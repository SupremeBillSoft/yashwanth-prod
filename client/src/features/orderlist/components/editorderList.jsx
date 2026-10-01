import React, { useState, useEffect } from 'react'
import SalesPage from '../../sales/salesPage';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { MdEditDocument } from "react-icons/md";
import {useParams} from 'react-router-dom';
export default function EditorderList({  onClose }){
  const [editMainData,setEditMainData]=useState()
  const [editSubData,setEditSubData]=useState([]) 
  const {soNo} = useParams();
  //console.log(soNo)
  // useEffect(() => {
  //   setEditSubData(soSub)
  //   setEditMainData(soMain)
  // },[soSub,soMain])

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleEdit = async () => {

    try {
      const res = await api.get(`/sales-entry-detail/${soNo}/`);
      const {trsomain,trsosub} = res.data;
      //console.log("trsosub",trsosub)
      // Transform trsomain to form format
      setEditMainData({
        ...trsomain,
        soDate:formatDate(trsomain.soDate),
        SoPreparedTime:formatDate(trsomain.SoPreparedTime),
        PaCode: trsomain.PaCode,
        PaName: trsomain.PaName,
        PaCreditTerms: trsomain.PaCreditTerms,
        soEmpNo:{label:trsomain.EmpName, value: trsomain.soEmpNo }
      });

      // Transform trsosub for your editable table
      const transformedSubItems = trsosub.map(item => ({
        prcode:item.PrCode,
        productName:item.PrName,
        packing:item.soSpecification,
        particular:item.soParticular,
        uom:item.soUOM,
        quantity:item.soQty,
        rate:item.soRate,
        discount:item.soDiscount,
        taxType:item.TaxType,
        taxAmount:item.soTaxAmt,
        //amount:item.soAmount,
        //subTotal:item.soTotalAmount,
        deliveryPref: item.SoDeliveryPreference,
        deliveryDate: item.SoDeliveryDate
      }))
      setEditSubData(transformedSubItems);
    } catch(err){
      console.error("Failed to fetch order data for editing:", err);
      toast.error("Unable to load sales order.");
    }
  };
useEffect(()=>{
         handleEdit()
},[])


  return (
    
         <>       

          <div className="max-w-full  overflow-hidden py-5 ">
            <SalesPage title='Edit Sales Order' 
            icon= {<MdEditDocument/>}
            editData={editSubData} 
            editMain={editMainData} 
        
            onClose={onClose} />
          </div>
          </>
  )
      
}
