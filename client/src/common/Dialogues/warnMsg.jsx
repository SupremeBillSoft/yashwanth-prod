import { useState } from "react";

export default function WarnMsg({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M12 5a7 7 0 00-7 7v5h14v-5a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Employee Mismatch
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          The selected employee does not belong to this customer’s previous
          invoice records.
        </p>

        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
