import React, { useEffect, useState } from 'react'
import Dropdown from '../../common/Dropdown/Dropdown'
import api from '../../services/api'
import Input from '../../common/ui/input'

export default function CustomerOutStandingListPage() {
  const [empName, setEmpName] = useState([])
  const [cusName, setCusName] = useState([])

  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const [selectedEmpName, setSelectedEmpName] = useState(null)
  const [selectedCusName, setSelectedCusName] = useState(null)

  // Checked -> from_date is forced back to the report's earliest possible date (01-Apr-2014).
  // Unchecked -> the From Date the user picked is used as-is.
  const [includeAll, setIncludeAll] = useState(false)

  const statusOptions = [
    { label: '[ALL]', value: 'ALL' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Completed', value: 'Completed' },
  ]
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0])

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const formatInvDate = (value) => {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d.getTime())) return value

    const dd = String(d.getDate()).padStart(2, '0')
    const mmm = MONTH_ABBR[d.getMonth()]
    const yy = String(d.getFullYear()).slice(-2)
    return `${dd}-${mmm}-${yy}`
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, res2] = await Promise.all([
          api.get("/employee/"),
          api.get("/party-list/")
        ])

        const data = res?.data?.data || []
        const customer = res2?.data?.data || []

        const paOptions = customer.map(item => ({
          label: item.PaName,
          value: item.PaCode
        }))

        const empDropdown = data.map(item => ({
          label: item.EmpName,
          value: item.EmpNo
        }))

        setEmpName(empDropdown)
        setCusName(paOptions)
      } catch (error) {
        console.error("Failed to fetch dropdown data", error)
      }
    }

    fetchData()
  }, [])

  const filterData = async () => {
    setLoading(true)
    setError("")
    setResults([])

    if (!includeAll && !fromDate) {
      setError("Please select a From Date, or check Include All.")
      setLoading(false)
      return
    }
    if (!toDate) {
      setError("Please select a To Date.")
      setLoading(false)
      return
    }

    const params = {}
    // 01-Apr-2014 as an ISO date to match the <input type="date"> format used elsewhere.
    params.from_date = includeAll ? "2014-04-01" : fromDate
    params.to_date = toDate

    // Always send these keys, even when unselected. axios drops null/undefined
    // values from the query string automatically, so an unselected combo ends up
    // as a missing param on the backend — which your serializer reads as None,
    // letting COALESCE(...) fall through and return all customers/employees.
    params.emp_no = selectedEmpName?.value ?? null
    params.PaCode = selectedCusName?.value ?? null

    // Status is optional — [ALL] omits the filter entirely so the SQL proc's own
    // default applies. Pending/Completed are sent as-is.
    // TODO: confirm these are the exact values your proc expects for PayStatus.
    if (selectedStatus?.value && selectedStatus.value !== 'ALL') {
      params.PayStatus = selectedStatus.value
    }

    try {
      const res = await api.get("/payment-outstanding-list/", { params })
      const data = res?.data?.data || []

      if (data.length === 0) {
        setError('No data found for this combination.')
      }
      setResults(data)
    } catch (error) {
      setError('No data found for this combination.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col max-w-6xl mx-auto'>

      <div className='border-0 h-full flex gap-x-2 space-y-2'>
        <div className='w-full max-w-sm'>
          <label>Sales Rep Name</label>
          <div className='flex items-center gap-x-1'>
            <div className='flex-1'>
              <Dropdown
                options={empName}
                value={selectedEmpName}
                onChange={setSelectedEmpName}
              />
            </div>
            {selectedEmpName && (
              <button
                type="button"
                onClick={() => setSelectedEmpName(null)}
                title="Clear"
                className='text-gray-500 hover:text-gray-800 px-1 cursor-pointer'>
                ×
              </button>
            )}
          </div>
        </div>

        <div className='w-full max-w-sm'>
          <label>Customer Name</label>
          <div className='flex items-center gap-x-1'>
            <div className='flex-1'>
              <Dropdown
                options={cusName}
                value={selectedCusName}
                onChange={setSelectedCusName}
              />
            </div>
            {selectedCusName && (
              <button
                type="button"
                onClick={() => setSelectedCusName(null)}
                title="Clear"
                className='text-gray-500 hover:text-gray-800 px-1 cursor-pointer'>
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className='flex gap-x-2 items-center-safe'>
        <div className='w-full max-w-sm'>
          <label>From Date</label>
          <Input
            placeholder="Enter From Date"
            type="date"
            value={fromDate}
            disabled={includeAll}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className='w-full max-w-sm'>
          <label>To Date</label>
          <Input
            placeholder="Enter To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className='w-full max-w-sm'>
          <label>Status</label>
          <Dropdown
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>

        <div className='mt-7 flex items-center gap-x-1'>
          <input
            id="includeAll"
            type="checkbox"
            checked={includeAll}
            onChange={(e) => setIncludeAll(e.target.checked)}
          />
          <label htmlFor="includeAll">Include All</label>
        </div>

        <div className='mt-7'>
          <button
            onClick={filterData}
            type="button"
            disabled={loading}
            className='bg-blue-500 text-white rounded-full cursor-pointer px-2 py-1 disabled:opacity-50'>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      <div className='mt-4'>
        {error && <p className='text-red-500'>{error}</p>}

        {results.length > 0 && (
          <table className='w-full border-collapse'>
            <thead>
              <tr className='text-left border-b'>
                <th className='p-1'>Sl No</th>
                <th className='p-1'>Inv No</th>
                <th className='p-1'>Inv Date</th>
                <th className='p-1'>Party Name</th>
                <th className='p-1 text-right'>Total Amount</th>
                <th className='p-1 text-right'>Paid Amount</th>
                <th className='p-1 text-right'>Debit Amount</th>
                <th className='p-1 text-right'>Pending Amount</th>
                <th className='p-1 text-right'>TDS Amount</th>
                <th className='p-1 text-right'>Due Days</th>
                <th className='p-1'>Cheque Ref</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => (
                <tr key={idx} className='border-b'>
                  <td className='p-1'>{row.sl_no}</td>
                  <td className='p-1'>{row.InvNo}</td>
                  <td className='p-1'>{formatInvDate(row.InvDate)}</td>
                  <td className='p-1'>{row.party_name}</td>
                  <td className='p-1 text-right'>{row.TotAmount}</td>
                  <td className='p-1 text-right'>{row.PaidAmount}</td>
                  <td className='p-1 text-right'>{row.DebitAmount}</td>
                  <td className='p-1 text-right'>{row.PendingAmount}</td>
                  <td className='p-1 text-right'>{row.TDSAmount}</td>
                  <td className='p-1 text-right'>{row.DueDays}</td>
                  <td className='p-1'>{row.Cheque_Ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
