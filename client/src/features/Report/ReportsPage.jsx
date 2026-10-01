import React, { useEffect, useState, useContext, useMemo } from 'react'
import Dropdown from '../../common/Dropdown/Dropdown'
import Input from '../../common/ui/input'
import api from '../../services/api'
import { format, startOfMonth } from 'date-fns'
import {exportTableToExcel} from '../../utils/ExcelExport'
import { UserContext } from "../../context/useContext"
import { 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  FileSpreadsheet,
  RefreshCw,
  Upload
} from 'lucide-react';
  



// ── Date helpers ──────────────────────────────────────────────────────────────
const today = new Date()
const DEFAULT_FROM = format(startOfMonth(today), 'yyyy-MM-dd')
const DEFAULT_TO   = format(today, 'yyyy-MM-dd')

// ── Report registry — add new reports here only ───────────────────────────────
const ALL_REPORTS = [
  {
    value: 'sales-vs-payment',
    label: 'Sales vs Payment Register',
    filters: ['fromDate', 'toDate'],
    endpoint: '/sales-vs-payment-register/',
    params: (f) => ({ from_date: f.fromDate, to_date: f.toDate }),
    adminOnly: true, // only visible when user.emp_no is null
  },
  {
    value: 'employee-sales',
    label: 'Employee Wise Sales',
    filters: ['employee', 'fromDate', 'toDate'],
    endpoint: '/sales-vs-payment/',
    params: (f) => ({
      emp_no:    f.employee?.value,
      from_date: f.fromDate,
      to_date:   f.toDate,
    }),
  },
  {
    value: 'employee-wise-customer-outstanding',
    label: 'Employee Wise Customer Outstanding',
    filters: ['employee'],
    endpoint: '/empwise-customer-outstanding/',
    params: (f) => ({ emp_no: f.employee?.value }),
  },
  {
    value: 'customer-outstanding',
    label: 'Customer Outstanding',
    filters: [],
    endpoint: '/customer-outstanding/',
    params: () => ({}),
    adminOnly: true,
  },
];
  
// ── Column definitions per report ─────────────────────────────────────────────
const COLUMNS = {
  'sales-vs-payment': [
    { key: 'party_name',      label: 'Party Name',       align: 'left'  },
    { key: 'opening_balance', label: 'Opening Balance',  align: 'right', color: (v) => v < 0 ? 'text-red-500' : 'text-gray-700' },
    { key: 'sales',           label: 'Sales',            align: 'right' },
    { key: 'total',           label: 'Total',            align: 'right' },
    { key: 'payment',         label: 'Payment',          align: 'right', color: () => 'text-green-600' },
    { key: 'balance',         label: 'Balance',          align: 'right', color: (v) => v < 0 ? 'text-red-500' : 'text-gray-800', bold: true },
  ],
  'employee-sales': [
    { key: 'party_name',      label: 'Party Name',       align: 'left'  },
    { key: 'opening_balance', label: 'Opening Balance',  align: 'right', color: (v) => v < 0 ? 'text-red-500' : 'text-gray-700' },
    { key: 'sales',           label: 'Sales',            align: 'right' },
    { key: 'total',           label: 'Total',            align: 'right' },
    { key: 'payment',         label: 'Payment',          align: 'right', color: () => 'text-green-600' },
    { key: 'balance',         label: 'Balance',          align: 'right', color: (v) => v < 0 ? 'text-red-500' : 'text-gray-800', bold: true },
  ],
    'employee-wise-customer-outstanding': [     
      {key : 'party_name', label : 'Party Name', align : 'left'},
      {key : 'below_30', label : 'Below 30 Days', align : 'right'},
      {key : 'between_30_45', label : '30-45 Days', align : 'right'},
      {key : 'between_45_60', label : '45-60 Days', align : 'right'},
      {key : 'between_60_90', label : '60-90 Days', align : 'right'},
      {key : 'above_90', label : 'Above 90 Days', align : 'right'},
      
    ],
     'customer-outstanding': [     
      {key : 'party_name', label : 'Party Name', align : 'left'},
      {key : 'below_30', label : 'Below 30 Days', align : 'right'},
      {key : 'between_30_45', label : '30-45 Days', align : 'right'},
      {key : 'between_45_60', label : '45-60 Days', align : 'right'},
      {key : 'between_60_90', label : '60-90 Days', align : 'right'},
      {key : 'above_90', label : 'Above 90 Days', align : 'right'},
    ],
}     
      


// ── Number formatter ──────────────────────────────────────────────────────────
const fmt = (val) =>
  typeof val === 'number'
    ? val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00'

// ── Result table ──────────────────────────────────────────────────────────────
function ReportTable({ data, loading, error, reportKey }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" />
      </div>
    )
  }
  if (error) {
    return <div className="text-center text-red-500 font-semibold py-4">{error}</div>
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 text-sm">
        Select filters and click Search to view the report.
      </div>
    )
  }

  const cols = COLUMNS[reportKey] || []

  // totals for numeric columns
  const numericKeys = cols.filter(c => c.align === 'right').map(c => c.key)
  const totals = data.reduce((acc, row) => {
    numericKeys.forEach(k => { acc[k] = (acc[k] || 0) + (row[k] || 0) })
    return acc
  }, {})

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm" id="ReportTableData">
        <thead>
          <tr className="bg-blue-500 text-white text-left">
            <th className="px-4 py-2 font-semibold">#</th>
            {cols.map(col => (
              <th
                key={col.key}
                className={`px-4 py-2 font-semibold ${col.align === 'right' ? 'text-right' : ''}`}
              >
                {col.label}
              </th>
            ))}
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
              {cols.map(col => {
                const val = row[col.key]
                const colorClass = col.color ? col.color(val) : 'text-gray-700'
                return (
                  <td
                    key={col.key}
                    className={`px-4 py-2 ${col.align === 'right' ? 'text-right' : ''} ${colorClass} ${col.bold ? 'font-semibold' : ''}`}
                  >
                    {col.align === 'right' ? fmt(val) : val}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-blue-50 border-t-2 border-blue-300 font-semibold text-gray-800">
            <td className="px-4 py-2" colSpan={2}>Total</td>
            {cols.slice(1).map(col => (
              <td key={col.key} className={`px-4 py-2 ${col.align === 'right' ? 'text-right' : ''} ${col.key === 'payment' ? 'text-green-600' : ''}`}>
                {col.align === 'right' ? fmt(totals[col.key]) : ''}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { user } = useContext(UserContext)

  const REPORTS = useMemo(
    () => (user?.emp_no == null ? ALL_REPORTS : ALL_REPORTS.filter((r) => !r.adminOnly)),
    [user]
  )

  const [selectedReport, setSelectedReport] = useState(REPORTS[0])
  const [empOptions, setEmpOptions]         = useState([])
  const [filters, setFilters]               = useState({
    employee: null,
    fromDate: DEFAULT_FROM,
    toDate:   DEFAULT_TO,
  })
  const [reportData, setReportData]         = useState([])
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [searched, setSearched]             = useState(false)
  const [exportLoading, setExportLoading]   = useState(false)

  // keep selectedReport in sync if REPORTS changes after user loads async
  useEffect(() => {
    setSelectedReport(REPORTS[0])
  }, [REPORTS])

  // ── Fetch employee list once ───────────────────────────────────────────────
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employee/')
        const data = res?.data?.data || []
        setEmpOptions(data.map(item => ({ label: item.EmpName, value: item.EmpNo })))
      } catch (err) {
        console.error('Failed to fetch employees', err)
      }
    }
    fetchEmployees()
  }, [])

  const isAdmin = user?.role === 'Admin' // ← match exact casing from your DB

  // auto-select "self" as the employee once empOptions is loaded, if not admin
  useEffect(() => {
    if (!isAdmin && empOptions.length > 0 && user?.emp_no != null) {
      const self = empOptions.find(e => e.value === user.emp_no)
      if (self) {
        setFilters(prev => ({ ...prev, employee: self }))
      }
    }
  }, [empOptions, isAdmin, user])

  // ── Reset results when report type changes ─────────────────────────────────
  const handleReportChange = (option) => {
    const report = REPORTS.find(r => r.value === option?.value)
    setSelectedReport(report)
    setReportData([])
    setError('')
    setSearched(false)
  }

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }))

  const visible = (filterName) => selectedReport?.filters?.includes(filterName)

  // ── Fetch report ──────────────────────────────────────────────────────────
  const fetchReport = async () => {
    // Only validate employee if this report needs it
    if (visible('employee') && !filters.employee) {
      setError('Please select a Sales Rep.')
      return
    }

    // Only validate dates if this report needs them
    if (visible('fromDate') || visible('toDate')) {
      if (!filters.fromDate || !filters.toDate) {
        setError('Please select both From Date and To Date.')
        return
      }
      if (filters.fromDate > filters.toDate) {
        setError('From Date cannot be after To Date.')
        return
      }
    }

    setLoading(true)
    setError('')
    setReportData([])
    setSearched(true)

    try {
      const res = await api.get(selectedReport.endpoint, {
        params: selectedReport.params(filters),
      })
      const rows = res?.data?.data || []
      setReportData(rows)
      if (rows.length === 0) setError('No data found for the selected filters.')
    } catch {
      setError('No data found for this combination.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFilters({ employee: null, fromDate: DEFAULT_FROM, toDate: DEFAULT_TO })
    setReportData([])
    setError('')
    setSearched(false)
  }

  const reportOptions = REPORTS.map(r => ({ label: r.label, value: r.value }))

  return (
    <div className="flex flex-col max-w-6xl mx-auto gap-y-4">

      {/* ── Report selector ──────────────────────────────────────────────── */}
      <div className="w-full max-w-sm">
        <label className="text-sm text-gray-600 mb-1 block">Report</label>
        <Dropdown
          options={reportOptions}
          value={reportOptions.find(r => r.value === selectedReport?.value)}
          onChange={handleReportChange}
          placeholder="Select Report"
        />
      </div>

      {/* ── Filters row ──────────────────────────────────────────────────── */}
      <div className="border-0 flex flex-wrap gap-x-2 gap-y-2 items-end">

      
      {visible('employee') && (
          <div className="w-full max-w-sm">
                <label className="text-sm text-gray-600 mb-1 block">Sales Rep Name</label>
                    <Dropdown
                          options={empOptions}
                          value={filters.employee}
                          onChange={(val) => setFilter('employee', val)}
                          placeholder="Select Sales Rep"
                          disabled={!isAdmin}
                    />                      
        </div>
)}


        {visible('fromDate') && (
          <div className="w-full max-w-sm">
            <label className="text-sm text-gray-600 mb-1 block">From Date</label>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilter('fromDate', e.target.value)}
            />
          </div>
        )}

        {visible('toDate') && (
          <div className="w-full max-w-sm">
            <label className="text-sm text-gray-600 mb-1 block">To Date</label>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilter('toDate', e.target.value)}
            />
          </div>
        )}

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

          <button
            onClick={() => exportTableToExcel("ReportTableData", selectedReport.label)}
            disabled={exportLoading || reportData.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Upload size={18} />
            )}
            Export Excel
          </button>
        </div>
      </div>

      {/* ── Summary badge ────────────────────────────────────────────────── */}
      {!loading && !error && reportData.length > 0 && (
        <div className="flex items-center gap-x-2 text-sm text-gray-500">
          <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-0.5 font-medium">
            {reportData.length} {reportData.length === 1 ? 'record' : 'records'}
          </span>
          <span>
            {visible('employee') && filters.employee
              ? `${empOptions.find(e => e.value === filters.employee?.value)?.label} · `
              : ''}
            {filters.fromDate} → {filters.toDate}
          </span>
        </div>
      )}

      {/* ── Result table ─────────────────────────────────────────────────── */}
      <ReportTable
        data={reportData}
        loading={loading}
        error={error}
        reportKey={selectedReport?.value}
      />
    </div>
  )
}