from django.urls import path
from .views import (
    CustomerOutstandingReportView,
    EmpWiseCustomerOutstandingReportView,
    LoginListView,
    LoginAPIView,
    CompanyInformationView,
    EmployeeListView,
    ProductTaxTypeView,
    ProductColorListView,
     AllProductColorListView,
    # LoginCheckView,
    MaPartyListView,
    GenerateSONumberAPIView,
    ActiveProductListView,
    ActiveProductListView,
    MaColorListView,
    MaPackListView,
    CalculateTaxAmount,
    CurrentWeekSalesView,
    SalesVsPaymentRegisterReportView,
    TrsoSubListBySoNoView, 
    FilterdataForReportView,
    SalesEntryDetailView,
    SalesOrderSearchView,
    SalesEntryUpdateView, 
    SalesEntryView,
    TrsoMainDeleteView,
    LatestInvRateView,
    CheckCustomerEmployeeView,
    CreditTermsView,
    #cors_test_view
 SalesVsPaymentReportView,
PaymentOutstandingListView
)


urlpatterns = [
  #path("cors-test/", cors_test_view),
  path('login/', LoginListView.as_view()),
   path('logincheck/', LoginAPIView.as_view(), name='login-api'),
   path('company-info/', CompanyInformationView.as_view(), name='company-info'),
   path('employee/', EmployeeListView.as_view(), name='employee-list'),
   path('party-list/',MaPartyListView.as_view()),
   path('product-tax/', ProductTaxTypeView.as_view(), name='product-tax'),
   path('product-colors/', ProductColorListView.as_view(), name='product-colors'),
   path("product-colors-all/", AllProductColorListView.as_view(), name="product-colors-all"),
   path('generate-so-number/', GenerateSONumberAPIView.as_view(), name='generate-so-number'),
   path('active-products/',ActiveProductListView.as_view(), name='active-products'),
   path('macolors/',MaColorListView.as_view(),name='color-list'),
   path('units/',MaPackListView.as_view(),name='unit-list'),
    path('credit-terms/<str:code>/', CreditTermsView.as_view(), name='credit-terms'),
    path('current-week-sales/', CurrentWeekSalesView.as_view(), name='current-week-sales'), ##default list main details for current week
    path('sub-items/<int:so_no>/', TrsoSubListBySoNoView.as_view(), name='sub-items-by-sono'), ##fetch sub details based on sono related to somain  
    path("sales-filter-list/", SalesOrderSearchView.as_view(), name="sales-list-date"), #filter the  data by date ,sono  for  list
    path('filter-invoice-order/',FilterdataForReportView.as_view(), name='trso-main-by-empno'),
    
    path("sales-entry/", SalesEntryView.as_view(), name="sales-entry"),  ##create -sales -order
     path("delete-sales/<int:so_no>/", TrsoMainDeleteView.as_view(), name="delete-sales"),
    
    path('sales-entry-detail/<int:soNo>/', SalesEntryDetailView.as_view(), name='sales-entry-detail'),
    ##path('sales-entry-update/<int:soNo>/', SalesEntryUpdateView.as_view(), name='sales-entry-update'),
    path('sales-entry-update/<int:so_no>/<str:year_code>/', SalesEntryUpdateView.as_view(),name='sales-entry-update'),
    path('calculate-tax/', CalculateTaxAmount.as_view(), name='calculate-tax'),
    
    path('latest-invrate/', LatestInvRateView.as_view(), name='latest-invrate'),
     path("cus-emp-check/",CheckCustomerEmployeeView.as_view(), name="check-customer-employee"),
   

    path('sales-vs-payment/', SalesVsPaymentReportView.as_view(), name='sales-vs-payment',),
    path('sales-vs-payment-register/', SalesVsPaymentRegisterReportView.as_view(), name='sales-vs-payment-register',),
    path('customer-outstanding/', CustomerOutstandingReportView.as_view(), name='customer-outstanding',),
    path('empwise-customer-outstanding/', EmpWiseCustomerOutstandingReportView.as_view(), name='empwise-customer-outstanding',),
    path('payment-outstanding-list/', PaymentOutstandingListView.as_view(), name='payment-outstanding-list',),
    
    
]