from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Sum,DecimalField,IntegerField
from decimal import Decimal

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView

from .models import Supplier, Purchase
from .serializer import *
from sales.models import Sale

from rest_framework_api_key.permissions import HasAPIKey


class SupplierView(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

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
    
    

class PurchaseView(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer

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
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        serializer.delete(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def format_error_message(self, detail):
        # Verificar si el detalle es una lista
        if isinstance(detail, list):
            return str(detail[0])  # Obtener el primer mensaje en la lista

        # Verificar si el detalle es un diccionario
        elif isinstance(detail, dict):
            for key in detail:
                return str(detail[key][0])  # Obtener el primer mensaje asociado a la primera clave

        # Si el detalle no es ni lista ni diccionario
        return str(detail)
    permission_classes = [HasAPIKey]


class PurchaseDetailView(viewsets.ModelViewSet):
    queryset = PurchaseDetail.objects.all()
    serializer_class = PurchaseDetailSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        serializer.delete(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def format_error_message(self, detail):
        if isinstance(detail, list):
            return str(detail[0])
        elif isinstance(detail, dict):
            for key in detail:
                return str(detail[key][0])
        return str(detail)
    permission_classes = [HasAPIKey]


class PaymentMethodView(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [HasAPIKey]


class ExpenseCategoryView(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [HasAPIKey]


class ExpenseView(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [HasAPIKey]




#Reporte Compras
class PurchaseReportView(APIView):

    def get(self, request):
        # Obtener los parámetros de la consulta (query parameters)
        start_date_param = request.query_params.get('start_date')
        end_date_param = request.query_params.get('end_date')

        # Obtener la fecha y hora actual
        now = timezone.now()

        # Verificar y convertir start_date si está presente
        if start_date_param:
            try:
                start_date = timezone.make_aware(datetime.strptime(start_date_param, '%Y-%m-%d'))
            except ValueError:
                return Response({"error": "Invalid start_date format. Use YYYY-MM-DD."}, status=400)
        else:
            # Si no se proporciona start_date, usar la fecha actual menos 30 días por defecto
            start_date = now - timedelta(days=30)

        # Verificar y convertir end_date si está presente
        if end_date_param:
            try:
                end_date = timezone.make_aware(datetime.strptime(end_date_param, '%Y-%m-%d'))
            except ValueError:
                return Response({"error": "Invalid end_date format. Use YYYY-MM-DD."}, status=400)
        else:
            # Si no se proporciona end_date, usar la fecha actual
            end_date = now

        # Ajustar end_date al final del día
        end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)

        # Asegurarse de que start_date y end_date estén en el mismo formato y zona horaria
        start_date = timezone.localtime(start_date)
        end_date = timezone.localtime(end_date)

        # Filtrar las compras entre las fechas dadas
        purchases = Purchase.objects.filter(date__range=[start_date, end_date]).order_by('-date')
        
        # Serializar las compras
        serializer = PurchaseReportSerializer(purchases, many=True)
        
        return Response(serializer.data)
    permission_classes = [HasAPIKey]


## REPORTE PROVEEDORES MAS COTIZADOS
class SupplierReportView(APIView):

    def get(self, request):
        # Agregar la agregación de cantidad de compras y total de dinero gastado por proveedor
        suppliers = Supplier.objects.annotate(
            total_purchases=Count('purchase'),  # Cuenta el número de compras por proveedor
            total_spent=Sum('purchase__total')  # Suma el total de todas las compras por proveedor
        ).order_by('-total_spent')  # Ordenar por total_spent de mayor a menor

        # Serializar los resultados
        serializer = SupplierReportSerializer(suppliers, many=True)
        return Response(serializer.data)
    permission_classes = [HasAPIKey]


class ExpenseReportMonthView(APIView):
    def get(self, request, year, month, *args, **kwargs):
        # Validar parámetros de año y mes
        try:
            year = int(year)
            month = int(month)
            if month < 1 or month > 12:
                raise ValueError
        except ValueError:
            return Response({"error": "Año y mes deben ser números enteros válidos"}, status=status.HTTP_400_BAD_REQUEST)

        # Filtrar gastos por año y mes
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)

        # Convertir las fechas a fechas conscientes de la zona horaria
        start_date = timezone.make_aware(start_date, timezone.get_current_timezone())
        end_date = timezone.make_aware(end_date, timezone.get_current_timezone())

        # Filtrar gastos entre las fechas
        expenses = Expense.objects.filter(date__range=[start_date, end_date], state=True)

        # Agrupar los gastos por categoría
        expenses_by_category = expenses.values('IDExpenseCategory__name').annotate(
            total_amount=Sum('amount')
        )

        # Calcular el total global
        total_global = expenses.aggregate(total_amount=Sum('amount'))['total_amount'] or 0

        # Preparar el reporte
        report = []
        for category in expenses_by_category:
            category_name = category['IDExpenseCategory__name']
            category_expenses = expenses.filter(IDExpenseCategory__name=category_name)
            serializer = ExpenseSerializer(category_expenses, many=True)
            report.append({
                "category": category_name,
                "expenses": serializer.data,
                "total": category['total_amount']
            })

        # Estructura de respuesta
        response_data = {
            "total_global": total_global,
            "categories": report
        }

        return Response(response_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
    
#Reporte Gastos startDate y endDate
class ExpenseReportView(APIView):

    def get(self, request):
        # Obtener los parámetros de la consulta (query parameters)
        start_date_param = request.query_params.get('start_date')
        end_date_param = request.query_params.get('end_date')

        # Obtener la fecha y hora actual
        now = timezone.now()

        # Verificar y convertir start_date si está presente
        if start_date_param:
            try:
                start_date = timezone.make_aware(datetime.strptime(start_date_param, '%Y-%m-%d'))
            except ValueError:
                return Response({"error": "Invalid start_date format. Use YYYY-MM-DD."}, status=400)
        else:
            # Si no se proporciona start_date, usar la fecha actual menos 30 días por defecto
            start_date = now - timedelta(days=30)

        # Verificar y convertir end_date si está presente
        if end_date_param:
            try:
                end_date = timezone.make_aware(datetime.strptime(end_date_param, '%Y-%m-%d'))
            except ValueError:
                return Response({"error": "Invalid end_date format. Use YYYY-MM-DD."}, status=400)
        else:
            # Si no se proporciona end_date, usar la fecha actual
            end_date = now

        # Ajustar end_date al final del día
        end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)

        # Asegurarse de que start_date y end_date estén en el mismo formato y zona horaria
        start_date = timezone.localtime(start_date)
        end_date = timezone.localtime(end_date)

        # Filtrar los gastos entre las fechas dadas
        expenses = Expense.objects.filter(date__range=[start_date, end_date]).order_by('-date')

        # Serializar los gastos
        serializer = ExpenseSerializer(expenses, many=True)

        return Response(serializer.data)
    permission_classes = [HasAPIKey]

#Reporte Gastos Anual
class ExpenseReportYearView(APIView):
    def get(self, request, year, *args, **kwargs):
        # Validar el parámetro de año
        try:
            year = int(year)
            # Remover restricciones en el año
        except ValueError:
            return Response({"error": "Año inválido. Debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

        # Definir las fechas de inicio y fin del año
        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1)

        # Convertir las fechas a fechas conscientes de la zona horaria de Managua
        start_date = timezone.make_aware(start_date, timezone.get_current_timezone())
        end_date = timezone.make_aware(end_date, timezone.get_current_timezone())

        # Filtrar los gastos por año y solo aquellos con state=True
        expenses = Expense.objects.filter(date__range=[start_date, end_date], state=True)

        # Agrupar los gastos por categoría
        expenses_by_category = expenses.values('IDExpenseCategory__name').annotate(
            total_amount=Sum('amount')
        )

        # Calcular el total global
        total_global = expenses.aggregate(total_amount=Sum('amount'))['total_amount'] or 0

        # Preparar el reporte
        report = []
        for category in expenses_by_category:
            category_name = category['IDExpenseCategory__name']
            category_expenses = expenses.filter(IDExpenseCategory__name=category_name)
            serializer = ExpenseSerializer(category_expenses, many=True)
            report.append({
                "category": category_name,
                "total": category['total_amount']
            })

        # Estructura de respuesta
        response_data = {
            "total_global": total_global,
            "categories": report
        }

        return Response(response_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
   
##Reporte mensual de productos comprados
class ProductPurchasesMonthlyReportView(APIView):
    def get(self, request, *args, **kwargs):
        year = kwargs.get('year')
        month = kwargs.get('month')

        try:
            year = int(year)
            month = int(month)
        except ValueError:
            return Response({'error': 'Año o mes inválido'}, status=status.HTTP_400_BAD_REQUEST)

        # Definir la zona horaria para Managua
        managua_tz = timezone.get_current_timezone()

        # Determinar las fechas de inicio y fin del mes
        start_date_naive = datetime(year, month, 1)
        end_date_naive = (start_date_naive + timedelta(days=31)).replace(day=1) - timedelta(days=1)

        # Convertir las fechas naive a aware (con zona horaria)
        start_date_aware = timezone.make_aware(datetime.combine(start_date_naive, datetime.min.time()), managua_tz)
        end_date_aware = timezone.make_aware(datetime.combine(end_date_naive, datetime.max.time()), managua_tz)

        # Obtener los productos comprados durante el mes, sumando la cantidad comprada y el total gastado
        product_purchases = PurchaseDetail.objects.filter(
            IDPurchase__date__range=(start_date_aware, end_date_aware),
            IDPurchase__state=True,  # Consideramos solo compras válidas
            state=True  # Consideramos solo detalles de compra válidos
        ).values(
            'IDProduct__NombreProducto', 'IDProduct__CodigoProducto'
        ).annotate(
            total_quantity=Sum('quantity', output_field=IntegerField()),
            total_spent=Sum('total', output_field=DecimalField())
        ).order_by('-total_quantity')

        # Preparar los datos del reporte
        report_data = []
        for product in product_purchases:
            report_data.append({
                'NombreProducto': product['IDProduct__NombreProducto'],
                'CodigoProducto': product['IDProduct__CodigoProducto'],
                'total_quantity': product['total_quantity'],
                'total_spent': product['total_spent'],
            })

        # Retornar los datos en formato JSON
        return Response(report_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
    
##Reporte Anual de productos comprados
class ProductPurchasesAnnualReportView(APIView):
    def get(self, request, *args, **kwargs):
        year = kwargs.get('year')

        try:
            year = int(year)
        except ValueError:
            return Response({'error': 'Año inválido'}, status=status.HTTP_400_BAD_REQUEST)

        # Definir la zona horaria para Managua
        managua_tz = timezone.get_current_timezone()

        # Determinar las fechas de inicio y fin del año
        start_date_naive = datetime(year, 1, 1)
        end_date_naive = datetime(year, 12, 31)

        # Convertir las fechas naive a aware (con zona horaria)
        start_date_aware = timezone.make_aware(datetime.combine(start_date_naive, datetime.min.time()), managua_tz)
        end_date_aware = timezone.make_aware(datetime.combine(end_date_naive, datetime.max.time()), managua_tz)

        # Obtener los productos comprados durante el año, sumando la cantidad comprada y el total gastado
        product_purchases = PurchaseDetail.objects.filter(
            IDPurchase__date__range=(start_date_aware, end_date_aware),
            IDPurchase__state=True,  # Consideramos solo compras válidas
            state=True  # Consideramos solo detalles de compra válidos
        ).values(
            'IDProduct__NombreProducto', 'IDProduct__CodigoProducto'
        ).annotate(
            total_quantity=Sum('quantity', output_field=IntegerField()),
            total_spent=Sum('total', output_field=DecimalField())
        ).order_by('-total_quantity')

        # Preparar los datos del reporte
        report_data = []
        for product in product_purchases:
            report_data.append({
                'NombreProducto': product['IDProduct__NombreProducto'],
                'CodigoProducto': product['IDProduct__CodigoProducto'],
                'total_quantity': product['total_quantity'],
                'total_spent': product['total_spent'],
            })

        # Retornar los datos en formato JSON
        return Response(report_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]

##Reporte top 5 Anual de productos comprados por año
class ProductPurchasesByCategoryYearlyReportView(APIView):
    def get(self, request, *args, **kwargs):
        year = kwargs.get('year')

        # Validar el año
        try:
            year = int(year)
        except ValueError:
            return Response({'error': 'Año inválido'}, status=status.HTTP_400_BAD_REQUEST)

        # Definir la zona horaria para Managua
        managua_tz = timezone.get_current_timezone()

        # Determinar las fechas de inicio y fin del año
        start_date_naive = datetime(year, 1, 1)
        end_date_naive = datetime(year, 12, 31)

        # Convertir las fechas naive a aware (con zona horaria)
        start_date_aware = timezone.make_aware(datetime.combine(start_date_naive, datetime.min.time()), managua_tz)
        end_date_aware = timezone.make_aware(datetime.combine(end_date_naive, datetime.max.time()), managua_tz)

        # Obtener los productos comprados durante el año, agrupados por categoría
        purchases_by_category = PurchaseDetail.objects.filter(
            IDPurchase__date__range=(start_date_aware, end_date_aware),
            IDPurchase__state=True,  # Considerar solo compras válidas
            state=True  # Considerar solo detalles de compra válidos
        ).values(
            'IDProduct__IDCategoria__NombreCategoria',  # Nombre de la categoría
            'IDProduct__NombreProducto',
            'IDProduct__CodigoProducto'
        ).annotate(
            total_quantity=Sum('quantity', output_field=IntegerField()),
            total_spent=Sum('total', output_field=DecimalField())
        ).order_by(
            'IDProduct__IDCategoria__NombreCategoria', '-total_quantity'  # Ordenar por categoría y luego por cantidad descendente
        )

        # Organizar los productos en categorías y calcular los totales por categoría y globales
        category_data = {}
        total_quantity_global = Decimal('0.00')
        total_spent_global = Decimal('0.00')

        for purchase in purchases_by_category:
            category_name = purchase['IDProduct__IDCategoria__NombreCategoria']
            product_info = {
                'NombreProducto': purchase['IDProduct__NombreProducto'],
                'CodigoProducto': purchase['IDProduct__CodigoProducto'],
                'total_quantity': purchase['total_quantity'],
                'total_earned': purchase['total_spent'],  # Ajuste aquí para que coincida con el formato
            }

            # Inicializar datos de la categoría si no existen
            if category_name not in category_data:
                category_data[category_name] = {
                    'values': [],
                    'total_quantity': Decimal('0.00'),
                    'total': Decimal('0.00')
                }
            
            # Añadir producto a la lista y limitar a los top 5
            category_data[category_name]['values'].append(product_info)
            category_data[category_name]['values'] = sorted(category_data[category_name]['values'], key=lambda x: x['total_quantity'], reverse=True)[:5]

            # Actualizar los totales por categoría
            category_data[category_name]['total_quantity'] += purchase['total_quantity']
            category_data[category_name]['total'] += purchase['total_spent']

            # Actualizar los totales globales
            total_quantity_global += purchase['total_quantity']
            total_spent_global += purchase['total_spent']

        # Formatear los datos para la respuesta JSON
        report_data = {
            'total_quantity_global': total_quantity_global,
            'total_global': total_spent_global,
            'categories': []
        }

        # Añadir los datos de cada categoría
        for category, data in category_data.items():
            report_data['categories'].append({
                'category': category,
                'values': data['values'],
                'total_quantity': data['total_quantity'],
                'total': data['total']
            })

        # Retornar los datos en formato JSON
        return Response(report_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
    
##Reporte top 5 Mensual de productos comprados por año
class ProductPurchasesByCategoryMonthlyReportView(APIView):
    def get(self, request, *args, **kwargs):
        year = kwargs.get('year')
        month = kwargs.get('month')

        # Validar año y mes
        try:
            year = int(year)
            month = int(month)
        except ValueError:
            return Response({'error': 'Año o mes inválido'}, status=status.HTTP_400_BAD_REQUEST)

        # Validar que el mes esté en un rango válido
        if not (1 <= month <= 12):
            return Response({'error': 'Mes inválido'}, status=status.HTTP_400_BAD_REQUEST)

        # Definir la zona horaria para Managua
        managua_tz = timezone.get_current_timezone()

        # Determinar las fechas de inicio y fin del mes
        start_date_naive = datetime(year, month, 1)
        end_date_naive = (start_date_naive + timedelta(days=31)).replace(day=1) - timedelta(days=1)

        # Convertir las fechas naive a aware (con zona horaria)
        start_date_aware = timezone.make_aware(datetime.combine(start_date_naive, datetime.min.time()), managua_tz)
        end_date_aware = timezone.make_aware(datetime.combine(end_date_naive, datetime.max.time()), managua_tz)

        # Obtener las compras durante el mes, agrupadas por categoría
        purchases_by_category = PurchaseDetail.objects.filter(
            IDPurchase__date__range=(start_date_aware, end_date_aware),
            IDPurchase__state=True,  # Considerar solo compras válidas
            state=True  # Considerar solo detalles de compra válidos
        ).values(
            'IDProduct__IDCategoria__NombreCategoria',  # Nombre de la categoría
            'IDProduct__NombreProducto',
            'IDProduct__CodigoProducto'
        ).annotate(
            total_quantity=Sum('quantity', output_field=IntegerField()),
            total_earned=Sum('total', output_field=DecimalField())
        ).order_by(
            'IDProduct__IDCategoria__NombreCategoria', '-total_quantity'  # Ordenar por categoría y luego por cantidad descendente
        )

        # Organizar los productos en categorías y calcular los totales por categoría y globales
        category_data = {}
        total_quantity_global = Decimal('0.00')
        total_earned_global = Decimal('0.00')

        for purchase in purchases_by_category:
            category_name = purchase['IDProduct__IDCategoria__NombreCategoria']
            product_info = {
                'NombreProducto': purchase['IDProduct__NombreProducto'],
                'CodigoProducto': purchase['IDProduct__CodigoProducto'],
                'total_quantity': purchase['total_quantity'],
                'total_earned': purchase['total_earned'],
            }

            # Añadir productos a su respectiva categoría
            if category_name not in category_data:
                category_data[category_name] = {
                    'values': [],
                    'total_quantity': Decimal('0.00'),
                    'total': Decimal('0.00')
                }
            
            # Añadir producto a la lista y limitar a los top 5
            category_data[category_name]['values'].append(product_info)
            category_data[category_name]['values'] = sorted(category_data[category_name]['values'], key=lambda x: x['total_quantity'], reverse=True)[:5]

            # Actualizar los totales por categoría
            category_data[category_name]['total_quantity'] += purchase['total_quantity']
            category_data[category_name]['total'] += purchase['total_earned']

            # Actualizar los totales globales
            total_quantity_global += purchase['total_quantity']
            total_earned_global += purchase['total_earned']

        # Formatear los datos para la respuesta JSON
        report_data = {
            'total_quantity_global': total_quantity_global,
            'total_global': total_earned_global,
            'categories': []
        }

        # Añadir los datos de cada categoría
        for category, data in category_data.items():
            report_data['categories'].append({
                'category': category,
                'values': data['values'],
                'total_quantity': data['total_quantity'],
                'total': data['total']
            })

        # Retornar los datos en formato JSON
        return Response(report_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]

##Reporte categoria de gasto se realiza mas(Mes actual)
class ExpenseCategoryReportView(APIView):
    def get(self, request, *args, **kwargs):
        # Obtener la fecha actual y definir el rango para el mes actual
        now = timezone.now()
        start_date = datetime(now.year, now.month, 1, 0, 0, 0)
        end_date = datetime(now.year, now.month + 1, 1, 0, 0, 0) if now.month != 12 else datetime(now.year + 1, 1, 1, 0, 0, 0)

        # Definir la zona horaria para convertir fechas naive a aware (con zona horaria)
        managua_tz = timezone.get_current_timezone()
        start_date_aware = timezone.make_aware(start_date, managua_tz)
        end_date_aware = timezone.make_aware(end_date, managua_tz)

        # Filtrar los gastos realizados durante el mes actual y agrupar por categoría
        expenses_by_category = Expense.objects.filter(
            date__range=(start_date_aware, end_date_aware),
            state=True  # Considerar solo gastos activos
        ).values(
            'IDExpenseCategory__name'
        ).annotate(
            total_spent=Sum('amount', output_field=DecimalField())
        ).order_by(
            '-total_spent'  # Ordenar por la cantidad total gastada en orden descendente
        )

        # Organizar los gastos por categoría y calcular los totales globales
        category_data = []
        total_spent_global = Decimal('0.00')

        for expense in expenses_by_category:
            category_name = expense['IDExpenseCategory__name']
            total_spent = expense['total_spent']

            # Actualizar los totales globales
            total_spent_global += total_spent

            # Añadir la información de la categoría al reporte
            category_data.append({
                'category': category_name,
                'total_spent': total_spent
            })

        # Formatear los datos para la respuesta JSON
        report_data = {
            'total_global': total_spent_global,
            'categories': category_data
        }

        # Retornar los datos en formato JSON
        return Response(report_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
