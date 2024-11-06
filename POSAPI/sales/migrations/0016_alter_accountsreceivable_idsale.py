# Generated by Django 5.0.8 on 2024-08-15 05:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0015_client_iscredit'),
    ]

    operations = [
        migrations.AlterField(
            model_name='accountsreceivable',
            name='IDSale',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='accountsreceivable_set', to='sales.sale'),
        ),
    ]
