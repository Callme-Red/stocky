# Generated by Django 5.0.8 on 2024-08-24 04:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0018_quotation_quotationdetail'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='date',
            field=models.DateTimeField(),
        ),
    ]
