# Generated by Django 5.0.8 on 2024-09-12 03:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0040_remove_sale_idcurrency'),
    ]

    operations = [
        migrations.AddField(
            model_name='sale',
            name='voucher',
            field=models.CharField(blank=True, max_length=20, null=True, unique=True),
        ),
    ]