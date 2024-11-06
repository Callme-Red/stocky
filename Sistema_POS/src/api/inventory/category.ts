import axios from "axios";
import { getCsrfToken } from "../../utils/function";

export const getCategorys = () => {
  return axios.get(`${import.meta.env.VITE_API_URL_INVENTORY}/category/`)
}

export const createCategory = async (category: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_INVENTORY}/category/`, category,
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

export const updateCategory = async (categoryId: string, category: unknown) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_INVENTORY}/category/${categoryId}/`, category,
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

export const deleteCategory = async (categoryId: string, category: unknown) => {
  try {
    const response = await axios.patch(`${import.meta.env.VITE_API_URL_INVENTORY}/category/${categoryId}/`, category,
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