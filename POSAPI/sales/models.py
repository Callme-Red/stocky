from django.db import models
import uuid

# Create your models here.

class Department(models.Model):
    IDDepartment = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Municipality(models.Model):
    IDMunicipality = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    IDDepartment = models.ForeignKey(Department, on_delete=models.RESTRICT)

    def __str__(self):
        return self.name


class Client(models.Model):
    IDClient = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    lastName = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True,blank=True)
    IDMunicipality = models.ForeignKey(Municipality, on_delete=models.RESTRICT)
    address = models.CharField(max_length=500)
    description = models.CharField(max_length=500,null=True,blank=True)
    date = models.DateTimeField(auto_now_add=True)
    state = models.BooleanField(default=True)
    isCredit = models.BooleanField(default=False)  


    def __str__(self):
        return self.name

class Sale(models.Model):
    STATE_CHOICES = (
        ('0', 'CANCELADA'),
        ('1', 'ACTIVA'),
        ('2', 'PENDIENTE'),
        ('3', 'PAGADA'),
    )

    IDSale = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    salesCode = models.CharField(max_length=30, null=True, blank=True)
    IDUser = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True)
    voucher = models.CharField(max_length=20,null=True, blank=True)
    isVoucher = models.BooleanField(default=True)
    IDClient =  models.ForeignKey(Client, on_delete=models.RESTRICT,related_name='sales')
    IDPaymentMethod = models.ForeignKey('purchase.PaymentMethod',on_delete=models.RESTRICT)
    typeSale = models.BooleanField(default=True)
    typeShipping = models.BooleanField(default=True)
    shippingCost = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    subTotal = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    discount = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    tax =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    total =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    date = models.DateTimeField(auto_now_add=True)
    expirationDate = models.DateField(null=True, blank=True)
    state = models.CharField(max_length=1, choices=STATE_CHOICES) 

    def save(self, *args, **kwargs):
        # Verificar si es una venta membretada
        if self.isVoucher:
            if not self.salesCode:
                raise ValueError('El código de venta es obligatorio para ventas membretadas.')
        else:
            # Si no es membretada, generar el código secuencial
            if not self.salesCode:
                last_sale = Sale.objects.filter(isVoucher=False).order_by('-date', '-salesCode').first()
                if last_sale:
                    last_code = last_sale.salesCode
                    last_number = int(last_code.split('-')[1])
                    new_number = last_number + 1
                else:
                    new_number = 1

                # Generar el nuevo código secuencial
                self.salesCode = f'VT-{new_number:04d}'
                
                # Reintentar si el código ya existe en la base de datos
                while Sale.objects.filter(salesCode=self.salesCode).exists():
                    new_number += 1
                    self.salesCode = f'VT-{new_number:04d}'

        super(Sale, self).save(*args, **kwargs)
    def __str__(self):
        return f"{self.salesCode} - {self.date.strftime('%Y-%m-%d %H:%M:%S')}"

class SaleDetail(models.Model):
    IDSaleDetail =  models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    IDSale =  models.ForeignKey(Sale, related_name='details', on_delete=models.CASCADE, null=True, blank=True)
    IDProduct = models.ForeignKey('inventory.Producto', on_delete=models.RESTRICT)
    productPrice = models.DecimalField(max_digits=20, decimal_places=4, default=0.00, null=True)
    quantity = models.IntegerField()
    subTotal = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    discount = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    tax =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    total =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    state = models.BooleanField(default=True) 
    date = models.DateTimeField(auto_now_add=True)


class AccountsReceivable(models.Model):
    IDAccountsReceivable = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    IDSale = models.ForeignKey(Sale,related_name='accountsreceivable_set', on_delete=models.CASCADE, blank=True, null = True)
    IDClient = models.ForeignKey(Client,related_name='accountsreceivable_set', on_delete=models.RESTRICT)
    IDPaymentMethod = models.ForeignKey('purchase.PaymentMethod',on_delete=models.RESTRICT, null=True, blank=True)
    voucher = models.CharField(max_length=20,null=True, blank=True)
    paymentCode = models.CharField(max_length=10, unique=True, null=True, blank=True)
    type = models.BooleanField(default=True)
    inflow = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    outflow = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    balance = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    dateSale = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=500, default='')
    
    def save(self, *args, **kwargs):
        # Solo generar paymentCode si es una compra (type=True)
        if not self.paymentCode:
            last_AccountsReceivable = AccountsReceivable.objects.order_by('-paymentCode').first()

            if last_AccountsReceivable and last_AccountsReceivable.paymentCode:
                try:
                    last_number = int(last_AccountsReceivable.paymentCode.split('VT')[-1])
                except ValueError:
                    last_number = 0
            else:
                last_number = 0

            # Generar el nuevo código incrementando el número
            new_number = last_number + 1
            self.paymentCode = f'PAG-VT{new_number:04d}'

            # Reintentar si el código ya existe en la base de datos
            while AccountsReceivable.objects.filter(paymentCode=self.paymentCode).exists():
                new_number += 1
                self.paymentCode = f'PAG-VT{new_number:04d}'

        super(AccountsReceivable, self).save(*args, **kwargs)

    def __str__(self):
        # Determina si es "compra" o "abono"
        transaction_type = "compra" if self.type else "abono"
        
        # Retorna el salesCode y el tipo de transacción
        return f"{self.IDSale.salesCode} - {transaction_type} - {self.dateSale.strftime('%Y-%m-%d %H:%M:%S')}"
    
class Quotation(models.Model):
    STATE_CHOICES = (
        ('0', 'INACTIVO'),
        ('1', 'ACTIVA'),
        ('2', 'COMPLETADA'),
    )

    IDQuotation = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotationCode = models.CharField(max_length=10, unique=True)
    IDClient =  models.ForeignKey(Client, on_delete=models.RESTRICT)
    typeShipping = models.BooleanField(default=True)
    shippingCost = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    subTotal = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    discount = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    tax =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    total =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    date = models.DateTimeField(auto_now_add=True)
    state = models.CharField(max_length=1, choices=STATE_CHOICES) 

    def save(self, *args, **kwargs):
        if not self.quotationCode:
            last_Quotation = Quotation.objects.order_by('-date', '-quotationCode').first()
            if last_Quotation:
                last_code = last_Quotation.quotationCode
                last_number = int(last_code.split('-')[1])
                new_number = last_number + 1
            else:
                new_number = 1
            
            # Generar el nuevo código, asegurando que el código sea único
            self.quotationCode = f'CT-{new_number:04d}'
            
            # Reintentar si el código ya existe en la base de datos
            while Quotation.objects.filter(quotationCode=self.quotationCode).exists():
                new_number += 1
                self.quotationCode = f'CT-{new_number:04d}'

        super(Quotation, self).save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.quotationCode} - {self.date.strftime('%Y-%m-%d %H:%M:%S')}"

class QuotationDetail(models.Model):
    IDQuotationDetail =  models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    IDQuotation =  models.ForeignKey(Quotation, related_name='details', on_delete=models.CASCADE)
    IDProduct = models.ForeignKey('inventory.Producto', on_delete=models.RESTRICT)
    quantity = models.IntegerField()
    subTotal = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    discount = models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    tax =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    total =  models.DecimalField(max_digits=20, decimal_places=4, default=0.00)
    state = models.BooleanField(default=True) 


