from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Client)
admin.site.register(Municipality)
admin.site.register(Department)
admin.site.register(SaleDetail)

class SaleAdmin(admin.ModelAdmin):
    list_display = ['salesCode', 'date']
    ordering = ['date']  # Ordenar de los más antiguos a los más nuevos

admin.site.register(Sale, SaleAdmin)

admin.site.register(AccountsReceivable)
admin.site.register(Quotation)
admin.site.register(QuotationDetail)




