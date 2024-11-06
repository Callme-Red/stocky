
from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'department', views.DepartmentView, basename='department'),
router.register(r'municipality', views.MunicipalityView, basename='municipality'),
router.register(r'client', views.ClientView, basename='client'),
router.register(r'sale', views.saleView, basename='sale'),
router.register(r'saleDetail', views.saleDetailView, basename='saleDetail'),
router.register(r'AccountsReceivable', views.AccountsReceivableView, basename='AccountsReceivable'),
router.register(r'quotation', views.QuotationView, basename='quotation'),
router.register(r'QuotationDetail', views.QuotationDetailView, basename='QuotationDetail'),


urlpatterns = [
    path('api/v1/', include(router.urls)),  # Asegúrate de que la URL termina con '/'
    path('api/v1/departments/<uuid:department_id>/municipalities/', views.MunicipalityByDepartmentView.as_view(), name='municipalities-by-department'), 
    path('api/v1/client/<uuid:client_id>/pending-sales/', views.PendingSalesListView.as_view(), name='pending-sales-list'),
    path('api/v1/quotations/<uuid:id_quotation>/update-state/', views.UpdateQuotationStateView.as_view(), name='update-quotation-state'),
    path('api/v1/report/', views.SaleReportView.as_view(), name='sales-report'),
    path('api/v1/reports-credit-sales/', views.ClientReportListView.as_view(), name='credit-sales-report'),
    path('api/v1/report-month/<int:year>/<int:month>/', views.SalesMonthReportView.as_view(), name='sales-report-month'),
    path('api/v1/report-annual/<int:year>/', views.SalesAnnualReportView.as_view(), name='sales-report-annual'),
    path('api/v1/daily-report/', views.DailySalesReportView.as_view(), name='daily-sales-report'),
    path('api/v1/client-sales-report-monthly/<int:year>/<int:month>/', views.ClientSalesMonthlyReportView.as_view(), name='client-sales-report-monthly'),
    path('api/v1/sales/latest-code/', views.LastSalesCodeView.as_view(), name='last_sales_code'),
    path('api/v1/client-sales-report-yearly/<int:year>/', views.ClientSalesYearlyReportView.as_view(), name='client-sales-report-yearly'),
    path('api/v1/product-sales-report-monthly/<int:year>/<int:month>/', views.ProductSalesMonthlyReportView.as_view(), name='product-sales-report-monthly'),
    path('api/v1/product-sales-report-yearly/<int:year>/', views.ProductSalesAnnualReportView.as_view(), name='product-sales-report-yearly'),
    path('api/v1/product-sales-category-report-monthly/<int:year>/<int:month>/', views.ProductSalesByCategoryMonthlyReportView.as_view(), name='product-sales-category-monthly-report'),
    path('api/v1/product-sales-category-report-yearly/<int:year>/', views.ProductSalesByCategoryAnnualReportView.as_view(), name='product-sales-category-yearly-report'),
    path('api/v1/accounts-receivable-report/<uuid:id_sale>/', views.AccountsReceivableReportView.as_view(), name='accounts-receivable-report'),
    path('api/v1/latest-payment-code/', views.LatestPaymentCodeView.as_view(), name='latest-payment-code'),
    path('api/v1/latest-balance-report/<uuid:id_sale>/', views.LatestBalanceReportView.as_view(), name='latest-balance-report'),
    path('api/v1/latest-quotation/', views.LatestQuotationView.as_view(), name='latest-quotation'),
    path('api/v1/reports-quotation/', views.QuotationReportView.as_view(), name='quotation-by-date-range'),



]