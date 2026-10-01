import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from myapp.serializers import TrsoMainSerializer, TrsoSubSerializer

main = {
    'soNo': 99999,
    'soYearCode': '2526',
    'soDate': '2026-06-24T10:00:00Z',
    'PaCode': 'P00001',
    'soEmpNo': 1,
    'SoPreparedTime': '2026-06-24T10:00:00Z',
    'PaCreditTerms': '30'
}
sub = [{
    'SoNo': 99999,
    'soYearCode': '2526',
    'soSlNo': 12345,
    'PrCode': '1001',
    'soSpecification': 'Pack',
    'soQty': 1,
    'soRate': 10.0,
    'soParticular': 'Some',
    'soDiscount': 0,
    'TaxType': 'GST',
    'soTaxAmt': 0,
    'SoDeliveryPreference': 'High',
    'SoDeliveryDate': '2026-06-28T00:00:00Z'
}]

ms = TrsoMainSerializer(data=main)
print('main valid', ms.is_valid())
print(ms.errors)
ss = TrsoSubSerializer(data=sub, many=True)
print('sub valid', ss.is_valid())
print(ss.errors)
