import axios from "axios";
import { getCsrfToken } from "../../utils/function";

export const createPurchase = async (purchase: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_PURCHASE}/purchases/`, purchase,
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

export const deletePurchase = async (purchaseId: string) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_URL_PURCHASE}/purchases/${purchaseId}/`,
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

export const updateProductDetailsPurchase = async (IDDetailsPurchase: string, product: unknown) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_PURCHASE}/purchases-details/${IDDetailsPurchase}/`, product,
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

export const deleteProductDetailsPurchase = async (IDDetailsPurchase: string) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_URL_PURCHASE}/purchases-details/${IDDetailsPurchase}/`,
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

export const createProductDetailsPurchase = async (product: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_PURCHASE}/purchases-details/`, product,
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

export const updatePurchase = async (IDPurchase: string, purchase: unknown) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_PURCHASE}/purchases/${IDPurchase}/`, purchase,
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

export const getPurchases = async () => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/purchases/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getPurchasesId = async (IDPurchase: string) => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/purchases/${IDPurchase}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getPurchaseByDate = async (startDate?: string, endDate?: string) => {
  let url = `${import.meta.env.VITE_API_URL_PURCHASE}/report/`

  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  }
  return await axios.get(url,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}