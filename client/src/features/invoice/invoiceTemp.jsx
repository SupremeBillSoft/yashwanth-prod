import React from 'react';
import { MdLocalPrintshop } from "react-icons/md";
export default function InvoiceTemplate({ soMain = {}, soSub = [], companyInfo = {} }) {
  const handlePrint = () => window.print();
  console.log("format 2 ", soSub)
  const getPreferenceClass = (preference = '') => {
    switch (preference.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-600 font-semibold';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 font-semibold';
      case 'low':
        return 'bg-green-100 text-green-700 font-semibold';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const totalQty = soSub.reduce((sum, item) => sum + Number(item.soQty || 0), 0);
  const totalRate = soSub.reduce((sum, item) => sum + Number(item.soRate || 0), 0);





  const totalAmount = Number(soSub.reduce((sum, item) => {
    const qty = Number(item.soQty || 0);
    const rate = Number(item.soRate || 0);
    const discount = Number(item.soDiscount || 0);
    const taxAmt = Number(item.soTaxAmt || 0);

    const baseAmount = qty * rate;
    const discountAmount = baseAmount * (discount / 100);
    const total = baseAmount - discountAmount + taxAmt;
    console.log(taxAmt, baseAmount, discountAmount)
    return sum + total;
  }, 0).toFixed(2));


  return (
    <>
      {/* Print Button */}
      <div className="flex justify-center my-4 print:hidden">

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-orange-500 text-white rounded text-base font-medium  flex gap-x-1 hover:cursor-pointer items-center"
        >
          <span><MdLocalPrintshop size={20} /></span> Print So No
        </button>
      </div>

      {/* Invoice Content */}
      <div className="print-area  mx-auto bg-white print:border text-gray-800 text-sm shadow-none print:shadow-none print:bg-white print:w-[210mm] print:min-h-[297mm] print:p-10 print:mx-0 print:rounded-none screen:p-4 p-0 md:p-2">
        <div className="max-w-full mx-auto print:max-w-[210mm]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-y-3 border-b pb-3">
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center space-x-2">
                <div className="text-red-500  text-sm xl:text-2xl font-bold">🌸</div>
                <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide print:text-black">
                  {companyInfo?.company_name || 'Company Name'}
                </h1>
              </div>
              <div className="text-sm   xl:pl-1 leading-5 text-gray-600 print:text-black">
                <p>{companyInfo?.address1 || ''}</p>
                <p>{[companyInfo?.address2, companyInfo?.address3].filter(Boolean).join(', ')}</p>
              </div>
            </div>
            <div className="text-right text-sm space-y-1">
              <p>
                <span className="font-semibold">SO No:</span> {soMain?.soNo || '--'}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{' '}
                {soMain?.soDate
                  ? new Date(soMain.soDate).toLocaleDateString('en-GB')
                  : '--'}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mt-6 space-y-3">
            <div className=" flex felx-col  sm:flex-row sm:justify-between  md:justify-start sm:items-start print:justify-start  items-center gap-x-2 text-md">
              <p className="font-semibold text-gray-600 print:text-black">Sales Representative:</p>
              <p>{soMain?.EmpName || '--'}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-2">
              <div className="flex items-center gap-x-2">
                <p className="font-bold uppercase text-xs text-gray-600 print:text-black">Customer Name:</p>
                <p>{soMain?.PaName || '--'}</p>
              </div>
              <div className="flex items-center gap-x-2">
                <p className="font-bold uppercase text-xs text-gray-600 print:text-black">GST No:</p>
                <p>{companyInfo?.GSTNo || '---'}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-8 w-full  overflow-x-auto overflow-visible screen:rounded-md border-0 ">
            <table className="w-max min-w-full border-t border-b  text-base  print:text-xs">
              <thead>
                <tr className="bg-gray-100 capitalize tracking-wide text-gray-600 print:text-black">
                  <th className="px-2 py-2 text-left">Sl No</th>
                  <th className="px-2 py-2 text-left">Product Name</th>
                  <th className="px-2 py-2 text-center">Order Qty</th>
                  <th className="px-2 py-2 text-center">Rate</th>
                  <th className="px-2 py-2 text-center">Discount</th>
                  <th className="px-2 py-2 text-center">Tax Type</th>
                  <th className="px-2 py-2 text-center">Tax Amount</th>
                  <th className="px-2 py-2 text-center">Amount</th>
                  <th className="px-2 py-2 text-center">Delivery Date</th>
                  <th className="px-2 py-2 text-center">Preference</th>
                </tr>
              </thead>
              <tbody>
                {soSub.map((item, index) => (
                  <tr key={item.soSlNo || index} className="border-t hover:bg-gray-50 text-sm">
                    <td className="px-2 py-2 text-left">{index + 1}</td>
                    <td className="px-2 py-2 text-left">{`${item.PrName || '--'}/${item.soParticular || '--'}/${item.soSpecification || '--'}`}</td>
                    <td className="px-2 py-2 text-center">{item.soQty || 0}</td>
                    <td className="px-2 py-2 text-right">
                      ₹{Number(item.soRate || 0).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {item.soDiscount || 0}%
                    </td>
                    <td className="px-2 py-2 text-center">
                      {item.TaxType}
                    </td>
                    <td className="px-2 py-2 text-right">
                    ₹{(item.soTaxAmt).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      ₹{(Number(item.soQty) * Number(item.soRate) -
                        (Number(item.soQty) * Number(item.soRate) * Number(item.soDiscount || 0) / 100) +
                        Number(item.soTaxAmt || 0)).toFixed(2)}
                    </td>

                    <td className="px-2 py-2 text-center">
                      {item.SoDeliveryDate
                        ? new Date(item.SoDeliveryDate).toLocaleDateString('en-GB')
                        : '--'}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span
                        className={`px-3 py-1 text-xs rounded-full w-20 inline-block text-center ${getPreferenceClass(
                          item.SoDeliveryPreference
                        )}`}
                      >
                        {item.SoDeliveryPreference || '--'}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="border-t font-semibold">
                  <td colSpan={3} className="px-2 py-2 text-right">
                    {/* Total */}
                  </td>
                  <td className="px-2 py-2 text-center">{""}</td>
                  <td className="px-2 py-2 text-right">{""}</td>
                  <td className="px-2 py-2"></td>
                  <td className="px-2 py-2">Total</td>
                  <td className="px-2 py-2 text-right">₹{totalAmount.toFixed(2)}</td>
                  <td className="px-2 py-2"></td>
                  <td className="px-2 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-10 flex justify-between items-center border-0 pt-4">
            <p className="text-sm text-gray-700">Thank you for your business!</p>
            <div className="text-right">
              <div className="border-t w-48 mt-4 pt-1 text-xs text-gray-600">
                Authorized Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
