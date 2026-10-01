from rest_framework import serializers
from .models import LoginUsers,Maparty,Employee,MaProduct,MaColor,MaPack,TrsoMain,TrsoSub,MaTax,Maparty,CompanyInformation,RptRateLoad




# class LoginSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Login
#         fields = '__all__'

def get_financial_year(date):
    if date.month >= 4:  # April or later
        start_year = date.year
        end_year = date.year + 1
    else:  # Jan, Feb, Mar
        start_year = date.year - 1
        end_year = date.year
    return f"{start_year}-{end_year}"     

class LoginUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginUsers
        fields = ['LoID', 'LoPrivilege','EmpName','EmpDepartment','EmpNo']  # Include only the required fields
        
        
class CompanyInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyInformation
        fields = '__all__'               


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['EmpNo', 'EmpName']  
        
              
class MapartySerializer(serializers.Serializer):
    PaType = serializers.CharField()
    PaCode=serializers.CharField()
    PaName = serializers.CharField()
    PaCreditTerms =serializers.CharField(allow_null=True)
    #EmpNo=serializers.IntegerField()
    #EmpName=serializers.CharField() 
    PaStatus = serializers.CharField()  
     

class SaleVsPaymentRegEmpQuerySerializer(serializers.Serializer):
    FDate = serializers.DateField()
    ToDate = serializers.DateField()
    Empno = serializers.IntegerField()

class SaleVsPaymentRegEmpSerializer(serializers.Serializer):
    sl_no = serializers.CharField()
    party_name = serializers.CharField()
    opening_balance = serializers.FloatField()
    sales = serializers.FloatField()
    total = serializers.FloatField()
    payment = serializers.FloatField()
    balance = serializers.FloatField()

class MaColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaColor
        fields = ['UnitID', 'UnitName']  
        
class MaPackSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaPack
        fields = ['UnitID', 'UnitName']        
          
class MaProductSerializer(serializers.Serializer):
    PrCode = serializers.IntegerField()
    PrName = serializers.CharField()
    PrUOM = serializers.CharField(allow_null=True)
    PrRate = serializers.FloatField(allow_null=True)
    PrStatus = serializers.CharField()
    TaxType =  serializers.CharField()
    

class ProductTaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaProduct
        fields = ['PrCode','PrName','TaxType','PrUOM']
  

# class TrsoSubSerializer(serializers.ModelSerializer):
#     # SoNo = serializers.PrimaryKeyRelatedField(
#     #     queryset=TrsoMain.objects.all(),
#     #     required=False  # We'll add it in the view manually
#     # )
#     PrName = serializers.SerializerMethodField()

#     class Meta:
#         model = TrsoSub
#         fields = [
#             'SoNo', 'soYearCode', 'soSlNo', 'PrCode', 'PrName', 'soSpecification',
#             'soQty', 'soRate', 'soParticular', 'soDiscount', 'TaxType',
#             'soTaxAmt', 'SoDeliveryPreference', 'SoDeliveryDate'
#         ]
#         extra_kwargs = {
#             'SoNo': {'required': True},
#             'soYearCode': {'required': True},
#             'soSlNo': {'required': False},
#             'PrCode': {'required': True},
#             'soSpecification': {'required': True},
#         }

#     def get_PrName(self, obj):
#         code = obj.PrCode.strip() if obj.PrCode else None
#         if code:
#             product = MaProduct.objects.filter(PrCode=code).first()
#             return product.PrName if product else ""
#         return ""

class TrsoSubSerializer(serializers.ModelSerializer):
    PrName = serializers.SerializerMethodField()
    SoNo = serializers.IntegerField(source='SoNo_id')
    PrCode = serializers.CharField()          # <-- add this line, no validators

    class Meta:
        model = TrsoSub
        fields = [
            'SoNo', 'soYearCode', 'soSlNo', 'PrCode', 'PrName', 'soSpecification',
            'soQty', 'soRate', 'soParticular', 'soDiscount', 'TaxType',
            'soTaxAmt', 'SoDeliveryPreference', 'SoDeliveryDate'
        ]
        extra_kwargs = {
            'soYearCode': {'required': True},
            'soSlNo': {'required': False},
            'soSpecification': {'required': True},
        }
        validators = []

    def get_PrName(self, obj):
        code = obj.PrCode.strip() if obj.PrCode else None
        if code:
            product = MaProduct.objects.filter(PrCode=code).first()
            return product.PrName if product else ""
        return ""
        
        

class TrsoMainSerializer(serializers.ModelSerializer):
    PaName = serializers.SerializerMethodField()
    EmpName = serializers.SerializerMethodField()
    PaAddress = serializers.SerializerMethodField()
    PaAddress3 = serializers.SerializerMethodField()
    trso_sub = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TrsoMain
        fields = [
            'soNo',
            'soYearCode',
            'soDate',
            'PaCode',
            'PaCreditTerms',
            'SoPreparedTime',
            'soEmpNo',
            'PaName',
            'EmpName',
            'PaAddress',
            'PaAddress3',
            'trso_sub'
        ]
        extra_kwargs = {
            'soNo': {'validators': []},  # remove DRF's auto unique-on-PK validator
        }
        validators = [] 

    def validate(self, data):
        # Only check for duplicates on create, never on update
        if self.instance is None:
            so_no = data.get('soNo')
            so_year_code = data.get('soYearCode')
            if so_no is not None and so_year_code is not None:
                if TrsoMain.objects.filter(soNo=so_no, soYearCode=so_year_code).exists():
                    raise serializers.ValidationError(
                        "A sales order with this SO number and year code already exists."
                    )
        return data

    def get_trso_sub(self, obj):
        request = self.context.get('request')
        prcode = request.query_params.get("prcode") if request else None
        # filter by year too, otherwise other years' items with the same soNo appear        
        sub_qs = TrsoSub.objects.filter(SoNo=obj.soNo, soYearCode=obj.soYearCode).order_by('soSlNo')
        if prcode:
            sub_qs = sub_qs.filter(PrCode=str(prcode).strip())
        return TrsoSubSerializer(sub_qs, many=True).data    

    def get_PaName(self, obj):
        code = obj.PaCode.strip() if obj.PaCode else None
        if code:
            party = Maparty.objects.filter(PaCode=code).first()
            return party.PaName if party else ""
        return ""

    def get_EmpName(self, obj):
        if obj.soEmpNo:
            emp = Employee.objects.filter(EmpNo=obj.soEmpNo).first()
            return emp.EmpName if emp else ""
        return ""

    def get_PaAddress(self, obj):
        code = obj.PaCode.strip() if obj.PaCode else None
        if code:
            party = Maparty.objects.filter(PaCode=code).first()
            return party.PaAddress if party else ""
        return ""

    def get_PaAddress3(self, obj):
        code = obj.PaCode.strip() if obj.PaCode else None
        if code:
            party = Maparty.objects.filter(PaCode=code).first()
            return party.PaAddress3 if party else ""
        return ""

    
class TrsoMainUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrsoMain
        fields = [
            'soNo',
            'soYearCode',
            'soDate',
            'PaCode',
            'PaCreditTerms',
            'SoPreparedTime',
            'soEmpNo'
        ]



class TrsoSubUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrsoSub
        fields = [
            'SoNo',
            'soYearCode',
            'soSlNo',
            'PrCode',
            'soSpecification',
            'soQty',
            'soRate',
            'soUom',
            'soParticular',
            'soDiscount',
            'TaxType',
            'soTaxAmt',
            'SoDeliveryPreference',
            'SoDeliveryDate'
        ]
        


        extra_kwargs = {
            'PrCode': {'required': True},
            'soSpecification': {'required': True},
            'soSlNo': {'required': False},  # allow auto-generation if not provided
        }        


class TrsoMainUpdateFieldsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrsoMain
        fields = ['PaCode', 'PaCreditTerms', 'SoPreparedTime']
    

class MaTaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaTax
        fields = '__all__'
                
##for list        
class TrsoMainListSerializer(serializers.ModelSerializer):
    trso_sub = serializers.SerializerMethodField()
    PaNames = serializers.SerializerMethodField()

    class Meta:
        model = TrsoMain
        fields = [
            'soNo', 'soYearCode', 'soDate', 'PaCode', 'PaNames',
            'PaCreditTerms', 'SoPreparedTime', 'trso_sub'
        ]

    def get_PaNames(self, obj):
        code = obj.PaCode.strip() if obj.PaCode else None
        if code:
            party = Maparty.objects.filter(PaCode=code).first()
            return party.PaName if party else ""
        return ""

    def get_trso_sub(self, obj):
        subs = TrsoSub.objects.filter(SoNo=obj.soNo, soYearCode=obj.soYearCode)
        return TrsoSubSerializer(subs, many=True).data   
       
  
  
class ColorProductSerializer(serializers.Serializer):
    PrCode = serializers.CharField(source='productcolour__item_code__PrCode')
    UnitName = serializers.CharField(source='UnitName')


class RptRateLoadSerializer(serializers.ModelSerializer):
    class Meta:
        model=RptRateLoad
        fields='__all__'
        
        
     #===================
     
class SalesVsPaymentSerializer(serializers.Serializer):
    """
    Serializer for the sales vs payment report output.
    Matches the SELECT columns from salevsPaymentRegEmpNew procedure.
    """
    sl_no = serializers.SerializerMethodField()
    party_name = serializers.CharField(source='PaName')
    opening_balance = serializers.FloatField(source='Opening')
    sales = serializers.FloatField(source='Sales')
    total = serializers.FloatField(source='Total')
    payment = serializers.FloatField(source='Payment')
    balance = serializers.FloatField(source='Balance')

    def get_sl_no(self, obj):
        # Auto-increment serial number using context index
        index = self.context.get('index', {})
        paname = obj.get('PaName', '')
        return index.get(paname, '')

    def to_representation(self, instance):
        # instance is a dict from raw SQL result
        return {
            'sl_no': '',
            'party_name': instance.get('PaName', ''),
            'opening_balance': instance.get('Opening', 0.0),
            'sales': instance.get('Sales', 0.0),
            'total': instance.get('Total', 0.0),
            'payment': instance.get('Payment', 0.0),
            'balance': instance.get('Balance', 0.0),
        }


class SalesVsPaymentRequestSerializer(serializers.Serializer):
    """
    Serializer to validate input parameters for the report.
    """
    from_date = serializers.DateField(
        input_formats=['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y'],
        help_text="Start date (YYYY-MM-DD)"
    )
    to_date = serializers.DateField(
        input_formats=['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y'],
        help_text="End date (YYYY-MM-DD)"
    )
    emp_no = serializers.IntegerField(
        min_value=1,
        help_text="Employee number"
    )

    def validate(self, data):
        if data['from_date'] > data['to_date']:
            raise serializers.ValidationError(
                {"to_date": "To date must be greater than or equal to From date."}
            )
        return data


class SalesVsPaymentResponseSerializer(serializers.Serializer):
    """
    Wrapper serializer for the full API response.
    """
    success = serializers.BooleanField()
    emp_no = serializers.IntegerField()
    from_date = serializers.DateField()
    to_date = serializers.DateField()
    total_records = serializers.IntegerField()
    data = SalesVsPaymentSerializer(many=True)
 #===================
     
class SalesVsPaymentRegisterSerializer(serializers.Serializer):
    """
    Serializer for the sales vs payment Register report output.
    Matches the SELECT columns from salevspaymentreg procedure.
    """
    sl_no = serializers.SerializerMethodField()
    party_name = serializers.CharField(source='PaName')
    opening_balance = serializers.FloatField(source='Opening')
    sales = serializers.FloatField(source='Sales')
    total = serializers.FloatField(source='Total')
    payment = serializers.FloatField(source='Payment')
    balance = serializers.FloatField(source='Balance')

    def get_sl_no(self, obj):
        # Auto-increment serial number using context index
        index = self.context.get('index', {})
        paname = obj.get('PaName', '')
        return index.get(paname, '')

    def to_representation(self, instance):
        # instance is a dict from raw SQL result
        return {
            'sl_no': '',
            'party_name': instance.get('PaName', ''),
            'opening_balance': instance.get('Opening', 0.0),
            'sales': instance.get('Sales', 0.0),
            'total': instance.get('Total', 0.0),
            'payment': instance.get('Payment', 0.0),
            'balance': instance.get('Balance', 0.0),
        }


class SalesVsPaymentRegisterRequestSerializer(serializers.Serializer):
    """
    Serializer to validate input parameters for the report.
    """
    from_date = serializers.DateField(
        input_formats=['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y'],
        help_text="Start date (YYYY-MM-DD)"
    )
    to_date = serializers.DateField(
        input_formats=['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y'],
        help_text="End date (YYYY-MM-DD)"
    )
   

    def validate(self, data):
        if data['from_date'] > data['to_date']:
            raise serializers.ValidationError(
                {"to_date": "To date must be greater than or equal to From date."}
            )
        return data


class SalesVsPaymentRegisterResponseSerializer(serializers.Serializer):
    """
    Wrapper serializer for the full API response.
    """
    success = serializers.BooleanField()   
    from_date = serializers.DateField()
    to_date = serializers.DateField()
    total_records = serializers.IntegerField()
    data = SalesVsPaymentRegisterSerializer(many=True)
#===================
    
class CustomerOutstandingSerializer(serializers.Serializer):
    sl_no = serializers.SerializerMethodField()
    party_name = serializers.CharField(source='PaName')
    below_30 = serializers.FloatField(source='below30')
    between_30_45 = serializers.FloatField(source='between30_45')
    between_45_60 = serializers.FloatField(source='between45_60')
    between_60_90 = serializers.FloatField(source='between60_90')
    above_90 = serializers.FloatField(source='above90')

    def get_sl_no(self, obj):
        index = self.context.get('index', {})
        paname = obj.get('PaName', '')
        return index.get(paname, '')

    def to_representation(self, instance):
        return {
             #'sl_no': self.get_sl_no(instance),   # ← was hardcoded ''
            'sl_no': '', # Placeholder, will be set in view using context index
            'party_name': instance.get('PaName', ''),
            'below_30': instance.get('Below30', 0.0),
            'between_30_45': instance.get('ecc_code', 0.0),
            'between_45_60': instance.get('30To60', 0.0),
            'between_60_90': instance.get('Above60', 0.0),
            'above_90': instance.get('fax', 0.0),
        }
    
class CustomerOutstandingResponseSerializer(serializers.Serializer):
    """
    Wrapper serializer for the full API response.
    """
    success = serializers.BooleanField()  
    total_records = serializers.IntegerField()
    data = CustomerOutstandingSerializer(many=True)
#================

  
     
class EmpWiseCustomerOutstandingSerializer(serializers.Serializer):
    """
    Serializer for the sales vs payment report output.
    Matches the SELECT columns from EmpWiseCustomerOutstandingSerializer procedure.
    """
    sl_no = serializers.SerializerMethodField()
    party_name = serializers.CharField(source='PaName')
    below_30 = serializers.FloatField(source='below30')
    between_30_45 = serializers.FloatField(source='between30_45')
    between_45_60 = serializers.FloatField(source='between45_60')
    between_60_90 = serializers.FloatField(source='between60_90')
    above_90 = serializers.FloatField(source='above90')


    def get_sl_no(self, obj):
        # Auto-increment serial number using context index
        index = self.context.get('index', {})
        paname = obj.get('PaName', '')
        return index.get(paname, '')

    def to_representation(self, instance):
        # instance is a dict from raw SQL result
        return {
            #'sl_no': self.get_sl_no(instance),   # ← was hardcoded ''
            'sl_no': '', # Placeholder, will be set in view using context index
            'party_name': instance.get('PaName', ''),
            'below_30': instance.get('Below30', 0.0),
            'between_30_45': instance.get('ecc_code', 0.0),
            'between_45_60': instance.get('30To60', 0.0),
            'between_60_90': instance.get('Above60', 0.0),
            'above_90': instance.get('fax', 0.0),
        }


class EmpWiseCustomerOutstandingRequestSerializer(serializers.Serializer):
    """
    Serializer to validate input parameters for the report.
    """    
    emp_no = serializers.IntegerField(
        min_value=1,
        help_text="Employee number"
    )

    def validate(self, data):
        if data['emp_no'] is None:
            raise serializers.ValidationError(
                {"emp_no": "Employee number is required."}
            )
        return data


class EmpWiseCustomerOutstandingResponseSerializer(serializers.Serializer):
    """
    Wrapper serializer for the full API response.
    """
    success = serializers.BooleanField()
    emp_no = serializers.IntegerField()
    from_date = serializers.DateField()
    to_date = serializers.DateField()
    total_records = serializers.IntegerField()
    data = EmpWiseCustomerOutstandingSerializer(many=True)


# class PaymentOutstandingListSerializer(serializers.Serializer):
#     """
#     Serializer for the Payment Outstanding report output.
#     Matches the SELECT columns from  PaymentoutstandingList procedure.
#     """
#     sl_no = serializers.SerializerMethodField()
#     InvNo = serializers.CharField(source='InvNo')
#     InvDate = serializers.DateField(source='InvDate')
#     party_name = serializers.CharField(source='PaName')
#     TotAmount = serializers.FloatField(source='InvGrandTotal')
#     PaidAmount = serializers.FloatField(source='TotalPaid')
#     DebitAmount = serializers.FloatField(source='TotalDebit')
#     PendingAmount = serializers.FloatField(source='PendingAmount')
#     TDSAmount = serializers.FloatField(source='TotalTDS')
#     DueDays = serializers.IntegerField(source='DueDays')
#     Cheque_Ref = serializers.CharField(source='BankRef')    

#     def get_sl_no(self, obj):
#         # Auto-increment serial number using context index
#         index = self.context.get('index', {})
#         paname = obj.get('PaName', '')
#         return index.get(paname, '')

#     def to_representation(self, instance):
#         # instance is a dict from raw SQL result
#         return {
#             #'sl_no': self.get_sl_no(instance),   # ← was hardcoded ''
#             'sl_no': '', # Placeholder, will be set in view using context index
#             'InvNo': instance.get('InvNo', ''),
#             'InvDate': instance.get('InvDate', None),
#             'party_name': instance.get('PaName', ''),
#             'TotAmount': instance.get('InvGrandTotal', 0.0),
#             'PaidAmount': instance.get('TotalPaid', 0.0),
#             'DebitAmount': instance.get('TotalDebit', 0.0),
#             'PendingAmount': instance.get('PendingAmount', 0.0), 
#             'TDSAmount': instance.get('TotalTDS', 0.0),
#             'DueDays': instance.get('DueDays', 0),
#             'Cheque_Ref': instance.get('BankRef', ''),
#         }
    
# class PaymentOutstandingListRequestSerializer(serializers.Serializer):
#     """
#     Serializer to validate input parameters for the report.

#     http://127.0.0.1:8000/api/payment-outstanding-list/?from_date=2024-01-01&to_date=2024-12-31&emp_no=123&PaCode=ABC123&PayStatus=Pending
    
#     """ 
#     from_date = serializers.DateField(
#         input_formats=['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y'],
#         help_text="Start date (YYYY-MM-DD)"
#     )
#     to_date = serializers.DateField(
#         input_formats=['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y'],
#         help_text="End date (YYYY-MM-DD)"
#     )
   
#     emp_no = serializers.IntegerField(required=False, help_text="Employee number (optional)")           
#     PaCode = serializers.CharField(required=False, allow_blank=True, help_text="Party code (optional)")
#     PayStatus = serializers.CharField(required=False, allow_blank=True, help_text="Payment status (optional)")

#     def validate(self, data):
#         if data['from_date'] > data['to_date']:
#             raise serializers.ValidationError(
#                 {"to_date": "To date must be greater than or equal to From date."}
#             )        
   
#         return data


# class PaymentOutstandingListResponseSerializer(serializers.Serializer):
#     """
#     Wrapper serializer for the full API response.
#     """
#     success = serializers.BooleanField()
#     emp_no = serializers.IntegerField()
#     from_date = serializers.DateField()
#     to_date = serializers.DateField()
#     total_records = serializers.IntegerField()
#     data = PaymentOutstandingListSerializer(many=True)

class PaymentOutstandingListSerializer(serializers.Serializer):
    """
    Serializer for the Payment Outstanding report output.
    Matches the SELECT columns from PaymentoutstandingList procedure.
    """
    sl_no = serializers.SerializerMethodField()
    InvNo = serializers.CharField(source='InvNo')
    InvDate = serializers.DateField(source='InvDate')
    party_name = serializers.CharField(source='PaName')
    TotAmount = serializers.FloatField(source='InvGrandTotal')
    PaidAmount = serializers.FloatField(source='TotalPaid')
    DebitAmount = serializers.FloatField(source='TotalDebit')
    PendingAmount = serializers.FloatField(source='PendingAmount')
    TDSAmount = serializers.FloatField(source='TotalTDS')
    DueDays = serializers.IntegerField(source='DueDays')
    Cheque_Ref = serializers.CharField(source='BankRef')

    def get_sl_no(self, obj):
        # Auto-increment serial number using context index, keyed by row identity
        index = self.context.get('index', {})
        # Use id() of the dict as a stable per-row key set in the view
        return index.get(id(obj), '')

    def to_representation(self, instance):
        # instance is a dict from raw SQL result
        return {
            'sl_no': self.get_sl_no(instance),  # fixed: was hardcoded ''
            'InvNo': instance.get('InvNo', ''),
            'InvDate': instance.get('InvDate', None),
            'party_name': instance.get('PaName', ''),
            'TotAmount': instance.get('InvGrandTotal', 0.0),
            'PaidAmount': instance.get('TotalPaid', 0.0),
            'DebitAmount': instance.get('TotalDebit', 0.0),
            'PendingAmount': instance.get('PendingAmount', 0.0),
            'TDSAmount': instance.get('TotalTDS', 0.0),
            'DueDays': instance.get('DueDays', 0),
            'Cheque_Ref': instance.get('BankRef', ''),
        }


class PaymentOutstandingListRequestSerializer(serializers.Serializer):
    """
    Serializer to validate input parameters for the report.

    http://127.0.0.1:8000/api/payment-outstanding-list/?from_date=2024-01-01&to_date=2024-12-31&emp_no=123&PaCode=ABC123&PayStatus=Pending
    """
    from_date = serializers.DateField(
        input_formats=['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y'],
        help_text="Start date (YYYY-MM-DD)"
    )
    to_date = serializers.DateField(
        input_formats=['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y'],
        help_text="End date (YYYY-MM-DD)"
    )
    emp_no = serializers.IntegerField(required=False, allow_null=True, help_text="Employee number (optional)")
    PaCode = serializers.CharField(required=False, allow_blank=True, allow_null=True, help_text="Party code (optional)")
    PayStatus = serializers.CharField(required=False, allow_blank=True, allow_null=True, help_text="Payment status (optional)")

    def validate(self, data):
        if data['from_date'] > data['to_date']:
            raise serializers.ValidationError(
                {"to_date": "To date must be greater than or equal to From date."}
            )
        return data


class PaymentOutstandingListResponseSerializer(serializers.Serializer):
    """
    Wrapper serializer for the full API response.
    """
    success = serializers.BooleanField()
    emp_no = serializers.IntegerField(required=False, allow_null=True)
    from_date = serializers.DateField()
    to_date = serializers.DateField()
    total_records = serializers.IntegerField()
    data = PaymentOutstandingListSerializer(many=True)


def _sql_str(value):
    """
    Return a properly quoted SQL string literal, or the bare NULL keyword
    if the value is missing/blank. This is what makes COALESCE() in the
    stored procedure correctly treat 'not provided' as 'no filter'.
    """
    if value is None or value == '':
        return 'NULL'
    # basic escaping of embedded single quotes
    return "'{}'".format(str(value).replace("'", "''"))


def _sql_int(value):
    """
    Return an integer literal, or NULL if missing/blank.
    """
    if value is None or value == '':
        return 'NULL'
    return str(int(value))

class TrsoMainEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrsoMain
        fields = ['soDate', 'PaCode', 'PaCreditTerms', 'SoPreparedTime', 'soEmpNo']