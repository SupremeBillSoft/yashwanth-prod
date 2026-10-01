// salesEditTable.jsx
import React, { useEffect, useState } from 'react';
import TableDropdown from '../../../common/Dropdown/TableDropDown';
//import Input from '../../../common/ui/input';
//import axios from 'axios';
import api from '../../../services/api';
import { TiDelete } from 'react-icons/ti';
import { indexOf } from 'lodash';

const deliveryOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];
///inside the dialgue box
export default function SalesEntryEditTable({ rows, setRows }) {
  const [productNames, setProductNames] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [particulars, setParticulars] = useState([]);
  const [packingUnits, setPackingUnits] = useState([]);
  const [taxTypes, setTaxTypes] = useState([]);

  useEffect(() => {   ///for dropdowns
    const loadDropdowns = async () => {
      try {
        const [productRes, unitRes, colorRes] = await Promise.all([
          api.get('/active-products/'),
          api.get('/units/'),
          api.get('/macolors/'),
        ]);

        const products = productRes.data.data;
        const units = unitRes.data.data;
        const colors = colorRes.data.data;

        setProductNames([...new Map(products.map(item => [item.PrCode, { label: `${item.PrName} - ${item.PrCode}`, value: item.PrCode }])).values()]);
        setUOMs([...new Set(products.map(item => item.PrUOM))].filter(Boolean).map(u => ({ label: u, value: u })));
        setParticulars(colors.map(c => ({ label: c.UnitName, value: c.UnitID })));
        setPackingUnits(units.map(u => ({ label: u.UnitName, value: u.UnitID })));
        setTaxTypes([...new Set(products.map(p => p.TaxType))].filter(Boolean).map(t => ({ label: t, value: t })));
      } catch (err) {
        console.error('Dropdown fetch failed:', err);
      }
    };
    loadDropdowns();
  }, []);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    const q = parseFloat(updated[index].quantity);
    const r = parseFloat(updated[index].rate);
    const d = parseFloat(updated[index].discount) || 0;

    if (!isNaN(q) && !isNaN(r)) {
      const base = q * r;
      const discAmt = (base * d) / 100;
      const amt = base - discAmt;

      updated[index].amount = amt;
      updated[index].taxAmount = 0;
      updated[index].subTotal = amt;
      updated[index]._needsTax = true; //flag for later tax fetch
    }

    // Auto add new row
    if (field === 'productName' && index === updated.length - 1 && value) {
      updated.push({
        id: Date.now(),
        productName: null,
        particular: null,
        packing: null,
        uom: null,
        quantity: '',
        rate: '',
        discount: '',
        taxType: null,
        amount: '',
        taxAmount: '',
        subTotal: '',
        deliveryDate: '',
        deliveryPref: null,
      });
    }

    setRows(updated);
  };

  const deleteRow = (id) => {
    const updated = rows.filter((row) => row.id !== id);
    setRows(updated);
  };

  //Debounced tax fetch
  useEffect(() => {
    const timer = setTimeout(async () => {
      const updated = await Promise.all(
        rows.map(async (row) => {
          if (row._needsTax && row.taxType && row.amount) {
            try {
              const res = await api.post('/calculate-tax/', {
                TaxType: row.taxType.value,
                base_amount: row.amount,
              });

              const taxAmount = res.data.total_tax_amount || 0;
              const subTotal = parseFloat(row.amount) + taxAmount;

              return {
                ...row,
                taxAmount,
                subTotal,
                _needsTax: false,
              };
            } catch {
              return {
                ...row,
                taxAmount: 0,
                subTotal: parseFloat(row.amount),
                _needsTax: false,
              };
            }
          }
          return row;
        })
      );

      setRows(updated);
    }, 400); //delay in ms

    return () => clearTimeout(timer);
  }, [rows]);


  // const deleteRow = (id) => {
  //   const updated = rows.filter(row => row.id !== id);
  //   setRows(updated);
  // };




  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
    <div className="overflow-x-auto  p-1 max-w-full ">
      <div className="min-w-[3000px]">
        <div className='grid grid-cols-[repeat(24,_120px)] gap-1 h-full   text-center  border-1 border-gray-200 py-0 bg-white text-[18px]'>
          <div className='col-span-0  border-r-1 border-r-gray-300 '>Product ID</div>
          <div className='col-span-3 border-r-1 border-r-gray-300 '>Item Code Name</div>
          <div className='col-span-2 border-r-1 border-r-gray-300'>Particular</div>
          <div className='col-span-2 border-r-1 border-r-gray-300'>Packing</div>
          <div className='border-r-1 col-span-2 border-r-gray-300'>UOM</div>
          <div className='border-r-1 col-span-1 border-r-gray-300'>Quantity</div>
          <div className='border-r-1 col-span-2 border-r-gray-300'>Rate</div>
          <div className='border-r-1 border-r-gray-300'>Discount%</div>
          <div className='border-r-1 border-r-gray-300'>Amount</div>
          <div className='border-r-1 border-r-gray-300'>Tax%</div>
          <div className='border-r-1 border-r-gray-300'>Tax Amount</div>
          <div className='border-r-1 col-span-2 border-r-gray-300'>Sub Total</div>
          <div className='border-r-1 col-span-2 border-r-gray-300'>Delivery Date</div>
          <div className='border-r-1 col-span-2 border-r-gray-300'>Delivery Preference</div>
          {/* <div className='border-r-1 border-r-gray-300'>Delivery</div> */}

          <div className='border-r-0 col-span-1 border-r-gray-300'>Action</div>
        </div>


  {rows.map((row, index) => (
  <div key={index} className='grid grid-cols-[repeat(25,_120px)] gap-1 text-center border-1 border-t-0 border-gray-200 py-1 text-[16px] bg-white'>
  <div className='col-span-0'>
    <input readOnly value={index + 1} className='rounded-md w-full h-full px-2 border' />
  </div>
  <div className='col-span-3'>
    <TableDropdown
      options={productNames}
      value={row.productName}
      onChange={(val) => handleRowChange(index, 'productName', val)}
    />
  </div>
  <div className='col-span-2'>
    <TableDropdown
      options={particulars}
      value={row.particular}
      onChange={(val) => handleRowChange(index, 'particular', val)}
    />
  </div>
  <div className='col-span-2'>
    <TableDropdown
      options={packingUnits}
      value={row.packing}
      onChange={(val) => handleRowChange(index, 'packing', val)}
    />
  </div>
  <div className='col-span-2'>
    <TableDropdown
      options={uoms}
      value={row.uom}
      onChange={(val) => handleRowChange(index, 'uom', val)}
    />
  </div>
  <div className='col-span-1'>
    <input
      value={row.quantity}
      onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
      className='rounded-md w-full h-full px-2 border'
      placeholder='qty'
    />
  </div>
  <div className='col-span-2'>
    <input
      value={row.rate}
      onChange={(e) => handleRowChange(index, 'rate', e.target.value)}
      className='rounded-md w-full h-full px-2 border'
      placeholder='rate'
    />
  </div>
  <div>
    <input
      value={row.discount}
      onChange={(e) => handleRowChange(index, 'discount', e.target.value)}
      className='rounded-md w-full h-full px-2 border'
      placeholder='discount'
    />
  </div>

  {/*New TaxType dropdown */}
    <div>
  <input
      value={row.amount}
      readOnly
      className='rounded-md w-full h-full px-2 border'
      placeholder='amount'
    />
    </div>


  <div>

  <TableDropdown
      options={taxTypes}
      value={row.taxType}
      onChange={(val) => handleRowChange(index, 'taxType', val)}
    />
    
  </div>
  <div>
    <input
      value={row.taxAmount}
      readOnly
      className='rounded-md w-full h-full px-2 border'
      placeholder='TaxAmount'
    />
  </div>
  <div className='col-span-2'>
    <input
      value={row.subTotal}
      readOnly
      className='rounded-md w-full h-full px-2 border'
      placeholder='subtotal'
    />
  </div>
  <div className='col-span-2'>
    <input
      type="date"
      value={row.deliveryDate}
      onChange={(e) => handleRowChange(index, 'deliveryDate', e.target.value)}
      className='rounded-md w-full h-full px-2 border'
    />
  </div>
  <div className='col-span-2'>
    <TableDropdown
      options={deliveryOptions}
      value={row.deliveryPref}
      onChange={(val) => handleRowChange(index, 'deliveryPref', val)}
    />
  </div>
  <div className='col-span-1 flex items-center justify-center'>
    <button
      className='text-red-600 font-bold cursor-pointer'
      onClick={() => deleteRow(row.id)}
      disabled={rows.length === 1}
    >
      <TiDelete size={30} />
    </button>
  </div>
</div>
))}
      </div>
    </div>
    {/* <div className="flex justify-end mt-4 pr-5">
      <div className="text-lg font-bold">
        Net Total: ₹ {netTotal?.toFixed(2)}
      </div>
    </div> */}
  </div>
  );
}
