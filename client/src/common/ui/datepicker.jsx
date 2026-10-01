"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function DatePicker({ value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("date");
  const [yearRange, setYearRange] = useState([2020, 2031]);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const btnRef = useRef(null);
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });


  useEffect(() => {
    // Sync internal state if external value changes
    setSelectedDate(value);
  }, [value]);
  // Position popup under button
  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setStep("date");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleYearSelect = (year) => {
    setCurrentYear(year);
    setStep("month");
  };

  const handleMonthSelect = (index) => {
    setCurrentMonth(index);
    setStep("date");
  };

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year, month) =>
    new Date(year, month, 1).getDay();

  const handleDateSelect = (day) => {
    const selected = new Date(currentYear, currentMonth, day);
    setSelectedDate(selected);
    setIsOpen(false);
    setStep("date");
    if (onChange) onChange(selected);
  };

  const formatDate = (date) =>
    date?.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => {
            setIsOpen((prev) => {
                const opening = !prev;
            
                // If opening for the first time and no date selected yet
                if (opening && !selectedDate) {
                  const now = new Date();
                  setSelectedDate(now);
                  setCurrentYear(now.getFullYear());
                  setCurrentMonth(now.getMonth());
                }
            
                return opening;
              });
              setStep("date");
        }}
        className="w-full border px-4 py-1 rounded-md text-left bg-white"
      >
        {selectedDate ? formatDate(selectedDate) : "Pick a date"}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 9999,
            
            }}
            className="bg-white shadow-lg rounded-md p-4 border    "
          >
            {/* YEAR GRID */}
            {step === "year" && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() =>
                      setYearRange([yearRange[0] - 12, yearRange[1] - 12])
                    }
                    className="px-2"
                  >
                    ←
                  </button>
                  <span className="font-semibold">
                    {yearRange[0]} - {yearRange[1]}
                  </span>
                  <button
                    onClick={() =>
                      setYearRange([yearRange[0] + 12, yearRange[1] + 12])
                    }
                    className="px-2"
                  >
                    →
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: yearRange[1] - yearRange[0] + 1 }).map(
                    (_, i) => {
                      const year = yearRange[0] + i;
                      return (
                        <button
                          key={year}
                          onClick={() => handleYearSelect(year)}
                          className="px-2 py-1 rounded hover:bg-gray-200"
                        >
                          {year}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* MONTH PICKER */}
            {step === "month" && (
              <div>
                <div className="flex justify-center mb-3 font-semibold">
                  <button
                    onClick={() => setStep("year")}
                    className="hover:underline hover:cursor-pointer"
                  >
                    {currentYear}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {months.map((month, idx) => (
                    <button
                      key={month}
                      onClick={() => handleMonthSelect(idx)}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DATE PICKER */}
            {step === "date" && (
              <div>
                <div className="flex justify-between items-center mb-3 font-semibold">
                  <button
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear((prev) => prev - 1);
                      } else {
                        setCurrentMonth((prev) => prev - 1);
                      }
                    }}
                    className="px-2"
                  >
                    ←
                  </button>

                  <button
                    onClick={() => setStep("month")}
                    className="hover:underline hover:cursor-pointer"
                  >
                    {months[currentMonth]} {currentYear}
                  </button>

                  <button
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear((prev) => prev + 1);
                      } else {
                        setCurrentMonth((prev) => prev + 1);
                      }
                    }}
                    className="px-2"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center text-gray-500 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({
                    length: getFirstDayOfMonth(currentYear, currentMonth),
                  }).map((_, i) => (
                    <div key={"empty-" + i}></div>
                  ))}
                  {Array.from({
                    length: getDaysInMonth(currentYear, currentMonth),
                  }).map((_, i) => {
                    const day = i + 1;
                    const isSelected =
                      selectedDate &&
                      selectedDate.getFullYear() === currentYear &&
                      selectedDate.getMonth() === currentMonth &&
                      selectedDate.getDate() === day;

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        className={`px-2 py-1 rounded ${
                          isSelected
                            ? "bg-purple-600 text-white"
                            : "hover:bg-purple-500 hover:cursor-pointer"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
