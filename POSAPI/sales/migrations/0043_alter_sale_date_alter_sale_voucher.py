# Generated by Django 5.0.8 on 2024-09-13 06:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0042_alter_sale_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='sale',
            name='voucher',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
