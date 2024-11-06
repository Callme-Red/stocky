from rest_framework import serializers
from .models import *
from django.db import transaction


class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['IDCategoria', 'NombreCategoria', 'descripcion','estado']

    def validate_NombreCategoria(self, value):
        # Obtener el ID de la categoría en la que se está realizando la actualización (si está presente)
        request = self.context.get('request')
        if request and request.method == 'PUT':
            categoria_id = request.parser_context['kwargs'].get('pk')
            # Solo verificar si existe en otras categorías
            if Categoria.objects.filter(NombreCategoria=value).exclude(IDCategoria=categoria_id).exists():
                raise serializers.ValidationError("Este nombre de categoría ya existe.")
        else:
            # Validación normal para creación
            if Categoria.objects.filter(NombreCategoria=value).exists():
                raise serializers.ValidationError("Este nombre de categoría ya existe.")
        return value
class PrecioProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrecioProducto
        fields = ['Precio', 'Costo', 'Margen', 'Ganancia']


class Productos(serializers.ModelSerializer):
    IDCategoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    nombre_categoria = serializers.SerializerMethodField()
    precio_producto = PrecioProductoSerializer()
    existencias = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = [
            'IDProducto', 'CodigoProducto', 'IDCategoria', 'NombreProducto', 'nombre_categoria', 'descripcion', 'cantidadMinima', 'estado', 'FechaIngreso',
            'precio_producto', 'existencias'
        ]

    def get_nombre_categoria(self, obj):
        return obj.IDCategoria.NombreCategoria

    def get_existencias(self, obj):
        try:
            inventario = Inventario.objects.filter(IDProducto=obj).order_by('-fecha').first()
            return inventario.saldoUnidades if inventario else 0
        except AttributeError:
            return 0

    def get_costo_promedio(self, obj):
        try:
            inventario = Inventario.objects.filter(IDProducto=obj).order_by('-fecha').first()
            return inventario.costoPromedio if inventario else 0.00
        except AttributeError:
            return 0.00

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Obtener el costo promedio directamente usando el método de la instancia
        costo_promedio = self.get_costo_promedio(instance)
        
        # Modificar el campo `precio_producto` para incluir el costo promedio
        precio_producto = representation.get('precio_producto', {})
        if precio_producto is None:
            precio_producto = {}
        
        precio_producto['Costo'] = costo_promedio
        representation['precio_producto'] = precio_producto
        
        # Excluir `existencias` en POST y PUT
        if self.context['request'].method in ['POST', 'PUT']:
            representation.pop('existencias', None)

        return representation

    def validate_CodigoProducto(self, value):
        if self.instance is None:
            if Producto.objects.filter(CodigoProducto=value).exists():
                raise serializers.ValidationError("Este código de producto ya existe.")
        else:
            if Producto.objects.filter(CodigoProducto=value).exclude(IDProducto=self.instance.IDProducto).exists():
                raise serializers.ValidationError("Este código de producto ya existe.")
        return value

    def create(self, validated_data):
        precio_data = validated_data.pop('precio_producto', {})

        # Crea el producto
        producto = Producto.objects.create(**validated_data)

        # Inicializa el `Costo` a 0 en el momento de la creación
        PrecioProducto.objects.create(
            IDProducto=producto,
            Precio=precio_data.get('Precio', 0.00),
            Costo=0.00,  # Inicializa el costo a 0
            Margen=precio_data.get('Margen', 0.00),
            Ganancia=precio_data.get('Ganancia', 0.00)
        )

        return producto

    def update(self, instance, validated_data):
        precio_data = validated_data.pop('precio_producto', {})

        # Actualiza los datos del `Producto`
        instance.CodigoProducto = validated_data.get('CodigoProducto', instance.CodigoProducto)
        instance.NombreProducto = validated_data.get('NombreProducto', instance.NombreProducto)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.IDCategoria = validated_data.get('IDCategoria', instance.IDCategoria)
        instance.cantidadMinima = validated_data.get('cantidadMinima', instance.cantidadMinima)
        instance.estado = validated_data.get('estado', instance.estado)
        instance.save()

        # Actualiza el `Costo` con el costo promedio más reciente, manteniendo otros campos igual
        precio_producto, created = PrecioProducto.objects.get_or_create(IDProducto=instance)
        if not created:  # Solo actualiza el costo si el `PrecioProducto` ya existe
            precio_producto.Costo = self.get_costo_promedio(instance)  # Actualiza solo el costo
        precio_producto.Precio = precio_data.get('Precio', precio_producto.Precio)
        precio_producto.Margen = precio_data.get('Margen', precio_producto.Margen)
        precio_producto.Ganancia = precio_data.get('Ganancia', precio_producto.Ganancia)
        precio_producto.save()

        return instance

class InventoryAdjustmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryAdjustment
        fields = '__all__'

    @transaction.atomic
    def create(self, validated_data):
        # Crear el ajuste de inventario
        adjustment = InventoryAdjustment.objects.create(**validated_data)

        # Extraer datos del ajuste
        id_producto = adjustment.IDProduct
        cantidad = adjustment.quantity
        movimiento_tipo = adjustment.movement_type
        costo_total = adjustment.cost
        fecha_ajuste = adjustment.date

        # Obtener el saldo y costo monetario actual del inventario
        ultimo_inventario = Inventario.objects.filter(IDProducto=id_producto).order_by('-fecha').first()

        saldo_actual = ultimo_inventario.saldoUnidades if ultimo_inventario else 0
        costo_saldo_actual = ultimo_inventario.costoSaldo if ultimo_inventario else 0
        costo_promedio_actual = ultimo_inventario.costoPromedio if ultimo_inventario else 0

        if movimiento_tipo == '2':  # Entrada por ajuste
            costo_entrada = costo_promedio_actual * cantidad
            nuevo_saldo = saldo_actual + cantidad
            nuevo_costo_saldo = costo_saldo_actual + costo_entrada

            Inventario.objects.create(
                IDProducto=id_producto,
                tipoMovimiento='2',
                entrada=cantidad,
                salida=0,
                saldoUnidades=nuevo_saldo,
                costoEntrada=costo_entrada,
                costoSalida=0,
                costoSaldo=nuevo_costo_saldo,
                costoPromedio=costo_promedio_actual,  # Mantener el costo promedio actual
                fecha=fecha_ajuste
            )

        elif movimiento_tipo == '3':  # Salida por ajuste
            if cantidad > saldo_actual:
                raise serializers.ValidationError("La cantidad de salida excede el saldo disponible en inventario.")

            costo_salida = costo_promedio_actual * cantidad
            nuevo_saldo = saldo_actual - cantidad
            nuevo_costo_saldo = costo_saldo_actual - costo_salida

            Inventario.objects.create(
                IDProducto=id_producto,
                tipoMovimiento='3',
                entrada=0,
                salida=cantidad,
                saldoUnidades=nuevo_saldo,
                costoEntrada=0,
                costoSalida=costo_salida,
                costoSaldo=nuevo_costo_saldo,
                costoPromedio=costo_promedio_actual,  # Mantener el costo promedio actual
                fecha=fecha_ajuste
            )

        return adjustment

class InventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = [
            'IDInventario', 'IDProducto', 'tipoMovimiento', 'entrada', 'salida', 
            'saldoUnidades', 'costoEntrada', 'costoSalida', 'costoSaldo', 
            'costoPromedio', 'fecha', 'IDPurchase', 'IDSale'
        ]

#REPORTE PRODUCTOS MAS VENDIDOS - NOMBRE, ID, CANTIDAD EN LA QUE SE HA VENDIDO
class ProductSalesReportSerializer(serializers.Serializer):
    ProductID = serializers.UUIDField()
    ProductName = serializers.CharField()
    totalSales = serializers.DecimalField(max_digits=20, decimal_places=4)

    class Meta:
        model = Producto
        fields = ['ProductID', 'ProductName', 'totalSales']

##Reporte weird inventory

