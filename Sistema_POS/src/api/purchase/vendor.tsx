import axios from "axios";
import { getCsrfToken } from "../../utils/function";

export const getVendors = () => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/suppliers/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getVendorId = (IDVendor: string) => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/suppliers/${IDVendor}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const createVendor = async (vendor: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_PURCHASE}/suppliers/`, vendor,
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

export const updateVendor = async (IDVendor: string, vendor: unknown) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_PURCHASE}/suppliers/${IDVendor}/`, vendor,
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

export const deleteVendor = async (IDVendor: string, vendor: unknown) => {
  try {
    const response = await axios.patch(`${import.meta.env.VITE_API_URL_PURCHASE}/suppliers/${IDVendor}/`, vendor,
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