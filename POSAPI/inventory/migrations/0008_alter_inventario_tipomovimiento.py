# Generated by Django 5.0.8 on 2024-08-23 03:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0007_inventoryadjustment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inventario',
            name='tipoMovimiento',
            field=models.CharField(choices=[('0', 'Entrada'), ('1', 'Salida'), ('2', 'Entrada por ajuste'), ('3', 'Salida por ajuste')], max_length=1),
        ),
    ]
