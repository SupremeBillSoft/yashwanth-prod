// components/invoice/InvoiceWrapper.jsx
import React, { useEffect, useState } from 'react';
// import InvoiceTemplate from './invoiceTemp';
import api from '../../services/api';
// import axios from 'axios';
// import { toast } from 'react-toastify';
import InvoiceTempNew from './invoiceTempnew'
import InvoiceTemplate from './invoiceTemp'

export default function InvoiceWrapper({ soNo }) {
  const [mainData, setMainData] = useState(null);
  const [subItems, setSubItems] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error ,setError]=useState("")
  const [activeFormat,setActiveFormat] = useState("format1"); // format1 or format2

  //console.log(subItems)
  const fetchData = async () => {
     if(!soNo) return;      
    setError("")
    setLoading(true);
    setSubItems([])
    setMainData("")
    setCompanyInfo("")

    try {
      const [mainRes,companyRes] = await Promise.all([
        api.get(`/sales-entry-detail/${soNo}/`),
        api.get('/company-info/'),
      ]);
      setMainData(mainRes.data.trsomain);
      setSubItems(mainRes.data.trsosub);
      setCompanyInfo(companyRes.data);
    } catch (err) {
      setError('No data found for this SO No.');
      //toast.error('Failed to fetch invoice data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (soNo) fetchData();
  }, [soNo])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" />
      </div>
    );
  }
if(error){
    return(
      <div className="text-center text-red-500 font-semibold py-4">
           {error}
      </div>
    )
}


  // if (!mainData || companyInfo) {
  //   return null
  //   // <div className="text-red-600 text-center">No data found.</div>;
  // }


return(
          <>
      <div className="p-4">
      {/* Toggle Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveFormat("format1")}
          className={`px-3 py-1 rounded-full text-sm  font-semibold hover:cursor-pointer ${
            activeFormat === "format1" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Format 1
        </button>
        <button
          onClick={() => setActiveFormat("format2")}
          className={`px-4 py-2 rounded-full text-sm  font-semibold  hover:cursor-pointer ${
            activeFormat === "format2" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Format 2
        </button>
      </div>

      {/* Conditional Render */}
      {activeFormat === "format2" && <InvoiceTemplate   soMain={mainData}     soSub={subItems}    companyInfo={companyInfo}/>}
      {activeFormat === "format1" && (
        <InvoiceTempNew
          soMain={mainData}
          soSub={subItems}
          companyInfo={companyInfo}
        />
      )}
    </div>
          </>
         
        )
    
}
