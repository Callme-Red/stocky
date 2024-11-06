from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(PrecioProducto)
admin.site.register(Categoria)
admin.site.register(Producto)

class InventarioAdmin(admin.ModelAdmin):
    list_display = ['IDProducto', 'tipoMovimiento', 'fecha']
    ordering = ['fecha']  # Ordenar de los más antiguos a los más nuevos

admin.site.register(Inventario, InventarioAdmin)
admin.site.register(InventoryAdjustment)