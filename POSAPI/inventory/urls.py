from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'category', views.CategoriaView, basename='category')
router.register(r'products', views.ProductoDetalleView, basename='product')
router.register(r'inventory-adjustment', views.InventoryAdjustmentView, basename='inventory-adjustment')
router.register(r'inventory', views.InventorysView, basename='inventory')

urlpatterns = [
    path('api/v1/', include(router.urls)),  # Asegúrate de que la URL termina con '/'
    path('api/v1/top-products-sales/', views.TopProductSalesReportView.as_view(), name='top-product-sales-report'),
    path('api/v1/kardex/<uuid:IDProduct>/', views.InventarioByProductView.as_view(), name='inventario-by-product'),
    path('api/v1/inventory-report/', views.InventoryReportView.as_view(), name='inventory-report'),
    path('api/v1/product-code/<str:CodigoProducto>/', views.ProductByCodeView.as_view(), name='product-by-code'),


]