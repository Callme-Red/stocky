# Generated by Django 5.0.8 on 2024-08-24 04:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0009_inventoryadjustment_movement_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inventoryadjustment',
            name='type',
            field=models.CharField(choices=[('0', 'Sobreventa'), ('1', 'Infraventa'), ('2', 'Robo'), ('3', 'Uso personal'), ('4', 'Daños'), ('5', 'Perdidas'), ('6', 'Otros'), ('7', 'Mal conteo')], max_length=1),
        ),
        migrations.AlterField(
            model_name='producto',
            name='NombreProducto',
            field=models.CharField(max_length=200),
        ),
    ]
