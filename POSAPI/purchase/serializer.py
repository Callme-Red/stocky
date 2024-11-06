from rest_framework import serializers
from .models import Purchase, Supplier, PurchaseDetail,PaymentMethod,ExpenseCategory,Expense
from rest_framework.exceptions import ValidationError
from inventory.models import Inventario
from django.db import transaction
from inventory.models import Producto

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = 'IDSupplier', 'ruc', 'name', 'SocialReason', 'phone', 'email', 'state', 'date'

    def validate_name(self, value):
        instance = getattr(self, 'instance', None)
        if instance and instance.name == value:
            return value  # Allow the same value if it's the current record

        if Supplier.objects.filter(name=value).exists():
            raise ValidationError("Este nombre ya existe.")
        return value

    def validate_ruc(self, value):
        # Excluir el proveedor actual de la validación
        if value is not None and value != "":
            if self.instance:
                if Supplier.objects.filter(ruc=value).exclude(IDSupplier=self.instance.IDSupplier).exists():
                    raise serializers.ValidationError("Este número ruc ya existe.")
            else:
                if Supplier.objects.filter(ruc=value).exists():
                    raise serializers.ValidationError("Este número ruc ya existe.")
        return value
    
    def validate_SocialReason(self, value):
        # Excluir el proveedor actual de la validación
        if value is not None and value != "":
            if self.instance:
                if Supplier.objects.filter(SocialReason=value).exclude(IDSupplier=self.instance.IDSupplier).exists():
                    raise serializers.ValidationError("Esta razon social ya existe.")
            else:
                if Supplier.objects.filter(SocialReason=value).exists():
                    raise serializers.ValidationError("Este número de teléfono ya existe.")
        return value

    def validate_phone(self, value):
        # Excluir el proveedor actual de la validación
        if value is not None and value != "":
            if self.instance:
                if Supplier.objects.filter(phone=value).exclude(IDSupplier=self.instance.IDSupplier).exists():
                    raise serializers.ValidationError("Este número de teléfono ya existe.")
            else:
                if Supplier.objects.filter(phone=value).exists():
                    raise serializers.ValidationError("Este número de teléfono ya existe.")
        return value

    def validate_email(self, value):
        # Excluir el proveedor actual de la validación
        if value is not None and value != "":
            if self.instance:
                if Supplier.objects.filter(email=value).exclude(IDSupplier=self.instance.IDSupplier).exists():
                    raise serializers.ValidationError("Este correo electrónico ya existe.")
            else:
                if Supplier.objects.filter(email=value).exists():
                    raise serializers.ValidationError("Este correo electrónico ya existe.")
        return value

    def create(self, validated_data):
        return Supplier.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.ruc = validated_data.get('ruc', instance.ruc)
        instance.name = validated_data.get('name', instance.name)
        instance.SocialReason = validated_data.get('SocialReason', instance.SocialReason)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.email = validated_data.get('email', instance.email)
        instance.state = validated_data.get('state', instance.state)
        instance.save()
        return instance
    
class PurchaseDetailSerializer(serializers.ModelSerializer):
    productName = serializers.SerializerMethodField()  # Campo para el nombre del producto
    productCode = serializers.CharField(source='IDProduct.CodigoProducto', read_only=True)

    class Meta:
        model = PurchaseDetail
        fields = ['IDPurchaseDetail','IDPurchase', 'quantity', 'cost', 'subTotal', 'discount', 'tax', 'total', 'state', 'IDProduct', 'productName','productCode','date']

    def get_productName(self, obj):
        # Obtén el nombre del producto usando el ID del producto
        product = Producto.objects.filter(IDProducto=obj.IDProduct.IDProducto).first()
        return product.NombreProducto if product else None

    def create(self, validated_data):
        # Envolver en una transacción atómica
        try:
            with transaction.atomic():
                # Crear el registro de detalle de compra
                purchase_detail = super().create(validated_data)

                # Actualizar el inventario usando la función existente
                self._create_inventory(purchase_detail)  # 0 como old_quantity porque es una nueva entrada

                return purchase_detail  # Retornar el detalle de compra creado

        except serializers.ValidationError as e:
            # Capturar la excepción y evitar que la creación se aplique
            raise serializers.ValidationError({"message": str(e)})

    def update(self, instance, validated_data):
        old_quantity = instance.quantity  # Cantidad antigua antes de la actualización
        old_total = instance.total  # Total antiguo antes de la actualización

        # Envolver en una transacción atómica
        try:
            with transaction.atomic():
                instance = super().update(instance, validated_data)
                # Actualizar el inventario solo si no se produce un error
                self._update_inventory(instance, old_quantity)
        except serializers.ValidationError as e:
            # Capturar la excepción y evitar que la actualización se aplique
            raise ValidationError({"message": "El saldo de unidades no puede ser negativo."})
            
        return instance

    def delete(self, instance):
        id_producto = instance.IDProduct

        try:
            with transaction.atomic():
                # Obtener el registro de inventario para el producto
                inventory_records = Inventario.objects.filter(IDProducto=id_producto.IDProducto)

                # Verificar si hay registros anteriores a la fecha del detalle de compra
                previous_inventory_records = inventory_records.filter(fecha__lt=instance.IDPurchase.date)

                # Si hay registros anteriores, se puede eliminar sin problemas
                if previous_inventory_records.exists():
                    inventory_record = Inventario.objects.filter(
                        IDProducto=id_producto.IDProducto,
                        IDPurchase=instance.IDPurchase
                    ).first()

                    if inventory_record:
                        # Obtener el último registro de inventario anterior al registro que se va a eliminar
                        last_inventory_record = inventory_records.filter(fecha__lt=inventory_record.fecha).order_by('-fecha').first()

                        # Eliminar el registro de inventario
                        inventory_record.delete()

                        # Eliminar el detalle de compra
                        instance.delete()

                        # Recalcular los registros posteriores utilizando el último registro anterior
                        if last_inventory_record:
                            self._recalculate_subsequent_records(id_producto.IDProducto, last_inventory_record)
                    else:
                        raise serializers.ValidationError({"message":"No se encontró el registro de inventario relacionado para eliminar."})

                else:
                    # Si no hay registros anteriores, verificar si es el único registro
                    if inventory_records.count() == 1:
                        # Si es el único registro de inventario, se puede eliminar sin problemas
                        inventory_record = inventory_records.first()
                        inventory_record.delete()
                        instance.delete()
                        # No hay registros posteriores para recalcular, ya que es el único registro
                    else:
                        # Si hay más de un registro de inventario, no se puede eliminar
                        raise serializers.ValidationError("El saldo de unidades no puede ser negativo.")

        except serializers.ValidationError as e:
            # Extraer el mensaje de error y formatearlo correctamente
            error_message = e.detail[0] if isinstance(e.detail, list) else str(e)
            raise serializers.ValidationError({"message": error_message})

        except Exception as e:
            # Manejar errores generales
            raise serializers.ValidationError({"message": "Error al eliminar el detalle de compra."})

    def _create_inventory(self, purchase_detail):
        id_producto = purchase_detail.IDProduct
        quantity = purchase_detail.quantity
        total_cost = purchase_detail.total

        # Obtener el último registro de inventario
        last_inventory_record = Inventario.objects.filter(
            IDProducto=id_producto
        ).order_by('-fecha').first()

        # Calcular valores basados en el último registro de inventario
        if last_inventory_record:
            saldo_anterior = last_inventory_record.saldoUnidades
            costo_saldo_anterior = last_inventory_record.costoSaldo

            # Calcular el nuevo saldo de unidades
            nuevo_saldo_unidades = saldo_anterior + quantity

            # Calcular el nuevo costo saldo
            nuevo_costo_saldo = costo_saldo_anterior + total_cost

            # Calcular el nuevo costo promedio
            nuevo_costo_promedio = nuevo_costo_saldo / nuevo_saldo_unidades if nuevo_saldo_unidades > 0 else 0

        else:
            # Si no hay registro anterior, inicializar valores
            nuevo_saldo_unidades = quantity
            nuevo_costo_saldo = total_cost
            nuevo_costo_promedio = total_cost / quantity if quantity > 0 else 0

        # Crear un nuevo registro de inventario
        Inventario.objects.create(
            IDProducto=id_producto,
            IDPurchase=purchase_detail.IDPurchase,
            entrada=quantity,
            salida=0,  # Salida del producto
            saldoUnidades=nuevo_saldo_unidades,
            costoEntrada=total_cost,
            costoSalida=0,
            costoSaldo=nuevo_costo_saldo,
            costoPromedio=nuevo_costo_promedio,
            tipoMovimiento='0'  # Indicar que es una entrada por compra
        )


    def _update_inventory(self, purchase_detail, old_quantity):
        id_producto = purchase_detail.IDProduct
        quantity = purchase_detail.quantity
        total_cost = purchase_detail.total

        # Obtener el último registro de inventario anterior a la fecha del registro actual
        previous_inventory_record = Inventario.objects.filter(
            IDProducto=id_producto,
            fecha__lt=purchase_detail.date  # Usamos la fecha del detalle de compra asociada
        ).order_by('-fecha').first()

        saldo_anterior = previous_inventory_record.saldoUnidades if previous_inventory_record else 0
        costo_saldo_anterior = previous_inventory_record.costoSaldo if previous_inventory_record else 0

        # Actualizar la entrada con la nueva cantidad
        entrada_actualizada = quantity

        # Calcular el nuevo saldo de unidades
        nuevo_saldo_unidades = saldo_anterior + entrada_actualizada 

        # Calcular el nuevo costo de entrada
        costo_entrada_actualizado = total_cost

        # Calcular el nuevo costo saldo
        nuevo_costo_saldo = costo_saldo_anterior + costo_entrada_actualizado

        # Calcular el nuevo costo promedio
        nuevo_costo_promedio = nuevo_costo_saldo / nuevo_saldo_unidades if nuevo_saldo_unidades > 0 else 0

        # Verificar que el saldo no sea negativo
        if nuevo_saldo_unidades <= 0:
            raise serializers.ValidationError({"message":"El saldo de unidades no puede ser negativo."})

        # Actualizar o crear el registro de inventario actual
        last_inventory_record = Inventario.objects.filter(
            IDProducto=id_producto,
            IDPurchase=purchase_detail.IDPurchase
        ).order_by('-fecha').first()

        if last_inventory_record:
            last_inventory_record.entrada = entrada_actualizada
            last_inventory_record.salida = 0  # Siempre 0 porque es una compra
            last_inventory_record.saldoUnidades = nuevo_saldo_unidades
            last_inventory_record.costoEntrada = costo_entrada_actualizado
            last_inventory_record.costoSalida = 0  # Siempre 0 porque es una compra
            last_inventory_record.costoSaldo = nuevo_costo_saldo
            last_inventory_record.costoPromedio = nuevo_costo_promedio
            last_inventory_record.save()

            # Recalcular los registros posteriores
            self._recalculate_subsequent_records(id_producto, last_inventory_record)

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

class PurchaseSerializer(serializers.ModelSerializer):
    details = PurchaseDetailSerializer(many=True)
    Supplier = serializers.CharField(source='IDSupplier.name', read_only=True)
    PaymentMethod = serializers.CharField(source='IDPaymentMethod.name', read_only=True)
    purchaseCode = serializers.CharField(read_only=True)  # Incluye purchaseCode solo en GET


    class Meta:
        model = Purchase
        fields = [
            'IDPurchase',
            'purchaseCode',
            'subTotal',
            'discount',
            'tax',
            'total',
            'date',
            'state',
            'IDSupplier',
            'Supplier',
            'IDPaymentMethod',
            'PaymentMethod',
            'details',
        ]

    def validate(self, data):
        # Verifica que el campo 'details' no esté vacío
        details = data.get('details')
        if not details or len(details) == 0:
            raise serializers.ValidationError({"message": "Debe agregar un producto."})
        return data

    @transaction.atomic
    def create(self, validated_data):
        details_data = validated_data.pop('details')
        purchase = Purchase.objects.create(**validated_data)  # Crear la compra

        for detail_data in details_data:
            # Aquí se asegura de que IDPurchase se asigne automáticamente
            purchase_detail = PurchaseDetail.objects.create(IDPurchase=purchase, **detail_data)

            # Extraer datos del detalle de compra
            id_producto = detail_data['IDProduct']
            cantidad = detail_data['quantity']
            costo_total = detail_data['total']

            # Consultar el saldo y costo monetario actual
            saldo = Inventario.objects.filter(IDProducto=id_producto).order_by('-fecha').values_list('saldoUnidades', flat=True).first() or 0
            costo_monetario = Inventario.objects.filter(IDProducto=id_producto).order_by('-fecha').values_list('costoSaldo', flat=True).first() or 0

            # Actualizar inventario para una compra (entrada de productos)
            saldo += cantidad
            costo_monetario += costo_total
            costo_promedio = costo_monetario / saldo if saldo > 0 else 0

            # Crear o actualizar el inventario
            Inventario.objects.create(
                IDProducto=id_producto,
                tipoMovimiento=0, 
                entrada=cantidad,
                salida=0,
                saldoUnidades=saldo,
                costoSalida=0,
                costoEntrada=costo_total,
                costoSaldo=costo_monetario,
                costoPromedio=costo_promedio,
                fecha=purchase.date,
                IDPurchase=purchase,  # Establecer IDPurchase
                IDSale=None           # Asegurarse de que IDSale sea null
            )

        return purchase
    
    @transaction.atomic
    def update(self, instance, validated_data):
        # Actualizar campos principales
        instance.IDPaymentMethod = validated_data.get('IDPaymentMethod', instance.IDPaymentMethod)
        instance.IDSupplier = validated_data.get('IDSupplier', instance.IDSupplier)

        instance.subTotal = validated_data.get('subTotal', instance.subTotal)
        instance.discount = validated_data.get('discount', instance.discount)
        instance.tax = validated_data.get('tax', instance.tax)
        instance.total = validated_data.get('total', instance.total)
        instance.date = validated_data.get('date', instance.date)
        instance.state = validated_data.get('state', instance.state)
        instance.save()
        
        return instance

    @transaction.atomic
    def delete(self, instance):
        try:
            # Recorre cada detalle de la compra y utiliza el PurchaseDetailSerializer para eliminarlo
            for detail in instance.details.all():
                # Utilizamos el serializer de detalles para manejar la eliminación
                detail_serializer = PurchaseDetailSerializer()
                detail_serializer.delete(detail)

            # Después de eliminar todos los detalles, eliminamos la compra
            instance.delete()

        except Exception as e:
            # Si el error es de validación, extraemos solo el mensaje
            if isinstance(e, serializers.ValidationError):
                error_message = e.detail.get('message', str(e.detail))  # Extraemos el mensaje de error si existe
            else:
                error_message = f"Error al eliminar la compra: {str(e)}"

            raise serializers.ValidationError({"message": error_message})

            

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='IDExpenseCategory.name', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'IDExpense',
            'name',
            'description',
            'amount',
            'date',
            'IDExpenseCategory',
            'category',
            'state'
        ]


#REPORTES COMPRA POR FECHA
class PurchaseReportSerializer(serializers.ModelSerializer):
    details = PurchaseDetailSerializer(many=True)
    Supplier = serializers.CharField(source='IDSupplier.name', read_only=True)
    PaymentMethod = serializers.CharField(source='IDPaymentMethod.name', read_only=True)
    purchaseCode = serializers.CharField(read_only=True)

    class Meta:
        model = Purchase
        fields = [
            'IDPurchase',
            'purchaseCode',
            'subTotal',
            'discount',
            'tax',
            'total',
            'date',
            'state',
            'IDSupplier',
            'Supplier',
            'IDPaymentMethod',
            'PaymentMethod',
            'details',
        ]

## REPORTE PROVEEDORES MAS COTIZADOS
class SupplierReportSerializer(serializers.ModelSerializer):
    total_purchases = serializers.IntegerField(read_only=True)
    total_spent = serializers.DecimalField(max_digits=20, decimal_places=4, read_only=True)
    
    class Meta:
        model = Supplier
        fields = ['IDSupplier', 'name',
                 'total_purchases', 'total_spent']

