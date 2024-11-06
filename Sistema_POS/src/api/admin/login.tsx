import axios from "axios";
import { getCsrfToken } from "../../utils/function";

export const createUser = async (user: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_ADMIN}/register/`, user,
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

export const getUsers = async () => {
  return await axios.get(`${import.meta.env.VITE_API_URL_ADMIN}/users/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getUserLogin = async (user: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_ADMIN}/login/`, user,
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

export const changePassword = async (userId: string, user: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_ADMIN}/change-password/${userId}/`, user,
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

export const updateEmail = async (userId: string, user: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_ADMIN}/change-email/${userId}/`, user,
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

export const deleteUser = async (userId: string, user: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_ADMIN}/change-activate/${userId}/`, user,
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

export const updateUsername = async (userId: string, user: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_ADMIN}/change-username/${userId}/`, user,
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