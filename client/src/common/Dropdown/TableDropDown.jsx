"use client";
import {useEffect,useRef,useState} from "react"
import {createPortal} from "react-dom"
import {FaChevronDown,FaCheck } from "react-icons/fa"
import {motion,AnimatePresence } from "framer-motion"

export default function TableDropdown({ value, onChange, options = [] }) {
const[isOpen,setIsOpen] = useState(false)
const[selected,setSelected] = useState(value||null)
const[dropdownStyles,setDropdownStyles] =useState({})
const[readyToRender,setReadyToRender] =useState(false)
const [searchTerm, setSearchTerm] = useState("")
const wrapperRef = useRef(null)
const buttonRef = useRef(null)
const dropdownRef = useRef(null)

const handleSelect = (option) => {
    setSelected(option)
    onChange?.(option)
    setIsOpen(false)
    setReadyToRender(false)
}

useEffect(() => {
    setSelected(value)
},[value])

useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !wrapperRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
        setReadyToRender(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
},[])

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
        })
        setReadyToRender(true);
      }, 0)

      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  // Filtered options
const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
) 

  return (
    <>
      <div
        ref={wrapperRef}
        tabIndex={0}
        className="relative w-full text-sm font-medium"
      >
        <button
          ref={buttonRef}
          onClick={() => {
            setIsOpen(!isOpen);
            setReadyToRender(false);
          }}
          className={`flex items-center justify-between w-full px-2 py-2 h-10 border-1 rounded-md transition-all duration-200 ${
            isOpen
              ? "border-purple-500 ring-1 ring-[#7c3aed] outline-none"
              : "border-[#d1d5db]"
          } bg-white`}
        >
          <span>{selected?.label || ""}</span>
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
              {/* Search box */}
              <li className="sticky top-0 bg-white px-3 py-2 border-b border-gray-200">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm outline-none"
                />
              </li>

              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-2 cursor-pointer flex justify-between items-center hover:bg-purple-100 ${
                      selected?.value === option.value
                        ? "font-semibold text-purple-700"
                        : ""
                    }`}
                  >
                    {option.label}
                    {selected?.value === option.value && (
                      <FaCheck className="text-purple-600 text-xs" />
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-gray-400 italic text-center">
                  No options found
                </li>
              )}
            </motion.ul>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
