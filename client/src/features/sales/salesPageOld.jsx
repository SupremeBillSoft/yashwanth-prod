import React, { useState, useEffect } from 'react'
import SalesEntryTable from './components/salesentrytable'
import { LuShoppingCart } from "react-icons/lu";
import { IoMdDocument } from "react-icons/io";
import Dropdown from '../../common/Dropdown/Dropdown';
import Input from '../../common/ui/input';
import DatePicker from '../../common/ui/datepicker';
import { toast } from 'react-toastify';
import axios from 'axios'
import api from '../../services/api'
import ConfirmationDialog from '../../common/Dialogues/submitDialogue'
import FlashMessage from '../../common/Dialogues/FlashMessage';
import { values } from 'lodash';
import { label } from 'framer-motion/client';

export default function SalesPage({editData,editMain,icon,title="Create Sales Order"}) {
  //console.log(editMain)
  const [tableKey, setTableKey] = useState(0);
  const [flash,setFlash]=useState(null)
  const [productItems, setProductItems] = useState([]);
  //const [dropdownData, setDropdownData] = useState([]);
  //const [selectedOption, setSelectedOption] = useState(null);
  const [paCodeOptions, setPaCodeOptions] = useState([])
  const [paTypes, setPaTypes] = useState([])
  const [paNamesOptions, setPanamesOptions] = useState([])
  const [paCreditTerms, setPacreditTerms] = useState([])
  const [soNumber, setSoNumber] = useState("")
  const [empName, setEmpName] = useState([])
  const [time,setTime] = useState("");
  const [date,setDate] = useState("")
  const [submiting,setSubmiting] = useState(false)
  const [confirmOpen,setConfirmOpen] = useState(false)
  const [allData,setAllData] = useState([])
  const [selectedPaCode,setSelectedPaCode] = useState(null)
  const [selectedPaType,setSelectedPaType] = useState(null)
  const [selectedPaName,setSelectedPaName] = useState(null)
  const [selectedEmpName,setSelectedEmpName] = useState(null)
  const [selectedPacredit,setSelectedPacredit] = useState(null)
  const [manualPaNameSelection,setManualPaNameSelection] = useState(false)
  const [editCheckDone, setEditCheckDone] = useState(false)
  const [editChecked,setEditChecked] = useState(false);
  const isEditMode = !!editMain;
  //console.log(date)
  console.log("productitems",productItems)
  //set current time

useEffect(()=>{
        setSelectedEmpName(editMain?.soEmpNo)
        setSelectedPaCode({label:editMain?.PaCode,value:editMain?.PaCode})
        setSelectedPaName({label:editMain?.PaName,value:editMain?.PaName})
         setSelectedPacredit({label:editMain?.PaCreditTerms,value:editMain?.PaCreditTerms})
        //setSelectedPaType()
},[editMain])


  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit",
        hour12: true, //set false for 24hour format
      });
      setTime(formattedTime);
    };

    updateTime(); // Call once on mount
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup
  }, [])

  useEffect(() => {
    let timer;
  
    if (editMain?.soDate) {
      // Edit mode: use the value from editMain
      setDate(editMain.soDate);
      setEditChecked(true);
    } else if (!editMain && !editChecked) {
      // Wait briefly to confirm it's create mode
      timer = setTimeout(() => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-GB"); // DD/MM/YYYY
        setDate(formattedDate);
        setEditChecked(true);
      }, 1000);
    }
  
    return () => clearTimeout(timer);
  }, [editMain, editChecked]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const[party,employee] = await  Promise.all([
          api.get("/party-list/"),
          api.get("/employee")
        ])
        const data = party.data.data
        const emp=employee.data.data
        //console.log(emp)
        //console.log(data)
        setAllData(data)

        const uniquePaTypes = [
          ...new Set(data.map((item) => item.PaType)),
        ].map((v)=>({label:v,value:v}))

        const uniquePaCodes = [
          ...new Set(data.map((item) => item.PaCode))
        ].map((code) =>({label:code,value:code}))

        const uniquePaNames = [
          ...new Set(data.map((item) => item.PaName)),
        ].map((name) => ({ label:name,value:name }));

        const uniquePacreditTerms = [
          ...new Set(data.map((item) => item.PaCreditTerms)),
        ].map((name) => ({ label: name, value: name }));


        // const uniqueEmpNames = [
        //   ...new Map(emp?.map(item => [item.EmpName, item])).values()
        // ].map(item => ({
        //   label: item.EmpName,
        //   value: item.EmpNo
        // }));

        const  uniqueEmpNames = emp?.map(item => ({
          label: item.EmpName,
          value: item.EmpNo
        }));

        setPaTypes(uniquePaTypes);
        setPaCodeOptions(uniquePaCodes)
        setPanamesOptions(uniquePaNames);
        setPacreditTerms(uniquePacreditTerms)
        if (uniquePacreditTerms.length === 1) {
          setSelectedPacredit(uniquePacreditTerms[0]);
        }
        setEmpName(uniqueEmpNames);

        //console.log(uniqueEmpNames)
        // const formattedCodes=data.map((item) => ({
        //   label: item.PaCode,  // visible text
        //   value: item.PaCode,  // internal value
        // }));

        //setPaCode(formattedCodes)

      } catch (error) {
        console.error("Failed to fetch dropdown data", error)
      }
    }


    fetchData()
  }, []);




  const fetchSONumber = async () => {
    try {
      const res = await api.get("/generate-so-number/");
      if (res.data.status) {
        setSoNumber(res.data.so_number);
      } else {
        console.error("Failed to fetch SO Number:", res.data.error)
      }
    } catch (error) {
      console.error("Error fetching SO Number:", error)
    }
  }

  useEffect(() => {
    let timer;
  
    // Case 1: Edit Mode — editMain has value
    if (editMain) {
      setSoNumber(editMain.soNo || "");
      setEditCheckDone(true);
    }
  
    // Case 2: Create Mode — editMain is still null/undefined
    else if (!editCheckDone) {
      // Wait 3 seconds instead of 1 to be safer
      timer = setTimeout(() => {
        if (!editMain) {
          fetchSONumber(); // only if editMain still empty
          setEditCheckDone(true);
        }
      }, 3000); // Delay gives time for editMain to arrive
    }
  
    return () => clearTimeout(timer);
  }, [editMain, editCheckDone]);

  const handlePaCodeChange = (code) => {
    setSelectedPaCode(code)
    setManualPaNameSelection(false) //let PaCode control again
  }





  useEffect(() => {
    const allUniqueNames = [...new Set(allData.map(item => item.PaName))];

    const mapped = selectedPaCode
      ? allData.filter(item => item.PaCode === selectedPaCode.value)
      : [];

    const mappedNames = mapped.map(item => item.PaName);

    const options = allUniqueNames.map(name => ({
      label: name,
      value: name,
      isMapped: mappedNames.includes(name),
    }));

    const sortedOptions = selectedPaCode
      ? options.sort((a, b) => (b.isMapped ? 1 : -1))
      : options;

    setPanamesOptions(sortedOptions);

    if (selectedPaCode && !manualPaNameSelection && mappedNames.length > 0) {
      setSelectedPaName({ label: mappedNames[0], value: mappedNames[0] });
    }
  }, [selectedPaCode, allData]);

  useEffect(() => {
    if (!selectedPaName) return;
    const match = allData.find(item => item.PaName === selectedPaName.value);
    if (match) {
      setSelectedPaCode({ label: match.PaCode, value: match.PaCode });
      setManualPaNameSelection(true);
    }
  }, [selectedPaName, allData]);



  const handleProductChangeAdd = (items) => {
    setProductItems(items)
    //console.log("Updated rows from child:", items);
  }


  const getFinancialYear = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };
  const currentYearCode = getFinancialYear(new Date());


  // const fieldNameToLabelMap = {
  //   soSpecification: "Particular",
  //   // soQuantity: "Quantity",
  //   // soRate: "Rate",
  //   // Add all relevant fields here
  // };
  // // const handleError = (error) => {
  //   const errors = error?.response?.data?.data?.errors;
  
  //   if (errors && typeof errors === "object") {
  //     Object.entries(errors).forEach(([field, messages]) => {
  //       const label = fieldNameToLabelMap[field] || field; // fallback to raw field name
  //       messages.forEach((msg) => {
  //         toast.error(`${label}: ${msg}`);
  //       });
  //     });
  //   } else {
  //     toast.error("Something went wrong.");
  //   }
  // };
  const handleSubmit = async () => {
    setSubmiting(true)
    try {
      if (!selectedPaCode || !selectedPaName || !selectedEmpName || productItems.length === 0) {
        alert("Please fill all required fields.");
        return;
      }
  
      const mainPayload = {
        soNo: soNumber,
        soYearCode: currentYearCode,
        PaCode: selectedPaCode.value,
        soDate: parseDDMMYYYY(date)?.toISOString(),
        soEmpNo: selectedEmpName.value,
        SoPreparedTime: new Date().toISOString(),
        PaCreditTerms: selectedPacredit?.value || "",
        // Add more fields as needed
      }
  
      const updatedProductItems = productItems.map((item) => ({
        ...item,
        SoNo: soNumber,
        soYearCode: currentYearCode,
      }));
  
      const payload = {
        trso_main: mainPayload,
        trso_sub: updatedProductItems
      };
     //console.log("payload",payload)
      let res;
  
      if (editMain) {
        //PUT request in edit mode
        res =await api.put(`/sales-entry-update/${soNumber}/`, payload);
      } else {
        
        res = await api.post("/sales-entry/", payload)
      }
  
      if (res.status === 200 || res.status === 201) {
        setFlash({
          type: "success",
          title: editMain ? "Order Updated" : "Order Submitted",
          message: editMain
            ? "Sales order has been successfully updated."
            : "Sales order has been successfully saved.",
        });
  
        setConfirmOpen(false);
        setSubmiting(false);
         if(editMain){
            window.location.href="/orderlist"
         }else{
          // Reset only in create mode
          setSelectedPaCode(null);
          setSelectedPaName(null);
          setSelectedPaType(null);
          setSelectedEmpName(null);
          setSelectedPacredit(null);
          setManualPaNameSelection(false);          
          setProductItems([]);
          setTableKey(prev => prev + 1);
          setDate(new Date().toLocaleDateString("en-GB"));
          setTime(new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }));
          fetchSONumber();
        }
  
      } else {
        setFlash({
          type: "error",
          title: "Error",
          message: "Please try again later.",
        });
      }
  
    } catch (err) {
      //handleError(err);
      setFlash({
        type: "error",
        title: "Error",
        message: "Something went wrong while submitting.",
      });
    } finally {
      setSubmiting(false);
      setConfirmOpen(false);
    }
  };

  function parseDDMMYYYY(dateStr) {
    if (!dateStr) return null;
    const[day,month,year]=dateStr.split("/");
    return new Date(+year,+month-1,+day); 
  }
  return (
    <>
      <div className='border-0 max-w-full mx-auto flex flex-col relative z-0'>
        <div className='bg-white py-2 h-9 border-b-1 border-gray-200 flex gap-x-2 items-center pl-3'>
          <span>{editMain?icon:<IoMdDocument/>}</span> <h1 className='font-bold text-xl'>{title}</h1>
        </div>

        <div className='flex  flex-col space-y-5 justify-between border-0 p-3  '>
          <div className='flex flex-col space-y-3 xl:space-y-10 pl-0'>
            <div className='grid grid-cols-1 sm:grid-cols-2  xl:grid-cols-[300px_300px_300px_300px] gap-y-3 sm:gap-x-3  lg:gap-x-5  '>
              <div className='flex   flex-col gap-x-2 w-full col-span-1'>
                <span className='text-sm font-semibold'>SO.NO</span>

                <Input placeholder='' value={soNumber} readOnly />

              </div>
              <div className='flex flex-col  gap-x-2 '>
                <span className='text-sm font-semibold'>S0.Date</span>
                <DatePicker  value={parseDDMMYYYY(editMain?.soDate)} />

                {/* <Input placeholder="Enter Date" value={date} readOnly /> */}
              </div>

              <div className='flex flex-col  gap-x-2 '>
                <span className='text-sm font-semibold'>Prepared Time</span>
                <Input placeholder="Enter  Time" value={time} readOnly />
              </div>
              <div className='flex  flex-col gap-x-2 '>
                <span className='text-sm font-semibold'>Sales Person Name</span>
                <Dropdown
                  value={selectedEmpName}
                  onChange={setSelectedEmpName}
                  options={empName}
                />
              </div>



            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[300px_620px_300px] gap-y-3 gap-x-3  xl:gap-x-5 '>
              <div className='flex  flex-col  '>
                <span className='text-sm font-semibold'>Customer Code</span>
                <Dropdown
                  value={selectedPaCode} onChange={handlePaCodeChange} options={paCodeOptions} />
              </div>
              <div className='flex  flex-col  '>
                <span className='text-sm font-semibold'>Customer Name</span>
                <Dropdown
                  value={selectedPaName}
                  onChange={setSelectedPaName}
                  options={paNamesOptions}

                />
                {/* <input placeholder='' className=' w-[500px] border-gray-500 border-1 rounded-md py-1'></input>  */}
              </div>

              <div className='flex  flex-col   '>
                <span className='text-sm font-semibold'>Payment Terms</span>
                <Dropdown
                  options={paCreditTerms}
                  value={selectedPacredit}
                  onChange={setSelectedPacredit}
                />
              </div>


            </div>
          </div>




        </div>
        <div className='mt-2 w-full  max-w-screen mx-auto'>
          <SalesEntryTable           
            editData={editData}
            onProductChange={handleProductChangeAdd}
            key={tableKey}
          />


        <div className='flex justify-center border-0  xl:justify-end p-5'>
          <button
            disabled={submiting}
            onClick={() => setConfirmOpen(true)}
            type="submit"
            className='bg-blue-500 hover:cursor-pointer disabled:opacity-20
           hover:bg-blue-700 text-white font-semibold  py-2 w-full  xl:max-w-28 text-center rounded-full '
          >
            Submit
          </button>
        </div>
        </div>

        
      </div>
      <ConfirmationDialog
        loading={submiting}
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
        buttonText="Submit"
        title="Confirm Submission"
        message="Are you sure you want to submit this Sales Order?"
      />

{flash&& (<FlashMessage type={flash.type}
    title={flash.title}
    message={flash.message}   
    buttonText="OK"  
    onClose={()=>setFlash(null)}
    onAction={()=>setFlash(null)}
    />
)}

    </>
  )
}
