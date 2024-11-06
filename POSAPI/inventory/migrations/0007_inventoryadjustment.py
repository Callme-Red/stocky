# Generated by Django 5.0.8 on 2024-08-23 03:01

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0006_alter_inventario_costoentrada_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='InventoryAdjustment',
            fields=[
                ('IDInventoryAdjustment', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('type', models.CharField(choices=[('0', 'Sobreventa'), ('1', 'Infraventa'), ('2', 'Robo'), ('3', 'Uso personal'), ('4', 'Daños'), ('5', 'Perdidas'), ('6', 'Otros')], max_length=1)),
                ('quantity', models.DecimalField(decimal_places=4, max_digits=20, null=True)),
                ('cost', models.DecimalField(decimal_places=4, max_digits=20, null=True)),
                ('description', models.CharField(max_length=500, null=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('IDProduct', models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='inventory.producto')),
            ],
        ),
    ]