from django.db import models

# Create your models here.
from django.db import models

# Create your models here.

# class Login(models.Model):
#     loid = models.CharField(max_length=15, primary_key=True)
#     lopassword = models.CharField(max_length=100, null=True, blank=True)
#     loprivilege = models.CharField(max_length=15)
#     locount = models.IntegerField(default=0)
#     empcode = models.IntegerField(null=True, blank=True)
#     last_pwd_change_date = models.DateField(null=True, blank=True, db_column='LastPwdChangeDate')
#     password = models.CharField(max_length=15, null=True, blank=True,db_column='password')
#     is_encrypt = models.CharField(max_length=5, null=True, blank=True,db_column='IsEncrypt')

#     class Meta:
#         db_table = 'Login'  # Use the exact SQL table name
#         managed = False 
 
 
class LoginUsers(models.Model):
    LoID = models.CharField(max_length=15, primary_key=True, db_column='LoID')
    LoPassword = models.CharField(max_length=15, db_column='LoPassword')
    LoPrivilege = models.CharField(max_length=15, db_column='LoPrivilege')
    LoCount = models.IntegerField(db_column='LoCount')

    EmpName = models.CharField(max_length=100, db_column='EmpName')
    EmpDepartment = models.CharField(max_length=100, db_column='EmpDepartment')
    EmpNo = models.IntegerField(db_column='EmpNo')

    class Meta:
        db_table = 'VEmpLogin'  #EXACT table name in SQL Server
        managed = False
    
class CompanyInformation(models.Model):
    company_name = models.CharField(max_length=60 , primary_key=True)
    address1 = models.CharField(max_length=200, blank=True, null=True)
    address2 = models.CharField(max_length=200, blank=True, null=True)
    address3 = models.CharField(max_length=200, blank=True, null=True)
    GSTNo = models.CharField(max_length=50, blank=True, null=True) 

    class Meta:
        db_table = 'Company_Information'  # Exact table name in your DB
        managed = False    
         
class Employee(models.Model):
    EmpNo = models.IntegerField(primary_key=True)
    EmpName = models.CharField(max_length=50,null=True,blank=True)

    class Meta:
        managed=False
        db_table='Employee'
        
# class SalesOrderNumber(models.Model):
#     so_number=models.CharField(max_length=30, unique=True)
#     created_at=models.DateTimeField(auto_now_add=True)

#     class Meta:
#         managed=False
#         db_table = 'SalesOrderNumber'
                
class Maparty(models.Model):
     PaCode = models.CharField(max_length=7,primary_key=True)
     PaType = models.CharField(max_length=15)
     PaName = models.CharField(max_length=50,null=True,blank=True)
     PaStatus = models.CharField(max_length=20)
     PaAddress=models.CharField(max_length=200)
     PaAddress3=models.CharField(max_length=100)
     PaCreditTerms = models.CharField(max_length=100,null=True,blank=True) 
     class Meta:
        managed = False  #Prevent Django from modifying this table
        db_table ='MaParty'  
        

class MaProduct(models.Model):  ##for fetch
    PrCode=models.IntegerField( db_column='PrCode',primary_key=True)  
    PrName=models.CharField(db_column='PrName',max_length=300)
    PrUOM=models.CharField(max_length=5, null=True, blank=True)
    PrRate=models.FloatField(null=True, blank=True)
    PrStatus = models.CharField(max_length=10, null=True, blank=True)
    TaxType = models.CharField(max_length=50, null=True, blank=True)
    

    class Meta:
        managed = False  
        db_table = 'MaProduct'   
        
class ProductColour(models.Model):
    item_code = models.ForeignKey('MaProduct', db_column='ItemCode', to_field='PrCode', on_delete=models.DO_NOTHING, null=True, blank=True)
    colour_code = models.ForeignKey('MaColor', db_column='ColourCode', to_field='UnitID', on_delete=models.DO_NOTHING, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'ProductColour'

    def __str__(self):
        return f"{self.item_code} - {self.colour_code}"             
        
class MaColor(models.Model):
    UnitID = models.IntegerField(db_column='UnitID',primary_key=True)
    UnitName = models.CharField(db_column='UnitName',max_length=50, null=True, blank=True)
    Remarks = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        managed=False 
        db_table='MaColor' 
        
class MaPack(models.Model):
    UnitID=models.IntegerField(primary_key=True)
    UnitName=models.CharField(max_length=15,null=True,blank=True)

    class Meta:
        managed = False  
        db_table = 'MaPack'   


    
class ColourLoad(models.Model):
    unit_id = models.CharField(max_length=20, db_column='UnitID')
    unit_name = models.CharField(max_length=100, db_column='UnitName')
    pr_code = models.CharField(max_length=20, db_column='PrCode')
    pr_name = models.CharField(max_length=100, db_column='PrName')
    item_code = models.CharField(max_length=20, db_column='ItemCode')

    class Meta:
        managed = False  
        db_table = 'vColourLoad'        

# class TrsoMain(models.Model):
#     soNo = models.IntegerField(primary_key=True)
#     soYearCode = models.CharField(max_length=9)
#     ##soType = models.CharField(max_length=10, default='Sales', null=True, blank=True)
#     soDate=models.DateTimeField(null=True, blank=True)
#     PaCode= models.CharField(max_length=7, null=True, blank=True)
#     PaCreditTerms=models.CharField(max_length=100, null=True, blank=True)
#     SoPreparedTime=models.DateTimeField(null=True, blank=True)   
#     soEmpNo = models.IntegerField(null=True, blank=True)  
    
#     ## nee to add empname  ^^^
#     class Meta:
#         db_table = 'TrsoMain'
#         managed = False                    


class TrsoMain(models.Model):
    soNo = models.IntegerField(primary_key=True)  # Django needs *a* PK; this is just bookkeeping
    soYearCode = models.CharField(max_length=9)
    soDate = models.DateTimeField(null=True, blank=True)
    PaCode = models.CharField(max_length=7, null=True, blank=True)
    PaCreditTerms = models.CharField(max_length=100, null=True, blank=True)
    SoPreparedTime = models.DateTimeField(null=True, blank=True)
    soEmpNo = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'TrsoMain'
        managed = False
        unique_together = (('soNo', 'soYearCode'),)
        
class TrsoSub(models.Model):
    SoNo = models.ForeignKey('TrsoMain', on_delete=models.CASCADE, db_column='SoNo',
                             to_field='soNo', related_name='trso_sub')
    soSlNo = models.IntegerField()     
    soYearCode = models.CharField(max_length=9)
    PrCode = models.CharField(max_length=30, primary_key=True)  # bookkeeping pk only
    soSpecification = models.CharField(max_length=250)
    soQty = models.FloatField(null=True, blank=True)
    soRate = models.FloatField(null=True, blank=True)
    soParticular = models.CharField(max_length=250, null=True, blank=True)
    soDiscount = models.FloatField(null=True, blank=True)
    TaxType = models.CharField(max_length=50, null=True, blank=True)
    soTaxAmt = models.FloatField(null=True, blank=True)
    SoDeliveryPreference = models.CharField(max_length=100, null=True, blank=True)
    SoDeliveryDate = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'TrsoSub'
        managed = False
        unique_together = (('SoNo', 'soYearCode', 'PrCode'),)

    # def save(self, *args, **kwargs):
    #     if self.SoDeliveryDate:
    #         self.soYearCode = get_financial_year(self.SoDeliveryDate)
    #     else:
    #         self.soYearCode = get_financial_year(datetime.now())
    #     super().save(*args, **kwargs)    
 
 
class TrsoMainHistory(models.Model):
    soNo = models.IntegerField(primary_key=True)
    soYearCode = models.CharField(max_length=9)
    ##soType = models.CharField(max_length=10, default='Sales', null=True, blank=True)
    soDate=models.DateTimeField(null=True, blank=True)
    PaCode= models.CharField(max_length=7, null=True, blank=True)
    PaCreditTerms=models.CharField(max_length=100, null=True, blank=True)
    SoPreparedTime=models.DateTimeField(null=True, blank=True)   
    soEmpNo = models.IntegerField(null=True, blank=True)  
    
    ## nee to add empname  ^^^
    class Meta:
        db_table = 'TrsoMain_History'
        managed = False         

class TrsoSubHistory(models.Model):  ##for  storing deleted  data
      
    SoNo = models.ForeignKey('TrsoMainHistory', on_delete=models.CASCADE, db_column='SoNo',to_field='soNo', related_name='trso_sub')
    #soSlNo = models.IntegerField(primary_key=True)    ## while updateing comment it
    soSlNo = models.IntegerField(primary_key=True)  ##while listing comment it   ##for add uncomment
    soYearCode = models.CharField(max_length=9)   ##2025-2026
    PrCode = models.CharField(max_length=30 )
    soSpecification = models.CharField(max_length=250)
    soQty = models.FloatField(null=True, blank=True)
    soRate = models.FloatField(null=True, blank=True)
    soParticular = models.CharField(max_length=250, null=True, blank=True)
    soDiscount = models.FloatField(null=True, blank=True)
    TaxType = models.CharField(max_length=50, null=True, blank=True)  
    soTaxAmt = models.FloatField(null=True, blank=True)
    SoDeliveryPreference = models.CharField(max_length=100, null=True, blank=True)
    SoDeliveryDate = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'TrsoSub_History'
        managed = False
        unique_together = (('SoNo', 'soYearCode', 'soSlNo', 'PrCode', 'soSpecification'),)
        

class MaTax(models.Model):
    TaxType = models.CharField(db_column='TaxType', max_length=20, primary_key=True)
    NOB = models.CharField(db_column='NOB', max_length=10, null=True, blank=True)
    ExciseDuty = models.FloatField(db_column='ExciseDuty', null=True, blank=True)
    EDCaption=models.CharField(db_column='EDCaption', max_length=20, null=True, blank=True)
    CESS=models.FloatField(db_column='CESS', null=True, blank=True)
    CESSCaption=models.CharField(db_column='CESSCaption', max_length=20, null=True, blank=True)
    SalesTax = models.FloatField(db_column='SalesTax', null=True, blank=True)
    STCaption = models.CharField(db_column='STCaption', max_length=20, null=True, blank=True)
    ServiceTax = models.FloatField(db_column='ServiceTax', null=True, blank=True)
    SerTCaption = models.CharField(db_column='SerTCaption', max_length=20, null=True, blank=True)
    SurCharge = models.FloatField(db_column='SurCharge', null=True, blank=True)
    SCCaption = models.CharField(db_column='SCCaption', max_length=20, null=True, blank=True)
    VAT = models.FloatField(db_column='VAT', null=True, blank=True)
    VATCaption = models.CharField(db_column='VATCaption', max_length=20, null=True, blank=True)
    SHCess = models.FloatField(db_column='SHCess', null=True, blank=True)
    SHCessCaption = models.CharField(db_column='SHCessCaption', max_length=20, null=True, blank=True)
    FormReq = models.CharField(db_column='FormReq', max_length=3, null=True, blank=True)
    FormName = models.CharField(db_column='FormName', max_length=15, null=True, blank=True)
    Status = models.CharField(db_column='Status', max_length=50, null=True, blank=True)
    Type = models.CharField(db_column='Type', max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'MaTax'
        managed = False

    def __str__(self):
        return self.TaxType   
    
    
class RptRateLoad(models.Model):
    PrCode=models.CharField(max_length=50)
    InvSpecification=models.CharField(max_length=200)
    InvParticular=models.CharField(max_length=200)
    InvRate=models.DecimalField(max_digits=18, decimal_places=2)
    InvQty=models.DecimalField(max_digits=18, decimal_places=2)
    InvNo=models.IntegerField(primary_key=True)
    InvYearCode=models.IntegerField()
    PaCode=models.CharField(max_length=50)
    InvEmpNo=models.IntegerField()

    class Meta:
        managed=False 
        db_table='rptRateLoad'

    # ========================
"""
class MaParty(models.Model):
   #Master Party table
    pacode = models.CharField(max_length=50, primary_key=True, db_column='PaCode')
    paname = models.CharField(max_length=500, db_column='PaName')
    pacity = models.CharField(max_length=200, db_column='PaCity', blank=True, null=True)

    class Meta:
        db_table = 'MaParty'
        managed = False  # Table already exists in SQL Server

    def __str__(self):
        return f"{self.pacode} - {self.paname}"

"""
        


class TrInvoiceMain(models.Model):
    """Transaction Invoice Main table"""
    invno = models.CharField(max_length=50, db_column='InvNo')
    invyearcode = models.CharField(max_length=20, db_column='InvYearCode')
    invtype = models.CharField(max_length=20, db_column='InvType')
    pacode = models.CharField(max_length=50, db_column='Pacode')
    invdate = models.DateField(db_column='InvDate')
    invgrandtotal = models.FloatField(db_column='InvGrandTotal', default=0)
    invempno = models.IntegerField(db_column='InvEmpNo')
    einvstatus = models.CharField(
        max_length=50, db_column='Einvstatus', blank=True, null=True
    )

    class Meta:
        db_table = 'TrInvoiceMain'
        managed = False

    def __str__(self):
        return f"Invoice {self.invno} - {self.pacode}"


class TrOpeningBalNew(models.Model):
    """Transaction Opening Balance table"""
    pacode = models.CharField(max_length=50, db_column='Pacode')
    invamt = models.FloatField(db_column='InvAmt', default=0)
    invempno = models.IntegerField(db_column='InvEmpNo')
    entrydate = models.DateField(db_column='EntryDate')
    invdate = models.DateField(db_column='InvDate', blank=True, null=True)

    class Meta:
        db_table = 'TrOpeningBalNew'
        managed = False

    def __str__(self):
        return f"Opening Balance - {self.pacode}"


class TrPayCollMain(models.Model):
    """Payment Collection Main table"""
    payentryno = models.CharField(max_length=50, primary_key=True, db_column='PayEntryNo')
    payyearcode = models.CharField(max_length=20, db_column='PayYearCode')
    paydate = models.DateField(db_column='PayDate')

    class Meta:
        db_table = 'TrPayCollMain'
        managed = False

    def __str__(self):
        return f"Payment {self.payentryno}"


class TrPayCollSub(models.Model):
    """Payment Collection Sub table"""
    payentryno = models.CharField(max_length=50, db_column='PayEntryNo')
    payyearcode = models.CharField(max_length=20, db_column='PayYearCode')
    invno = models.CharField(max_length=50, db_column='InvNo')
    invyearcode = models.CharField(max_length=20, db_column='InvYearCode')
    invtype = models.CharField(max_length=20, db_column='InvType')
    payamount = models.FloatField(db_column='PayAmount', default=0)

    class Meta:
        db_table = 'TrPayCollSub'
        managed = False

    def __str__(self):
        return f"Pay Sub {self.payentryno}"
