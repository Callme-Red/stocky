from django.db.models import Sum,F,DecimalField
from .serializer import *
from .models import *

from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from sales.models import SaleDetail
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404

from rest_framework_api_key.permissions import HasAPIKey

class InventorysView(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer
    permission_classes = [HasAPIKey]


class CategoriaView(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            # Extraer y formatear los mensajes de error
            error_message = self.format_error_message(e.detail)
            return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError as e:
            # Extraer y formatear los mensajes de error
            error_message = self.format_error_message(e.detail)
            return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)

    def format_error_message(self, detail):
        # Extraer el primer mensaje de error
        if isinstance(detail, list):
            return str(detail[0])
        elif isinstance(detail, dict):
            for key in detail:
                return str(detail[key][0])
        return str(detail)
    permission_classes = [HasAPIKey]


class ProductoDetalleView(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = Productos

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            # Extraer el mensaje de error sin incluir 'code'
            error_message = self.extract_error_message(e.detail)
            return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError as e:
            error_message = self.extract_error_message(e.detail)
            return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)

    def extract_error_message(self, detail):
        # Extraer el mensaje como un string limpio
        if isinstance(detail, dict):
            error_message = list(detail.values())[0]
        elif isinstance(detail, list):
            error_message = detail[0]
        else:
            error_message = str(detail)

        # Si el mensaje es una lista o un objeto ErrorDetail, convertirlo
        if isinstance(error_message, list):
            error_message = error_message[0]
        if isinstance(error_message, serializers.ErrorDetail):
            error_message = str(error_message)
        return error_message
    permission_classes = [HasAPIKey]

class ProductByCodeView(APIView):
    def get(self, request, CodigoProducto, *args, **kwargs):
        try:
            # Buscamos el producto por su CodigoProducto
            producto = Producto.objects.get(CodigoProducto=CodigoProducto)
        except Producto.DoesNotExist:
            # Si no se encuentra, mandamos el mensaje personalizado
            return Response({"message": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Si se encuentra el producto, serializamos y enviamos la respuesta
        serializer = Productos(producto, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]

class InventoryAdjustmentView(viewsets.ModelViewSet):
    queryset = InventoryAdjustment.objects.all()
    serializer_class = InventoryAdjustmentSerializer
    permission_classes = [HasAPIKey]

## REPORTE PRODUCTOS TOP MEJORES
class TopProductSalesReportView(APIView):
    def get(self, request, *args, **kwargs):
        # Agrupar por producto y sumar la cantidad vendida, luego ordenar y limitar a los 5 primeros
        sales_data = SaleDetail.objects.values(
            'IDProduct'  # Agrupa por IDProduct
        ).annotate(
            totalSales=Sum('quantity'),
            ProductName=F('IDProduct__NombreProducto')  # Anotar el nombre del producto
        ).order_by('-totalSales')[:5]  # Limitar el resultado al top 5

        # Cambiar el nombre de los campos en el resultado
        sales_data = sales_data.annotate(
            ProductID=F('IDProduct__IDProducto'),  # Usar un nombre diferente como ProductID
        ).values('ProductID', 'ProductName', 'totalSales')

        # Serializar los datos
        serializer = ProductSalesReportSerializer(sales_data, many=True)

        return Response(serializer.data)
    permission_classes = [HasAPIKey]


## REPORTE KARDEX POR PRRODUCT ID
class InventarioByProductView(APIView):
    def get(self, request, IDProduct, *args, **kwargs):
        # Validar el parámetro de ID de producto
        try:
            product_id = int(IDProduct)
        except ValueError:
            return Response({"error": "ID de producto inválido. Debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener los parámetros de fecha desde la URL
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        # Verificar y procesar las fechas
        if start_date:
            try:
                # Convertir la fecha de inicio a un objeto datetime consciente de la zona horaria de Managua
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
                start_date = timezone.make_aware(start_date, timezone.get_current_timezone())
            except ValueError:
                return Response({"error": "Fecha de inicio inválida. Formato debe ser YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            start_date = None

        if end_date:
            try:
                # Convertir la fecha de fin a un objeto datetime consciente de la zona horaria de Managua
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
                end_date = timezone.make_aware(end_date, timezone.get_current_timezone())
                # Ajustar para incluir todo el día de la fecha de fin
                end_date += timezone.timedelta(days=1)
            except ValueError:
                return Response({"error": "Fecha de fin inválida. Formato debe ser YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            end_date = None

        # Filtrar los registros de inventario por producto y rango de fechas
        queryset = Inventario.objects.filter(IDProducto=product_id)

        if start_date and end_date:
            queryset = queryset.filter(fecha__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(fecha__gte=start_date)
        elif end_date:
            queryset = queryset.filter(fecha__lt=end_date)

        # Ordenar los registros de inventario por fecha ascendente
        queryset = queryset.order_by('fecha')

        # Serializar los datos
        serializer = InventarioSerializer(queryset, many=True)

        # Preparar y retornar la respuesta
        return Response(serializer.data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]


##Reporte weird inventory
class InventoryReportView(APIView):
    def get(self, request, *args, **kwargs):
        # Obtener todos los productos
        productos = Producto.objects.all()

        report = []

        for producto in productos:
            # Obtener las últimas 3 entradas (compras) sin ajustes
            ultimas_entradas = Inventario.objects.filter(
                IDProducto=producto,
                tipoMovimiento='0'  # Solo considerar entradas (compras)
            ).order_by('-fecha')[:3]

            # Sumar las entradas de las últimas 3 entradas
            total_entradas = sum([entrada.entrada for entrada in ultimas_entradas])

            # Obtener el costo promedio de la última compra, si existe
            costo_promedio_ultima_compra = ultimas_entradas[0].costoPromedio if ultimas_entradas else 0

            # Calcular lo comprado: total de entradas * costo promedio de la última compra
            comprado = total_entradas * costo_promedio_ultima_compra

            # Obtener el saldo y costo promedio del último registro del inventario (salida o salida por ajuste)
            ultimo_registro = Inventario.objects.filter(
                IDProducto=producto
            ).order_by('-fecha').first()

            saldo_actual = ultimo_registro.saldoUnidades if ultimo_registro else 0
            costo_promedio_actual = ultimo_registro.costoPromedio if ultimo_registro else 0

            # Calcular el valor en inventario: saldo actual * costo promedio
            en_inventario = saldo_actual * costo_promedio_actual

            # Calcular lo vendido: comprado - en inventario
            vendido = comprado - en_inventario

            # Obtener el precio de venta más reciente
            precio_producto = PrecioProducto.objects.filter(IDProducto=producto).order_by('-FechaPrecio').first()
            precio_actual = precio_producto.Precio if precio_producto else 0

            # Calcular la ganancia: cantidad vendida * precio de venta - lo comprado
            ganancia = (total_entradas - saldo_actual) * precio_actual - comprado

            # Armar el reporte para este producto
            report.append({
                "Producto": producto.NombreProducto,
                "Comprado": comprado,
                "Vendido": vendido,
                "En inventario": en_inventario,
                "Ganancia": ganancia
            })

        return Response(report, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]

