import React from 'react'
import OrderListTable from './components/orderListTable'
import { HiOutlineDocumentSearch } from "react-icons/hi";

export default function OrderListPage() {
    return (
        <div>
            <div className='bg-white py-5 border-b-1 border-gray-400 flex gap-x-2 items-center pl-3'>
                <span>< HiOutlineDocumentSearch size={25}/></span> <h1 className='font-bold text-xl'>List Orders</h1>
            </div>
            
            <OrderListTable />
        </div>
    )
}
