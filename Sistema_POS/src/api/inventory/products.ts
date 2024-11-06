import axios from "axios";
import { getCsrfToken } from "../../utils/function";

export const getProducts = () => {
  return axios.get(`${import.meta.env.VITE_API_URL_INVENTORY}/products/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}

export const getProductID = (IDProduct: string) => {
  return axios.get(`${import.meta.env.VITE_API_URL_INVENTORY}/products/${IDProduct}`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getTopProducts = () => {
  return axios.get(`${import.meta.env.VITE_API_URL_INVENTORY}/top-products-sales/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getProductByCode = async (code: string) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL_INVENTORY}/product-code/${code}`,
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

export const getBestSellingProductsMonth = (year: number, month: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/product-sales-report-monthly/${year}/${month}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getBestSellingProductsYear = (year: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/product-sales-report-yearly/${year}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getBestBuyingProductsMonth = (year: number, month: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/product-purchases-report-monthly/${year}/${month}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getBestBuyingProductsYear = (year: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/product-purchases-report-yearly/${year}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getBestSellingCategoryProducts = (year: number, month: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/product-sales-category-report-monthly/${year}/${month}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getBestSellingCategoryProductsYear = (year: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_SALE}/product-sales-category-report-yearly/${year}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getBestBuyingCategoryProductsMonth = (year: number, month: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/product-category-purchases-report-monthly/${year}/${month}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const getBestBuyingCategoryProductsYear = (year: number) => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/product-category-purchases-report-yearly/${year}/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  );
}

export const updateProduct = async (IDProduct: string, product: unknown) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL_INVENTORY}/products/${IDProduct}/`, product,
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

export const createProduct = async (product: unknown) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL_INVENTORY}/products/`, product,
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

export const deleteProduct = async (IDProduct: string, product: unknown) => {
  try {
    const response = await axios.patch(`${import.meta.env.VITE_API_URL_INVENTORY}/products/${IDProduct}/`, product,
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