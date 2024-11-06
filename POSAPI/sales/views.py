from django.db.models import Prefetch
from django.db.models import Sum,F,Q, Min,Value,DecimalField,IntegerField

from collections import defaultdict
from decimal import Decimal, InvalidOperation
from django.db.models.functions import Coalesce



from django.utils import timezone
from datetime import datetime, timedelta




from .serializer import *
from .models import *
from rest_framework import viewsets
from rest_framework import generics
from rest_framework import status

from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView

from rest_framework_api_key.permissions import HasAPIKey



class DepartmentView(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    permission_classes = [HasAPIKey]

class MunicipalityView(viewsets.ModelViewSet):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer

    permission_classes = [HasAPIKey]


class MunicipalityByDepartmentView(generics.ListAPIView):
    serializer_class = MunicipalitySerializer

    def get_queryset(self):
        department_id = self.kwargs['department_id']
        return Municipality.objects.filter(IDDepartment=department_id)
    
    permission_classes = [HasAPIKey]

    
class ClientView(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
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
            error_message = self.format_error_message(e.detail)
            return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)

    def format_error_message(self, detail):
        if isinstance(detail, list):
            return str(detail[0])
        elif isinstance(detail, dict):
            for key in detail:
                return str(detail[key][0])
        return str(detail)
    
    permission_classes = [HasAPIKey]
    

class saleView(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-date')
    serializer_class = saleSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
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
            error_message = self.format_error_message(e.detail)
            return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)
    
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


class saleDetailView(viewsets.ModelViewSet):
    queryset = SaleDetail.objects.all()
    serializer_class = saleDetailSerializer

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



class AccountsReceivableView(viewsets.ModelViewSet):
    queryset = AccountsReceivable.objects.all()
    serializer_class = AccountsReceivableSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
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
            error_message = self.format_error_message(e.detail)
            return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)

    def format_error_message(self, detail):
        if isinstance(detail, list):
            return str(detail[0])
        elif isinstance(detail, dict):
            for key in detail:
                return str(detail[key][0])
        return str(detail)
    
    permission_classes = [HasAPIKey]

class PendingSalesListView(generics.ListAPIView):
    serializer_class = SaleSummarySerializer

    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return Sale.objects.filter(IDClient=client_id, state__in=['2', '3']).prefetch_related(
            Prefetch('accountsreceivable_set', queryset=AccountsReceivable.objects.order_by('-type', 'dateSale'))
        )
    permission_classes = [HasAPIKey]



class QuotationDetailView(viewsets.ModelViewSet):
    queryset = QuotationDetail.objects.all()
    serializer_class = QuotationDetailSerializer
    permission_classes = [HasAPIKey]


class QuotationView(viewsets.ModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
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
            error_message = self.format_error_message(e.detail)
            return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)

    def format_error_message(self, detail):
        if isinstance(detail, list):
            return str(detail[0])
        elif isinstance(detail, dict):
            for key in detail:
                return str(detail[key][0])
        return str(detail)
    permission_classes = [HasAPIKey]

class UpdateQuotationStateView(APIView):
    def patch(self, request, id_quotation, format=None):
        try:
            quotation = Quotation.objects.get(IDQuotation=id_quotation)
        except Quotation.DoesNotExist:
            return Response({"error": "Quotation not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Obtener el estado del cuerpo de la solicitud
        state = request.data.get('state')
        
        if state is None:
            return Response({"error": "State is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar que el estado sea uno de los valores permitidos
        if state not in ['0', '1', '2']:
            return Response({"error": "Invalid state value"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Actualizar el estado de la cotización
        quotation.state = state
        quotation.save()

        # Devolver la cotización actualizada
        serializer = QuotationSerializer(quotation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
   

#REPORTE VENTAS
class SaleReportView(APIView):
    def get(self, request):
        # Obtener los parámetros de la consulta (query parameters)
        start_date_param = request.query_params.get('start_date')
        end_date_param = request.query_params.get('end_date')
        voucher_param = request.query_params.get('voucher')
        membretado_param = request.query_params.get('membretado')

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

        # Asegurarse de que las fechas estén en la zona horaria local
        start_date = timezone.localtime(start_date)
        end_date = timezone.localtime(end_date)

        # Filtrar las ventas entre las fechas dadas
        sales = Sale.objects.filter(date__range=[start_date, end_date])

        # Aplicar el filtro basado en el parámetro "voucher" y "membretado"
        if voucher_param == 'true' and membretado_param == 'true':
            # Si ambos están presentes, mostrar todos los registros (sin filtro adicional)
            pass
        elif voucher_param == 'true':
            # Si solo se selecciona "voucher", filtrar por ventas donde isVoucher es False
            sales = sales.filter(isVoucher=False)
        elif membretado_param == 'true':
            # Si solo se selecciona "membretado", filtrar por ventas donde isVoucher es True
            sales = sales.filter(isVoucher=True)

        # Ordenar las ventas por fecha descendente
        sales = sales.order_by('-date')

        # Serializar los datos
        serializer = SaleReportSerializer(sales, many=True)
        return Response(serializer.data)
    permission_classes = [HasAPIKey]
    
##REPORTE CLIENTE CREDIT
class ClientReportListView(generics.ListAPIView):
    serializer_class = ClientReportSerializer

    def get_queryset(self):
        # Filtrar clientes con isCredit=True y obtener la venta pendiente más próxima a expirar
        clients_with_sales = Client.objects.filter(isCredit=True).annotate(
            nearest_expiration=Min('sales__expirationDate', filter=F('sales__state') == '2')
        ).order_by('nearest_expiration')
        return clients_with_sales
    permission_classes = [HasAPIKey]
   
class SalesMonthReportView(APIView):
    def get(self, request, year, month, *args, **kwargs):
        try:
            year = int(year)
            month = int(month)
        except ValueError:
            return Response({'error': 'Invalid year or month'}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener los parámetros de la consulta
        voucher_param = request.query_params.get('voucher')
        membretado_param = request.query_params.get('membretado')

        # Determinar el primer y último día del mes en tiempo "naive"
        start_date_naive = datetime(year, month, 1)
        end_date_naive = (start_date_naive + timedelta(days=31)).replace(day=1) - timedelta(days=1)

        # Definir la zona horaria de Managua
        managua_tz = timezone.get_current_timezone()

        # Convertir las fechas "naive" a fechas conscientes para la consulta
        start_date_aware = timezone.make_aware(datetime.combine(start_date_naive, datetime.min.time()), managua_tz)
        end_date_aware = timezone.make_aware(datetime.combine(end_date_naive, datetime.max.time()), managua_tz)

        # Filtrar las ventas del mes
        sales_query = Sale.objects.filter(date__range=[start_date_aware, end_date_aware])

        # Aplicar filtros por "voucher" y "membretado"
        if voucher_param == 'true' and membretado_param == 'true':
            # Si ambos están presentes, no se aplica filtro adicional
            pass
        elif voucher_param == 'true':
            # Si solo se selecciona "voucher", filtrar por ventas donde isVoucher es True
            sales_query = sales_query.filter(isVoucher=False)
        elif membretado_param == 'true':
            # Si solo se selecciona "membretado", filtrar por ventas donde isVoucher es False
            sales_query = sales_query.filter(isVoucher=True)

        # Obtener los resultados y formatear la respuesta
        report_data = []
        for sale in sales_query:
            client_name = f"{sale.IDClient.name} {sale.IDClient.lastName}" if sale.IDClient else "Sin cliente"
            tipo = 'Membretada' if sale.isVoucher else 'Voucher'  # Determinar el tipo según isVoucher
            report_data.append({
                'fecha': sale.date.astimezone(managua_tz).strftime("%Y-%m-%d %H:%M:%S"),  # Convertir a la zona horaria de Managua
                'nombre': client_name,
                'tipo': tipo,
                'total': sale.total,
            })

        return Response(report_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
   
##Reporte anual.
class SalesAnnualReportView(APIView):
    def get(self, request, year):
        try:
            year = int(year)
        except ValueError:
            return Response({'error': 'Invalid year'}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener los parámetros de la consulta
        voucher_param = request.query_params.get('voucher')
        membretado_param = request.query_params.get('membretado')

        # Obtener la zona horaria de Managua
        managua_tz = timezone.get_default_timezone()

        # Filtrar las ventas por año y por los estados: activa (1), pendiente (2), pagada (3)
        sales_query = Sale.objects.filter(date__year=year, state__in=['1', '2', '3'])

        # Aplicar el filtro por "voucher" y "membretado"
        if voucher_param == 'true' and membretado_param == 'true':
            pass  # No aplicar filtro adicional
        elif voucher_param == 'true':
            sales_query = sales_query.filter(isVoucher=False)
        elif membretado_param == 'true':
            sales_query = sales_query.filter(isVoucher=True)

        # Diccionario para almacenar las ventas mensuales
        monthly_totals = defaultdict(Decimal)
        total_year = Decimal(0)

        # Agrupar las ventas por mes en la zona horaria de Managua
        for sale in sales_query:
            # Convertir la fecha de la venta a la zona horaria de Managua
            sale_date_local = timezone.localtime(sale.date, managua_tz)
            sale_month = sale_date_local.month
            monthly_totals[sale_month] += Decimal(sale.total)
            total_year += Decimal(sale.total)

        # Crear el diccionario con los nombres de los meses y convertir a string con 4 decimales
        report_data = {
            'Enero': f'{monthly_totals[1]:.4f}',
            'Febrero': f'{monthly_totals[2]:.4f}',
            'Marzo': f'{monthly_totals[3]:.4f}',
            'Abril': f'{monthly_totals[4]:.4f}',
            'Mayo': f'{monthly_totals[5]:.4f}',
            'Junio': f'{monthly_totals[6]:.4f}',
            'Julio': f'{monthly_totals[7]:.4f}',
            'Agosto': f'{monthly_totals[8]:.4f}',
            'Septiembre': f'{monthly_totals[9]:.4f}',
            'Octubre': f'{monthly_totals[10]:.4f}',
            'Noviembre': f'{monthly_totals[11]:.4f}',
            'Diciembre': f'{monthly_totals[12]:.4f}',
            'Total': f'{total_year:.4f}',
        }

        # Serializar los datos
        serializer = SalesAnnualReportSerializer(report_data)
        return Response(serializer.data)
    permission_classes = [HasAPIKey]
   
##Reporte de ventas por dias en el mes actual.
class DailySalesReportView(APIView):
    def get(self, request, *args, **kwargs):
        # Obtener los parámetros de la consulta
        voucher_param = request.query_params.get('voucher')
        membretado_param = request.query_params.get('membretado')

        today = timezone.localtime(timezone.now()).date()
        start_of_month = timezone.make_aware(datetime(today.year, today.month, 1), timezone.get_current_timezone())
        if today.month == 12:
            end_of_month = timezone.make_aware(datetime(today.year + 1, 1, 1), timezone.get_current_timezone())
        else:
            end_of_month = timezone.make_aware(datetime(today.year, today.month + 1, 1), timezone.get_current_timezone())

        # Ajustar end_of_month al final del día
        end_of_month = end_of_month.replace(hour=23, minute=59, second=59, microsecond=999999)

        # Filtrar las ventas según los parámetros proporcionados
        sales_query = Sale.objects.filter(date__range=[start_of_month, end_of_month])

        # Aplicar el filtro por "voucher" y "membretado"
        if voucher_param == 'true' and membretado_param == 'true':
            # Si ambos parámetros están presentes, incluir todas las ventas
            pass
        elif voucher_param == 'true':
            sales_query = sales_query.filter(isVoucher=False)
        elif membretado_param == 'true':
            sales_query = sales_query.filter(isVoucher=True)

        # Obtener ventas en el rango de fechas
        sales = sales_query

        if not sales.exists():
            return Response({'message': 'No sales found for the current month'}, status=status.HTTP_404_NOT_FOUND)

        # Procesar resultados para agrupar por fecha en la zona horaria de Managua
        daily_sales = defaultdict(Decimal)
        total_sales_for_month = Decimal(0)  # Variable para el total del mes

        # Obtener la zona horaria de Managua
        managua_tz = timezone.get_default_timezone()

        for sale in sales:
            # Convertir la fecha de la venta a la zona horaria de Managua
            sale_date_local = timezone.localtime(sale.date, managua_tz).date()
            daily_sales[sale_date_local] += sale.total
            total_sales_for_month += sale.total  # Sumar al total del mes

        # Formatear los datos para la respuesta
        sales_data = [{'date': date.strftime('%Y-%m-%d'), 'total_sales': float(total)} for date, total in daily_sales.items()]

        # Respuesta en el formato solicitado
        response_data = {
            'total': float(total_sales_for_month),  # Total de ventas del mes
            'sales': sales_data  # Lista de ventas diarias
        }

        if not sales_data:
            return Response({'message': 'No sales data found for the current month'}, status=status.HTTP_404_NOT_FOUND)

        return Response(response_data)
    permission_classes = [HasAPIKey]


##Reporte Mensual de ventas de clientes(producto mas comprado)
class ClientSalesMonthlyReportView(APIView):
    def get(self, request, *args, **kwargs):
        year = kwargs.get('year')
        month = kwargs.get('month')

        try:
            year = int(year)
            month = int(month)
        except ValueError:
            return Response({'error': 'Fecha o mes invalido'}, status=status.HTTP_400_BAD_REQUEST)

        # Define the timezone for Managua
        managua_tz = timezone.get_current_timezone()

        # Determine the first and last days of the month in naive time
        start_date_naive = datetime(year, month, 1)
        end_date_naive = (start_date_naive + timedelta(days=31)).replace(day=1) - timedelta(days=1)

        # Convert naive dates to aware dates
        start_date_aware = timezone.make_aware(datetime.combine(start_date_naive, datetime.min.time()), managua_tz)
        end_date_aware = timezone.make_aware(datetime.combine(end_date_naive, datetime.max.time()), managua_tz)

        # Fetch clients with sales in the given month and year
        clients = Client.objects.annotate(
            total_spent=Coalesce(Sum('sales__total', filter=(
                Q(sales__date__range=(start_date_aware, end_date_aware))
            )), Value(0, output_field=DecimalField()))
        ).filter(total_spent__gt=0)

        # Create the report data list
        report_data = []

        for client in clients:
            # Fetch the most purchased product by each client
            most_purchased = SaleDetail.objects.filter(
                IDSale__IDClient=client,
                IDSale__state__in=['1', '2', '3'],
                IDSale__date__range=(start_date_aware, end_date_aware)
            ).values('IDProduct__NombreProducto').annotate(
                total_quantity=Sum('quantity', output_field=IntegerField()),
                total_spent=Sum('total', output_field=DecimalField())
            ).order_by('-total_quantity').first()

            if most_purchased:
                most_purchased_product = most_purchased['IDProduct__NombreProducto']
                most_purchased_quantity = most_purchased['total_quantity']
                total_spent_on_product = most_purchased['total_spent']
            else:
                most_purchased_product = None
                most_purchased_quantity = 0
                total_spent_on_product = 0

            # Add client data to the report
            report_data.append({
                'name': client.name,
                'lastName': client.lastName,
                'total_spent': client.total_spent,
                'most_purchased_product': most_purchased_product,
                'most_purchased_quantity': most_purchased_quantity,
                'total_spent_on_product': total_spent_on_product,
            })

        # Serialize the data
        serializer = ClientSalesMonthlyReportSerializer(report_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]

##Conseguir ultimo LastCode
class LastSalesCodeView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            # Obtener el último salesCode
            last_sale = Sale.objects.order_by('-date').first()
            
            if last_sale:
                last_sales_code = last_sale.salesCode
            else:
                last_sales_code = None

            # Serializar los datos
            serializer = SalesCodeSerializer(data={'last_sales_code': last_sales_code})
            if serializer.is_valid():
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response({'error': 'Error en la serialización'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    permission_classes = [HasAPIKey]

##Reporte Anual de ventas de clientes(producto mas comprado)
class ClientSalesYearlyReportView(APIView):
    def get(self, request, *args, **kwargs):
        year = kwargs.get('year')

        try:
            year = int(year)
        except ValueError:
            return Response({'error': 'Año inválido'}, status=status.HTTP_400_BAD_REQUEST)

        # Define la zona horaria para Managua
        managua_tz = timezone.get_current_timezone()

        # Determina el primer y último día del año en tiempo naive
        start_date_naive = datetime(year, 1, 1)
        end_date_naive = datetime(year, 12, 31)

        # Convierte las fechas naive a aware (con zona horaria)
        start_date_aware = timezone.make_aware(datetime.combine(start_date_naive, datetime.min.time()), managua_tz)
        end_date_aware = timezone.make_aware(datetime.combine(end_date_naive, datetime.max.time()), managua_tz)

        # Obtiene los clientes con ventas en el año dado
        clients = Client.objects.annotate(
            total_spent=Coalesce(Sum('sales__total', filter=(
                Q(sales__date__range=(start_date_aware, end_date_aware))
            )), Value(0, output_field=DecimalField()))
        ).filter(total_spent__gt=0)

        # Crear la lista de datos del reporte
        report_data = []

        for client in clients:
            # Obtener el producto más comprado por cada cliente durante el año
            most_purchased = SaleDetail.objects.filter(
                IDSale__IDClient=client,
                IDSale__state__in=['1', '2', '3'],
                IDSale__date__range=(start_date_aware, end_date_aware)
            ).values('IDProduct__NombreProducto').annotate(
                total_quantity=Sum('quantity', output_field=IntegerField()),
                total_spent=Sum('total', output_field=DecimalField())
            ).order_by('-total_quantity').first()

            if most_purchased:
                most_purchased_product = most_purchased['IDProduct__NombreProducto']
                most_purchased_quantity = most_purchased['total_quantity']
                total_spent_on_product = most_purchased['total_spent']
            else:
                most_purchased_product = None
                most_purchased_quantity = 0
                total_spent_on_product = 0

            # Agregar los datos del cliente al reporte
            report_data.append({
                'name': client.name,
                'lastName': client.lastName,
                'total_spent': client.total_spent,
                'most_purchased_product': most_purchased_product,
                'most_purchased_quantity': most_purchased_quantity,
                'total_spent_on_product': total_spent_on_product,
            })

        # Serializar los datos
        serializer = ClientSalesMonthlyReportSerializer(report_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]

##Reporte Mensual de ventas por PRODUCTO
class ProductSalesMonthlyReportView(APIView):
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

        # Obtener los productos vendidos durante el mes, sumando la cantidad vendida y el total generado
        product_sales = SaleDetail.objects.filter(
            IDSale__date__range=(start_date_aware, end_date_aware),
            IDSale__state__in=['1', '2', '3'],  # Consideramos las ventas activas, pendientes y pagadas
            state=True  # Consideramos solo detalles de ventas válidos
        ).values(
            'IDProduct__NombreProducto', 'IDProduct__CodigoProducto'
        ).annotate(
            total_quantity=Sum('quantity', output_field=IntegerField()),
            total_earned=Sum('total', output_field=DecimalField())
        ).order_by('-total_quantity')

        # Preparar los datos del reporte
        report_data = []
        for product in product_sales:
            report_data.append({
                'NombreProducto': product['IDProduct__NombreProducto'],
                'CodigoProducto': product['IDProduct__CodigoProducto'],
                'total_quantity': product['total_quantity'],
                'total_earned': product['total_earned'],
            })

        # Retornar los datos en formato JSON
        return Response(report_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
    
##Reporte Anual de ventas por PRODUCTO
class ProductSalesAnnualReportView(APIView):
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

        # Obtener los productos vendidos durante el año, sumando la cantidad vendida y el total generado
        product_sales = SaleDetail.objects.filter(
            IDSale__date__range=(start_date_aware, end_date_aware),
            IDSale__state__in=['1', '2', '3'],  # Consideramos las ventas activas, pendientes y pagadas
            state=True  # Consideramos solo detalles de ventas válidos
        ).values(
            'IDProduct__NombreProducto', 'IDProduct__CodigoProducto'
        ).annotate(
            total_quantity=Sum('quantity', output_field=IntegerField()),
            total_earned=Sum('total', output_field=DecimalField())
        ).order_by('-total_quantity')

        # Preparar los datos del reporte
        report_data = []
        for product in product_sales:
            report_data.append({
                'NombreProducto': product['IDProduct__NombreProducto'],
                'CodigoProducto': product['IDProduct__CodigoProducto'],
                'total_quantity': product['total_quantity'],
                'total_earned': product['total_earned'],
            })

        # Retornar los datos en formato JSON
        return Response(report_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]

##Reporte top 5 Mensual de productos vendidos por año
class ProductSalesByCategoryMonthlyReportView(APIView):
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

        # Obtener los productos vendidos durante el mes, agrupados por categoría
        sales_by_category = SaleDetail.objects.filter(
            IDSale__date__range=(start_date_aware, end_date_aware),
            IDSale__state__in=['1', '2', '3'],  # Considerar las ventas activas, pendientes y pagadas
            state=True  # Considerar solo detalles de ventas válidos
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
        total_quantity_by_category = {}
        total_earned_by_category = {}

        for sale in sales_by_category:
            category_name = sale['IDProduct__IDCategoria__NombreCategoria']
            product_info = {
                'NombreProducto': sale['IDProduct__NombreProducto'],
                'CodigoProducto': sale['IDProduct__CodigoProducto'],
                'total_quantity': sale['total_quantity'],
                'total_earned': sale['total_earned'],
            }

            # Añadir productos a su respectiva categoría
            if category_name not in category_data:
                category_data[category_name] = {
                    'values': [],
                    'total': Decimal('0.00'),
                    'total_quantity': Decimal('0.00')
                }
                total_quantity_by_category[category_name] = Decimal('0.00')
                total_earned_by_category[category_name] = Decimal('0.00')

            # Añadir producto a la lista y limitar a los top 5
            category_data[category_name]['values'].append(product_info)
            category_data[category_name]['values'] = sorted(category_data[category_name]['values'], key=lambda x: x['total_quantity'], reverse=True)[:5]

            # Actualizar los totales por categoría
            total_quantity_by_category[category_name] += sale['total_quantity']
            total_earned_by_category[category_name] += sale['total_earned']
            category_data[category_name]['total'] = total_earned_by_category[category_name]
            category_data[category_name]['total_quantity'] = total_quantity_by_category[category_name]
            
            # Actualizar los totales globales
            total_quantity_global += sale['total_quantity']
            total_earned_global += sale['total_earned']

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
                'total': data['total'],
                'total_quantity': data['total_quantity'],
            })

        # Retornar los datos en formato JSON
        return Response(report_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
    
##Reporte top 5 Anual de productos vendidos por año
class ProductSalesByCategoryAnnualReportView(APIView):
    def get(self, request, *args, **kwargs):
        year = kwargs.get('year')

        # Validar año
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

        # Obtener los productos vendidos durante el año, agrupados por categoría
        sales_by_category = SaleDetail.objects.filter(
            IDSale__date__range=(start_date_aware, end_date_aware),
            IDSale__state__in=['1', '2', '3'],  # Considerar las ventas activas, pendientes y pagadas
            state=True  # Considerar solo detalles de ventas válidos
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

        # Organizar los productos en categorías y calcular los totales
        category_data = {}
        total_quantity_global = Decimal('0.00')
        total_earned_global = Decimal('0.00')
        total_quantity_by_category = {}
        total_earned_by_category = {}

        for sale in sales_by_category:
            category_name = sale['IDProduct__IDCategoria__NombreCategoria']
            product_info = {
                'NombreProducto': sale['IDProduct__NombreProducto'],
                'CodigoProducto': sale['IDProduct__CodigoProducto'],
                'total_quantity': sale['total_quantity'],
                'total_earned': sale['total_earned'],
            }

            # Añadir productos a su respectiva categoría
            if category_name not in category_data:
                category_data[category_name] = {
                    'values': [],
                    'total': Decimal('0.00'),
                    'total_quantity': Decimal('0.00')
                }
                total_quantity_by_category[category_name] = Decimal('0.00')
                total_earned_by_category[category_name] = Decimal('0.00')

            # Añadir producto a la lista y limitar a los top 5
            category_data[category_name]['values'].append(product_info)
            category_data[category_name]['values'] = sorted(category_data[category_name]['values'], key=lambda x: x['total_quantity'], reverse=True)[:5]

            # Actualizar los totales por categoría
            total_quantity_by_category[category_name] += sale['total_quantity']
            total_earned_by_category[category_name] += sale['total_earned']
            category_data[category_name]['total'] = total_earned_by_category[category_name]
            category_data[category_name]['total_quantity'] = total_quantity_by_category[category_name]
            
            # Actualizar los totales globales
            total_quantity_global += sale['total_quantity']
            total_earned_global += sale['total_earned']

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
                'total': data['total'],
                'total_quantity': data['total_quantity'],
            })

        # Retornar los datos en formato JSON
        return Response(report_data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
   
##Reporte de cuentas al credito por IDSale
class AccountsReceivableReportView(APIView):
    def get(self, request, id_sale, *args, **kwargs):
        # Filtrar los registros de AccountsReceivable por IDSale
        records = AccountsReceivable.objects.filter(IDSale__IDSale=id_sale).order_by('dateSale')
        
        # Verificar si hay registros
        if not records.exists():
            return Response({"message": "No se encontraron registros para esta venta."}, status=status.HTTP_404_NOT_FOUND)

        # Serializar los datos
        serializer = AccountsReceivableSerializer(records, many=True)
        
        # Retornar la respuesta
        return Response(serializer.data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]
    
##Ultimo PaymentCode Account Receivable
class LatestPaymentCodeView(APIView):
    def get(self, request):
        # Obtener el último registro de AccountsReceivable
        latest_record = AccountsReceivable.objects.order_by('-dateSale').first()

        # Verificar si se encontró algún registro
        if latest_record and latest_record.paymentCode:
            return Response({"latest_payment_code": latest_record.paymentCode}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No se encontraron registros de pagos."}, status=status.HTTP_404_NOT_FOUND)
    permission_classes = [HasAPIKey]

class LatestBalanceReportView(APIView):
    def get(self, request, id_sale):
        # Obtener el último registro de AccountsReceivable para el IDSale especificado
        latest_record = AccountsReceivable.objects.filter(IDSale=id_sale).order_by('-dateSale').first()

        # Verificar si se encontró algún registro
        if latest_record:
            # Obtener datos del cliente
            client = latest_record.IDClient
            municipality = client.IDMunicipality
            department = municipality.IDDepartment

            return Response({
                "last_balance": str(latest_record.balance),
                "id_client": str(client.IDClient),
                "client_name": client.name,
                "client_lastname": client.lastName,
                "phone": client.phone,
                "address": client.address,
                "municipality": municipality.name,
                "department": department.name
            }, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No se encontraron registros para este IDSale."}, status=status.HTTP_404_NOT_FOUND)
    permission_classes = [HasAPIKey]

class LatestQuotationView(APIView):
    def get(self, request, *args, **kwargs):
        # Obtenemos la cotización más reciente
        latest_quotation = Quotation.objects.order_by('-date').first()
        
        if latest_quotation:
            serializer = LatestQuotationSerializer(latest_quotation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No se encontró ninguna cotización."}, status=status.HTTP_404_NOT_FOUND)
    permission_classes = [HasAPIKey]  


##Reporte cotizacipones por fecha
class QuotationReportView(APIView):
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
                return Response({"errorMessage": "Formato de start_date inválido. Use YYYY-MM-DD."}, status=400)
        else:
            # Si no se proporciona start_date, usar la fecha actual menos 30 días por defecto
            start_date = now - timedelta(days=30)

        # Verificar y convertir end_date si está presente
        if end_date_param:
            try:
                end_date = timezone.make_aware(datetime.strptime(end_date_param, '%Y-%m-%d'))
            except ValueError:
                return Response({"errorMessage": "Formato de end_date inválido. Use YYYY-MM-DD."}, status=400)
        else:
            # Si no se proporciona end_date, usar la fecha actual
            end_date = now

        # Ajustar end_date al final del día
        end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)

        # Asegurarse de que las fechas estén en la zona horaria local
        start_date = timezone.localtime(start_date)
        end_date = timezone.localtime(end_date)

        # Filtrar las cotizaciones entre las fechas dadas usando el campo correcto
        quotations = Quotation.objects.filter(date__range=[start_date, end_date])

        # Ordenar las cotizaciones por fecha descendente
        quotations = quotations.order_by('-date')

        # Serializar los datos
        serializer = QuotationSerializer(quotations, many=True)
        return Response(serializer.data)
    permission_classes = [HasAPIKey]  
