# Generated by Django 5.0.8 on 2024-08-15 04:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0012_accountsreceivable_idsale'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='state',
            field=models.CharField(choices=[('0', 'CANCELADA'), ('1', 'ACTIVA'), ('2', 'PENDIENTE'), ('3', 'PAGADA')], max_length=1),
        ),
    ]
