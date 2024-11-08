# Generated by Django 5.0.8 on 2024-08-13 04:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchase', '0004_alter_purchasedetail_idpurchase'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchase',
            name='discount',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=8),
        ),
        migrations.AlterField(
            model_name='purchase',
            name='subTotal',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=8),
        ),
        migrations.AlterField(
            model_name='purchase',
            name='tax',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=8),
        ),
        migrations.AlterField(
            model_name='purchase',
            name='total',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=8),
        ),
        migrations.AlterField(
            model_name='purchasedetail',
            name='cost',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=8),
        ),
        migrations.AlterField(
            model_name='purchasedetail',
            name='discount',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=8),
        ),
        migrations.AlterField(
            model_name='purchasedetail',
            name='subTotal',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=8),
        ),
        migrations.AlterField(
            model_name='purchasedetail',
            name='tax',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=8),
        ),
        migrations.AlterField(
            model_name='purchasedetail',
            name='total',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=8),
        ),
    ]
