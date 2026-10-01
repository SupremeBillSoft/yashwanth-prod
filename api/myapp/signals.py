# signals.py

from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import TrsoMain, TrsoSub, TrsoMainHistory, TrsoSubHistory

@receiver(pre_delete, sender=TrsoMain)
def archive_main_and_sub(sender, instance, **kwargs):
    # Save main history and store it in a variable
    main_history = TrsoMainHistory.objects.create(
        soNo=instance.soNo,
        soYearCode=instance.soYearCode,
        soDate=instance.soDate,
        PaCode=instance.PaCode,
        PaCreditTerms=instance.PaCreditTerms,
        SoPreparedTime=instance.SoPreparedTime,
        soEmpNo=instance.soEmpNo,
    )

    # Save sub history, linking to main_history (TrsoMainHistory)
    sub_items = TrsoSub.objects.filter(SoNo=instance)
    for sub in sub_items:
        TrsoSubHistory.objects.create(
            SoNo=main_history,  # ✅ FIXED: use main_history, not sub.SoNo
            soSlNo=sub.soSlNo,
            soYearCode=sub.soYearCode,
            PrCode=sub.PrCode,
            soSpecification=sub.soSpecification,
            soQty=sub.soQty,
            soRate=sub.soRate,
            soParticular=sub.soParticular,
            soDiscount=sub.soDiscount,
            TaxType=sub.TaxType,
            soTaxAmt=sub.soTaxAmt,
            SoDeliveryPreference=sub.SoDeliveryPreference,
            SoDeliveryDate=sub.SoDeliveryDate,
        )
