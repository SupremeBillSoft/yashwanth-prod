import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SalesEntryTable from './components/salesentrytable';
import { IoMdDocument } from "react-icons/io";
import Dropdown from '../../common/Dropdown/Dropdown';
import Input from '../../common/ui/input';
import DatePicker from '../../common/ui/datepicker';
import api from '../../services/api';
import ConfirmationDialog from '../../common/Dialogues/submitDialogue';
import FlashMessage from '../../common/Dialogues/FlashMessage';
import WarnMsg from '../../common/Dialogues/warnMsg';


//Custom CSS for unique design elements
// const styles = `
//   .sales-page-container {
//     background: linear-gradient(145deg, #e5e7eb 0%, #d1d5db 100%);
//     min-height: 100vh;
//     padding: 2rem;
//     border-radius: 16px;
//   }

//   .header {
//     background: linear-gradient(90deg, #2dd4bf 0%, #a78bfa 100%);
//     border-radius: 12px;
//     padding: 1.25rem 1.75rem;
//     display: flex;
//     align-items: center;
//     gap: 1rem;
//     box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
//   }

//   .header-icon {
//     color: #ffffff;
//     font-size: 1.75rem;
//     transition: transform 0.3s ease;
//   }

//   .header-icon:hover {
//     transform: scale(1.2);
//   }

//   .header-title {
//     font-size: 1.75rem;
//     font-weight: 700;
//     color: #ffffff;
//     text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//   }

//   .form-section {
//     margin-top: 2.5rem;
//     display: flex;
//     flex-direction: column;
//     gap: 2.5rem;
//   }

//   .form-grid {
//     display: grid;
//     grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//     gap: 1.75rem;
//   }

//   .form-group {
//     display: flex;
//     flex-direction: column;
//     gap: 0.75rem;
//     position: relative;
//   }

//   .form-label {
//     font-size: 0.9rem;
//     font-weight: 600;
//     color: #4b5563;
//     letter-spacing: 0.03em;
//     transition: color 0.3s ease;
//   }

//   .form-group:hover .form-label {
//     color: #fb7185;
//   }

//   .input-container {
//     position: relative;
//     transition: all 0.3s ease;
//     border: 2px solid transparent;
//     border-radius: 8px;
//     background: #ffffff;
//     padding: 0.25rem;
//   }

//   .input-container:hover {
//     border-color: #2dd4bf;
//     transform: translateY(-3px);
//     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//   }

//   .submit-button {
//     background: linear-gradient(90deg, #fb7185 0%, #a78bfa 100%);
//     color: #ffffff;
//     font-weight: 600;
//     padding: 0.75rem 2.5rem;
//     border-radius: 9999px;
//     transition: all 0.3s ease;
//     width: 100%;
//     max-width: 9rem;
//     text-align: center;
//     border: none;
//   }

//   .submit-button:hover:not(:disabled) {
//     background: linear-gradient(90deg, #f43f5e 0%, #8b5cf6 100%);
//     transform: translateY(-3px);
//     box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
//   }

//   .submit-button:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }

//   .table-container {
//     background: #ffffff;
//     border-radius: 12px;
//     box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
//     padding: 2rem;
//     margin-top: 2.5rem;
//     border: 1px solid #e5e7eb;
//   }

//   @media (max-width: 640px) {
//     .form-grid {
//       grid-template-columns: 1fr;
//     }

//     .sales-page-container {
//       padding: 1rem;
//     }

//     .header-title {
//       font-size: 1.5rem;
//     }
//   }
// `;

const styles = `
  .sales-page-container {
    background: var(--bg-page);
    min-height: 100vh;
    padding: 1rem;
    font-size: 0.85rem;
  }
  .header {
    background: var(--header-bg);
    border: var(--header-border);
    border-radius: var(--radius);
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    box-shadow: var(--shadow);
  }
  .header-icon { color: var(--header-icon); font-size: 1.15rem; display: flex; }
  .header-title { font-size: 1.05rem; font-weight: 600; color: var(--header-text); margin: 0; }
  .form-section {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.85rem 1rem;
    box-shadow: var(--shadow);
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.6rem 0.85rem;
  }
  .form-group { display: flex; flex-direction: column; gap: 0.15rem; }
  .form-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .input-container {
    border: 1px solid var(--input-border);
    border-radius: var(--radius);
    background: var(--surface);
    padding: 0.1rem;
    font-size: 0.85rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input-container:hover { border-color: var(--accent); }
  .input-container:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-ring);
  }
  .input-container input,
  .input-container select { font-size: 0.85rem; }
  .submit-button {
    background: var(--accent);
    color: #ffffff;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.45rem 1.5rem;
    border-radius: var(--radius);
    width: 100%;
    max-width: 8rem;
    border: none;
    transition: background 0.2s;
  }
  .submit-button:hover:not(:disabled) { background: var(--accent-hover); }
  .submit-button:disabled { opacity: 0.6; cursor: not-allowed; }
  .table-container {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.85rem 1rem;
    margin-top: 0.75rem;
    box-shadow: var(--shadow);
  }
  @media (max-width: 640px) {
    .sales-page-container { padding: 0.5rem; }
    .form-grid { grid-template-columns: 1fr; }
  }
`;
export default function SalesPage(props) {
  const { soNo, yearCode } = useParams();
  return <SalesPageForm key={`${soNo ?? 'new'}-${yearCode ?? ''}`} {...props} />;
}

// Your existing component, only the name changes (remove "export default")
function SalesPageForm({ icon, title }) {
  const { soNo, yearCode: yearCodeParam } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!soNo && !!yearCodeParam;
  const [editMain, setEditMain] = useState(null);
  const [editData, setEditData] = useState(undefined);
  const [loadingEdit, setLoadingEdit] = useState(isEditMode);
  const [tableKey, setTableKey] = useState(0);
  const [flash, setFlash] = useState(null);
  const [productItems, setProductItems] = useState([]);
  const [paCodeOptions, setPaCodeOptions] = useState([]);
  const [paNamesOptions, setPanamesOptions] = useState([]);
  const [soNumber, setSoNumber] = useState("");
  const [empName, setEmpName] = useState([]);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [submiting, setSubmiting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [allData, setAllData] = useState([]);
  const [selectedPaCode, setSelectedPaCode] = useState(null);
  const [selectedPaName, setSelectedPaName] = useState(null);
  const [selectedEmpName, setSelectedEmpName] = useState(null);
  const [manualPaNameSelection, setManualPaNameSelection] = useState(false);
  const [dateInitDone, setDateInitDone] = useState(false);
  const [yearCode, setYearCode] = useState(null);
  const [paCredit, setPaCredit] = useState("");
  const [isWarning, setIswarning] = useState(false);

  const toLocalDateTimeString = (d) => {
  if (!d) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`;
  };

  // ---- Helpers ----
  function parseDDMMYYYY(dateStr) {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("/");
    return new Date(+year, +month - 1, +day);
  }

  const formatDate = (d) => {
    const x = new Date(d);
    return `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}/${x.getFullYear()}`;
  };

  const getFinancialYearCode = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const fyStart = month >= 4 ? year % 100 : (year - 1) % 100;
    const fyEnd = month >= 4 ? (year + 1) % 100 : year % 100;
    return `${fyStart}${fyEnd}`;
  };

  const fetchSONumber = async (forDate) => {
    const yc = getFinancialYearCode(forDate || new Date());
    try {
      const response = await api.get("/generate-so-number/", { params: { SoYearCode: yc } });
      const nextNo = response.data?.nextSoNo;
      if (nextNo !== undefined) setSoNumber(nextNo.toString());
    } catch (err) {
      console.error("Failed to fetch next SO Number", err);
    }
  };

  // ---- Effects ----

  // Load the order when editing
  useEffect(() => {
    if (!isEditMode) return;
    const loadOrder = async () => {
      try {
        const res = await api.get(`/sales-entry-detail/${soNo}/`, {
          params: { SoYearCode: yearCodeParam },
        });
        const { trsomain, trsosub } = res.data;

        setEditMain({ ...trsomain, soDate: formatDate(trsomain.soDate) });
        setEditData(
          trsosub.map((item) => {
            const qty = Number(item.soQty || 0);
            const rate = Number(item.soRate || 0);
            const discountPct = Number(item.soDiscount || 0);
            const taxAmt = Number(item.soTaxAmt || 0);

            const base = qty * rate;
            const amount = +(base - (base * discountPct) / 100).toFixed(2);  // after discount, before tax
            const totalAmount = +(amount + taxAmt).toFixed(2);               // including tax

            return {
              prcode: item.PrCode,
              productName: item.PrName,
              packing: item.soSpecification,
              particular: item.soParticular,
              uom: item.soUOM,
              quantity: item.soQty,
              rate: item.soRate,
              discount: item.soDiscount,
              taxType: item.TaxType,
              taxAmount: item.soTaxAmt,
              amount,
              subTotal: totalAmount,
              totalAmount,
              deliveryPref: item.SoDeliveryPreference,
              deliveryDate: item.SoDeliveryDate,
            };
          })
        );
      } catch (err) {
        console.error(err);
        setFlash({ type: "error", title: "Error", message: "Could not load the order." });
      } finally {
        setLoadingEdit(false);
      }
    };
    loadOrder();
  }, [soNo, yearCodeParam]);

  // Pre-fill customer, terms (edit mode only)
  useEffect(() => {
    if (!editMain) return;
    setSelectedPaCode({ label: editMain.PaCode, value: editMain.PaCode });
    setSelectedPaName({ label: editMain.PaName, value: editMain.PaName });
    setManualPaNameSelection(true);
    setPaCredit(editMain.PaCreditTerms || "");
  }, [editMain]);

  // Pre-fill employee once options are loaded
  useEffect(() => {
    if (!editMain || empName.length === 0) return;
    setSelectedEmpName(empName.find((e) => e.value === editMain.soEmpNo) || null);
  }, [editMain, empName]);

  // Employee + customer conflict warning (create mode only)
  useEffect(() => {
    const handleCheckEmpCus = async () => {
      try {
        const res = await api.get(
          `cus-emp-check/?empno=${selectedEmpName.value}&pacode=${selectedPaCode.value}`
        );
        if (res.data.warning) setIswarning(true);
      } catch (err) {
        console.log(err.response?.data);
      }
    };
    if (!isEditMode && selectedEmpName?.value && selectedPaCode?.value) {
      handleCheckEmpCus();
    }
  }, [selectedEmpName, selectedPaCode]);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // SO Date: from the order when editing, otherwise today
  useEffect(() => {
    if (editMain?.soDate) {
      setDate(editMain.soDate);
      setDateInitDone(true);
    } else if (!isEditMode && !dateInitDone) {
      setDate(new Date().toLocaleDateString("en-GB"));
      setDateInitDone(true);
    }
  }, [editMain, isEditMode, dateInitDone]);

  // SO Number: keep the order's own number when editing, otherwise fetch the next one
  useEffect(() => {
    if (isEditMode) {
      if (editMain) setSoNumber(String(editMain.soNo));
      return;
    }
    if (date) fetchSONumber(parseDDMMYYYY(date));
  }, [date, editMain, isEditMode]);

  // Year code: the order's own year when editing, otherwise the current one
  useEffect(() => {
    setYearCode(isEditMode ? yearCodeParam : getFinancialYearCode());
  }, [isEditMode, yearCodeParam]);

  // Dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [party, employee] = await Promise.all([
          api.get("/party-list/"),
          api.get("/employee/"),
        ]);
        const data = party.data.data;
        const emp = employee.data.data;
        setAllData(data);
        setPaCodeOptions([...new Set(data.map((i) => i.PaCode))].map((c) => ({ label: c, value: c })));
        setPanamesOptions([...new Set(data.map((i) => i.PaName))].map((n) => ({ label: n, value: n })));
        setEmpName(emp?.map((i) => ({ label: i.EmpName, value: i.EmpNo })) || []);
      } catch (error) {
        console.error("Failed to fetch dropdown data", error);
      }
    };
    fetchData();
  }, []);

  const handlePaCodeChange = (code) => {
    setSelectedPaCode(code);
    setManualPaNameSelection(false);
  };

  useEffect(() => {
    const allUniqueNames = [...new Set(allData.map((item) => item.PaName))];
    const mapped = selectedPaCode
      ? allData.filter((item) => item.PaCode === selectedPaCode.value)
      : [];
    const mappedNames = mapped.map((item) => item.PaName);

    const options = allUniqueNames.map((name) => ({
      label: name,
      value: name,
      isMapped: mappedNames.includes(name),
    }));
    setPanamesOptions(
      selectedPaCode ? options.sort((a, b) => (b.isMapped ? 1 : -1)) : options
    );

    if (selectedPaCode && !manualPaNameSelection && mappedNames.length > 0) {
      setSelectedPaName({ label: mappedNames[0], value: mappedNames[0] });
    }
  }, [selectedPaCode, allData]);

  useEffect(() => {
    if (!selectedPaName) return;
    const match = allData.find((item) => item.PaName === selectedPaName.value);
    if (match) {
      setSelectedPaCode({ label: match.PaCode, value: match.PaCode });
      setManualPaNameSelection(true);
    }
  }, [selectedPaName, allData]);

  const handleProductChangeAdd = (items) => setProductItems(items);

  const handleSubmit = async () => {
    setSubmiting(true);
    try {
      const missing = [];
      if (!selectedPaCode) missing.push("Customer Code");
      if (!selectedPaName) missing.push("Customer Name");
      if (!selectedEmpName) missing.push("Sales Person Name");
      if (productItems.length === 0) missing.push("at least one product item");

      if (missing.length > 0) {
        alert(`Please fill the following required field(s): ${missing.join(", ")}`);
        return;
      }
      

      const mainPayload = {
        soNo: soNumber,
        soYearCode: yearCode,
        PaCode: selectedPaCode.value,        
        soDate: toLocalDateTimeString(parseDDMMYYYY(date)),
        soEmpNo: selectedEmpName.value,
        SoPreparedTime: new Date().toISOString(),
        PaCreditTerms: paCredit,
      };

      const updatedProductItems = productItems.map((item) => ({
        ...item,
        SoNo: soNumber,
        soYearCode: yearCode,
      }));

      const payload = { trso_main: mainPayload, trso_sub: updatedProductItems };

      const res = isEditMode
        ? await api.put(`/sales-entry-update/${soNumber}/${yearCode}/`, payload)
        : await api.post("/sales-entry/", payload);

      if (res.status === 200 || res.status === 201) {
        setFlash({
          type: "success",
          title: isEditMode ? "Order Updated" : "Order Submitted",
          message: isEditMode
            ? "Sales order has been successfully updated."
            : "Sales order has been successfully saved.",
        });

        if (isEditMode) {
          navigate("/MenuLayout/orderlist");
        } else {
          setSelectedPaCode(null);
          setSelectedPaName(null);
          setSelectedEmpName(null);
          setManualPaNameSelection(false);
          setPaCredit("");
          setProductItems([]);
          setTableKey((prev) => prev + 1);

          const todayStr = new Date().toLocaleDateString("en-GB");
          setDate(todayStr);
          // Call directly: if the date didn't change, the effect won't re-fire
          fetchSONumber(parseDDMMYYYY(todayStr));
        }
      } else {
        setFlash({ type: "error", title: "Error", message: "Please try again later." });
      }
    } catch (err) {
      console.log("SERVER ERROR:", err.response?.data);
      setFlash({ type: "error", title: "Error", message: "Something went wrong while submitting." }); 
    } finally {
      setSubmiting(false);
      setConfirmOpen(false);
    }
  };

  // Must stay AFTER all hooks
  if (loadingEdit) return <div className="p-6">Loading order...</div>;

//   return (
//     <>
//       <style>{styles}</style>
//       <div className="sales-page-container">
//         <div className="header">
//           <span className="header-icon">{icon || <IoMdDocument />}</span>
//           <h1 className="header-title">
//             {title ?? (isEditMode ? "Edit Sales Order" : "Create Sales Order")}
//           </h1>
//         </div>

//         {/* ...the rest of your JSX stays exactly the same... */}
//       </div>
//       {/* ...ConfirmationDialog, FlashMessage, WarnMsg unchanged... */}
//     </>
//   );
// }
  return (
    <>
      <style>{styles}</style>
      <div className="sales-page-container">
        <div className="header">          
           <span className="header-icon">{icon || <IoMdDocument />}</span>
          <h1 className="header-title">
            {title ?? (isEditMode ? "Edit Sales Order" : "Create Sales Order")}
          </h1>
        </div>

        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <span className="form-label">SO.NO</span>
              <div className="input-container">
                <Input placeholder="SO Number" value={soNumber} readOnly />
              </div>
            </div>
            <div className="form-group">
              <span className="form-label">SO Date</span>
              <div className="input-container">
                <DatePicker
                  value={parseDDMMYYYY(date)}
                  onChange={(newDate) =>
                    setDate(newDate.toLocaleDateString("en-GB"))
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <span className="form-label">Prepared Time</span>
              <div className="input-container">
                <Input placeholder="Enter Time" value={time} readOnly />
              </div>
            </div>
            <div className="form-group">
              <span className="form-label">Sales Person Name</span>
              <div className="input-container">
                <Dropdown
                  value={selectedEmpName}
                  onChange={setSelectedEmpName}
                  options={empName}
                />
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <span className="form-label">Customer Code</span>
              <div className="input-container">
                <Dropdown
                  value={selectedPaCode}
                  onChange={handlePaCodeChange}
                  options={paCodeOptions}
                />
              </div>
            </div>
            <div className="form-group">
              <span className="form-label">Customer Name</span>
              <div className="input-container">
                <Dropdown
                  value={selectedPaName}
                  onChange={setSelectedPaName}
                  options={paNamesOptions}
                />
              </div>
            </div>
            <div className="form-group">
              <span className="form-label">Payment Terms</span>
              <div className="input-container">
                <input
                  value={paCredit}
                  onChange={(e) => setPaCredit(e.target.value)}
                  className="py-1 pl-1 rounded-md outline-0 border-1 border-gray-300 w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="table-container">
          <SalesEntryTable
  pacode={selectedPaCode}
  editData={isEditMode ? editData : undefined}
  onProductChange={handleProductChangeAdd}
  key={tableKey}

          />
          <div className="flex justify-center xl:justify-end p-5">
            <button
              disabled={submiting}
              onClick={() => setConfirmOpen(true)}
              className="submit-button"
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

      {flash && (
        <FlashMessage
          type={flash.type}
          title={flash.title}
          message={flash.message}
          buttonText="OK"
          onClose={() => setFlash(null)}
          onAction={() => setFlash(null)}
        />
      )}

      <WarnMsg open={isWarning} onClose={() => setIswarning(false)} />
    </>
  );
}
