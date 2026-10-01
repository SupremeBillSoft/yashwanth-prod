import React, { useEffect, useState } from 'react'
import Dropdown from '../../common/Dropdown/Dropdown'
import Input from '../../common/ui/input'
import api from '../../services/api'
import DatePicker from "../../common/Datepicker/datePicker";
import { format } from 'date-fns'



// ── Sub-component: result table ───────────────────────────────────────────────
function SalesPaymentTable({ data, loading, error }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-semibold py-4">
        {error}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 text-sm">
        Select filters and click Search to view the report.
      </div>
    )
  }

  // Summary totals
  const totals = data.reduce(
    (acc, row) => ({
      opening: acc.opening + (row.opening_balance || 0),
      sales:   acc.sales   + (row.sales           || 0),
      total:   acc.total   + (row.total            || 0),
      payment: acc.payment + (row.payment          || 0),
      balance: acc.balance + (row.balance          || 0),
    }),
    { opening: 0, sales: 0, total: 0, payment: 0, balance: 0 }
  )

  const fmt = (val) =>
    typeof val === 'number'
      ? val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00'

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-blue-500 text-white text-left">
            <th className="px-4 py-2 font-semibold">#</th>
            <th className="px-4 py-2 font-semibold">Party Name</th>
            <th className="px-4 py-2 font-semibold text-right">Opening Balance</th>
            <th className="px-4 py-2 font-semibold text-right">Sales</th>
            <th className="px-4 py-2 font-semibold text-right">Total</th>
            <th className="px-4 py-2 font-semibold text-right">Payment</th>
            <th className="px-4 py-2 font-semibold text-right">Balance</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={`border-t border-gray-100 hover:bg-blue-50 transition-colors ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
              <td className="px-4 py-2 font-medium text-gray-800">{row.party_name}</td>
              <td className={`px-4 py-2 text-right ${row.opening_balance < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                {fmt(row.opening_balance)}
              </td>
              <td className="px-4 py-2 text-right text-gray-700">{fmt(row.sales)}</td>
              <td className="px-4 py-2 text-right text-gray-700">{fmt(row.total)}</td>
              <td className="px-4 py-2 text-right text-green-600">{fmt(row.payment)}</td>
              <td className={`px-4 py-2 text-right font-semibold ${row.balance < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                {fmt(row.balance)}
              </td>
            </tr>
          ))}
        </tbody>

        {/* Totals footer */}
        <tfoot>
          <tr className="bg-blue-50 border-t-2 border-blue-300 font-semibold text-gray-800">
            <td className="px-4 py-2" colSpan={2}>Total</td>
            <td className="px-4 py-2 text-right">{fmt(totals.opening)}</td>
            <td className="px-4 py-2 text-right">{fmt(totals.sales)}</td>
            <td className="px-4 py-2 text-right">{fmt(totals.total)}</td>
            <td className="px-4 py-2 text-right text-green-600">{fmt(totals.payment)}</td>
            <td className="px-4 py-2 text-right">{fmt(totals.balance)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SalesVsPaymentPage() {
//  const [empName, setEmpName]                   = useState([])
  //const [selectedEmpName, setSelectedEmpName]   = useState(null)
  const [fromDate, setFromDate]                 = useState('')
  const [toDate, setToDate]                     = useState('')
  const [reportData, setReportData]             = useState([])
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState('')
  const [searched, setSearched]                 = useState(false)

  // ── Fetch employee dropdown on mount ────────────────────────────────────────
  useEffect(() => {
    // const fetchDropdowns = async () => {
    //   try {
    //     const res = await api.get('/employee/')
    //     const data = res?.data?.data || []
    //     const empDropdown = data.map(item => ({
    //       label: item.EmpName,
    //       value: item.EmpNo,
    //     }))
    //     setEmpName(empDropdown)
    //   } catch (err) {
    //     console.error('Failed to fetch employees', err)
    //   }
    // }
    // fetchDropdowns()
  }, [])

  // ── Validate & fetch report ──────────────────────────────────────────────────
  const fetchReport = async () => {
    // if (!selectedEmpName) {
    //   setError('Please select a Sales Rep.')
    //   return
    // }
    if (!fromDate || !toDate) {
      setError('Please select both From Date and To Date.')
      return
    }
    if (fromDate > toDate) {
      setError('From Date cannot be after To Date.')
      return
    }

    setLoading(true)
    setError('')
    setReportData([])
    setSearched(true)

    try {  

      const res = await api.get('/sales-vs-payment-register/', {
        params: {    
           from_date: fromDate,
          to_date:   toDate,
        },
      })     
         

      const rows = res?.data?.data || []
      setReportData(rows)

      if (rows.length === 0) {
        setError('No data found for the selected filters.')
      }
    } catch (err) {
      setError('No data found for this combination.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
 //   setSelectedEmpName(null)
    setFromDate('')
    setToDate('')
    setReportData([])
    setError('')
    setSearched(false)
  }

  

  return (
    <div className="flex flex-col max-w-6xl mx-auto gap-y-4">

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="border-0 h-full flex flex-wrap gap-x-2 gap-y-2 items-end">     
     
         <div className="w-full max-w-sm">
               <label className="text-sm text-gray-600 mb-1 block">From Date</label>
               <Input
                 type="date"
                 value={fromDate}
                 onChange={(e) => setFromDate(e.target.value)}
               />
             </div>
     
             <div className="w-full max-w-sm">
               <label className="text-sm text-gray-600 mb-1 block">To Date</label>
               <Input
                 type="date"
                 value={toDate}
                 onChange={(e) => setToDate(e.target.value)}
               />
             </div>
        <div className="flex gap-x-2 mt-1">
          <button
            onClick={fetchReport}
            type="button"
            className="bg-blue-500 text-white rounded-full cursor-pointer px-4 py-1 text-sm hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
          {searched && (
            <button
              onClick={handleClear}
              type="button"
              className="bg-gray-200 text-gray-700 rounded-full cursor-pointer px-4 py-1 text-sm hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Summary badge (shown after a successful search) ─────────────────── */}
      {!loading && !error && reportData.length > 0 && (
        <div className="flex items-center gap-x-2 text-sm text-gray-500">
          <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-0.5 font-medium">
            {reportData.length} {reportData.length === 1 ? 'party' : 'parties'}
          </span>
          <span>
            {/*empName.find(e => e.value === (selectedEmpName?.value || selectedEmpName))?.label || ''*/}
            {' · '}
            {fromDate} → {toDate}
          </span>
        </div>
      )}

      {/* ── Results table ───────────────────────────────────────────────────── */}
      <SalesPaymentTable
        data={reportData}
        loading={loading}
        error={error}
      />
    </div>
  )
}
