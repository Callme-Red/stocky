# Generated by Django 5.0.8 on 2024-08-10 03:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchase', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchasedetail',
            name='IDPurchase',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='details', to='purchase.purchase'),
        ),
    ]
