# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Max, IntegerField
from django.db import connection
from .models import LoginUsers, TrsoMain ,MaTax,TrsoSub
from .serializers import CustomerOutstandingSerializer, LoginUsersSerializer, CompanyInformationSerializer
from .serializers import MapartySerializer,MaProductSerializer, ProductTaxSerializer,MaColorSerializer,MaPackSerializer
from .serializers import SalesVsPaymentRegisterRequestSerializer, SalesVsPaymentRegisterSerializer,TrsoMainSerializer,TrsoSubSerializer 
from .serializers import TrsoMainListSerializer,TrsoMainUpdateFieldsSerializer,ColorProductSerializer,EmployeeSerializer,SaleVsPaymentRegEmpSerializer
from .serializers import SaleVsPaymentRegEmpQuerySerializer,EmpWiseCustomerOutstandingSerializer,EmpWiseCustomerOutstandingRequestSerializer,PaymentOutstandingListSerializer,PaymentOutstandingListRequestSerializer
from .models import Maparty,Employee,MaProduct,MaColor,MaPack,CompanyInformation , ColourLoad,RptRateLoad
from django.contrib.auth.hashers import check_password
from rest_framework import generics
from django.db.models import F,Value,Q
#from .utils import generate_so_number
from datetime import datetime
from django.utils.timezone import now
from datetime import timedelta
from rest_framework.generics import ListAPIView
from django.utils.dateparse import parse_date
from django.db.models import Max
from random import randint
from django.db import transaction
from django.db.models.functions import Upper,Trim,Replace
import random 
from django.http import JsonResponse
from django.db.models.functions import Cast
from .serializers import SalesVsPaymentRequestSerializer,   SalesVsPaymentSerializer
from .models import TrsoMainHistory, TrsoSubHistory
from .serializers import TrsoMainEditSerializer

def test_view(request):
    data = TrsoMain.objects.all()[:5]
    return JsonResponse(list(data.values()), safe=False)

def get_financial_year(date):
    date = date if isinstance(date, datetime) else datetime.fromisoformat(date)
    if date.month >= 4:
        return f"{date.year}-{date.year + 1}"
    else:
        return f"{date.year - 1}-{date.year}"


class LoginListView(APIView):
    def get(self, request, format=None):
        logins = Login.objects.all()
        serializer = LoginSerializer(logins, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class LoginAPIView(APIView):
    def post(self, request):
        loid = request.data.get('LoID')
        password = request.data.get('LoPassword')

        if not loid or not password:
            return Response({"detail": "Missing credentials"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = LoginUsers.objects.get(LoID=loid, LoPassword=password)
            serializer = LoginUsersSerializer(user)
            return Response({
                "status": True,
                "message": "Login successful",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except LoginUsers.DoesNotExist:
            return Response({
                "status": False,
                "message": "Invalid LoID or Password"
            }, status=status.HTTP_401_UNAUTHORIZED)
            

class CompanyInformationView(APIView):
    def get(self, request, *args, **kwargs):
        company = CompanyInformation.objects.first()  # Fetches the first (and only) row
        if company:
            serializer = CompanyInformationSerializer(company)
            return Response(serializer.data)
        return Response({"detail": "Company information not found"}, status=404)  
    
class EmployeeListView(ListAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": True,
            "data": serializer.data
        } ,status=status.HTTP_200_OK)             
        
class MaPartyListView(APIView):
    def get(self,request):
        customers=Maparty.objects.filter(PaType__iexact='Customer', PaStatus__iexact='Active')
        serializer=MapartySerializer(customers, many=True)
        return Response({
            "status": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)

class SaleVsPaymentRegEmpView(APIView):
    def get(self, request):
        serializer = SaleVsPaymentRegEmpQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        fdate = serializer.validated_data['FDate']
        todate = serializer.validated_data['ToDate']
        empno = serializer.validated_data['Empno']

        sql = """
DECLARE @FDate DATETIME = %s;
DECLARE @ToDate DATETIME = %s;
DECLARE @Empno INT = %s;
DECLARE @temp TABLE (Pacode VARCHAR(50), Payment FLOAT, EmpNo INT);
DECLARE @temp2 TABLE (Pacode VARCHAR(50), Payment FLOAT, EmpNo INT);
DECLARE @temp3 TABLE (Pacode VARCHAR(50), Payment FLOAT, EmpNo INT);
DECLARE @temp4 TABLE (Pacode VARCHAR(50), Payment FLOAT, EmpNo INT);
DECLARE @temp5 TABLE (Pacode VARCHAR(50), Payment FLOAT, EmpNo INT);
DECLARE @temp6 TABLE (Pacode VARCHAR(50), Payment FLOAT, EmpNo INT);
DECLARE @temp8 TABLE (Pacode VARCHAR(50), Opening FLOAT, Sales FLOAT, Total FLOAT, Payment FLOAT, balance FLOAT, PaName VARCHAR(500), EmpNo INT);

INSERT INTO @temp(Pacode, Payment, EmpNo)
SELECT Pacode, ISNULL(SUM(TotalPaid),0), InvEmpNo
FROM vPayTotalEmp
WHERE PayDate < @FDate
GROUP BY Pacode, InvEmpNo;

INSERT INTO @temp2(Pacode, Payment, EmpNo)
SELECT Pacode, SUM(ISNULL(InvAmt,0)), InvEmpNo
FROM TrOpeningBalNew
WHERE EntryDate < @FDate
GROUP BY Pacode, InvEmpNo;

INSERT INTO @temp3(Pacode, Payment, EmpNo)
SELECT Pacode, SUM(ISNULL(InvGrandTotal,0)), InvEmpNo
FROM TrInvoiceMain
WHERE InvDate < @FDate
  AND Einvstatus IS NULL
GROUP BY Pacode, InvEmpNo;

INSERT INTO @temp4(Pacode, Payment, EmpNo)
SELECT Pacode, SUM(ISNULL(InvGrandTotal,0)), InvEmpNo
FROM TrInvoiceMain
WHERE InvDate BETWEEN @FDate AND @ToDate
  AND Einvstatus IS NULL
GROUP BY Pacode, InvEmpNo;

INSERT INTO @temp5(Pacode, Payment, EmpNo)
SELECT Pacode, SUM(ISNULL(InvAmt,0)), InvEmpNo
FROM TrOpeningBalNew
WHERE InvDate BETWEEN @FDate AND @ToDate
GROUP BY Pacode, InvEmpNo;

INSERT INTO @temp6(Pacode, Payment, EmpNo)
SELECT TrInvoiceMain.Pacode, SUM(ISNULL(TrPayCollSub.PayAmount,0)), TrInvoiceMain.InvEmpNo
FROM TrInvoiceMain
INNER JOIN TrPayCollSub ON TrInvoiceMain.InvNo = TrPayCollSub.InvNo
    AND TrInvoiceMain.InvYearCode = TrPayCollSub.InvYearCode
    AND TrInvoiceMain.InvType = TrPayCollSub.InvType
INNER JOIN TrPayCollMain ON TrPayCollSub.PayEntryNo = TrPayCollMain.PayEntryNo
    AND TrPayCollSub.PayYearCode = TrPayCollMain.PayYearCode
WHERE PayDate BETWEEN @FDate AND @ToDate
GROUP BY TrInvoiceMain.Pacode, InvEmpNo;

INSERT INTO @temp8(Pacode, Opening, Sales, Total, Payment, balance, PaName, EmpNo)
SELECT DISTINCT MaParty.Pacode, 0, 0, 0, 0, 0, MaParty.PaName + ' - ' + ISNULL(MaParty.Pacity,''), vSalesEmp.InvEmpno
FROM MaParty
INNER JOIN vSalesEmp ON MaParty.PaCode = vSalesEmp.Pacode;

UPDATE @temp8
SET Opening = Opening - tmp1.Payment
FROM @temp8 tmp
INNER JOIN @temp tmp1 ON tmp.Pacode = tmp1.Pacode AND tmp.EmpNo = tmp1.EmpNo;

UPDATE @temp8
SET Opening = Opening + tmp1.Payment
FROM @temp8 tmp
INNER JOIN @temp2 tmp1 ON tmp.Pacode = tmp1.Pacode AND tmp.EmpNo = tmp1.EmpNo;

UPDATE @temp8
SET Opening = Opening + tmp1.Payment
FROM @temp8 tmp
INNER JOIN @temp3 tmp1 ON tmp.Pacode = tmp1.Pacode AND tmp.EmpNo = tmp1.EmpNo;

UPDATE @temp8
SET Sales = Sales + tmp1.Payment
FROM @temp8 tmp
INNER JOIN @temp4 tmp1 ON tmp.Pacode = tmp1.Pacode AND tmp.EmpNo = tmp1.EmpNo;

UPDATE @temp8
SET Sales = Sales + tmp1.Payment
FROM @temp8 tmp
INNER JOIN @temp5 tmp1 ON tmp.Pacode = tmp1.Pacode AND tmp.EmpNo = tmp1.EmpNo;

UPDATE @temp8
SET Total = Sales + Opening
FROM @temp8 tmp;

UPDATE @temp8
SET Payment = tmp1.Payment
FROM @temp8 tmp
INNER JOIN @temp6 tmp1 ON tmp.Pacode = tmp1.Pacode AND tmp.EmpNo = tmp1.EmpNo;

UPDATE @temp8
SET balance = Total - Payment
FROM @temp8 tmp;

SELECT '' AS [SL.No], PaName AS [PARTY NAME], Opening AS [OPENING BALANCE], Sales AS [SALES], Total AS [TOTAL], Payment AS PAYMENT, balance AS BALANCE
FROM @temp8
WHERE (balance > 0 OR Opening > 0 OR Sales > 0)
  AND EmpNo = @Empno
ORDER BY PaName;
"""

        with connection.cursor() as cursor:
            cursor.execute(sql, [fdate, todate, empno])
            columns = [col[0] for col in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Normalize field names for frontend consistency
        formatted = []
        for row in rows:
            formatted.append({
                'sl_no': row.get('SL.No', ''),
                'party_name': row.get('PARTY NAME'),
                'opening_balance': float(row.get('OPENING BALANCE') or 0),
                'sales': float(row.get('SALES') or 0),
                'total': float(row.get('TOTAL') or 0),
                'payment': float(row.get('PAYMENT') or 0),
                'balance': float(row.get('BALANCE') or 0),
            })

        response_serializer = SaleVsPaymentRegEmpSerializer(formatted, many=True)
        return Response({
            'status': True,
            'data': response_serializer.data
        }, status=status.HTTP_200_OK)


               
class ActiveProductListView(APIView):
    def get(self, request):
        products = MaProduct.objects.filter(PrStatus='Active')
        serializer = MaProductSerializer(products, many=True)
        return Response({
            "status": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
        
class MaColorListView(APIView):
    def get(self, request):
        colors = MaColor.objects.all()
        serializer = MaColorSerializer(colors, many=True)
        return Response({
            "status": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
        
        
class MaPackListView(APIView):
    def get(self, request):
        units = MaPack.objects.all()
        serializer = MaPackSerializer(units, many=True)
        return Response({
            "status": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)  
        
        
class GenerateSONumberAPIView1(APIView):
    def get(self, request):
        year_code = request.query_params.get("SoYearCode")
        try:
            qs = TrsoMain.objects.all()
            if year_code:
                qs = qs.filter(soYearCode=year_code)
            last_entry = qs.order_by('-soNo').first()
            next_so_no = last_entry.soNo + 1 if last_entry else 1
            return Response({"status": True, "so_number": next_so_no}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": False, "error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# class GenerateSONumberAPIView(APIView):
#     def get(self, request):
#         SoYearCode = request.GET.get("SoYearCode")

#         if not SoYearCode:
#             return Response(
#                 {"status": False, "message": "SoYearCode is required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         qs = TrsoMain.objects.filter(SoYearCode=SoYearCode)

#         result = qs.aggregate(
#             max_no=Max(Cast('soNo', IntegerField()))
#         )

#         next_sono = (result['max_no'] or 0) + 1

#         return Response({
#             "status": True,
#             "SoYearCode": SoYearCode,
#             "nextSoNo": next_sono
#         }, status=status.HTTP_200_OK) 

class GenerateSONumberAPIView(APIView):
    def get(self, request):
        SoYearCode = request.GET.get("SoYearCode")

        if not SoYearCode:
            return Response(
                {"status": False, "message": "SoYearCode is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        qs = TrsoMain.objects.filter(soYearCode=SoYearCode)

        result = qs.aggregate(
            max_no=Max(Cast('soNo', IntegerField()))
        )

        next_sono = (result['max_no'] or 0) + 1

        return Response({
            "status": True,
            "SoYearCode": SoYearCode,
            "nextSoNo": next_sono
        }, status=status.HTTP_200_OK)

class ProductTaxTypeView(APIView):
    def get(self, request):
        pr_code=request.query_params.get('pr_code')
        if not pr_code:
            return Response({'error':'pr_code is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = MaProduct.objects.get(PrCode=pr_code)
            serializer = ProductTaxSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except MaProduct.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)    
            
class AllProductColorListView(APIView):
    def get(self, request):
        try:
            color_pairs = ColourLoad.objects.values(
                PrCode=F('pr_code'),
                UnitName=F('unit_name')
            ).distinct()

            return Response(color_pairs, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductColorListView(APIView):
    def get(self, request):
        pr_code = request.query_params.get('pr_code')
        if not pr_code:
            return Response({'error': 'Missing required query param: pr_code'}, status=status.HTTP_400_BAD_REQUEST)
        
        colors = MaColor.objects.filter(
            productcolour__item_code__PrCode=pr_code
        ).distinct()

        serializer = MaColorSerializer(colors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class SalesEntryView(APIView):
    def post(self, request):
        main_data = request.data.get("trso_main")
        sub_data = request.data.get("trso_sub", [])

        main_serializer = TrsoMainSerializer(data=main_data)
        if not main_serializer.is_valid():
            return Response({"errors": main_serializer.errors}, status=400)

        with transaction.atomic():
            main_instance = main_serializer.save()

            for idx, item in enumerate(sub_data, start=1):
                item["SoNo"] = main_instance.pk
                item["soYearCode"] = main_instance.soYearCode
                item["soSlNo"] = idx

            sub_serializer = TrsoSubSerializer(data=sub_data, many=True)
            if not sub_serializer.is_valid():
                transaction.set_rollback(True)
                return Response({"errors": sub_serializer.errors}, status=400)
            sub_serializer.save()

        return Response({"message": "Created Successfully"}, status=201)

class SalesEntryUpdateView(APIView):
    """PUT /sales-entry-update/<so_no>/<year_code>/"""

    def put(self, request, so_no, year_code):
        main_data = request.data.get("trso_main")
        sub_data = request.data.get("trso_sub", [])

        if not main_data:
            return Response({"detail": "Missing main data"}, status=status.HTTP_400_BAD_REQUEST)

        if not TrsoMain.objects.filter(soNo=so_no, soYearCode=year_code).exists():
            return Response({"detail": "Main entry not found."}, status=status.HTTP_404_NOT_FOUND)

        main_serializer = TrsoMainEditSerializer(data=main_data, partial=True)
        main_serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            TrsoMain.objects.filter(soNo=so_no, soYearCode=year_code).update(
                **main_serializer.validated_data
            )

            existing = {
                (s.PrCode or "").strip(): s
                for s in TrsoSub.objects.filter(SoNo=so_no, soYearCode=year_code)
            }
            incoming = set()

            for idx, item in enumerate(sub_data, start=1):
                item['SoNo'] = so_no
                item['soYearCode'] = year_code
                item['soSlNo'] = idx                      # row position = serial no
                code = str(item.get('PrCode', '')).strip()
                incoming.add(code)

                if code in existing:
                    ser = TrsoSubSerializer(existing[code], data=item, partial=True)
                    ser.is_valid(raise_exception=True)
                    values = dict(ser.validated_data)
                    for k in ('SoNo_id', 'soYearCode', 'PrCode'):
                        values.pop(k, None)               # key columns never change
                    TrsoSub.objects.filter(
                        SoNo=so_no, soYearCode=year_code, PrCode=code
                    ).update(**values)                    # soSlNo stays in values, so it renumbers
                else:
                    ser = TrsoSubSerializer(data=item)
                    ser.is_valid(raise_exception=True)
                    ser.save()                            # INSERT

            for code in existing.keys() - incoming:
                TrsoSub.objects.filter(SoNo=so_no, soYearCode=year_code, PrCode=code).delete()

        return Response({"detail": "Updated successfully."}, status=status.HTTP_200_OK)

    
class CurrentWeekSalesView(APIView):   ##list  all the  somain values for current week
    def get(self, request):
        today = now()
        start_of_week = today - timedelta(days=today.weekday())  #Monday
        end_of_week = start_of_week + timedelta(days=6)  #Sunday

        queryset = TrsoMain.objects.filter(
            soDate__date__range=[start_of_week.date(), end_of_week.date()]
        )
        serializer = TrsoMainSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class TrsoSubListBySoNoView(ListAPIView):
    serializer_class = TrsoSubSerializer

    def get_queryset(self):
        so_no = self.kwargs.get('so_no')
        year_code = self.request.query_params.get('SoYearCode')        
        qs = TrsoSub.objects.filter(SoNo=so_no).order_by('soSlNo')
        if year_code:
            qs = qs.filter(soYearCode=year_code)
        return qs

    def list(self, request, *args, **kwargs):
        if not request.query_params.get('SoYearCode'):
            return Response({"status": False, "message": "SoYearCode is required"},
                            status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response({
            "status": True,
            "message": "Sub-items fetched successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
        
        
class SalesOrderSearchView(APIView):
    def get(self, request):
        from_date_str = request.query_params.get("from_date")
        to_date_str = request.query_params.get("to_date")
        so_no = request.query_params.get("soNo")
        year_code = request.query_params.get("SoYearCode")   # optional

        if not from_date_str or not to_date_str:
            return Response({"status": False, "message": "from_date and to_date are required"},
                            status=status.HTTP_400_BAD_REQUEST)

        from_date = parse_date(from_date_str)
        to_date = parse_date(to_date_str)
        if not from_date or not to_date:
            return Response({"status": False, "message": "Invalid date format"},
                            status=status.HTTP_400_BAD_REQUEST)

        queryset = TrsoMain.objects.filter(soDate__date__range=[from_date, to_date])
        if so_no:
            queryset = queryset.filter(soNo=so_no)
        if year_code:
            queryset = queryset.filter(soYearCode=year_code)

        serializer = TrsoMainSerializer(queryset, many=True)
        return Response({
            "status": True,
            "message": "Filtered orders fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
             

class FilterdataForReportView(generics.ListAPIView):
    serializer_class = TrsoMainSerializer

    def get_queryset(self):
        queryset = TrsoMain.objects.all().order_by('soNo')
        params = self.request.query_params

        empno = params.get("empno")
        sono = params.get("sono")
        prcode = params.get("prcode")
        pacode = params.get("pacode")
        from_date = params.get("from_date")
        to_date = params.get("to_date")
        so_date=params.get("so_date")
        if empno:
            queryset = queryset.filter(soEmpNo=empno)

        if sono:
            queryset = queryset.filter(soNo=sono)

        if pacode:
            queryset = queryset.filter(PaCode__icontains=pacode)

        if from_date and to_date:
            try:
                from_dt = datetime.strptime(from_date,"%Y-%m-%d")
                to_dt = datetime.strptime(to_date,"%Y-%m-%d")
                queryset = queryset.filter(soDate__range=(from_dt, to_dt))
            except ValueError:
                pass  # Handle invalid date format silently
        if so_date:
           try:
              date_obj = datetime.strptime(so_date, "%Y-%m-%d")
              queryset = queryset.filter(soDate__date=date_obj.date())  # `.date()` for date-only match
           except ValueError:
               pass
      
        if prcode:
             queryset = queryset.filter(trso_sub__PrCode=prcode).distinct() # Skip filtering if prcode is invalid

        return queryset


    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({"message": "No records found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(queryset, many=True)
        return Response({"message": "Success", "data": serializer.data}, status=status.HTTP_200_OK)


class SalesEntryDetailView(APIView):
    """GET /sales-entry-detail/<soNo>/?SoYearCode=2627  (used by edit and print)"""

    def get(self, request, soNo):
        year_code = request.query_params.get("SoYearCode")
        if not year_code:
            return Response({"error": "SoYearCode is required."}, status=status.HTTP_400_BAD_REQUEST)

        main_instance = TrsoMain.objects.filter(soNo=soNo, soYearCode=year_code).first()
        if not main_instance:
            return Response({"error": "Sales order not found."}, status=status.HTTP_404_NOT_FOUND)

        sub_items = TrsoSub.objects.filter(SoNo=soNo, soYearCode=year_code).order_by('soSlNo')

        return Response({
            "trsomain": TrsoMainSerializer(main_instance).data,
            "trsosub": TrsoSubSerializer(sub_items, many=True).data,
        }, status=status.HTTP_200_OK)

               
class CalculateTaxAmount(APIView):
    def post(self, request):
        tax_type=request.data.get("TaxType")
        base_amount=request.data.get("base_amount")  # required field

        if not tax_type or base_amount is None:
            return Response({"error": "TaxType and Amount are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tax = MaTax.objects.get(TaxType=tax_type)
        except MaTax.DoesNotExist:
            return Response({"error": "Invalid TaxType."}, status=status.HTTP_404_NOT_FOUND)

        try:
            base_amount = float(base_amount)
            excise_duty = tax.ExciseDuty or 0
            cess = tax.CESS or 0
            sh_cess = tax.SHCess or 0

            total_tax =(base_amount*excise_duty/100)+\
                        (base_amount*cess/100) + \
                        (base_amount*sh_cess/100)

            return Response({
                "TaxType":tax.TaxType,
                "ExciseDuty":excise_duty,
                "CESS":cess,
                "SHCess":sh_cess,
                "base_amount":base_amount,
                "total_tax_amount":round(total_tax, 2)
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    


class TrsoMainDeleteView(APIView):
    """DELETE /delete-sales/<so_no>?SoYearCode=2627"""

    def delete(self, request, so_no):
        year_code = request.query_params.get("SoYearCode")
        if not year_code:
            return Response({"error": "SoYearCode is required"}, status=status.HTTP_400_BAD_REQUEST)

        main = TrsoMain.objects.filter(soNo=so_no, soYearCode=year_code).first()
        if not main:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        subs = list(TrsoSub.objects.filter(SoNo=so_no, soYearCode=year_code))

        with transaction.atomic():
            # Archive to the history tables (replaces the old delete signal)
            TrsoMainHistory.objects.create(
                soNo=main.soNo, soYearCode=main.soYearCode, soDate=main.soDate,
                PaCode=main.PaCode, PaCreditTerms=main.PaCreditTerms,
                SoPreparedTime=main.SoPreparedTime, soEmpNo=main.soEmpNo,
            )
            for s in subs:
                TrsoSubHistory.objects.create(
                    SoNo_id=main.soNo, soSlNo=s.soSlNo, soYearCode=s.soYearCode,
                    PrCode=s.PrCode, soSpecification=s.soSpecification, soQty=s.soQty,
                    soRate=s.soRate, soParticular=s.soParticular, soDiscount=s.soDiscount,
                    TaxType=s.TaxType, soTaxAmt=s.soTaxAmt,
                    SoDeliveryPreference=s.SoDeliveryPreference, SoDeliveryDate=s.SoDeliveryDate,
                )
            # Raw SQL, so BOTH keys are in the WHERE (Django's delete() would use soNo only)
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM TrsoSub WHERE SoNo = %s AND soYearCode = %s",
                               [so_no, year_code])
                cursor.execute("DELETE FROM TrsoMain WHERE soNo = %s AND soYearCode = %s",
                               [so_no, year_code])

        return Response(status=status.HTTP_204_NO_CONTENT)        

class LatestInvRateView(APIView):
    def get(self, request):
        # Get query params
        PaCode = request.query_params.get('PaCode')
        PrCode = request.query_params.get('PrCode')
        InvParticular = request.query_params.get('InvParticular')
        InvSpecification = request.query_params.get('InvSpecification')

        if not all([PaCode, PrCode, InvParticular, InvSpecification]):
            return Response({"error":"Missing required query params"}, status=400)

        # Normalize input: uppercase, trim, replace '+' with space
        normalize = lambda s: str(s).replace("+"," ").strip().upper()
        PaCode = normalize(PaCode)
        PrCode = normalize(PrCode)
        InvParticular = normalize(InvParticular)
        InvSpecification_input = normalize(InvSpecification).replace(" ", "")

        # Annotate DB fields with trim & uppercase
        queryset = RptRateLoad.objects.annotate(
            pacode_norm=Upper(Trim(F('PaCode'))),
            prcode_norm=Upper(Trim(F('PrCode'))),
            invpart_norm=Upper(Trim(F('InvParticular'))),
            invspec_norm_clean=Upper(Replace(F('InvSpecification'), Value(" "), Value("")))
        )

        # Use icontains to match variations in specification
        rate_record = queryset.filter(
            pacode_norm=PaCode,
            prcode_norm=PrCode,
            invpart_norm=InvParticular,
            invspec_norm_clean__icontains=InvSpecification_input
        ).order_by('-InvYearCode', '-InvNo').first()

        if rate_record:
            return Response({"InvRate": rate_record.InvRate})

        return Response({"error": "No matching record found"}, status=404)
    
    
class CheckCustomerEmployeeView(APIView):
    """
    Checks if the selected Empno matches with the customer's previous invoices.
    """
    def get(self, request):
        empno = request.query_params.get("empno")
        pacode = request.query_params.get("pacode")

        if not empno or not pacode:
            return Response({"error": "empno and pacode are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get all invoices for the given customer (pacode)
        invoices = RptRateLoad.objects.filter(PaCode=pacode)

        # if not invoices.exists():
        #     return Response({"warning":"No invoices found for this customer"}, status=status.HTTP_404_NOT_FOUND)

        # Check if employee exists in past invoices
        emp_exists = invoices.filter(InvEmpNo=empno).exists()

        if emp_exists:
            return Response({"message":"Employee is valid for this customer"}, status=status.HTTP_200_OK)
        else:
            return Response({"warning":"Employee does not match previous invoices for this customer"},status=status.HTTP_200_OK)

class CreditTermsView(APIView):
    def get(self, request, code):
        try:
            party = Maparty.objects.get(PaCode=code)
            return Response({'PaCreditTerms': party.PaCreditTerms}, status=status.HTTP_200_OK)
        except Maparty.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)        


#======================
def execute_sales_vs_payment_proc(from_date, to_date, emp_no):
    """
    Executes the salevsPaymentRegEmpNew stored procedure and returns results.

    Dates are formatted as 'YYYY-MM-DD' strings and embedded directly into
    the SQL string. emp_no is cast to int. This avoids the conflict between
    Django's mssql cursor wrapper and pyodbc's ? placeholder handling, which
    causes "not all arguments converted during string formatting".
    """
    sql = (
        "SET NOCOUNT ON; "
        "EXEC [dbo].[salevsPaymentRegEmpNew] "
        "@FDate='{fdate}', @ToDate='{tdate}', @Empno={empno}"
    ).format(
        fdate=str(from_date),   # date object -> 'YYYY-MM-DD'
        tdate=str(to_date),
        empno=int(emp_no),      # int cast prevents injection
    )

    with connection.cursor() as cursor:
        cursor.execute(sql)

        # Skip intermediate result sets produced by INSERT/UPDATE statements
        # inside the procedure until we reach the final SELECT result set.
        while cursor.description is None:
            if not cursor.nextset():
                return []

        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    # Map procedure output column names to serializer-friendly keys
    column_map = {
        'SL.No':           'SLNo',
        'PARTY NAME':      'PaName',
        'OPENING BALANCE': 'Opening',
        'SALES':           'Sales',
        'TOTAL':           'Total',
        'PAYMENT':         'Payment',
        'BALANCE':         'Balance',
    }

    results = []
    for row in rows:
        row_dict = dict(zip(columns, row))
        normalized = {
            column_map.get(k, k): (v if v is not None else 0.0)
            for k, v in row_dict.items()
        }
        results.append(normalized)

    return results


class SalesVsPaymentReportView(APIView):
    """
    GET  /api/sales-vs-payment/?from_date=2025-01-01&to_date=2026-06-12&emp_no=2
    POST /api/sales-vs-payment/  body: { "from_date": "...", "to_date": "...", "emp_no": 2 }
    """

    def get(self, request):
        request_serializer = SalesVsPaymentRequestSerializer(
            data=request.query_params
        )
        if not request_serializer.is_valid():
            return Response(
                {"success": False, "errors": request_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated  = request_serializer.validated_data
        from_date  = validated['from_date']
        to_date    = validated['to_date']
        emp_no     = validated['emp_no']

        try:
            results = execute_sales_vs_payment_proc(from_date, to_date, emp_no)
        except Exception as exc:
            return Response(
                {"success": False, "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = SalesVsPaymentSerializer(results, many=True)

        return Response(
            {
                "success": True,
                "emp_no": emp_no,
                "from_date": str(from_date),
                "to_date": str(to_date),
                "total_records": len(results),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        request_serializer = SalesVsPaymentRequestSerializer(data=request.data)
        if not request_serializer.is_valid():
            return Response(
                {"success": False, "errors": request_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated  = request_serializer.validated_data
        from_date  = validated['from_date']
        to_date    = validated['to_date']
        emp_no     = validated['emp_no']

        try:
            results = execute_sales_vs_payment_proc(from_date, to_date, emp_no)
        except Exception as exc:
            return Response(
                {"success": False, "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = SalesVsPaymentSerializer(results, many=True)

        return Response(
            {
                "success": True,
                "emp_no": emp_no,
                "from_date": str(from_date),
                "to_date": str(to_date),
                "total_records": len(results),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

#======================



def execute_sales_vs_payment_register_proc(from_date, to_date):
    """
    Executes the salevsPaymentReg stored procedure and returns results.

    Dates are formatted as 'YYYY-MM-DD' strings and embedded directly into
    the SQL string. emp_no is cast to int. This avoids the conflict between
    Django's mssql cursor wrapper and pyodbc's ? placeholder handling, which
    causes "not all arguments converted during string formatting".
    """
    sql = (
        "SET NOCOUNT ON; "
        "EXEC [dbo].[salevsPaymentReg] "
        "@FDate='{fdate}', @ToDate='{tdate}'"
    ).format(
        fdate=str(from_date),   # date object -> 'YYYY-MM-DD'
        tdate=str(to_date),       
    )

    with connection.cursor() as cursor:
        cursor.execute(sql)

        # Skip intermediate result sets produced by INSERT/UPDATE statements
        # inside the procedure until we reach the final SELECT result set.
        while cursor.description is None:
            if not cursor.nextset():
                return []

        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    # Map procedure output column names to serializer-friendly keys
    column_map = {
        'SL.No':           'SLNo',
        'PARTY NAME':      'PaName',
        'OPENING BALANCE': 'Opening',
        'SALES':           'Sales',
        'TOTAL':           'Total',
        'PAYMENT':         'Payment',
        'BALANCE':         'Balance',
    }

    results = []
    for row in rows:
        row_dict = dict(zip(columns, row))
        normalized = {
            column_map.get(k, k): (v if v is not None else 0.0)
            for k, v in row_dict.items()
        }
        results.append(normalized)

    return results


class SalesVsPaymentRegisterReportView(APIView):
    """
    GET  /api/sales-vs-payment-register/?from_date=2025-01-01&to_date=2026-06-12
    POST /api/sales-vs-payment-register/  body: { "from_date": "...", "to_date": "..." }
    """

    def get(self, request):
        request_serializer = SalesVsPaymentRegisterRequestSerializer(
            data=request.query_params
        )
        if not request_serializer.is_valid():
            return Response(
                {"success": False, "errors": request_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated  = request_serializer.validated_data
        from_date  = validated['from_date']
        to_date    = validated['to_date']     

        try:
            results = execute_sales_vs_payment_register_proc(from_date, to_date)
        except Exception as exc:
            return Response(
                {"success": False, "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = SalesVsPaymentRegisterSerializer(results, many=True)

        return Response(
            {
                "success": True,             
                "from_date": str(from_date),
                "to_date": str(to_date),
                "total_records": len(results),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        request_serializer = SalesVsPaymentRegisterRequestSerializer(data=request.data)
        if not request_serializer.is_valid():
            return Response(
                {"success": False, "errors": request_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated  = request_serializer.validated_data
        from_date  = validated['from_date']
        to_date    = validated['to_date']
        emp_no     = validated['emp_no']

        try:
            results = execute_sales_vs_payment_register_proc(from_date, to_date)
        except Exception as exc:
            return Response(
                {"success": False, "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = SalesVsPaymentRegisterSerializer(results, many=True)

        return Response(
            {
                "success": True,
                "emp_no": emp_no,
                "from_date": str(from_date),
                "to_date": str(to_date),
                "total_records": len(results),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

#======================



def execute_CustomerOutstanding_proc():
    """
    Executes the CustomerOutstanding stored procedure and returns results.

    Dates are formatted as 'YYYY-MM-DD' strings and embedded directly into
    the SQL string. emp_no is cast to int. This avoids the conflict between
    Django's mssql cursor wrapper and pyodbc's ? placeholder handling, which
    causes "not all arguments converted during string formatting".
    """
    sql = (
        "SET NOCOUNT ON; "
        "EXEC [dbo].[CustomerOutstanding2] "       
    )

    with connection.cursor() as cursor:
        cursor.execute(sql)

        # Skip intermediate result sets produced by INSERT/UPDATE statements
        # inside the procedure until we reach the final SELECT result set.
        while cursor.description is None:
            if not cursor.nextset():
                return []

        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    # Map procedure output column names to serializer-friendly keys
    column_map = {
        'SL.No':           'SLNo',
        'PARTY NAME':      'PaName',
        'Below 30 Days': 'below_30',
        'Between 30-45 Days': 'between_30_45',
        'Between 45-60 Days': 'between_45_60',
        'Between 60-90 Days': 'between_60_90',
        'Above 90 Days': 'above_90',
    }

    results = []
    for row in rows:
        row_dict = dict(zip(columns, row))
        normalized = {
            column_map.get(k, k): (v if v is not None else 0.0)
            for k, v in row_dict.items()
        }
        results.append(normalized)

    return results

class CustomerOutstandingReportView(APIView):
    """
    GET /api/customer-outstanding/
    """

    def get(self, request):
        try:
            results = execute_CustomerOutstanding_proc()
        except Exception as exc:
            return Response(
                {"success": False, "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Build index map for sl_no: { PaName: serial_number }
        index_map = {
            row['PaName']: idx + 1
            for idx, row in enumerate(results)
        }

        serializer = CustomerOutstandingSerializer(
            results,
            many=True,
            context={'index': index_map},  # pass sl_no context
        )

        return Response(
            {
                "success": True,
                "total_records": len(results),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

#======================

def execute_EmpWiseCustomerOutstanding_proc(emp_no):
    """
    Executes the execute_EmpWiseCustomerOutstanding_proc stored procedure and returns results.

    Dates are formatted as 'YYYY-MM-DD' strings and embedded directly into
    the SQL string. emp_no is cast to int. This avoids the conflict between
    Django's mssql cursor wrapper and pyodbc's ? placeholder handling, which
    causes "not all arguments converted during string formatting".
    """
    sql = (
        "SET NOCOUNT ON; "
        "EXEC [dbo].[CustomerOutstanding2New] {empno}"
    ).format(       
        empno=int(emp_no),      # int cast prevents injection
    )

    with connection.cursor() as cursor:
        cursor.execute(sql)

        # Skip intermediate result sets produced by INSERT/UPDATE statements
        # inside the procedure until we reach the final SELECT result set.
        while cursor.description is None:
            if not cursor.nextset():
                return []

        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    # Map procedure output column names to serializer-friendly keys
    column_map = {
        'SL.No':           'SLNo',
        'PARTY NAME':      'PaName',
        'Below 30 Days': 'below_30',
        'Between 30-45 Days': 'between_30_45',
        'Between 45-60 Days': 'between_45_60',
        'Between 60-90 Days': 'between_60_90',
        'Above 90 Days': 'above_90',
    }

    results = []
    for row in rows:
        row_dict = dict(zip(columns, row))
        normalized = {
            column_map.get(k, k): (v if v is not None else 0.0)
            for k, v in row_dict.items()
        }
        results.append(normalized)

    return results


class EmpWiseCustomerOutstandingReportView(APIView):
    """
    GET  /api/emp-wise-customer-outstanding/?emp_no=2
    POST /api/emp-wise-customer-outstanding/  body: { "emp_no": 2 }
    """

    def get(self, request):
        request_serializer = EmpWiseCustomerOutstandingRequestSerializer(
            data=request.query_params
        )
        if not request_serializer.is_valid():
            return Response(
                {"success": False, "errors": request_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated  = request_serializer.validated_data    
        emp_no     = validated['emp_no']

        try:
            results = execute_EmpWiseCustomerOutstanding_proc(emp_no)
        except Exception as exc:
            return Response(
                {"success": False, "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = EmpWiseCustomerOutstandingSerializer(results, many=True)

        return Response(
            {
                "success": True,
                "emp_no": emp_no,              
                "total_records": len(results),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        request_serializer = EmpWiseCustomerOutstandingRequestSerializer(data=request.data)
        if not request_serializer.is_valid():
            return Response(
                {"success": False, "errors": request_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated  = request_serializer.validated_data     
        emp_no     = validated['emp_no']

        try:
            results = execute_EmpWiseCustomerOutstanding_proc(emp_no)
        except Exception as exc:
            return Response(
                {"success": False, "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = EmpWiseCustomerOutstandingSerializer(results, many=True)

        return Response(
            {
                "success": True,
                "emp_no": emp_no,              
                "total_records": len(results),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

def execute_PaymentOutstandingList_proc(from_date, to_date, PaCode, emp_no, PayStatus):
    """
    Executes the PaymentOutstandingList stored procedure and returns results.

    Optional parameters that are not supplied are sent as literal SQL NULL
    (not empty strings), so the procedure's COALESCE(@param, column) logic
    correctly falls back to "no filter" instead of matching on ''/0.
    """

    def sql_str(value):
        if value is None or value == '':
            return 'NULL'
        return "'{}'".format(str(value).replace("'", "''"))

    def sql_int(value):
        if value is None or value == '':
            return 'NULL'
        return str(int(value))

    sql = (
        "SET NOCOUNT ON; "
        "EXEC [dbo].[PaymentOutstandingList] "
        "@FDate={fdate}, @ToDate={tdate}, @Pacode={pacode}, "
        "@Empno={empno}, @Status={pay_status}"
    ).format(
        fdate=sql_str(from_date),
        tdate=sql_str(to_date),
        pacode=sql_str(PaCode),
        empno=sql_int(emp_no),
        pay_status=sql_str(PayStatus),
    )

    with connection.cursor() as cursor:
        cursor.execute(sql)

        while cursor.description is None:
            if not cursor.nextset():
                return []

        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    column_map = {
        'SL.No': 'SLNo',
        'InvNo': 'InvNo',
        'InvDate': 'InvDate',
        'PaName': 'PaName',
        'InvGrandTotal': 'InvGrandTotal',
        'TotalPaid': 'TotalPaid',
        'TotalDebit': 'TotalDebit',
        'PendingAmount': 'PendingAmount',
        'TotalTDS': 'TotalTDS',
        'DueDays': 'DueDays',
        'BankRef': 'BankRef',
    }

    results = []
    for row in rows:
        row_dict = dict(zip(columns, row))
        normalized = {
            column_map.get(k, k): (v if v is not None else 0.0)
            for k, v in row_dict.items()
        }
        results.append(normalized)

    return results
class PaymentOutstandingListView(APIView):
    """
    GET /api/payment-outstanding-list/
    http://127.0.0.1:8000/api/payment-outstanding-list/?from_date=2014-01-04&to_date=2026-06-12&PaCode=CU1623
    """

    def get(self, request):
        req_serializer = PaymentOutstandingListRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)
        validated = req_serializer.validated_data

        from_date = validated['from_date']
        to_date = validated['to_date']
        emp_no = validated.get('emp_no')
        PaCode = validated.get('PaCode')
        PayStatus = validated.get('PayStatus')

        try:
            results = execute_PaymentOutstandingList_proc(
                from_date=from_date,
                to_date=to_date,
                PaCode=PaCode,
                emp_no=emp_no,
                PayStatus=PayStatus,
            )
        except Exception as exc:
            return Response(
                {"success": False, "error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Build index map for sl_no using row identity (id() of each dict),
        # since PaName is not guaranteed unique per row.
        index_map = {
            id(row): idx + 1
            for idx, row in enumerate(results)
        }

        serializer = PaymentOutstandingListSerializer(
            results,
            many=True,
            context={'index': index_map},
        )

        return Response(
            {
                "success": True,
                "emp_no": emp_no,
                "from_date": from_date,
                "to_date": to_date,
                "total_records": len(results),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )