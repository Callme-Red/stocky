from django.db import models
import uuid


# Create your models here.

class PaymentMethod(models.Model):
    IDPaymentMethod = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    def __str__(self):
        return self.name


class Supplier(models.Model):
    IDSupplier = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ruc = models.CharField(max_length=15, null=True, blank=True)
    name = models.CharField(max_length=200)
    SocialReason = models.CharField(max_length=200, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True,blank=True)
    date = models.DateTimeField(auto_now_add=True)
    state = models.BooleanField(default=True) 
    
    def __str__(self):
        return self.name
    
class Purchase(models.Model):
    IDPurchase = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    purchaseCode = models.CharField(max_length=10, unique=True)
    IDSupplier =  models.ForeignKey(Supplier, on_delete=models.RESTRICT)
    IDPaymentMethod = models.ForeignKey(PaymentMethod,on_delete=models.RESTRICT)
    subTotal = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    discount = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    tax =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    total =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    date = models.DateTimeField(auto_now_add=True)
    state = models.BooleanField(default=True)  

    def save(self, *args, **kwargs):
        if not self.purchaseCode:
            last_sale = Purchase.objects.order_by('-date', '-purchaseCode').first()
            if last_sale:
                last_code = last_sale.purchaseCode
                last_number = int(last_code.split('-')[1])
                new_number = last_number + 1
            else:
                new_number = 1
            
            # Generar el nuevo código, asegurando que el código sea único
            self.purchaseCode = f'CO-{new_number:04d}'
            
            # Reintentar si el código ya existe en la base de datos
            while Purchase.objects.filter(purchaseCode=self.purchaseCode).exists():
                new_number += 1
                self.purchaseCode = f'CO-{new_number:04d}'

        super(Purchase, self).save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.purchaseCode} - {self.date.strftime('%Y-%m-%d %H:%M:%S')}"


class PurchaseDetail(models.Model):
    IDPurchaseDetail =  models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    IDPurchase =  models.ForeignKey(Purchase, related_name='details', on_delete=models.CASCADE, null=True, blank=True)
    IDProduct = models.ForeignKey('inventory.Producto', on_delete=models.RESTRICT)
    quantity = models.IntegerField()
    cost = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    subTotal = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    discount = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    tax =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    total =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    state = models.BooleanField(default=True) 
    date = models.DateTimeField(auto_now_add=True)

class ExpenseCategory(models.Model):
    IDExpenseCategory = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    state = models.BooleanField(default=True)  


    def __str__(self):
        return self.name

class Expense(models.Model):
    IDExpense = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255,null=True, blank=True)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    IDExpenseCategory = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, null=True, related_name='expenses')
    state = models.BooleanField(default=True)  
   

    def __str__(self):
        return f"{self.name} - {self.amount} ({self.date})"
    




