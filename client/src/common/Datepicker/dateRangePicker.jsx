import React, { useState } from "react"
export default function DateRangeDropdown({onDateChange}) {
  const today = new Date()
  const [month, setMonth] =useState(today.getMonth())
  const [year, setYear] =useState(today.getFullYear())
  const [startDate, setStartDate] =useState(null)
  const [endDate, setEndDate] =useState(null)
  const [open, setOpen] = useState(false)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const currentYear = new Date().getFullYear();

  const handleDayClick = (day) => {
    const clickedDate = new Date(year, month, day);

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
      onDateChange?.({ fromdate: clickedDate, todate: null });
    } else if (clickedDate < startDate) {
      setStartDate(clickedDate);
      onDateChange?.({ fromdate: clickedDate, todate: endDate }); // send updated
    } else {
      setEndDate(clickedDate);
      onDateChange?.({ fromdate: startDate, todate: clickedDate });
    }
  };

  const isSelected = (day) => {
    const date = new Date(year, month, day);
    if (startDate && date.toDateString() === startDate.toDateString()) return true;
    if (endDate && date.toDateString() === endDate.toDateString()) return true;
    return false;
  };

  const isInRange = (day) => {
    if (!startDate || !endDate) return false;
    const date = new Date(year, month, day);
    return date > startDate && date < endDate;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="relative w-80  max-w-sm  mt-0 text-black">
      <label className="block mb-1 text-sm">Select Date</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-2 border rounded-md bg-white border-gray-700"
      >
        {startDate ? formatDate(startDate) : "From Date"} {" - "} {endDate ? formatDate(endDate) : "To Date"}
      </button>

      {open && (
        <div className="absolute mt-2 bg-white border border-gray-700 w-full rounded-lg shadow-lg p-4 z-50">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => setMonth((prev) => (prev === 0 ? 11 : prev - 1))}
              className="px-2 py-1 rounded hover:bg-blue-800"
            >
              ◀
            </button>
            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-gray-800 text-white text-sm rounded px-2 py-1"
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-gray-800 text-white text-sm rounded px-2 py-1"
              >
                {Array.from({ length: currentYear - 2010 + 1 }, (_, i) => 2010 + i).map((y) => (
    <option key={y} value={y}>{y}</option>
  ))}
              </select>
            </div>
            <button
              onClick={() => setMonth((prev) => (prev === 11 ? 0 : prev + 1))}
              className="px-2 py-1 rounded hover:bg-blue-800"
            >
              ▶
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-400 mb-1">
            {"Su Mo Tu We Th Fr Sa".split(" ").map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={i}></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <button
              key={`${year}-${month}-${day}`}
                onClick={() => handleDayClick(day)}
                className={`p-2 rounded-full text-sm 
                  ${isSelected(day) ? "bg-gray-400 text-white" : "hover:text-white"}
                  ${isInRange(day) ? "bg-gray-700 text-white" : "hover:bg-blue-800"}
                `}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
