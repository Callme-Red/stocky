import axios from "axios"
import { getCsrfToken } from "../../utils/function";

export const getCategoryExpense = () => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/expense-category/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getExpenses = (startDate: string, endDate: string) => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/expense-report/?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getExpenseById = (id: string) => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/expense/${id}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getExpenseMonthyReport = (year: number, month: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/expense-report-monthly/${year}/${month}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getExpenseYearReport = (year: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/expense-report-yearly/${year}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getCategoryExpenseReport = () => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/expense-category-report/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const createExpenseCategory = async (category: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_PURCHASE}/expense-category/`, category,
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

export const updateExpenseCategory = async (catetoryId: string, category: unknown) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_PURCHASE}/expense-category/${catetoryId}/`, category,
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
    const response = await axios.patch(`${import.meta.env.VITE_API_URL_PURCHASE}/expense-category/${categoryId}/`, category,
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

export const createExpense = async (expense: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_PURCHASE}/expense/`, expense,
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

export const deleteExpense = async (expenseId: string) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_URL_PURCHASE}/expense/${expenseId}/`,
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


export const updateExpense = async (IDExpense: string, expense: unknown) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_PURCHASE}/expense/${IDExpense}/`, expense,
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