from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'suppliers', views.SupplierView, basename='supplier')
router.register(r'PaymentMethod', views.PaymentMethodView, basename='PaymentMethod')
router.register(r'purchases', views.PurchaseView, basename='purchases')
router.register(r'purchases-details', views.PurchaseDetailView, basename='purchases-details')
router.register(r'expense-category', views.ExpenseCategoryView, basename='expense-category')
router.register(r'expense', views.ExpenseView, basename='expense')


urlpatterns = [
    path('api/v1/', include(router.urls)),
    path('api/v1/report/', views.PurchaseReportView.as_view(), name='purchases-report'),
    path('api/v1/supplier-report/', views.SupplierReportView.as_view(), name='supplier-report'),
    path('api/v1/expense-report-monthly/<int:year>/<int:month>/', views.ExpenseReportMonthView.as_view(), name='expense-report-monthly'),
    path('api/v1/expense-report/', views.ExpenseReportView.as_view(), name='expense-report'),
    path('api/v1/expense-report-yearly/<int:year>/', views.ExpenseReportYearView.as_view(), name='expense-report-year'),
    path('api/v1/product-purchases-report-monthly/<int:year>/<int:month>/', views.ProductPurchasesMonthlyReportView.as_view(), name='product-purchases-report-monthly'),
    path('api/v1/product-purchases-report-yearly/<int:year>/', views.ProductPurchasesAnnualReportView.as_view(), name='product-purchases-report-yearly'),
    path('api/v1/product-category-purchases-report-monthly/<int:year>/<int:month>/', views.ProductPurchasesByCategoryMonthlyReportView.as_view(), name='product-purchases-category-report-monthly'),
    path('api/v1/product-category-purchases-report-yearly/<int:year>/', views.ProductPurchasesByCategoryYearlyReportView.as_view(), name='product-purchases-category-report-yearly'),
    path('api/v1/expense-category-report/', views.ExpenseCategoryReportView.as_view(), name='expense-category-report'),



]