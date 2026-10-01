"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";


export default function Dropdown({ value, onChange, options = [], disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  //const [selected, setSelected] = useState(value || null);
  const [search, setSearch] = useState("");
  const [dropdownStyles, setDropdownStyles] = useState({})
  const [readyToRender, setReadyToRender] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const wrapperRef = useRef(null)
  const buttonRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const selected = value

  const filteredOptions = options.filter((opt) =>
    (opt.label || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option) => {
  
    onChange?.(option); // emit selection to parent
    setIsOpen(false);
    setSearch("");
    setReadyToRender(false);
    setHighlightedIndex(0);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !wrapperRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
        setReadyToRender(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const timeout = setTimeout(() => {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownStyles({
          position: "absolute",
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          zIndex: 9999,
        });
        setReadyToRender(true); // only render after styles are set
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  return (
     <>
     <div ref={wrapperRef} tabIndex={disabled ? -1 : 0} className="relative w-full text-sm font-medium">
        <button
          ref={buttonRef}
          disabled={disabled}
          onClick={() => {
            if (disabled) return
            setIsOpen(!isOpen);
            setSearch("");
            setReadyToRender(false);
          }}
          className={`flex items-center justify-between w-full px-3 py-1 h-9 border-1 rounded-md transition-all duration-200 ${
            isOpen
              ? "border-purple-500 ring-1 ring-[#7c3aed] outline-none"
              : "border-[#d1d5db]"
          } ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white cursor-pointer"}`}
        >
          <span>{selected?.label || "Select an option"}</span>
          <FaChevronDown
            className={`ml-2 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen &&
        readyToRender &&
        createPortal(
          <AnimatePresence>
            <motion.ul
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              style={dropdownStyles}
              className="bg-white rounded-xl border border-gray-200 shadow-md max-h-60 overflow-auto mt-1 p-0"
            >
              <div className="sticky top-0 bg-white px-3 py-2 z-10">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder="Search..."
                  className="w-full px-3 py-1 border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7c3aed]"
                />
              </div>

              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-2 cursor-pointer flex justify-between items-center ${
                      value?.value === option.value
                        ? "bg-purple-100 text-purple-700"
                        : ""
                    } ${
                      //selected?.value === option.value ? "font-semibold" : ""
                      value?.value === option.value ? "font-semibold" : ""
                    }`}
                  >
                    {option.label}
                    {value?.value === option.value && (
                      <FaCheck className="text-purple-600 text-xs" />
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-gray-400 italic text-center">
                  No results found
                </li>
              )}
            </motion.ul>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
