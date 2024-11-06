import axios from "axios";
import { getCsrfToken } from "../../utils/function";

axios.defaults.headers.common['Authorization'] = import.meta.env.VITE_API_KEY;

export const createSale = async (sales: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_SALE}/sale/`, sales,
      {
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { success: false, error: error.response?.data };
    } else {
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

export const updateSale = async (sales: unknown, saleId: string) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_SALE}/sale/${saleId}/`, sales,
      {
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { success: false, error: error.response?.data };
    } else {
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

export const updateProductDetailsSale = async (IDDetailsSale: string, product: unknown) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_SALE}/saleDetail/${IDDetailsSale}/`, product,
      {
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { success: false, error: error.response?.data };
    } else {
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

export const deleteSale = async (saleId: string) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_URL_SALE}/sale/${saleId}/`,
      {
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { success: false, error: error.response?.data };
    } else {
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

export const deleteProductDetailsSale = async (IDDetailsSale: string) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_URL_SALE}/saleDetail/${IDDetailsSale}/`,
      {
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { success: false, error: error.response?.data };
    } else {
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

export const createProductDetailsSale = async (product: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_SALE}/saleDetail/`, product,
      {
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { success: false, error: error.response?.data };
    } else {
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

export const getSales = async () => {
  return await axios.get(`${import.meta.env.VITE_API_URL_SALE}/sale/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getSaleById = async (saleId: string) => {
  return await axios.get(`${import.meta.env.VITE_API_URL_SALE}/sale/${saleId}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getSalesByDates = async (startDate?: string, endDate?: string, voucher?: boolean, letterhead?: boolean) => {
  let url = `${import.meta.env.VITE_API_URL_SALE}/report/`;
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}&voucher=${voucher}&membretado=${letterhead}`;
  }
  return await axios.get(url,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getSalesByMonth = async (year: number, month: number, voucher: boolean, letterhead: boolean) => {
  return await axios.get(`${import.meta.env.VITE_API_URL_SALE}/report-month/${year}/${month}/?voucher=${voucher}&membretado=${letterhead}`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getSalesByMonthReport = async () => {
  return await axios.get(`${import.meta.env.VITE_API_URL_SALE}/daily-report/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getSalesByYear = async (year: number, voucher: boolean, letterhead: boolean) => {
  return await axios.get(`${import.meta.env.VITE_API_URL_SALE}/report-annual/${year}/?voucher=${voucher}&membretado=${letterhead}`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getLastCodeSales = async () => {
  return await axios.get(`${import.meta.env.VITE_API_URL_SALE}/sales/latest-code/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getHistoryPaymentSalesCredit = async (salesId: string) => {
  return await axios.get(`${import.meta.env.VITE_API_URL_SALE}/accounts-receivable-report/${salesId}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getBalanceSalesCredit = async (salesId: string) => {
  return await axios.get(`${import.meta.env.VITE_API_URL_SALE}/latest-balance-report/${salesId}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    })
}

export const getLastPaymentCode = async () => {
  return await axios.get(`${import.meta.env.VITE_API_URL_SALE}/latest-payment-code`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}
