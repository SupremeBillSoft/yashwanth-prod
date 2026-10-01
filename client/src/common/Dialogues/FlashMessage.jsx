import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCheckCircle, MdError, MdInfo, MdClose } from 'react-icons/md';

const iconMap = {
  success: <MdCheckCircle className="text-green-500 text-4xl" />,
  error: <MdError className="text-red-500 text-4xl" />,
  info: <MdInfo className="text-blue-500 text-4xl" />,
};

const bgColorMap = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
};

export default function FlashMessage({
  type = 'success',
  title = 'Success!',
  message = 'Action completed successfully.',
  buttonText = 'OK',
  onClose,
  onAction,
}) {
  return (
    <AnimatePresence>
      <motion.div
        key="flash-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/[50%] bg-opacity-30 z-[9999] flex items-center justify-center"
      >
        <motion.div
          key="flash-box"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`w-[90%] max-w-sm rounded-xl border p-5 shadow-lg ${bgColorMap[type]} bg-white`}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex gap-3 items-start">
              {iconMap[type]}
              <div className="flex flex-col">
                <h2 className="font-semibold text-lg">{title}</h2>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800">
              <MdClose size={22} />
            </button>
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={onAction || onClose}
              className="bg-black hover:bg-gray-800 text-white px-4 py-1.5 text-sm rounded-full hover:cursor-pointer"
            >
              {buttonText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
