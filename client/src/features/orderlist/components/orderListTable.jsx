"use client";
import React, { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, format } from 'date-fns';

import { CiViewList } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { AiOutlineDelete } from "react-icons/ai";
import { LiaEditSolid } from "react-icons/lia";
import DatePicker from '../../../common/ui/datepicker';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ImPrinter } from "react-icons/im";
import FlashMessage from '../../../common/Dialogues/FlashMessage';
import ConfirmationDialog from '../../../common/Dialogues/submitDialogue'
// import InvoiceTemplate from '../../invoice/invoiceTemp';
// import { fetchInvoiceData } from '../../../services/fetchIvoicedata';
// import InvoiceWrapper from '../../invoice/InvoiceWrapper';

const styles = `
  .sales-page-container {
    background: var(--bg-page);
    min-height: 100vh;
    padding: 1rem;
    font-size: 0.85rem;
  }
  .header {
    background: var(--header-bg);
    border: var(--header-border);
    border-radius: var(--radius);
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    box-shadow: var(--shadow);
  }
  .header-icon { color: var(--header-icon); font-size: 1.15rem; display: flex; }
  .header-title { font-size: 1.05rem; font-weight: 600; color: var(--header-text); margin: 0; }

  .filter-section {
    margin-top: 0.75rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.85rem 1rem;
    box-shadow: var(--shadow);
  }
  .filter-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .filter-input {
    border: 1px solid var(--input-border);
    border-radius: var(--radius);
    background: var(--surface);
    padding: 0.35rem 0.5rem;
    font-size: 0.85rem;
    width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .filter-input:hover { border-color: var(--accent); }
  .filter-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }

  .btn-primary {
    background: var(--accent);
    color: #ffffff;
    font-weight: 600;
    font-size: 0.8rem;
    padding: 0.4rem 1.1rem;
    border-radius: 9999px;
    border: none;
    transition: background 0.2s;
    cursor: pointer;
  }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-danger {
    background: #ef4444;
    color: #ffffff;
    font-weight: 600;
    font-size: 0.8rem;
    padding: 0.4rem 1.1rem;
    border-radius: 9999px;
    border: none;
    transition: background 0.2s;
    cursor: pointer;
  }
  .btn-danger:hover { background: #dc2626; }
  .btn-disabled {
    background: #e2e8f0;
    color: #94a3b8;
    font-weight: 600;
    font-size: 0.8rem;
    padding: 0.4rem 1.1rem;
    border-radius: 9999px;
    border: none;
    cursor: not-allowed;
  }

  .table-container {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-top: 0.75rem;
    overflow: hidden;
    box-shadow: var(--shadow);
  }
  .table-head-row {
    background: var(--bg-page);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .table-data-row {
    font-size: 0.82rem;
    color: var(--text);
    border-top: 1px solid var(--border);
    transition: background 0.15s;
  }
  .table-data-row:hover { background: var(--bg-page); }

  .icon-btn {
    width: 1.85rem;
    height: 1.85rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    color: #ffffff;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
    font-size: 0.9rem;
  }
  .icon-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .icon-btn-view    { background: var(--accent); }
  .icon-btn-edit    { background: #f59e0b; }
  .icon-btn-delete  { background: #ef4444; }
  .icon-btn-print   { background: #64748b; }

  @media (max-width: 640px) {
    .sales-page-container { padding: 0.5rem; }
  }
`;


// const getWeekRange = () => {
//   const today = new Date()
//   const day = today.getDay()
//   const monday = new Date(today)
//   monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
//   const sunday = new Date(monday)
//   sunday.setDate(monday.getDate() + 6);
//   return { monday, sunday }
// };

const getDefaultRange = () => {
  const today = new Date();
  return { from: today, to: today };
};

export default function OrderListTable() {

  const toDateOnlyString = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
  //const { monday, sunday } = getWeekRange();
  const { from, to } = getDefaultRange();
  const [filteredData, setFilteredData] = useState([]);  //data store
  const [loading, setLoading] = useState(true)
  const [soNo, setSoNo] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)  //data clicked view icon
  const [isDialogOpen, setIsDialogOpen] = useState(false)   //for list 
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)  //for editis 
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteSoNo, setDeleteSoNo] = useState(null)
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  const [editOrder, setEditOrder] = useState(null)
  // const [fromDate, setFromDate] = useState(monday)
  // const [toDate, setToDate] = useState(sunday)
  const [fromDate, setFromDate] = useState(from)
  const [toDate, setToDate] = useState(to)

  const [subItem, setSubItem] = useState([])
  const [subItemLoading, setSubItemLoading] = useState(false)
  const [editRows, setEditRows] = useState([])

  const [showFlash, setFlash] = useState(false)
  const [mainData, setMainData] = useState(null);       // soMain data
  const [subItems, setSubItems] = useState([]);         // soSub data
  const [companyInfo, setCompanyInfo] = useState(null)
  const [printsoNo, setPrintSono] = useState(null)

  // const [initialFilters, setInitialFilters] = useState({    ///for diable reset button 
  //   fromDate: monday,
  //   toDate: sunday,
  //   soNo: ''
  // });

  const [initialFilters, setInitialFilters] = useState({ 
  fromDate: from,
  toDate: to,
  soNo: ''
    });
  let navigate = useNavigate();

  //console.log("editmain",editOrder)
  //console.log("editsub", editRows)

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const isFilterChanged =
    format(fromDate, 'yyyy-MM-dd') !== format(initialFilters.fromDate, 'yyyy-MM-dd') ||
    format(toDate, 'yyyy-MM-dd') !== format(initialFilters.toDate, 'yyyy-MM-dd') ||
    soNo.trim() !== initialFilters.soNo

  
  const handleView = async (order) => { ///fetch sub data   of clicking view icon
    setSelectedOrder(order)
    setIsDialogOpen(true)
    setSubItemLoading(true);
    try {
  // handleView
const res = await api.get(`/sub-items/${order.soNo}/`, {
  params: { SoYearCode: order.soYearCode },
});
      const subItems = res.data?.data || [];
      setSubItem(subItems)
    } catch (error) {
      console.error("Failed to fetch sub-items:", error);
    } finally {
      setSubItemLoading(false);
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedOrder(null)

  }

  const handleEdit = (order) => {
  navigate(`/MenuLayout/salesentry/${order.soNo}/${order.soYearCode}`);
  
};

  // const getOrderData = async () => {    //fetch curent week data default
  //   setLoading(true)
  //   try {
  //     const res = await api.get('/current-week-sales/')
  //     if (res?.status === 200) {
  //       const data = res?.data
  //       //console.log(data)
  //       const trmainValues = data?.map(item => ({ ...item, PaCode: item.PaCode?.trim(), })).sort((a, b) => b.soNo - a.soNo)


  //       setFilteredData(trmainValues)
  //     }
  //   } catch (err) {
  //     console.log('API Error:', err)
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   getOrderData();
  //   setInitialFilters({
  //     fromDate: monday,
  //     toDate: sunday,
  //     soNo: ''
  //   });
  // }, []);
useEffect(() => {
  handleSearch();
}, [fromDate, toDate]);

  const handleSearch = async () => {    ///for filter data by date
    if (!fromDate || !toDate) return

    // const from = fromDate.toISOString().split("T")[0]
    // const to = toDate.toISOString().split("T")[0]

    const from = toDateOnlyString(fromDate)
    const to = toDateOnlyString(toDate)

    const trimmedSoNo = soNo.trim()
    setLoading(true)
    try {
      const res = await api.get("/sales-filter-list/", {
        params: {
          from_date: from,
          to_date: to,
          ...(trimmedSoNo && { soNo: trimmedSoNo }), // only add if soNo exists
        }
      })

      if (res?.data?.status) {
        const cleaned = res.data.data?.map((item) => ({ ...item, PaCode: item.PaCode?.trim(), })).sort((a, b) => a.soNo - b.soNo)
        setFilteredData(cleaned);
      } else {
        setFilteredData([]);
      }
    } catch (err) {
      console.error("Search API Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // const handleReset = () => {       //reset button
  //   const { monday, sunday } = getWeekRange()
  //   setSoNo("")
  //   getOrderData()
  //   setInitialFilters({ fromDate: monday, toDate: sunday, soNo: '' })
  //   setFromDate(monday)
  //   setToDate(sunday)
  // }

  const handleReset = () => {
  const { from, to } = getDefaultRange();
  setSoNo("");
  setInitialFilters({ fromDate: from, toDate: to, soNo: '' });
  setFromDate(from);
  setToDate(to);
};

  const handleDelete = async () => {
    console.log(deleteSoNo)

    try {
      setLoading(true)
   
const response = await api.delete(`/delete-sales/${deleteSoNo.soNo}`, {
  params: { SoYearCode: deleteSoNo.yearCode },});
      console.log(response)
      setIsDeleteDialogOpen(false);
      if (response.status === 204) {
        setFlash(true)
        handleSearch()
      }



    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }



  const totalAmount = Number(subItem?.reduce((sum, item) => {
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
    <style>{styles}</style>
    <div className="sales-page-container">     
    <div className="header">
        <span className="header-icon"><CiViewList /></span>
        <h1 className="header-title">Sales Order List</h1>
      </div>      
       <div className='filter-section'>
  <h1 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
    Search Orders by Date Range
  </h1>
  <div className="flex flex-col gap-y-3 sm:flex-row sm:items-end sm:gap-x-3 w-full">

    <div className="flex flex-col w-full sm:w-[28%]">
      <label className="filter-label mb-1">From Date</label>
      <DatePicker value={fromDate} onChange={setFromDate} />
    </div>

    <div className="flex flex-col w-full sm:w-[28%]">
      <label className="filter-label mb-1">To Date</label>
      <DatePicker value={toDate} onChange={setToDate} />
    </div>

    <div className='flex flex-col w-full sm:w-[24%]'>
      <label className="filter-label mb-1">SO No</label>
      <input
        type="text"
        value={soNo}
        onChange={(e) => setSoNo(e.target.value)}
        placeholder="Enter SO No"
        className="filter-input"
      />
    </div>

    <div className="flex gap-x-2">
      <button onClick={handleSearch} className="btn-primary">
        Search
      </button>
      <button
        onClick={handleReset}
        disabled={!isFilterChanged}
        className={isFilterChanged ? "btn-danger" : "btn-disabled"}
      >
        Reset
      </button>
    </div>
  </div>
</div>

        {/* Table Header */}

       <div className="table-container">
  <div className='min-w-[1000px]'>
    <div className="grid grid-cols-20 sm:grid-cols-20 gap-1 items-center text-center table-head-row h-9">
      <div className="col-span-2">So.No</div>
      <div className="col-span-3">Date</div>
      <div className="col-span-3">Customer Code</div>
      <div className="col-span-4">Customer Name</div>
      <div className="col-span-2">View</div>
      <div className="col-span-2">Edit</div>
      <div className="col-span-2">Delete</div>
      <div className="col-span-2">Print</div>
    </div>

            {/* Table Data or Loading or No Data */}
            {loading ? (
              <div className="text-center py-4 text-blue-600 font-medium flex justify-center">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-4 text-red-500 font-medium">
                No data found for this date range.
              </div>
            ) : (

              filteredData.map((item) => (
  <div
    key={`${item.soNo}-${item.soYearCode}`}
    className="grid grid-cols-20 gap-0 items-center text-center table-data-row py-1.5"
  >
    <div className="col-span-2">{item.soNo}</div>
    <div className="col-span-3">
      {new Date(item.soDate).toLocaleDateString()}
    </div>
    <div className="col-span-3">{item.PaCode}</div>
    <div className="col-span-4 text-left pl-3">{item.PaName}</div>

    <div className="col-span-2">
      <button className="icon-btn icon-btn-view" onClick={() => handleView(item)} title="View">
        <CiViewList size={14} />
      </button>
    </div>

    <div className="col-span-2">
      <button className="icon-btn icon-btn-edit" onClick={() => handleEdit(item)} title="Edit">
        <LiaEditSolid size={14} />
      </button>
    </div>

    <div className="col-span-2">
      <button
        className="icon-btn icon-btn-delete"
        title="Delete"
        onClick={() => {
          setIsDeleteDialogOpen(true);
          setDeleteSoNo({ soNo: item.soNo, yearCode: item.soYearCode });
        }}
      >
        <AiOutlineDelete size={14} />
      </button>
    </div>

    <div className="col-span-2">
      <button
        className="icon-btn icon-btn-print"
        title="Print"
        onClick={() => navigate(`/MenuLayout/orderprint/${item.soNo}/${item.soYearCode}`)}
      >
        <ImPrinter size={14} />
      </button>
    </div>
  </div>
  
      
              ))
                

            )}
          </div>
        </div>

        {/*dialog box for list the order deatils*/}
        {isDialogOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-md shadow-lg w-[90%] max-w-7xl max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  SO No: {selectedOrder.soNo} - {selectedOrder.PaName}
                </h2>
                <button onClick={handleCloseDialog} className="text-white bg-blue-500 p-1 rounded-full hover:cursor-pointer">
                  <IoMdClose size={20} />
                </button>
              </div>

              {subItemLoading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ):
                subItem?.length > 0 ? (
                  <table className="w-full text-sm text-left border border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">Product Code</th>
                        <th className="border p-2">Item Name</th>
                        <th className="border p-2">Particular</th>
                        <th className="border p-2">Specification</th>
                        <th className="border p-2">Qty</th>
                        <th className="border p-2">Rate</th>
                        <th className="border p-2">Discount</th>
                        <th className="border p-2">Tax</th>
                        <th className="border p-2">Tax Amount</th>
                        <th className='border p-2'>Total Amount</th>
                        <th className="border p-2">Delivery Date</th>
                        <th className="border p-2">Delivery Preference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subItem?.map((sub, idx) => (
                        <tr key={idx}>
                          <td className="border p-2">{sub.PrCode}</td>
                          <td className="border p-2">{sub.PrName}</td>
                          <td className="border p-2">{sub.soParticular?.trim()}</td>
                          <td className="border p-2">{sub.soSpecification}</td>
                          <td className="border p-2">{sub.soQty}</td>
                          <td className="border p-2 text-right">₹{sub.soRate}</td>
                          <td className="border p-2">{sub.soDiscount}%</td>
                          <td className="border p-2">{sub.TaxType}</td>
                          <td className="border p-2 text-right">₹{sub.soTaxAmt}</td>
                          <td className="border p-2 text-right">₹{(Number(sub.soQty) * Number(sub.soRate) -
                            (Number(sub.soQty) * Number(sub.soRate) * Number(sub.soDiscount || 0) / 100) +
                            Number(sub.soTaxAmt || 0)).toFixed(2)}</td>
                          <td className="border p-2">{sub.SoDeliveryDate ? new Date(sub.SoDeliveryDate).toLocaleDateString() : '-'}</td>
                          <td className="border p-2">{sub.SoDeliveryPreference}</td>
                        </tr>
                      ))}

                      <tr className="border-t font-semibold">
                        <td colSpan={5} className="px-2 py-2 text-right">

                        </td>
                        <td className="px-2 py-2 text-center">{""}</td>
                        {/* <td className="px-2 py-2 text-right">₹{totalRate.toFixed(2)}</td> */}
                        <td className="px-2 py-2"></td>
                        <td className="px-2 py-2"> </td>
                        <td className="px-2 py-2 text-right">Total Amount</td>
                        <td className="px-2 py-2 text-right">₹ {totalAmount.toFixed(2)}</td>

                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600">No sub-items found for this order.</p>
                )}
            </div>
          </div>
        )}

        {/* {isEditDialogOpen && (
          <EditorderList
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            soMain={editOrder}   //somain value
            soSub={editRows}   //sosubvalues
            setEditRows={setEditRows}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              getOrderData();
            }}
          />
        )} */}




</div>
    
      
      <ConfirmationDialog isOpen={isDeleteDialogOpen}
        title="Delete Order"
        loading={loading}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        message="Are sure want to delete"
        buttonText="Delete" />


      {showFlash && (
        <FlashMessage
          type="error"
          title="Deleted"
          message="The record has been successfully deleted."
          buttonText="OK"

          onClose={() => setFlash(false)}
        />
      )}
    </>
 

  );
}
