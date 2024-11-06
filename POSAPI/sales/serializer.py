from rest_framework import serializers
from .models import *
from rest_framework.exceptions import ValidationError
from datetime import date
from django.utils.timezone import now
from django.db.models import Sum


from django.db import transaction
from inventory.models import Inventario,PrecioProducto,Producto



class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class MunicipalitySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='IDDepartment.name', read_only=True)  # Agrega el nombre del departamento

    class Meta:
        model = Municipality
        fields = ['IDMunicipality', 'name', 'IDDepartment', 'department_name']

class ClientSerializer(serializers.ModelSerializer):
    municipality_name = serializers.CharField(source="IDMunicipality.name", read_only=True)
    department = serializers.CharField(source="IDMunicipality.IDDepartment.name", read_only=True)
    IDDepartment = serializers.CharField(source="IDMunicipality.IDDepartment.IDDepartment", read_only=True)


    class Meta:
        model = Client
        fields = ['IDClient', 'name', 'lastName', 'phone', 'email', 'IDMunicipality', 'municipality_name', 'IDDepartment','department', 'address', 'description', 'date', 'state','isCredit']
    

    def validate_phone(self, value):
        # Excluir el cliente actual de la validación
        if value is not None and value != "":
            if self.instance:
                if Client.objects.filter(phone=value).exclude(IDClient=self.instance.IDClient).exists():
                    raise serializers.ValidationError("Este número de teléfono ya existe.")
            else:
                if Client.objects.filter(phone=value).exists():
                    raise serializers.ValidationError("Este número de teléfono ya existe.")
        return value

    def validate_email(self, value):
        # Excluir el cliente actual de la validación
        if value is not None and value != "":
            if self.instance:
                if Client.objects.filter(email=value).exclude(IDClient=self.instance.IDClient).exists():
                    raise serializers.ValidationError("Este correo electrónico ya existe.")
            else:
                if Client.objects.filter(email=value).exists():
                    raise serializers.ValidationError("Este correo electrónico ya existe.")
        return value
    
    def validate(self, data):
        # Verificar si el cliente tiene créditos activos (isCredit=True)
        if self.instance and data.get('state') == False and self.instance.isCredit:
            raise serializers.ValidationError(
                "No se puede inhabilitar al cliente porque tiene cuentas de crédito activas."
            )
        return data

class saleDetailSerializer(serializers.ModelSerializer):
    productName = serializers.SerializerMethodField()
    stock = serializers.SerializerMethodField(read_only=True)
    productCode = serializers.CharField(source='IDProduct.CodigoProducto', read_only=True)


    class Meta:
        model = SaleDetail
        fields = ['IDSaleDetail','IDSale','IDProduct','productCode','stock','productPrice','productName','quantity','subTotal','discount','tax','total','state','date']  

   
    def get_stock(self, obj):
        try:
            inventario = Inventario.objects.filter(IDProducto=obj.IDProduct).order_by('-fecha').first()
            return inventario.saldoUnidades if inventario else 0
        except AttributeError:
            return 0
        
    def get_productName(self, obj):
        # Obtén el nombre del producto usando el ID del producto
        product = Producto.objects.filter(IDProducto=obj.IDProduct.IDProducto).first()
        return product.NombreProducto if product else None

    def validate(self, data):
        # Obtener el precio del producto desde el modelo PrecioProducto
        producto = PrecioProducto.objects.get(IDProducto=data['IDProduct'])
        precio = producto.Precio

        ##Agregar el precio actual del producto
        data['productPrice'] = precio

        # Calcular el subtotal (cantidad * precio)
        data['subTotal'] = data['quantity'] * precio
        
        # Calcular el total sumando el descuento y el impuesto al subtotal
        data['total'] = data['subTotal'] - data.get('discount', 0) + data.get('tax', 0)

        return data

    @transaction.atomic
    def create(self, validated_data):
        # Crear el detalle de la venta
        sale_detail = SaleDetail.objects.create(**validated_data)

        # Lógica para actualizar el inventario
        self._update_inventory(sale_detail,0)

        return sale_detail

    @transaction.atomic
    def delete(self, instance):
        id_producto = instance.IDProduct

        try:
            # Obtener el registro de inventario relacionado con el detalle de venta
            inventory_record = Inventario.objects.filter(
                IDProducto=id_producto.IDProducto,
                IDSale=instance.IDSale
            ).first()

            if inventory_record:
                # Eliminar el registro de inventario relacionado
                inventory_record.delete()
            else:
                raise serializers.ValidationError({"message":"No se encontró el registro de inventario relacionado para eliminar."})

            # Obtener el último registro de inventario anterior a la fecha de la venta
            last_inventory_record = Inventario.objects.filter(
                IDProducto=id_producto.IDProducto,
                fecha__lt=instance.date
            ).order_by('-fecha').first()

            # Eliminar el detalle de venta
            instance.delete()

            # Recalcular registros de inventario posteriores, si es necesario
            if last_inventory_record:
                self._recalculate_subsequent_records(id_producto.IDProducto, last_inventory_record)

        except serializers.ValidationError as e:
            # Extraemos el mensaje de error y lo formateamos
            error_message = e.detail[0] if isinstance(e.detail, list) else str(e)
            raise serializers.ValidationError({"message": error_message})

        except Exception as e:
            raise serializers.ValidationError({"message": "Error al eliminar el detalle de la venta."})

    @transaction.atomic
    def update(self, instance, validated_data):
        old_quantity = instance.quantity
        instance = super().update(instance, validated_data)

        # Lógica para actualizar el inventario
        self._update_inventory(instance, old_quantity)

        return instance

    def _update_inventory(self, sale_detail, old_quantity):
        id_producto = sale_detail.IDProduct
        quantity = sale_detail.quantity

        previous_inventory_record = Inventario.objects.filter(
            IDProducto=id_producto,
            fecha__lt=sale_detail.date
        ).order_by('-fecha').first()

        if not previous_inventory_record:
            raise serializers.ValidationError({"message":"No se encontró un registro de inventario asociado a la venta."})

        saldo_anterior = previous_inventory_record.saldoUnidades
        costo_saldo_anterior = previous_inventory_record.costoSaldo
        costo_promedio_anterior = previous_inventory_record.costoPromedio

        nuevo_saldo_unidades = saldo_anterior - quantity
        nuevo_costo_salida = quantity  * costo_promedio_anterior
        nuevo_costo_saldo = costo_saldo_anterior - nuevo_costo_salida

        if nuevo_saldo_unidades < 0:
            raise serializers.ValidationError({"message":"El saldo de unidades no puede ser negativo."})

        last_inventory_record = Inventario.objects.filter(
            IDProducto=id_producto,
            IDSale=sale_detail.IDSale
        ).order_by('-fecha').first()

        if last_inventory_record:
            # Actualizar el último registro de inventario
            last_inventory_record.salida = quantity
            last_inventory_record.costoSalida = nuevo_costo_salida
            last_inventory_record.saldoUnidades = nuevo_saldo_unidades
            last_inventory_record.costoSaldo = nuevo_costo_saldo
            last_inventory_record.save()

            # Llama a la función para recalcular los registros posteriores
            self._recalculate_subsequent_records(id_producto, last_inventory_record)
        else:
            # Crear un nuevo registro de inventario si no existe
            Inventario.objects.create(
                IDProducto=id_producto,
                IDSale=sale_detail.IDSale,
                entrada=0,
                salida=quantity,
                saldoUnidades=nuevo_saldo_unidades,
                costoEntrada=0,
                costoSalida=nuevo_costo_salida,
                costoSaldo=nuevo_costo_saldo,
                costoPromedio=costo_promedio_anterior,  # Asumiendo que se mantiene el promedio
                tipoMovimiento='1'  # Salida por venta
            )

    def _recalculate_subsequent_records(self, id_producto, edited_record):
        subsequent_records = Inventario.objects.filter(
            IDProducto=id_producto,
            fecha__gt=edited_record.fecha
        ).order_by('fecha')

        saldo_anterior = edited_record.saldoUnidades
        costo_saldo_anterior = edited_record.costoSaldo
        costo_promedio_anterior = edited_record.costoPromedio

        for record in subsequent_records:
            if record.tipoMovimiento == '0':  # Entrada normal
                saldo_actual = saldo_anterior + record.entrada
                costo_saldo_actual = costo_saldo_anterior + record.costoEntrada
                costo_promedio_actual = costo_saldo_actual / saldo_actual if saldo_actual > 0 else 0
            elif record.tipoMovimiento == '1':  # Salida normal
                costo_salida_ajuste = record.salida * costo_promedio_anterior
                saldo_actual = saldo_anterior - record.salida
                costo_saldo_actual = costo_saldo_anterior - costo_salida_ajuste
                costo_promedio_actual = costo_promedio_anterior
                record.costoSalida = costo_salida_ajuste
            elif record.tipoMovimiento == '2':  # Entrada por ajuste
                costo_entrada_ajuste = record.entrada * costo_promedio_anterior
                saldo_actual = saldo_anterior + record.entrada
                costo_saldo_actual = costo_saldo_anterior + costo_entrada_ajuste
                record.costoEntrada = costo_entrada_ajuste
                costo_promedio_actual = costo_promedio_anterior
            elif record.tipoMovimiento == '3':  # Salida por ajuste
                costo_salida_ajuste = record.salida * costo_promedio_anterior
                saldo_actual = saldo_anterior - record.salida
                costo_saldo_actual = costo_saldo_anterior - costo_salida_ajuste
                record.costoSalida = costo_salida_ajuste
                costo_promedio_actual = costo_promedio_anterior

            # Verificar que el saldo no sea negativo
            if saldo_actual < 0:
                raise serializers.ValidationError({"message":"El saldo de unidades no puede ser negativo."})

            # Actualizar el registro con los nuevos valores
            record.saldoUnidades = saldo_actual
            record.costoSaldo = costo_saldo_actual
            record.costoPromedio = costo_promedio_actual
            record.save()

            # Actualizar los valores anteriores para la siguiente iteración
            saldo_anterior = saldo_actual
            costo_saldo_anterior = costo_saldo_actual
            costo_promedio_anterior = costo_promedio_actual  

class saleSerializer(serializers.ModelSerializer):
    details = saleDetailSerializer(many=True)
    Client = serializers.CharField(source='IDClient.name', read_only=True)
    PaymentMethod = serializers.CharField(source='IDPaymentMethod.name', read_only=True)
    Username = serializers.CharField(source='IDUser.username', read_only=True)
    

    class Meta:
        model = Sale
        fields = [
            'IDSale',
            'IDUser',
            'Username',
            'salesCode',
            'voucher',
            'isVoucher',
            'IDClient',
            'Client',  # Nombre del Cliente
            'IDPaymentMethod',
            'PaymentMethod',  # Nombre del Método de Pago
            'typeSale',
            'typeShipping',
            'shippingCost',
            'subTotal',
            'discount',
            'tax',
            'total',
            'date',
            'state',
            'expirationDate',
            'details'
        ]

    def validate_voucher(self, value):
        if value is not None and value != "":
            if self.instance:
                # Editando una instancia existente
                if Sale.objects.filter(voucher=value).exclude(IDSale=self.instance.IDSale).exists():
                    raise serializers.ValidationError("Este voucher ya existe.")
            else:
                # Creando una nueva instancia
                if Sale.objects.filter(voucher=value).exists():
                    raise serializers.ValidationError("Este voucher ya existe.")
        return value
    
    def validate_salesCode(self, value):
        # Excluir el cliente actual de la validación
        if self.instance:
            if Sale.objects.filter(salesCode=value).exclude(salesCode=self.instance.salesCode).exists():
                raise serializers.ValidationError("Este codigo de venta ya existe.")
        else:
            if Sale.objects.filter(salesCode=value).exists():
                raise serializers.ValidationError("Este codigo de venta ya existe.")
        return value

    def validate(self, data):
        details = data.get('details')
        if not details or len(details) == 0:
            raise serializers.ValidationError({"message": "Debe agregar un producto."})
               # Validación de stock para cada producto en detalles

        return data


    @transaction.atomic
    def create(self, validated_data):

        details_data = validated_data.pop('details')
        sale = Sale.objects.create(**validated_data)

        for detail_data in details_data:
            sale_detail = SaleDetail.objects.create(IDSale=sale, **detail_data)

            id_producto = detail_data['IDProduct']
            cantidad = detail_data['quantity']

            # Consultar el saldo y costo monetario actual
            saldo = Inventario.objects.filter(IDProducto=id_producto).order_by('-fecha').values_list('saldoUnidades', flat=True).first() or 0
            costo_monetario = Inventario.objects.filter(IDProducto=id_producto).order_by('-fecha').values_list('costoSaldo', flat=True).first() or 0

            # Consultar el costo promedio más actual
            costo_promedio = Inventario.objects.filter(IDProducto=id_producto).order_by('-fecha').values_list('costoPromedio', flat=True).first() or 0

            # Calcular costo de salida
            costo_salida = costo_promedio * cantidad

            # Actualizar inventario para una venta (salida de productos)
            saldo -= cantidad
            costo_monetario -= costo_salida

            Inventario.objects.create(
                IDProducto=id_producto,
                tipoMovimiento= 1,  # 1 para salida
                entrada = 0,
                salida=cantidad,
                saldoUnidades=saldo,
                costoSalida=costo_salida,
                costoEntrada=0,
                costoSaldo=costo_monetario,
                costoPromedio=costo_promedio,
                fecha=sale.date,
                IDSale=sale,  
                IDPurchase=None  
                
            )

        # Registrar en AccountsReceivable si typeSale es True
        if sale.typeSale:
            AccountsReceivable.objects.create(
                IDSale=sale,
                IDClient=sale.IDClient,
                type=True,
                inflow=sale.total,
                outflow=0,
                balance=sale.total,
                dateSale=sale.date,
                IDPaymentMethod = None,
                voucher = None
            )

        if sale.state == '2':
            # Actualizar el campo isCredit del cliente
            client = sale.IDClient
            client.isCredit = True
            client.save()

        return sale

    @transaction.atomic
    def update(self, instance, validated_data):
        # Validar si hay abonos (outflows) antes de cambiar el cliente
        if 'IDClient' in validated_data and instance.IDClient != validated_data['IDClient']:
            existing_outflows = AccountsReceivable.objects.filter(
                IDSale=instance,
                type=False  # Solo abonos (outflow)
            ).exists()

            if existing_outflows:
                raise serializers.ValidationError("La venta tiene abonos realizados. No se puede cambiar el cliente.")

        # Guardar el cliente actual y el nuevo cliente (si se actualiza)
        old_client = instance.IDClient
        new_client = validated_data.get('IDClient', old_client)

        # Almacenar el tipo de venta anterior
        old_type_sale = instance.typeSale

        # Actualizar los campos principales
        instance.IDClient = new_client
        instance.voucher = validated_data.get('voucher', instance.voucher)
        instance.salesCode = validated_data.get('salesCode', instance.salesCode)
        instance.typeSale = validated_data.get('typeSale', instance.typeSale)
        instance.IDPaymentMethod = validated_data.get('IDPaymentMethod', instance.IDPaymentMethod)
        instance.typeShipping = validated_data.get('typeShipping', instance.typeShipping)
        instance.shippingCost = validated_data.get('shippingCost', instance.shippingCost)
        instance.expirationDate = validated_data.get('expirationDate', instance.expirationDate)
        instance.subTotal = validated_data.get('subTotal', instance.subTotal)
        instance.discount = validated_data.get('discount', instance.discount)
        instance.tax = validated_data.get('tax', instance.tax)
        instance.total = validated_data.get('total', instance.total)
        instance.date = validated_data.get('date', instance.date)
        instance.state = validated_data.get('state', instance.state)
        instance.save()

        # Manejar cambios en el tipo de venta
        new_type_sale = instance.typeSale  # El nuevo tipo de venta

        if not old_type_sale and new_type_sale:
            # Crear registro en AccountsReceivable si cambia a crédito
            AccountsReceivable.objects.create(
                IDSale=instance,
                inflow=instance.total,
                balance=instance.total,
                type=True,  # Es una entrada (inflow)
                IDClient=new_client,
            )
            new_client.isCredit = True
            new_client.save()

        elif old_type_sale and not new_type_sale:
            # Si cambia a contado y tiene abonos, lanza un error
            existing_outflows = AccountsReceivable.objects.filter(
                IDSale=instance,
                type=False  # Solo abonos (outflow)
            ).exists()

            if existing_outflows:
                raise serializers.ValidationError("No se puede cambiar a contado porque existen abonos.")

            # Eliminar registro de AccountsReceivable
            AccountsReceivable.objects.filter(IDSale=instance).delete()

            has_pending_credit_sales = Sale.objects.filter(IDClient=old_client, typeSale=True, state='2').exists()
            if not has_pending_credit_sales:
                old_client.isCredit = False
                old_client.save()

        if instance.typeSale and instance.state == '2':  # Venta a crédito y pendiente
            account_receivable = AccountsReceivable.objects.filter(IDSale=instance).order_by('dateSale').first()

            if account_receivable:
                old_inflow = account_receivable.inflow
                old_balance = account_receivable.balance

                total_abonos = AccountsReceivable.objects.filter(
                    IDSale=instance, 
                    type=False  # Abonos (outflow)
                ).aggregate(total_abonos=Sum('outflow'))['total_abonos'] or 0

                if instance.total < total_abonos:
                    raise serializers.ValidationError("El cambio no puede realizarse porque los abonos superan el nuevo total.")

                account_receivable.inflow = instance.total
                account_receivable.balance = account_receivable.inflow
                account_receivable.save()

                subsequent_payments = AccountsReceivable.objects.filter(
                    IDSale=instance, 
                    type=False  # Abonos (outflow)
                ).order_by('dateSale')

                current_balance = account_receivable.balance
                for payment in subsequent_payments:
                    current_balance -= payment.outflow
                    payment.balance = current_balance
                    payment.save()

            if old_client != new_client:
                AccountsReceivable.objects.filter(IDSale=instance).update(IDClient=new_client)

            new_client.isCredit = True
            new_client.save()

            if old_client != new_client:  # Solo si el cliente ha cambiado
                has_pending_credit_sales = Sale.objects.filter(IDClient=old_client, typeSale=True, state='2').exists()
                if not has_pending_credit_sales:
                    old_client.isCredit = False
                    old_client.save()

        return instance

    @transaction.atomic
    def delete(self, instance):
        # Validar si existe un AccountsReceivable asociado con abonos
        existing_outflows = AccountsReceivable.objects.filter(
            IDSale=instance.IDSale,  # Verifica las cuentas asociadas a la venta
            type=False  # Filtra solo los abonos (outflows)
        ).exists()

        if existing_outflows:
            raise serializers.ValidationError({"message": "La venta tiene abonos realizados. No se puede eliminar."})

        try:
            # Recorre cada detalle de la compra y utiliza el PurchaseDetailSerializer para eliminarlo
            for detail in instance.details.all():
                # Utilizamos el serializer de detalles para manejar la eliminación
                detail_serializer = saleDetailSerializer()
                detail_serializer.delete(detail)

            # Después de eliminar todos los detalles, eliminamos la compra
            instance.delete()

            id_cliente = instance.IDClient
            if not AccountsReceivable.objects.filter(
                IDClient=id_cliente, IDSale__state='2'
            ).exists():
                cliente = instance.IDClient  # Obtener el cliente asociado a la venta
                cliente.isCredit = False  # Cambiar isCredit a False si no tiene más ventas al crédito
                cliente.save()        

        except Exception as e:
            # Si el error es de validación, extraemos solo el mensaje
            if isinstance(e, serializers.ValidationError):
                error_message = e.detail.get('message', str(e.detail))  # Extraemos el mensaje de error si existe
            else:
                error_message = f"Error al eliminar la compra: {str(e)}"

            raise serializers.ValidationError({"message": error_message})


class AccountsReceivableSerializer(serializers.ModelSerializer):
    IDClient = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), required=False)
    Client = serializers.CharField(source='IDClient.name', read_only=True)
    salesCode = serializers.CharField(source='IDSale.salesCode', read_only=True)
    PaymentMethod = serializers.CharField(source='IDPaymentMethod.name', read_only=True)

    class Meta:
        model = AccountsReceivable
        fields = [
                  'IDAccountsReceivable', 
                  'IDSale', 
                  'salesCode',
                  'IDClient', 
                  'Client', 
                  'paymentCode',
                  'IDPaymentMethod',
                  'PaymentMethod',
                  'voucher',
                  'type', 
                  'inflow', 
                  'outflow', 
                  'balance', 
                  'dateSale',
                  'description']
        
    def validate_voucher(self, value):
        if value is not None and value != "":
            if self.instance:
                # Editando una instancia existente
                if AccountsReceivable.objects.filter(voucher=value).exclude(IDAccountsReceivable=self.instance.IDAccountsReceivable).exists():
                    raise serializers.ValidationError("Este voucher ya existe.")
            else:
                # Creando una nueva instancia
                if AccountsReceivable.objects.filter(voucher=value).exists():
                    raise serializers.ValidationError("Este voucher ya existe.")
        return value

    def create(self, validated_data):
        # Verifica si el type es False (abono)
        if not validated_data.get('type'):
            # Obtener el ID del cliente y la venta desde los datos validados
            id_cliente = validated_data.get('IDClient')
            id_sale = validated_data.get('IDSale')
            
            # Obtener el balance más actual para el cliente pero solo de la misma venta (IDSale)
            balance_actual = AccountsReceivable.objects.filter(IDClient=id_cliente, IDSale=id_sale).order_by('-dateSale').values_list('balance', flat=True).first() or 0
            
            # Calcular el nuevo balance restando el outflow
            nuevo_balance = balance_actual - validated_data.get('outflow', 0)
            
            # Verificar si el nuevo balance es menor que 0
            if nuevo_balance < 0:
                raise ValidationError('El balance resultante es negativo. No se puede crear el registro.')

            # Asignar el nuevo balance a los datos validados
            validated_data['balance'] = nuevo_balance
            
            # Asegurar que inflow sea 0 cuando se trata de un abono
            validated_data['inflow'] = 0

            # Si el balance llega a 0, actualiza el estado de la venta
            if nuevo_balance == 0:
                sale = validated_data['IDSale']
                sale.state = '3'  # Cambiar estado a '3' (completado)
                sale.save()

                if not AccountsReceivable.objects.filter(
                    IDClient=id_cliente, IDSale__state='2'
                ).exists():
                    cliente = validated_data['IDClient']
                    cliente.isCredit = False  # Cambiar isCredit a False
                    cliente.save()

        # Crear la instancia de AccountsReceivable
        accounts_receivable = super().create(validated_data)

        # Recalcular los balances de los registros posteriores
        registros_posteriores = AccountsReceivable.objects.filter(
            IDClient=accounts_receivable.IDClient,
            IDSale=accounts_receivable.IDSale,
            dateSale__gt=accounts_receivable.dateSale
        ).order_by('dateSale')

        current_balance = accounts_receivable.balance

        for registro in registros_posteriores:
            current_balance -= registro.outflow
            if current_balance < 0:
                # Restaurar el balance actual antes de lanzar la excepción
                accounts_receivable.delete()
                raise ValidationError('El balance resultante es negativo. No se puede crear el registro.')
            registro.balance = current_balance
            registro.save()

        return accounts_receivable
    
    def update(self, instance, validated_data):


        new_outflow = validated_data.get('outflow', instance.outflow)
        new_inflow = validated_data.get('inflow', instance.inflow)
        description = validated_data.get('description', instance.description)
        instance.voucher = validated_data.get('voucher',instance.voucher)
        instance.IDPaymentMethod = validated_data.get('IDPaymentMethod', instance.IDPaymentMethod)


        # Calcular el balance previo antes de la actualización
        previous_balance = instance.balance + instance.outflow - instance.inflow

        # Nuevo balance después de la actualización
        new_balance = previous_balance - new_outflow + new_inflow

        # Verificar si el nuevo balance es menor que 0
        if new_balance < 0:
            raise ValidationError('El balance resultante es negativo. No se puede actualizar el registro.')

        # Actualizar el registro actual
        instance.outflow = new_outflow
        instance.inflow = new_inflow
        instance.balance = new_balance
        instance.description = description
        instance.save()

        # Actualizar el estado de la venta si el balance es 0
        if new_balance == 0:
            # Obtener la venta asociada
            sale = instance.IDSale
            # Cambiar el estado de la venta a '3' (asumiendo que '3' es el estado pagado)
            sale.state = '3'
            sale.save()

            # Eliminar registros posteriores si el balance es 0 y es el último abono
            AccountsReceivable.objects.filter(
                IDClient=instance.IDClient,
                IDSale=instance.IDSale,
                dateSale__gt=instance.dateSale
            ).delete()

            # Verificar el estado de todos los sales asociados al cliente
            all_sales = Sale.objects.filter(IDClient=instance.IDClient)
            if not all_sales.filter(state='2').exists():
                # Si no hay ningún sale pendiente, actualizar el campo isCredit del cliente a False
                cliente = instance.IDClient
                cliente.isCredit = False
                cliente.save()

        else:
            # Actualizar los registros posteriores
            registros_posteriores = AccountsReceivable.objects.filter(
                IDClient=instance.IDClient,
                IDSale=instance.IDSale,
                dateSale__gt=instance.dateSale
            ).order_by('dateSale')

            current_balance = new_balance

            for registro in registros_posteriores:
                current_balance -= registro.outflow
                if current_balance < 0:
                    # Restaurar el balance actual antes de lanzar la excepción
                    instance.save()  # Guardar el registro actual para evitar pérdida de datos
                    raise ValidationError('El balance resultante es negativo. No se puede actualizar el registro.')
                registro.balance = current_balance
                registro.save()

        return instance

class SaleSummarySerializer(serializers.ModelSerializer):
    accounts_receivable = AccountsReceivableSerializer(many=True, source='accountsreceivable_set')  

    class Meta:
        model = Sale
        fields = ['IDSale', 'salesCode', 'total', 'date','state','expirationDate', 'accounts_receivable']

    def get_accounts_receivable(self, obj):
        # Obtener la lista de registros de AccountsReceivable relacionados
        accounts_receivable = obj.accountsreceivable_set.all()
        # Ordenar por dateSale
        sorted_accounts_receivable = accounts_receivable.order_by('dateSale')
        # Serializar la lista ordenada
        serializer = AccountsReceivableSerializer(sorted_accounts_receivable, many=True)
        return serializer.data


class QuotationDetailSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='IDProduct.NombreProducto', read_only=True)
    price = serializers.DecimalField(source='IDProduct.precio_producto.Precio', max_digits=20, decimal_places=4, read_only=True)
    stock = serializers.SerializerMethodField()

    
    class Meta:
        model = QuotationDetail
        exclude = ['IDQuotation']

    def get_stock(self, obj):
        # Obtiene el saldo de unidades más reciente para el producto
        ultimo_inventario = Inventario.objects.filter(IDProducto=obj.IDProduct).order_by('-fecha').first()
        return ultimo_inventario.saldoUnidades if ultimo_inventario else 0

    def validate(self, data):
        producto = PrecioProducto.objects.get(IDProducto=data['IDProduct'])
        precio = producto.Precio
        
        data['subTotal'] = data['quantity'] * precio
        data['total'] = data['subTotal'] - data.get('discount', 0) + data.get('tax', 0)
        
        return data


class QuotationSerializer(serializers.ModelSerializer):
    details = QuotationDetailSerializer(many=True)  # Asegúrate de usar solo un serializer aquí.
    Client = serializers.CharField(source='IDClient.name', read_only=True)
    phone = serializers.CharField(source='IDClient.phone', read_only=True)
    address = serializers.CharField(source='IDClient.address', read_only=True)
    department = serializers.CharField(source='IDClient.IDMunicipality.IDDepartment.name',read_only=True)
    municipality = serializers.CharField(source='IDClient.IDMunicipality.name',read_only=True)
    quotationCode = serializers.CharField(read_only=True)  # Incluye purchaseCode solo en GET

    
    class Meta:
        model = Quotation
        fields = [
            'IDQuotation',
            'quotationCode',
            'IDClient',
            'Client', 
            'phone',
            'address',
            'municipality',
            'department',
            'typeShipping',
            'shippingCost',
            'subTotal',
            'discount',
            'tax',
            'total',
            'date',
            'state',
            'details'
        ]

    def create(self, validated_data):
        details_data = validated_data.pop('details')
        quotation = Quotation.objects.create(**validated_data)
        
        for detail_data in details_data:
            QuotationDetail.objects.create(IDQuotation=quotation, **detail_data)
        
        return quotation

    def validate(self, data):
        details = data.get('details')
        if not details or len(details) == 0:
            raise serializers.ValidationError({"message": "Debe agregar un producto."})
        return data
    

#REPORTE VENTAS POR FECHAS
class SaleReportSerializer(serializers.ModelSerializer):
    Client = serializers.CharField(source='IDClient.name', read_only=True)
    PaymentMethod = serializers.CharField(source='IDPaymentMethod.name', read_only=True)
    details = saleDetailSerializer(many=True, read_only=True)
    phone = serializers.CharField(source='IDClient.phone', read_only=True)  
    municipality = serializers.CharField(source='IDClient.IDMunicipality.name', read_only=True)  
    department = serializers.CharField(source='IDClient.IDMunicipality.IDDepartment.name', read_only=True) 
    address = serializers.CharField(source='IDClient.address', read_only=True)
    Username = serializers.CharField(source='IDUser.username', read_only=True)

    
    class Meta:
        model = Sale
        fields = ['IDSale',
                  'IDUser',
                  'Username',
                  'salesCode', 
                  'IDClient', 
                  'Client',
                  'phone',
                  'municipality',
                  'department',
                  'address',
                  'voucher',
                  'isVoucher',
                  'IDPaymentMethod', 
                  'PaymentMethod', 
                  'typeSale', 
                  'typeShipping', 
                  'shippingCost', 
                  'subTotal', 
                  'discount', 
                  'tax', 
                  'total', 
                  'date', 
                  'expirationDate',
                  'state', 
                  'details']

##REPORTE CLIENTES CREDITO

class ClientReportSerializer(serializers.ModelSerializer):
    nearest_pending_sale = serializers.SerializerMethodField()
    pending_sales_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = ['IDClient', 'name', 'lastName','pending_sales_count', 'nearest_pending_sale']

    def get_nearest_pending_sale(self, client):
        # Obtener la venta pendiente más cercana a expirar
        pending_sales = Sale.objects.filter(IDClient=client, state='2').order_by('expirationDate')
        if pending_sales.exists():
            nearest_sale = pending_sales.first()
            
            # Obtener el balance más actual de la venta más próxima a expirar
            accounts_receivable = AccountsReceivable.objects.filter(IDSale=nearest_sale).order_by('-dateSale').first()
            balance = accounts_receivable.balance if accounts_receivable else nearest_sale.total
            
            return {
                'salesCode': nearest_sale.salesCode,
                'expirationDate': nearest_sale.expirationDate,
                'total': nearest_sale.total,
                'balance': balance,  # Balance más actual de AccountsReceivable
            }
        return None

    def get_pending_sales_count(self, client):
        # Contar las ventas pendientes
        return Sale.objects.filter(IDClient=client, state='2').count()
    
##Reporte ventas semanal - aumento semanal.
class SalesMonthReportSerializer(serializers.Serializer):
    week = serializers.IntegerField()
    sales = serializers.DecimalField(max_digits=20, decimal_places=2)
    growth = serializers.DecimalField(max_digits=20, decimal_places=2)
    growth_percentage = serializers.DecimalField(max_digits=6, decimal_places=2)

##Reporte ventas por mes - anual.
class SalesAnnualReportSerializer(serializers.Serializer):
    Enero = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Febrero = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Marzo = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Abril = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Mayo = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Junio = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Julio = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Agosto = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Septiembre = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Octubre = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Noviembre = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Diciembre = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    Total = serializers.DecimalField(max_digits=20, decimal_places=4, default=0.00)

##Reporte ventas para solo los dias que hubieron ventas en el mes.
class DailySalesReportSerializer(serializers.Serializer):
    date = serializers.DateField()
    total_sales = serializers.DecimalField(max_digits=20, decimal_places=4)

##Reporte de clientes y su total de ventas en el mes especificado
class ClientSalesMonthlyReportSerializer(serializers.Serializer):
    name = serializers.CharField()
    lastName = serializers.CharField()
    total_spent = serializers.DecimalField(max_digits=20, decimal_places=4)
    most_purchased_product = serializers.CharField(allow_null=True)
    most_purchased_quantity = serializers.IntegerField()
    total_spent_on_product = serializers.DecimalField(max_digits=20, decimal_places=4)

##Obtener ultimo salesCode
class SalesCodeSerializer(serializers.Serializer):
    last_sales_code = serializers.CharField()

class LatestQuotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quotation
        fields = ['quotationCode']