# Generated by Django 5.0.8 on 2024-08-10 04:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchase', '0002_alter_purchasedetail_idpurchase'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchasedetail',
            name='cost',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=8),
        ),
    ]
