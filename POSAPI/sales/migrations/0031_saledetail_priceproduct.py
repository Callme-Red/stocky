# Generated by Django 5.0.8 on 2024-09-05 05:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0030_alter_sale_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='saledetail',
            name='PriceProduct',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=20, null=True),
        ),
    ]