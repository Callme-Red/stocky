# Generated by Django 5.0.8 on 2024-08-15 03:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('purchase', '0010_alter_purchase_date_alter_supplier_date'),
    ]

    operations = [
        migrations.RenameField(
            model_name='purchase',
            old_name='PurchaseCode',
            new_name='purchaseCode',
        ),
        migrations.RemoveField(
            model_name='purchasedetail',
            name='date',
        ),
    ]
