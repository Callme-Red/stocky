# Generated by Django 5.0.8 on 2024-09-20 04:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0051_merge_0050_alter_sale_date_0050_alter_sale_salescode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='salesCode',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
    ]
