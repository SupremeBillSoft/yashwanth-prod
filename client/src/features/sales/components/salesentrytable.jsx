import React, {useState,useRef,useEffect} from 'react'
//import Input from '../../../common/ui/input'
import TableDropdown from '../../../common/Dropdown/TableDropDown'
//import DatePicker from '../../../common/ui/datepicker'
import {TiDelete} from "react-icons/ti";
//import { RiDeleteBin7Line } from "react-icons/ri";
//import Dropdown from '../../../common/Dropdown/Dropdown'
//import OrderListEdit from '../../orderlist/components/editorderList';
import debounce from 'lodash/debounce';
//import axios from "axios";
import api from '../../../services/api';
const deliveryOptions = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" }
];

export default function SalesEntryTable({pacode,onProductChange, editData = [] }) {
  //console.log("cuscode",pacode.value)
  const [productCodes,setProductCodes] = useState([])
  const [productNames,setProductNames] = useState([])
  const [uoms,setUOMs] = useState([])
  const [particulars,setParticulars] = useState([])
  const [packingUnits,setPackingUnits] = useState([])
  const [netTotal, setNetTotal] = useState(0)
  const [taxTypes,setTaxTypes] = useState([])
  const inputRefs=useRef([])
  const [particularEdit ,setParticularOption]=useState([])
  //console.log(editData)


  const [rows, setRows] = useState([
    {
      id: "",
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
      deliveryPref: null
    }
  ])
  const[allColors,setAllColors]=useState([])
///console.log("rows",rows)



useEffect(() => {
  const fetchColors = async () => {
    try {
      const res = await api.get("/product-colors-all/") 
      //console.log(res.data)
      setAllColors(res.data); 
    } catch (error) {
      console.error("Failed to fetch all product colors:", error);
    }
  };

  fetchColors();
}, []);
        


  useEffect(() => {
    if (uoms.length === 1) {
      const onlyUom = uoms[0];
      // set default UOM for all rows or a specific row
      const updatedRows = rows.map(row => ({
        ...row,
        uom: onlyUom // set default uom
      }));
      setRows(updatedRows); // update rows with default uom
    }
  }, [uoms]);



  useEffect(() => {
  if (editData.length > 0) {
    const mappedRows = editData.map((item, idx) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      const disc = Number(item.discount || 0);
      const taxAmt = Number(item.taxAmount || 0);
      const amount = qty * rate - (qty * rate * disc) / 100;

      return {
        id: Date.now() + idx,
        productName: item.prcode ? { label: item.productName, value: item.prcode } : null,
        particular: item.particular ? { label: item.particular, value: item.particular } : null,
        packing: item.packing ? { label: item.packing, value: item.packing } : null,
        uom: item.uom || "NOS",
        quantity: item.quantity || '',
        rate: item.rate || '',
        discount: item.discount || '',
        taxType: item.taxType ? { label: item.taxType, value: item.taxType } : null,
        amount,
        taxAmount: item.taxAmount || '',
        subTotal: amount + taxAmt,
        deliveryDate: item.deliveryDate ? item.deliveryDate.split('T')[0] : '',
        deliveryPref: item.deliveryPref ? { label: item.deliveryPref, value: item.deliveryPref } : null,
      };
    });

    setRows(mappedRows);
    setNetTotal(mappedRows.reduce((s, r) => s + (Number(r.subTotal) || 0), 0));
    onProductChange(toPayloadRows(mappedRows));   // so Submit works without editing a row
  }
}, [editData]);

  //console.log("packing",selectedPacking)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, unitRes, colorRes] = await Promise.all([
          api.get("active-products/"),
          api.get("/units/"),
          api.get("/macolors/")
        ]);

        const productData = productRes.data.data;
        const units = unitRes.data.data;
        //const particularData = colorRes.data.data;

        const uniquePrNames = [...new Map(productData.map(item => [
          item.PrCode,
          {
            label: `${item.PrName} - ${item.PrCode}`,
            value: item.PrCode
          }
        ])).values()];

        const uniqueUOMs = [...new Set(productData.map(item => item.PrUOM))]
          .filter(Boolean)
          .map(uom => ({label:uom,value:uom}));

        // const formattedParticulars = particularData.map(item => ({
        //   label:item.UnitName,
        //   value:item.UnitID
        // }))

        const formattedPacking = units.map(item => ({
          label: item.UnitName,
          value: item.UnitID
        }))

        const uniqueTaxTypes = [...new Set(productData.map(item => item.TaxType))]
          .filter(Boolean)
          .map(tax => ({ label: tax, value: tax }));


        setProductNames(uniquePrNames);

        //console.log(uniqueUOMs)
        // setUOMs(uniqueUOMs);
        // if (uniqueUOMs.length === 1) {
        //   //setUOMs(uniqueUOMs[0])
        // }
        //setParticulars(formattedParticulars);
        setPackingUnits(formattedPacking);

        setTaxTypes(uniqueTaxTypes)

      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };

    fetchData();
  }, []);


  const handleProductSelect = async (prCode) => {
    try {
      const response = await axios.get(`https://your-api.com/api/product-tax/`, {
        params: { pr_code: prCode },
      });

      if (response.data.TaxType) {
        setSelectedTaxType(response.data.TaxType); // GST 5 or GST 18
      }
    } catch (error) {
      console.error("Failed to fetch tax type:", error);
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      const form = e.target.form
      const index = Array.prototype.indexOf.call(form, e.target)

      //Focus next input (if exists)
      if(form.elements[index + 1]) {
        form.elements[index + 1].focus();
      }
    }
  };

  const toPayloadRows = (list) =>
    list.filter(r => r.productName).map(r => ({
      PrCode: r.productName?.value || '',
      soSpecification: r.packing?.label || '',
      soQty: parseFloat(r.quantity) || 0,
      soRate: parseFloat(r.rate) || 0,
      soParticular: r.particular?.label || '',
      soDiscount: parseFloat(r.discount) || 0,
      TaxType: r.taxType?.value || '',
      soTaxAmt: parseFloat(r.taxAmount) || 0,
      SoDeliveryPreference: r.deliveryPref?.value || '',
      SoDeliveryDate: r.deliveryDate ? new Date(r.deliveryDate).toISOString() : null,
    }));

  const calculateAndSetTotals = debounce(async (index, updatedRows) => {
    const row = updatedRows[index];
    const q = parseFloat(row.quantity);
    const r = parseFloat(row.rate);
    const d = parseFloat(row.discount);
    const taxType = row.taxType?.value || "";

    if(!isNaN(q)&&!isNaN(r)) {
      const base = q * r;
      const disc = !isNaN(d) ? (base * d) / 100 : 0;
      const amt = base - disc;

      row.amount = amt;

      try {
        const res = await api.post("/calculate-tax/", {
          TaxType: taxType,
          base_amount: amt
        });

        const taxAmt = res.data.total_tax_amount || 0;
        row.taxAmount = taxAmt;
        row.subTotal = amt + taxAmt;
      } catch (error) {
        console.error("Tax calc failed:", error);
        row.taxAmount = 0;
        row.subTotal = amt;
      }

    } else {
      row.amount = '';
      row.taxAmount = '';
      row.subTotal = '';
    }

    const net = updatedRows.reduce((sum, row) => {
      const val = parseFloat(row.subTotal);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    setRows([...updatedRows])
    setNetTotal(net)

    const validRows = updatedRows.filter(r => r.productName).map(r => ({
      PrCode: r.productName?.value || '',
      soSpecification: r.packing?.label || '',
      soQty: parseFloat(r.quantity) || 0,
      soRate: parseFloat(r.rate) || 0,
      soParticular: r.particular?.label || '',
      soDiscount: parseFloat(r.discount) || 0,
      TaxType: r.taxType?.value || '',
      soTaxAmt: parseFloat(r.taxAmount) || 0,
      SoDeliveryPreference: r.deliveryPref?.value || '',
      SoDeliveryDate: r.deliveryDate ? new Date(r.deliveryDate).toISOString() : null,
    }));

    onProductChange(validRows);
  }, 400);

  const handleRowChange = async (index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field]=value
  
    try {      
      if (field === "productName" && value) {
        updatedRows[index].particular = null
        updatedRows[index].packing = null
        updatedRows[index].uom = ""
        updatedRows[index].rate = ""
  
        const productRes = await api.get("/product-tax/", {
          params: { pr_code: value.value },
        })
  
        const {TaxType,PrUOM } = productRes.data;
  
        // Set tax type
        const taxOption = taxTypes.find(t => t.value === TaxType);
        if (taxOption) {
          updatedRows[index].taxType = taxOption;
        }
  
        // Set UOM
        updatedRows[index].uom = PrUOM || "";
  
        // Populate colors
        const colorOptions = allColors
          .filter(c => c.PrCode === value.value)
          .map(c => ({
            label: c.UnitName,
            value: c.UnitName,
          }));
        setParticulars(colorOptions);
      }
  
      
      if ((field==="particular"||field ==="packing")&&value) {
        const row = updatedRows[index]
        updatedRows[index].rate = ""
        if (row.productName?.value && row.particular?.value && row.packing?.label) {
          const rateRes = await api.get("/latest-invrate/", {
            params: {
              PaCode: pacode?.value, 
              PrCode: row.productName.value,
              InvParticular: row.particular.value,
              InvSpecification: row.packing.label,
            },
          });
                 
          if (rateRes.data.InvRate) {
            updatedRows[index].rate = rateRes.data.InvRate;
          } else {
            updatedRows[index].rate = ""
            console.warn("No InvRate found for selection");
          }
        }
      }
    } catch(err){
      console.error("Error in handleRowChange:", err)
      updatedRows[index].rate = ""
    }  
    setRows(updatedRows);
    calculateAndSetTotals(index, updatedRows);
  };
  


  const addNewRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: Date.now(),
        productName: null,
        particular: null,
        packing: null,
        uom: null,
        quantity: "",
        rate: "",
        discount: "",
        taxType: null,
        amount: "",
        taxAmount: "",
        subTotal: "",
        deliveryDate: "",
        deliveryPref: null,
        //availableColors: [],
        //selectedColor: null,
      }
    ]);
  };


  const getFinancialYearCode = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; 
    let fyStart, fyEnd

    if (month >= 4) {
      // April to December
      fyStart = year % 100;
      fyEnd = (year + 1) % 100;
    } else {
      // January to March
      fyStart = (year-1) %100;
      fyEnd = year % 100;
    }

    return `${fyStart}${fyEnd}`; //format:2526
  };

  useEffect(() => {
    const code = getFinancialYearCode();
  
  }, []);
  const deleteRow = (id) => {
    const newRows = rows.filter(row => row.id !== id);
    setRows(newRows);
    setNetTotal(newRows.reduce((s, r) => s + (parseFloat(r.subTotal) || 0), 0));
    const validRows = newRows.filter(row => row.productName).map(row => ({
      PrCode: row.productName?.value || '',
      //soYearCode: '2025',
      //soSlNo: 1001,
      soSpecification: row.packing?.label || '',
      soQty: parseFloat(row.quantity) || 0,
      soRate: parseFloat(row.rate) || 0,
      soParticular: row.particular?.label || '',
      soDiscount: parseFloat(row.discount) || 0,
      TaxType: row.taxType?.value || '',
      soTaxAmt: parseFloat(row.taxAmount) || 0,
      SoDeliveryPreference: row.deliveryPref?.value || '',
      SoDeliveryDate: row.deliveryDate ? new Date(row.deliveryDate).toISOString() : null,
    }));

    onProductChange(validRows);
  };




  return (
    <>

      <div className="mb-2 flex justify-end pr-4">
        <button
          type="button"
          className="bg-blue-400 text-white px-3  py-1 rounded-full hover:bg-blue-700 font-semibold cursor-pointer"
          onClick={addNewRow}
        >
          + Add
        </button>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="w-full overflow-x-auto max-w-screen mx-auto px-2">

          <div className="min-w-fit">
            {/* Table Header */}
            <div className='grid grid-cols-[repeat(24,_minmax(100px,_1fr))] gap-1 text-center border border-gray-300 py-2 w-full bg-white font-semibold text-sm'>
              <div className='col-span-1'>S.No</div>
              <div className='col-span-3'>Item Code Name</div>
              <div className='col-span-2'>Particular</div>
              <div className='col-span-2'>Packing</div>
              <div className='col-span-2'>UOM</div>
              <div className='col-span-1'>Quantity</div>
              <div className='col-span-2'>Rate</div>
              <div className='col-span-1'>Discount%</div>
              <div className='col-span-1'>Amount</div>
              <div className='col-span-1'>Tax%</div>
              <div className='col-span-1'>Tax Amount</div>
              <div className='col-span-2'>Sub Total</div>
              <div className='col-span-2'>Delivery Date</div>
              <div className='col-span-2'>Delivery Preference</div>
              <div className='col-span-1'>Action</div>
            </div>

            {/* Table Rows */}
            {rows.map((row, index) => (
                   

              <div key={row.id} className='grid grid-cols-[repeat(24,_minmax(100px,_1fr))] gap-1 text-center border border-gray-300 py-2 w-full bg-white font-semibold text-sm'>
                <div className='col-span-1'>
                  <input readOnly value={index + 1} className='w-full h-full border-2 border-purple-400 px-2 rounded ' />
                </div>
                <div className='col-span-3'>
                  <TableDropdown
                    options={productNames}
                    value={row.productName}
                    onChange={(val) => handleRowChange(index, 'productName', val)}
                  />
                </div>
                <div className='col-span-2'>
                  {/* {row.availableColors && row.availableColors.length > 0 && ( */}
                  <TableDropdown
                    options={
                      row.productName?.value
                        ? allColors
                          .filter(item => parseInt(item.PrCode)===parseInt(row.productName.value))
                          .map(item => ({
                          label: item.UnitName?.trim(),
                          value: item.UnitName?.trim(),
                          }))
                        : []
                    }
                    value={row.particular}
                    onChange={(val) => handleRowChange(index, 'particular', val)}
                    placeholder="Select color"
                  />
                  {/* )} */}
                </div>
                <div className='col-span-2'>
                  <TableDropdown
                    options={packingUnits}
                    value={row.packing}
                    onChange={(val) => handleRowChange(index, 'packing', val)}
                  />
                </div>
                <div className='col-span-2'>
                  {/* <TableDropdown
              options={uoms}
              value={row.uom}
              onChange={(val) => handleRowChange(index, 'uom', val)}
              onKeyDown={handleEnterKey}
            />  */}

                  <input
                    value={row.uom}
                    //onChange={(e) => handleRowChange(index,'uom',e.target.value)}
                    className='w-full h-full border px-2 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500'
                    placeholder='Uom'
                    readOnly
                    onKeyDown={handleEnterKey}
                  />
                </div>
                <div>
                  <input
                    value={row.quantity}
                    onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                    className='w-full h-full border px-2 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500'
                    placeholder='Qty'
                    onKeyDown={handleEnterKey}
                  />
                </div>
                <div className='col-span-2'>
                  <input
                    value={row.rate}
                    //readOnly
                    onChange={(e) => handleRowChange(index, 'rate', e.target.value)}
                    className='w-full h-full border px-2 rounded'
                    placeholder='Rate'
                    onKeyDown={handleEnterKey}
                  />
                </div>
                <div>
                  <input
                    value={row.discount}
                    onChange={(e) => handleRowChange(index,'discount', e.target.value)}
                    className='w-full h-full border px-2 rounded'
                    placeholder='Discount'
                    onKeyDown={handleEnterKey}
                  />
                </div>
                <div>
                  <input
                    value={row.amount}
                    readOnly
                    className='w-full h-full border px-2 rounded'
                    placeholder='Amount'
                    onKeyDown={handleEnterKey}
                  />
                </div>
                <div>
                  {/* <TableDropdown
              options={taxTypes}
              value={row.taxType}
              onChange={(val) => handleRowChange(index, 'taxType', val)}
              onKeyDown={handleEnterKey}
             
            /> */}

                  <input
                    className='w-full h-full border px-2 rounded'
                    placeholder='taxtype'
                    onKeyDown={handleEnterKey} value={row.taxType?.label || ""} readOnly />
                </div>
                <div>
                  <input
                    value={row.taxAmount}
                    readOnly
                    className='w-full h-full border px-2 rounded'
                    placeholder='Tax Amt'
                    onKeyDown={handleEnterKey}
                  />
                </div>
                <div className='col-span-2'>
                  <input
                    value={Number(row.subTotal).toFixed(2)}
                    readOnly
                    className='w-full h-full border px-2 rounded'
                    placeholder='Sub Total'
                    onKeyDown={handleEnterKey}
                  />
                </div>
                <div className='col-span-2'>
                  <input
                    type="date"
                    value={row.deliveryDate}
                    onChange={(e) => handleRowChange(index,'deliveryDate', e.target.value)}
                    className='w-full h-full border px-2 rounded'
                    onKeyDown={handleEnterKey}
                  />
                </div>
                <div className='col-span-2'>
                  <TableDropdown
                    options={deliveryOptions}
                    value={row.deliveryPref}
                    onChange={(val) => handleRowChange(index,'deliveryPref',val)}
                    onKeyDown={handleEnterKey}
                  />
                </div>
                <div className='flex items-center justify-center'>
                  <button
                    className='text-red-600 hover:text-red-800 font-bold'
                    onClick={() => deleteRow(row.id)}
                    disabled={rows.length === 1}
                  >
                    <TiDelete size={24} />
                  </button>
                </div>
              </div>

            ))}

            {/* Net Total */}

          </div>

        </div>
        <div className="flex justify-end mt-4 pr-4">
          <div className="text-base font-semibold">
            Net Total: ₹{netTotal?.toFixed(2)}
          </div>
        </div>
      </form>
    </>
  )
}
