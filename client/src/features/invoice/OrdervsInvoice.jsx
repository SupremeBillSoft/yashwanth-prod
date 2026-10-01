import React, { useState, useEffect } from 'react'
import { MdLocalPrintshop } from "react-icons/md";
import api from '../../services/api';

const soSub = [
  {
    soSlNo: 1,
    soNo: 'SO-1001',
    soDate: '2025-07-12',
    productName: 'Steel Rod',
    soQty: 50,
    invoiceQty: 30,
    soRate: 100,
    invoiceAmount: 3000,
    orderAmount: 8989,
    pendingQty: 121
  },
  {
    soSlNo: 2,
    soNo: 'SO-1001',
    soDate: '2025-07-12',
    productName: 'Iron Sheet',
    soQty: 20,
    invoiceQty: 20,
    soRate: 250,
    invoiceAmount: 5000,
    orderAmount: 399,
    pendingQty: 132
  },
  {
    soSlNo: 3,
    soNo: 'SO-1001',
    soDate: '2025-07-12',
    productName: 'Aluminum Pipe',
    soQty: 15,
    invoiceQty: 10,
    soRate: 180,
    invoiceAmount: 1800,
    orderAmount: 39,
    pendingQty: 7576
  },
];
export default function OrdervsInvoice({ soMain = null, soSub = [], loading, error }) {

  const [companyInfo, setCompanyInfo] = useState(null)
  const handlePrint = () => window.print()



  const fetchCompanyInfo = async () => {
    try {
      const res = await api.get("/company-info/")
     // console.log(res)
      setCompanyInfo(res.data)
    } catch (error) {
      //console.log(res)
    }

  }

  useEffect(() => {
    fetchCompanyInfo()
  }, [])

  const totalQty = soSub.reduce((sum, item) => sum + Number(item.soQty || 0), 0);
  const totalRate = soSub.reduce((sum, item) => sum + Number(item.soRate || 0), 0);
  const totalAmount = soSub.reduce(
    (sum, item) => sum + Number(item.soQty || 0) * Number(item.soRate || 0),
    0
  );



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-semibold py-4">
        {error}
      </div>
    );
  }

  if (!soMain) return null;


  return (
    <>  

      <div className="flex justify-center my-4 print:hidden">

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-orange-500 text-white rounded text-base font-medium  flex gap-x-1 hover:cursor-pointer items-center"
        >
          <span><MdLocalPrintshop size={20} /></span> Print Invoice
        </button>
      </div>

      {/* Invoice Content */}

    

    
      
      <div className="invoice-print mx-auto bg-white border-0 text-gray-800 text-sm shadow-none print:shadow-none print:bg-white print:w-[210mm] print:min-h-[297mm] print:p-10 print:mx-0 print:rounded-none screen:p-4 p-0 md:p-2">
        <div className="max-w-full mx-auto print:max-w-[210mm]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-y-3 border-b pb-3">
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center space-x-2">
                <div className="text-red-500  text-sm xl:text-2xl font-bold">🌸</div>
                <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                  {companyInfo?.company_name || 'Company Name'}
                </h1>
              </div>
              <div className="text-sm   xl:pl-1 leading-5 text-gray-600">
                <p>{companyInfo?.address1 || ''}</p>
                <p>{[companyInfo?.address2, companyInfo?.address3].filter(Boolean).join(', ')}</p>
              </div>
            </div>
            {/* <div className="text-right text-sm space-y-1">
      <p>
        <span className="font-semibold">SO No:</span> {soMain?.soNo || '--'}
      </p>
      <p>
        <span className="font-semibold">Date:</span>{' '}
        {soMain?.soDate
          ? new Date(soMain.soDate).toLocaleDateString('en-GB')
          : '--'}
      </p>
    </div> */}
          </div>

          {/* Customer Info */}
          <div className="mt-6 space-y-3">
            <div className=" flex felx-col  sm:flex-row sm:justify-between  md:justify-start sm:items-start print:justify-start  items-center gap-x-2 text-md">
              <p className="font-semibold text-gray-600">Sales Representative:</p>
              <p>{soMain?.EmpName || '--'}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-2">
              <div className="flex items-center gap-x-2">
                <p className="font-bold uppercase text-xs text-gray-600">Customer Name:</p>
                <p>{soMain?.PaName || '--'}</p>
              </div>
              {/* <div className="flex items-center gap-x-2">
        <p className="font-bold uppercase text-xs text-gray-600">GST No:</p>
        <p>{companyInfo?.GSTNo || '---'}</p>
      </div> */}
            </div>
          </div>

          {/* Table */}
          <div className="mt-8 overflow-x-auto overflow-visible screen:rounded-md ">
            <table className="w-full table-auto border-t border-b text-xs border-collapse print:text-xs">
              <thead>
                <tr className="bg-gray-100 capitalize tracking-wide text-gray-600">
                  <th className="w-[7%] px-2 py-2 text-left">Sl No</th>
                  <th className="w-[7%] px-2 py-2 text-left">Order No</th>
                  <th className="w-[13%] px-2 py-2 text-center">Order Date</th>
                  <th className="w-[16%] px-2 py-2 text-center">Product Name</th>
                  <th className="w-[10%] px-2 py-2 text-right">Order Qty</th>
                  <th className="w-[12%] px-2 py-2 text-center">Invoice Qty</th>

                  <th className="w-[12%] px-2 py-2 text-center">Order Amount</th>
                  <th className="w-[12%] px-2 py-2 text-center">Invoice Amount</th>
                  <th className="w-[8%] px-2 py-2 text-center">Pending Qty</th>
                </tr>
              </thead>
              <tbody>
                {soSub.map((item, index) => (
                  <tr key={item.soSlNo || index} className="border-t hover:bg-gray-50 text-sm print:text-xs">
                    <td className=" w-[7%] px-2 py-2 text-left">{index + 1}</td>
                    <td className="  w-[10%] px-2 py-2 text-left">{item.soNo || '--'}</td>
                    <td className=" w-[12%] px-2 py-2 text-center">{new Date(item.soDate).toLocaleDateString('en-GB')}</td>
                    <td className="w-[16%] px-2 py-2 text-left pl-2">
                      {item.PrName}
                    </td>
                    <td className=" w-[10%] px-2 py-2 text-right">
                      {item.soQty}
                    </td>
                    <td className=" w-[12%] px-2 py-2 text-right">
                      {item.invoiceQty}
                    </td>
                    <td className=" w-[12%] px-2 py-2 text-right">
                      {item.orderAmount}
                    </td>
                    <td className=" w-[12%] px-2 py-2 text-right">
                      {item.invoiceAmount}
                    </td>
                    <td className=" w-[8%] px-2 py-2 text-right">
                      {item.pendingQty}
                    </td>

                  </tr>
                ))}

                {/* Total Row */}
                <tr className="border-t font-semibold">
                  <td colSpan={4} className="px-2 py-2 text-right">
                    Total
                  </td>
                  <td className="px-2 py-2 text-right">{totalQty}</td>
                  {/* <td className="px-2 py-2 text-right">₹{totalRate.toFixed(2)}</td> */}
                  {/* <td className="px-2 py-2 text-right">₹{totalAmount.toFixed(2)}</td> */}
                  <td className="px-2 py-2"></td>
                  <td className="px-2 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-10 flex justify-between items-center border-t pt-4">
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
  )
}
