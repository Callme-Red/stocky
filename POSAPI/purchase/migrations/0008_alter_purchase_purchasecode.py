# Generated by Django 5.0.8 on 2024-08-15 02:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchase', '0007_purchase_purchasecode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchase',
            name='PurchaseCode',
            field=models.CharField(default='no', max_length=10, unique=True),
        ),
    ]
