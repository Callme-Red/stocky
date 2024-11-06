import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@fontsource-variable/montserrat';
import './index.css'
import axios from 'axios';

axios.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
