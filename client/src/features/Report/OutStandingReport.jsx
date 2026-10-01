import React,{useEffect,useState} from 'react'
import { format } from 'date-fns';
import OrdervsInvoice from '../invoice/OrdervsInvoice'
import Dropdown from '../../common/Dropdown/Dropdown'
import api from '../../services/api'
import Input from '../../common/ui/input'
export default function OutStandingReport() {
    const[empName,setEmpName]=useState([])
    const[soNo,setSono]=useState("")
    const[cusName,setCusName]=useState([])
    const [prName ,setPrName]=useState([])
    const [date,setDate]=useState("")
    const[selectedEmpName,setSelectedEmpName]=useState(null)
    const[selectedCusName,setSelectedCusName]=useState(null)
    const[selectedPrName,setSelectedPrName]=useState(null)
    const[sodate,setSoDate]=useState(null)
    const[fromdate,setFromDate]=useState(null)
    const[todate,setToDate]=useState(null)
    const[formatedData,setFormatedData]=useState([])
    const[soMain,setSoMain] = useState(null) //for EmpName&PaName section
    const[loading,setLoading]=useState(false)
    const[error,setError]=useState("")
    const[soSub,setSoSub]=useState([])  
    console.log(cusName)

    //const formatted = format(new Date(sodate), "dd-MM-yyyy");
    //console.log(selectedCusName)
    useEffect(() => {
        
        const fetchData = async () => {
          try {
            
            const [res ,res2 ,res3] = await  Promise.all([
              api.get("/employee/"),
              api.get("/active-products/"),
              api.get("/party-list/")
            ]
            ) 
            const data = res?.data?.data||[]
            const products=res2?.data?.data||[]
            const  customer=res3?.data?.data||[]
            //console.log(data)
            //console.log(customer)
            //setAllData(data)
    
            // const uniquePaTypes = [
            //   ...new Set(data.map((item) => item.PaType)),
            // ].map((v) => ({ label: v, value: v }))
    
            // const uniquePaCodes = [
            //    ...new Set(data.map((item) => item.PaCode))
            //  ].map((code) => ({ label: code, value: code }))
    
            //  const uniquePaNames = [
            //    ...new Map(
            //     data.map(item => [item.PaCode, { label: item.PaName, value: item.PaCode }])
            //   ).values()]
    
                   
              const paOptions = customer.map(item => ({
                label:item.PaName,
                value:item.PaCode
              }));
            // const uniqueEmpNames = [
            //   ...new Map(data.map(item=>[item.EmpName,item])).values()
            // ].map(item =>({
            //   label:item.EmpName,
            //   value:item.EmpNo
            // }))

            const empDropdown = data.map(item => ({
              label: item.EmpName,
              value: item.EmpNo
            }));
            
            setEmpName(empDropdown)
            setCusName(paOptions)
         

            const productOptions = products.map(product => ({
              label:`${product.PrName} (${product.PrCode})`,
              value: product.PrCode
            }));
      
            setPrName(productOptions);
      
            // setPaTypes(uniquePaTypes);
            // setPaCodeOptions(uniquePaCodes)
            // setPanamesOptions(uniquePaNames);
           
           
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
      }, [])


      const filterData=async()=>{
            setSoMain(null)
            setSoSub([])
            setLoading(true)
            setError("")
            //setSelectedEmpName(null)


            const params={}
            if (selectedEmpName)params.empno=selectedEmpName?.value||selectedEmpName;
            if(selectedCusName)params.pacode=selectedCusName?.value||"";
            if(soNo)params.sono=soNo||""
            if(prName)params.prcode=selectedPrName?.value||""
            if(sodate)params.so_date=sodate||""

             //console.log(params)
                try{
                         const res =await api.get("/filter-invoice-order/",{
                            params
                               // empno:selectedEmpName?.value|| selectedEmpName
                             
                         })
                             //console.log(res.data)
                
                                const formatResData=res?.data.data.map(main => {
                                    return {
                                      EmpName: main.EmpName,
                                      PaName: main.PaName,
                                      soEmpNo: main.soEmpNo,
                                      soNo: main.soNo,
                                      soDate: main.soDate,
                                      items: main.trso_sub.map(sub => ({
                                        soNo: sub.SoNo,
                                        PrName: sub.PrName,
                                        soQty: sub.soQty,
                                        soDate: main.soDate, 
                                      })),
                                    };
                                  });
                              
                                  setFormatedData(formatResData)

                                  if (formatResData.length > 0) {
                                    setSoMain({
                                      EmpName:formatResData[0].EmpName,
                                      PaName:formatResData[0].PaName
                                    });
                              
                                    // Flatten all sub-items
                                    const allItems = formatResData.flatMap(order => order.items);
                                    setSoSub(allItems);
                                  }                             
                           

                }catch(error){
                         //console.log(error)
                         setError('No data found for this combination.')
                       
                }finally{
                  setLoading(false)
                }
                
      }

      // useEffect(()=>{
      //     filterData()
      // },[selectedEmpName])



    //   if (loading) {
    //     return (
    //       <div className="flex justify-center items-center h-64">
    //         <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" />
    //       </div>
    //     );
    //   }
    // if(error){
    //     return(
    //       <div className="text-center text-red-500 font-semibold py-4">
    //            {error}
    //       </div>
    //     )

    //   }

  return (
    <div className='flex flex-col max-w-6xl mx-auto'>
         
         <div className='border-0 h-full flex gap-x-2  space-y-2'>            
               
               
               <div className=' w-full max-w-sm'>
                <label>Sales Rep Name</label>
                   <Dropdown options={empName}   value={selectedEmpName}
                  onChange={setSelectedEmpName}/>
               </div>
{/* 
               <div className=' w-full max-w-sm'>
                <label>Customer Name</label>
                   <Dropdown options={cusName}   value={selectedCusName}
                  onChange={setSelectedCusName }/>
               </div>

               <div className=' w-full max-w-sm'>
                <label>Product Name</label>
                   <Dropdown options={prName}   value={selectedPrName}
                  onChange={setSelectedPrName}/>
               </div>           
            
         </div>

         <div className=' flex gap-x-2  items-center-safe'>
                         <div className='w-full max-w-sm'>
                       <label>So.No</label> 
                       <Input placeholder="Enter So No"  value={soNo} onChange={(e)=>{setSono(e.target.value)}} type="text"/>
                       </div> */}

                       <div className='w-full max-w-sm'>
                       <label>From Date</label>
                       <Input placeholder="Enter From Date"  type="date" value={fromdate} onChange={(e)=>setFromDate(e.target.value)}/>
                       </div>

<div className='w-full max-w-sm'>
                       <label>To Date</label>
                       <Input placeholder="Enter To Date"  type="date" value={todate} onChange={(e)=>setToDate(e.target.value)}/>
                       </div>

                       <div className='mt-7'>
                        <button
                        onClick={filterData}
                        type="submit"
                         className='bg-blue-500  text-white rounded-full cursor-pointer px-2 py-1'>
                                  Search
                        </button>
                       </div>
         </div>
         <div>
               
          
              <OutStandingReport 
              loading={loading}
              error={error}      
              soMain={soMain} soSub={soSub}/>
        

         </div>
    </div>
  )
}
