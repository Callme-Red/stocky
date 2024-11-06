from django.db import models
import uuid
from datetime import datetime


class PrecioProducto(models.Model):
    IDPrecioProducto = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    IDProducto = models.OneToOneField('Producto', related_name='precio_producto', on_delete=models.CASCADE) 
    FechaPrecio = models.DateTimeField(null=True, default=datetime.now)
    Costo = models.DecimalField(max_digits=20, decimal_places=4)
    Margen = models.DecimalField(max_digits=20, decimal_places=4)
    Ganancia = models.DecimalField(max_digits=20, decimal_places=4)
    Precio = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    estado = models.BooleanField(default=True) 

class Categoria(models.Model):
    IDCategoria = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    NombreCategoria = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=100, null=True)
    estado = models.BooleanField(default=True) 
    
    def __str__(self):
        return self.NombreCategoria

class Producto(models.Model):
    IDProducto = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    IDCategoria = models.ForeignKey('Categoria', on_delete=models.CASCADE, default=1)
    CodigoProducto = models.CharField(max_length=20)
    NombreProducto = models.CharField(max_length=200)
    descripcion = models.CharField(max_length=500, null=True)
    cantidadMinima = models.DecimalField(max_digits=8, decimal_places=4, null=True,default=0)
    FechaIngreso = models.DateTimeField(auto_now_add=True)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.NombreProducto

class Inventario(models.Model):
    TYPE_CHOICES = (
        ('0', 'Entrada'),
        ('1', 'Salida'),
        ('2', 'Entrada por ajuste'),
        ('3', 'Salida por ajuste'),

    )

    IDInventario = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    IDProducto = models.ForeignKey(Producto, on_delete=models.CASCADE,default=None )
    tipoMovimiento = models.CharField(max_length=1, choices=TYPE_CHOICES)
    entrada = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    salida = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    saldoUnidades = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    costoEntrada = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    costoSalida = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    costoSaldo = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    costoPromedio = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    IDPurchase = models.ForeignKey('purchase.Purchase', null=True, blank=True, on_delete=models.SET_NULL)
    IDSale = models.ForeignKey('sales.Sale', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        if self.tipoMovimiento == '0': 
            movimiento = "compra"
        elif self.tipoMovimiento == '1':
            movimiento = "venta"
        elif self.tipoMovimiento == '2':
            movimiento = "Entrada por ajuste"
        elif self.tipoMovimiento == '3':
            movimiento = "Salida por ajuste"
        return f"{self.IDProducto.NombreProducto} ({movimiento}) - {self.fecha.strftime('%Y-%m-%d %H:%M:%S')}"

class InventoryAdjustment(models.Model):
    MOVEMENT_TYPE_CHOICES = (
        ('2', 'Entrada por ajuste'),
        ('3', 'Salida por ajuste'),
    )

    IDInventoryAdjustment = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    IDProduct = models.ForeignKey(Producto, on_delete=models.CASCADE, default=None)
    movement_type = models.CharField(max_length=1, choices=MOVEMENT_TYPE_CHOICES, null=True)
    quantity = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    cost = models.DecimalField(max_digits=20, decimal_places=4, null=True)
    date = models.DateTimeField(auto_now_add=True)
 
