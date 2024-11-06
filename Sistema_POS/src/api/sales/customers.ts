import axios from "axios";
import { getCsrfToken } from "../../utils/function";

export const getCustomers = () => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/client/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
};

export const getCustomerId = (IDCustomer: string) => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/client/${IDCustomer}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getMunicipalities = (IDMunicipality: string | number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/departments/${IDMunicipality}/municipalities/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getDepartments = () => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/department/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getPendingSales = (IDCustomer: string) => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/client/${IDCustomer}/pending-sales/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const createCustomer = async (customer: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_SALE}/client/`, customer,
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

export const updateCustomer = async (IDCustomer: string, customer: unknown) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_SALE}/client/${IDCustomer}/`, customer,
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

export const savePass = async (pass: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_SALE}/AccountsReceivable/`, pass,
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

export const updatePass = async (IDPass: string, pass: unknown) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_SALE}/AccountsReceivable/${IDPass}/`, pass,
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

export const deleteCustomer = async (IDCustomer: string, customer: unknown) => {
  try {
    const response = await axios.patch(`${import.meta.env.VITE_API_URL_SALE}/client/${IDCustomer}/`, customer,
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

export const getPendingAccounts = () => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/reports-credit-sales/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getSalesByCustomerMonth = (year: number, month: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/client-sales-report-monthly/${year}/${month}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getSalesByCustomerYear = (year: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/client-sales-report-yearly/${year}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
} 
