import axios from "axios";
import { getCsrfToken } from "../../utils/function";

export const getPaymentMethod = () => {
  return axios.get(`${import.meta.env.VITE_API_URL_PURCHASE}/PaymentMethod/`,
    {
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    }
  )
}
