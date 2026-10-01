import React from 'react'
import{motion,AnimatePresence}from"framer-motion";
import{MdClose}from "react-icons/md";

export default function ConfirmationDialog({
  buttonText, isOpen, onClose, onConfirm, title, message, loading}) {
  console.log(loading)
  return (
    <AnimatePresence>
    {isOpen && (
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed  inset-0 bg-black/50 z-[9999] flex items-center justify-center"
      >
        <motion.div
          key="dialog"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="w-[90%] max-w-sm rounded-xl border-none p-5 shadow-xl bg-white"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col">
              <h2 className="font-semibold text-lg text-gray-800">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800 hover:cursor-pointer">
              <MdClose size={22} />
            </button>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full border text-sm border-gray-300 hover:bg-gray-100 text-gray-700 transition hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex hover:cursor-pointer items-center gap-2 px-4 py-1.5 rounded-full text-sm text-white bg-black hover:bg-gray-800 transition ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"
              }`}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              )}
              {loading ? "Submitting..." : buttonText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
}
