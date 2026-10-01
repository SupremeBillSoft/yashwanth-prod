import React from "react"
export default function Input({ className = "", ...props }) {
  return (
    <input
      type="text"
      className={` 
        w-full h-9 px-3 py-1 text-sm rounded-md border-1 
        border-[#d1d5db] bg-transparent text-[#111827] 
        placeholder:text-[#6b7280]
        focus-visible:outline-none 
        focus-visible:ring-1 focus-visible:ring-[#7c3aed] 
        focus-visible:ring-offset-2 
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      {...props}
    />
  );
}