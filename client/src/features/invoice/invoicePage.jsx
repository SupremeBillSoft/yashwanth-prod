import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
//import InvoiceTemplate from './invoiceTemp';
//import api from '../../services/api';
//import { toast } from 'react-toastify';
import InvoiceWrapper from './InvoiceWrapper';


export default function InvoicePage() {
  const {soNo}=useParams()


  return (
    <div>
         <InvoiceWrapper soNo={soNo} />
    </div>
  
  );
}
