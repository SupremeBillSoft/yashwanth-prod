import React, { useState } from 'react'
import InvoiceWrapper from '../invoice/InvoiceWrapper'
import Input from '../../common/ui/input'

export default function PrintOrderpage() {
    const [soNoInput, setSoNoInput] = useState('');
    const [submittedSoNo, setSubmittedSoNo] = useState('');
    //const [searchNo,setSearchNo]=useState(null)


    const handleSubmit = () => {
        //setSoNoInput(null)
        const trimmed = soNoInput?.trim();
        if (trimmed) {
            setSubmittedSoNo(trimmed); // Triggers invoice display
        } else {
            setSubmittedSoNo(null); // Clear if input is blank
        }
    }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }
    return (
        <div className=' p-4 sm:p-6 md:p-0'>
             <div className='h-11 flex items-center bg-white  border-b-0 border-gray-100'>

                <h1 className='font-bold'>Print So No</h1>
            </div>   
             
            <div className="w-full mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Input
            placeholder="Enter SO No"
            value={soNoInput}
            onChange={(e)=>setSoNoInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full sm:w-64"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 rounded-full text-white hover:bg-blue-700 px-4  py-1 hover:cursor-pointer font-bold w-full sm:w-auto"
          >
            Show sales order
          </button>
        </div>
      </div>

            {submittedSoNo ? (
                <div className="border-0 rounded shadow-none p-1 bg-white">
                    <InvoiceWrapper soNo={submittedSoNo} />
                </div>
            ) : (
                <div className="text-gray-400 text-center mt-10">No Invoice Loaded</div>
            )}
        </div>
    )
}
