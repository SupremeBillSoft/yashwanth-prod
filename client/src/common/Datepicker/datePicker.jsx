import React, { useState, useEffect, useRef, forwardRef } from "react";
import { CalendarDays } from "lucide-react";


const DatePicker = forwardRef(function DatePicker(
  {
    value,
    onChange,
    placeholder = "",
    showTime = false,
    minDate,
    maxDate,
    disabledDates = [],
    className = "",
  },
  ref
) {
  const [open, setOpen] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [viewDate, setViewDate] = useState(() =>
    value ? new Date(value) : new Date()
  );
  const rootRef = useRef(null);

  // time state
  const [hours, setHours] = useState(10);
  const [minutes, setMinutes] = useState(30);
  const [ampm, setAmPm] = useState("AM");

  const [mode, setMode] = useState("day"); // "day" | "month" | "year"

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

  const fmt = (d) => {
    if (!d) return "";
    if (!showTime) {
      return `${pad2(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    let h = d.getHours();
    const m = pad2(d.getMinutes());
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${pad2(d.getDate())} ${
      months[d.getMonth()]
    } ${d.getFullYear()} ${pad2(h)}:${m} ${ampm}`;
  };
  const sameDay = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const inRange = (d) => {
    if (!d || isNaN(d)) return false;
    if (minDate && d < stripTime(minDate)) return false;
    if (maxDate && d > stripTime(maxDate)) return false;
    if (disabledDates.some((x) => sameDay(stripTime(x), d))) return false;
    return true;
  };

  // set state from incoming value
  useEffect(() => {
    if (value instanceof Date && !isNaN(value)) {
      setInputValue(fmt(value));
      setViewDate(new Date(value));
      let h = value.getHours();
      setAmPm(h >= 12 ? "PM" : "AM");
      h = h % 12 || 12;
      setHours(h);
      setMinutes(value.getMinutes());
    }
  }, [value]);

  // click outside to close
  useEffect(() => {
    function onDoc(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  // --- central pick handler ---
  const buildDate = (baseDay) => {
    let h = hours % 12;
    if (ampm === "PM") h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return new Date(
      baseDay.getFullYear(),
      baseDay.getMonth(),
      baseDay.getDate(),
      h,
      minutes
    );
  };

  const handlePick = (d) => {
    if (!d) return;
    const day = stripTime(d);
    if (!inRange(day)) return;
    const picked = buildDate(day);
    setInputValue(fmt(picked));
    setOpen(false);
    onChange && onChange(picked);
  };

  const nav = (deltaMonths) => {
    const m = new Date(viewDate);
    m.setMonth(m.getMonth() + deltaMonths);
    setViewDate(m);
  };

  const onInputBlur = () => {
    if (value instanceof Date && !isNaN(value)) {
      setInputValue(fmt(value));
    } else {
      setInputValue("");
    }
  };

  const today = stripTime(new Date());
  const selected =
    value instanceof Date && !isNaN(value) ? stripTime(value) : null;

  return (
    <div ref={rootRef} className={"relative inline-block " + className}>
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={onInputBlur}
          className=" w-full flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <button
          type="button"
          onClick={() => setOpen(open === "calendar" ? null : "calendar")}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          aria-label="Toggle calendar"
        >
          <CalendarDays size={15} />
        </button>
      </div>

      {open === "calendar" && 
      (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-80 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() =>
                  mode === "day" ? nav(-1) : setViewDate(new Date(year - 12, month, 1))
                }
                className="h-8 w-8 rounded-lg hover:bg-gray-100"
              >
                ‹
              </button>
              <div className="font-medium flex gap-1">
                <span
                  className="cursor-pointer"
                  onClick={() => setMode("month")}
                >
                  {months[month]}
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setMode("year")}
                >
                  {year}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  mode === "day" ? nav(1) : setViewDate(new Date(year + 12, month, 1))
                }
                className="h-8 w-8 rounded-lg hover:bg-gray-100"
              >
                ›
              </button>
            </div>

            {/* Body */}
            {mode === "day" && (
              <>
                <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((d, i) => {
                    if (!d) return <div key={i} className="h-9" />;
                    const day = stripTime(d);
                    const isDisabled = !inRange(day);
                    const isToday = sameDay(day, today);
                    const isSelected = selected && sameDay(day, selected);
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handlePick(day)}
                        className={[
                          "h-9 w-9 text-sm rounded-lg mx-auto flex items-center justify-center",
                          isDisabled
                            ? "text-gray-300 cursor-not-allowed"
                            : "hover:bg-blue-100 hover:cursor-pointer ",
                          isSelected
                            ? "bg-blue-600 text-white hover:bg-blue-600"
                            : "",
                          !isSelected && isToday && !isDisabled
                            ? "ring-1 ring-blue-400"
                            : "",
                        ].join(" ")}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {mode === "month" && (
              <div className="grid grid-cols-3 gap-2">
                {months.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => {
                      setViewDate(new Date(year, i, 1));
                      setMode("day");
                    }}
                    className="p-2 rounded-lg hover:bg-blue-100"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {mode === "year" && (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }, (_, i) => year - 6 + i).map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setViewDate(new Date(y, month, 1));
                      setMode("month");
                    }}
                    className="p-2 rounded-lg hover:bg-blue-100"
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (inRange(today)) handlePick(today);
                }}
                className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                Pick Today
              </button>
            </div>
          </div>
        </div>
        
      
      )
      }
    </div>
  );
});

export default DatePicker;
