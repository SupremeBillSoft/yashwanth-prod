from django.contrib import admin
from .models import (LoginUsers,Employee,Maparty,MaProduct,MaColor,MaPack,TrsoMain,TrsoSub,MaTax
)
# Register your models here.
admin.site.register(LoginUsers)
admin.site.register(Employee)

admin.site.register(Maparty)
admin.site.register(MaProduct)
admin.site.register(MaColor)
admin.site.register(MaPack)

@admin.register(TrsoMain)
class TrsoMainAdmin(admin.ModelAdmin):
    list_display = ('soNo', 'soYearCode', 'soDate', 'PaCode', 'SoPreparedTime')
    search_fields = ('soNo', 'PaCode')
    list_filter = ('soYearCode',)
    date_hierarchy = 'soDate'
    
@admin.register(TrsoSub)
class TrsoSubAdmin(admin.ModelAdmin):
    list_display = ('SoNo', 'soSlNo', 'soYearCode', 'PrCode', 'soQty', 'soRate', 'TaxType')
    list_filter = ('soYearCode', 'TaxType', 'SoDeliveryPreference')
    search_fields = ('PrCode', 'soSpecification', 'soParticular')    
    ordering = ('SoNo', 'soSlNo')  ##optional

admin.site.register(MaTax)