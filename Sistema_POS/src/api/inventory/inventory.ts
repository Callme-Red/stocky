import axios from "axios";
import { getCsrfToken } from "../../utils/function";

export const updateInventory = async (inventory: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_INVENTORY}/inventory/`, inventory,
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

export const createAdjustmentInventory = async (adjustment: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_INVENTORY}/inventory-adjustment/`, adjustment,
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

export const getKardexByProductId = (IDProduct: string) => {
  return axios.get(`${import.meta.env.VITE_API_URL_INVENTORY}/kardex/${IDProduct}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getKardexByDate = (IDProduct: string, startDate: string, endDate: string) => {
  return axios.get(`${import.meta.env.VITE_API_URL_INVENTORY}/kardex/${IDProduct}/?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getInventoryMoney = async () => {
  return await axios.get(`${import.meta.env.VITE_API_URL_INVENTORY}/inventory-report/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

