from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(Supplier)
admin.site.register(PaymentMethod)

class PurchaseAdmin(admin.ModelAdmin):
    list_display = ['purchaseCode', 'date']
    ordering = ['date']  

admin.site.register(Purchase, PurchaseAdmin)
admin.site.register(PurchaseDetail)
admin.site.register(ExpenseCategory)
admin.site.register(Expense)


