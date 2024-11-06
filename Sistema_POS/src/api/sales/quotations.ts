import axios from "axios";
import { getCsrfToken } from "../../utils/function";

export const createQuotation = async (quotation: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_SALE}/quotation/`, quotation,
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

export const getQuotation = async () => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/quotation/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getQuotationByDates = async (startDate: string, endDate: string) => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/reports-quotation/?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getLastQuotationCode = async () => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/latest-quotation/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const updateQuotation = async (IDQuotation: string, quotation: unknown) => {
  try {
    const response = await axios.patch(`${import.meta.env.VITE_API_URL_SALE}/quotations/${IDQuotation}/update-state/`, quotation,
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