import React from 'react';
import {MdLocalPrintshop} from "react-icons/md";


export default function InvoiceTempNew({ soMain = {}, soSub = [], companyInfo = {} }) {
  const handlePrint = () => window.print();
  //console.log(companyInfo)


  const totalQty = soSub?.reduce((sum, item) => sum + Number(item.soQty || 0), 0);
  //const totalRate = soSub?.reduce((sum, item) => sum + Number(item.soRate || 0), 0);
  // const totalAmount = soSub?.reduce(
  //   (sum, item) => sum + Number(item.soQty || 0) * Number(item.soRate || 0),
  //   0
  // );

  // const totalAmount = soSub?.reduce((sum, item) => {
  //   const qty = Number(item.soQty || 0)
  //   const rate = Number(item.soRate || 0)
  //   const discount = Number(item.soDiscount || 0)  
  //   const base = qty * rate
  //   const discountAmount = base * (discount / 100)
  //   const net = base - discountAmount
  
  //   return sum + net;
  // }, 0);




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

      {/* Print Area */}
      <div className="print-area  p-2 sm:p-6 print:p-10 text-sm text-gray-800  w sm:max-w-6xl mx-auto border print:border-0">
        <h2 className="font-bold text-center text-lg">Sales Order Report</h2>
        <div className="flex justify-between items-center mt-4 mb-3">
          <div>
            <h2 className='font-bold '>{companyInfo?.company_name || 'Yashwanth Color Coatings'}</h2>
            <div className="text-sm   leading-5 text-gray-600">
              <p>{companyInfo?.address1 || ''}</p>
              <p>{[companyInfo?.address2, companyInfo?.address3].filter(Boolean).join(', ')}</p>
            </div>
            <p className="text-xs">GST No: _______________</p>
          </div>
          {/*<div className="text-left">
            <p>Date: {soMain?.soDate
              ? new Date(soMain.soDate).toLocaleDateString('en-GB')
              : '--'}</p>
          </div>*/}

          <div>
            <p className="font-semibold">To:</p>
            {/*<p className="border-b border-gray-400 h-6 w-full"></p> */}
            <div className='flex gap-x-2'>
              <p className="font-semibold">M/s:</p>
              <p className=" ">{soMain?.PaName||'--'}</p>
            </div>

            <div className='flex gap-x-2'>
                    <p className="font-semibold">Address:</p>
                    <p className='text-sm'>{soMain?.PaAddress3||''}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4 mb-2 print:grid-cols-2">
          <div className='flex gap-x-2'>
            <p className="font-semibold">Sales Representative Name:</p>
            <p className="">{soMain?.EmpName||'--'} </p>
          </div>
          <div className="">
            <p><span className='font-bold'>Date:</span>{soMain?.soDate
              ? new Date(soMain.soDate).toLocaleDateString('en-GB')
              : '--'}</p>
          </div>
        </div>

        {/* Table */}
        <div className=' w-full overflow-x-auto'>
          <table className="w-max min-w-full border border-gray-700 text-xs ">
            <thead className="bg-gray-100 border-b border-gray-700">
              <tr className="text-center">
                <th className="border-r border-gray-700 px-1 py-1">SNO</th>
                <th className="border-r border-gray-700 px-1 py-1">Item Details</th>
                <th className="border-r border-gray-700 px-1 py-1">Packing</th>
                <th className="border-r border-gray-700 px-1 py-1">Qty</th>
                <th className="border-r border-gray-700 px-1 py-1">Rate</th>
                <th className="border-r border-gray-700 px-1 py-1">Dis %</th>
                <th className="border-r border-gray-700 px-1 py-1">Dis Amount</th>
                <th className="border-gray-700 px-1 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {soSub?.map((item, idx) => (
                <tr
                  key={idx}
                  className={`text-center h-8 ${(idx + 1) % 20 === 0 ? 'page-break' : ''}`}
                >
                  <td className="border border-gray-700 px-1 py-1">{idx + 1}</td>
                  <td className="border border-gray-700 px-1 py-1">{`${item.PrName || '--'}/${item.soParticular || '--'}`}</td>
                  <td className="border border-gray-700 px-1 py-1">{item.soSpecification || '--'}</td>
                  <td className="border border-gray-700 px-1 py-1">{item.soQty || 0}</td>
                  <td className="border border-gray-700 px-1 py-1  text-right">  ₹{Number(item.soRate || 0).toFixed(2)}</td>
                  <td className="border border-gray-700 px-1 py-1">  {item.soDiscount || 0}%</td>
                  <td className="border border-gray-700 px-1 py-1 text-right">₹{(
                    (Number(item.soQty || 0) * Number(item.soRate || 0)) *
                    (Number(item.soDiscount || 0) / 100)
                  ).toFixed(2)}</td>
                  <td className="border border-gray-700 px-1 py-1  text-right ">  
                   ₹{(Number(item.soQty) * Number(item.soRate) -
                        (Number(item.soQty) * Number(item.soRate) * Number(item.soDiscount || 0) / 100) +
                        Number(item.soTaxAmt || 0)).toFixed(2)}</td>
                </tr>
              ))}

               <tr className="border-t font-semibold">
                <td colSpan={3} className="px-2 py-2 text-right">
                  Total Qty
                </td>
                <td className="px-2 py-2 text-center">{totalQty}</td>
                {/* <td className="px-2 py-2 text-right">₹{totalRate.toFixed(2)}</td> */}
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"> </td>
                <td className="px-2 py-2 text-right">Total Amount</td>
                <td className="px-2 py-2 text-right">₹ {totalAmount.toFixed(2)}</td>
              
              </tr> 
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mt-10">
          <div></div>
          <div className="text-right">
            <p className="border-t border-gray-500 w-48 pt-1 text-sm">
              Received Sign
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
