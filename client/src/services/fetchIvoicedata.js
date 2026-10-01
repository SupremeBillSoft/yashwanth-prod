import api from "./api";

export const fetchInvoiceData = async (soNo) => {
    try {
      const [mainRes, companyRes] = await Promise.all([
        api.get(`sales-entry-detail/${soNo}/`),
        api.get('company-info/'),
      ]);
  
      return {
        mainData: mainRes.data.trsomain,
        subItems: mainRes.data.trsosub,
        companyInfo: companyRes.data,
        error: null
      };
    } catch (error) {
      console.error("Failed to fetch invoice data:", error);
      return {
        mainData: null,
        subItems: [],
        companyInfo: null,
        error
      };
    }
  };