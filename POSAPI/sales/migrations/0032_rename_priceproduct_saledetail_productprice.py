# Generated by Django 5.0.8 on 2024-09-05 05:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0031_saledetail_priceproduct'),
    ]

    operations = [
        migrations.RenameField(
            model_name='saledetail',
            old_name='PriceProduct',
            new_name='productPrice',
        ),
    ]
