import './App.css';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import "./index.css";
import Home from './pages/Home';
import AddProduct from './pages/product/AddProduct';
import AddCustomer from './pages/customers/AddCustomer';
import Products from './pages/product/Products';
import AddVendor from './pages/vendor/AddVendor';
import Vendor from './pages/vendor/Vendor';
import Customers from './pages/customers/Customers';
import Sales from './pages/sales/Sales';
import Purchase from './pages/purchase/Purchase';
import SalesList from './pages/sales/SalesList';
import AccountsReceivable from './pages/customers/AccountsReceivable';
import Category from './pages/product/Category';
import AddQuoteation from './pages/quoteation/AddQuoteation';
import AddExpense from './pages/expense/AddExpense';
import CategoryExpense from './pages/expense/CategoryExpense';
import InventoryAdjustment from './pages/inventory/InventoryAdjustment';
import SalesReport from './pages/reports/SalesReport';
import PurchaseList from './pages/purchase/PurchaseList';
import PendingAccounts from './pages/customers/PendingAccounts';
import InventoryProduct from './pages/inventory/InventoryProduct';
import Expense from './pages/expense/Expense';
import Quoteation from './pages/quoteation/Quoteation';
import Login from './pages/login/Login';
import { encryptName } from './utils/function';
import ExpenseReport from './pages/reports/expenses/ExpenseReport';
import ExpenseYearReport from './pages/reports/expenses/ExpenseYearReport';
import ExpenseCategoryReport from './pages/reports/expenses/ExpenseCategoryReport';
import SalesByCustomerMonthReport from './pages/reports/sales/SalesByCustomersMonthReport';
import SalesByCustomerYearReport from './pages/reports/sales/SalesByCustomersYearReport';
import ProductSalesMonthReport from './pages/reports/products/ProductsSalesMonthReport';
import ProductSalesYearReport from './pages/reports/products/ProductsSalesYearReport';
import ProductsPurchaseMonthReport from './pages/reports/products/ProductsPurchaseMonthReport'
import ProductPurchaseYearReport from './pages/reports/products/ProductsPurchaseYearReport';
import ProductCategorySalesMonthReport from './pages/reports/products/ProductsCategorySalesMonthReport';
import ProductCategoryYearReport from './pages/reports/products/ProductCategoryYearReport';
import ProductCategoryPurchaseMonthReport from './pages/reports/products/ProductCategoryPurchaseMonthReport';
import ProductCategoryPurchaseYearReport from './pages/reports/products/ProductCategoryPurchaseYearReport';
import SalesMonth from './pages/reports/sales/SalesMonth';
import SalesDay from './pages/reports/sales/SalesDay';
import SalesYear from './pages/reports/sales/SalesYear';
import ProductInventoryReport from './pages/reports/products/ProductInventoryReport';
import ProductInventoryMoneyReports from './pages/reports/products/ProductInventoryMoneyReport';
import { useEffect } from 'react';

const PrivateRoute = ({ children }) => {
  const encryptedName = encryptName("tokenUser");
  const token = localStorage.getItem(encryptedName);
  const hourExpiration = new Date(localStorage.getItem('hourExpiration'));
  const currentDate = new Date();

  if (hourExpiration < currentDate) {
    localStorage.removeItem(encryptedName);
    localStorage.removeItem('hourExpiration');
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");

    document.cookie = `csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    return <Navigate to="/" replace />;
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const encryptedName = encryptName("tokenUser");
  const token = localStorage.getItem(encryptedName);
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicRoute><Login /></PublicRoute>
  },
  {
    path: "/home",
    element: <PrivateRoute><Home /></PrivateRoute>
  },
  {
    path: "/products/add/:id?",
    element: <PrivateRoute><AddProduct /></PrivateRoute>
  },
  {
    path: "/products",
    element: <PrivateRoute><Products /></PrivateRoute>
  },
  {
    path: "/customers/add/:id?",
    element: <PrivateRoute><AddCustomer /></PrivateRoute>
  },
  {
    path: "/customers/",
    element: <PrivateRoute><Customers /></PrivateRoute>
  },
  {
    path: "/vendor/add/:id?",
    element: <PrivateRoute><AddVendor /></PrivateRoute>
  },
  {
    path: "/vendor",
    element: <PrivateRoute><Vendor /></PrivateRoute>
  },
  {
    path: '/reports/expense-month/',
    element: <PrivateRoute><ExpenseReport /></PrivateRoute>
  },
  {
    path: '/reports/expense-year/',
    element: <PrivateRoute><ExpenseYearReport /></PrivateRoute>
  },
  {
    path: '/reports/products-month/',
    element: <PrivateRoute><ProductSalesMonthReport /></PrivateRoute>
  },
  {
    path: '/reports/products-year/',
    element: <PrivateRoute><ProductSalesYearReport /></PrivateRoute>
  },
  {
    path: 'reports/products-purchases-month/',
    element: <PrivateRoute><ProductsPurchaseMonthReport /></PrivateRoute>
  },
  {
    path: 'reports/products-purchases-year/',
    element: <PrivateRoute><ProductPurchaseYearReport /></PrivateRoute>
  },
  {
    path: '/reports/category-sales-month/',
    element: <PrivateRoute><ProductCategorySalesMonthReport /></PrivateRoute>
  },
  {
    path: '/reports/category-purchase-month/',
    element: <PrivateRoute><ProductCategoryPurchaseMonthReport /></PrivateRoute>
  },
  {
    path: '/reports/category-purchase-year/',
    element: <PrivateRoute><ProductCategoryPurchaseYearReport /></PrivateRoute>
  },
  {
    path: '/reports/sales-year/',
    element: <PrivateRoute><SalesYear /></PrivateRoute>
  },
  {
    path: '/reports/products-inventory/',
    element: <PrivateRoute><ProductInventoryReport /></PrivateRoute>
  },
  {
    path: '/reports/sales-month/',
    element: <PrivateRoute><SalesMonth /></PrivateRoute>
  },
  {
    path: '/reports/sales-day/',
    element: <PrivateRoute><SalesDay /></PrivateRoute>
  },
  {
    path: '/reports/category-sales-year/',
    element: <PrivateRoute><ProductCategoryYearReport /></PrivateRoute>
  },
  {
    path: '/reports/expense-category/',
    element: <PrivateRoute><ExpenseCategoryReport /></PrivateRoute>
  },
  {
    path: '/reports/sales-customers-month/',
    element: <PrivateRoute><SalesByCustomerMonthReport /></PrivateRoute>
  },
  {
    path: '/reports/sales-customers-year/',
    element: <PrivateRoute><SalesByCustomerYearReport /></PrivateRoute>
  },
  {
    path: "/sales",
    element: <PrivateRoute><SalesList /></PrivateRoute>
  },
  {
    path: "/sales/add/:id?",
    element: <PrivateRoute><Sales /></PrivateRoute>
  },
  {
    path: "/purchase/add/:id?",
    element: <PrivateRoute><Purchase /></PrivateRoute>
  },
  {
    path: "/purchases/",
    element: <PrivateRoute><PurchaseList /></PrivateRoute>
  },
  {
    path: "/account-receivable/:id?",
    element: <PrivateRoute><AccountsReceivable /></PrivateRoute>
  },
  {
    path: "/categories",
    element: <PrivateRoute><Category /></PrivateRoute>
  },
  {
    path: "/reports/products-inventory-money",
    element: <PrivateRoute><ProductInventoryMoneyReports /></PrivateRoute>
  },
  {
    path: "/quoteation/",
    element: <PrivateRoute><Quoteation /></PrivateRoute>
  },
  {
    path: "/quoteation/add",
    element: <PrivateRoute><AddQuoteation /></PrivateRoute>
  },
  {
    path: "/expense/add/:id?",
    element: <PrivateRoute><AddExpense /></PrivateRoute>
  },
  {
    path: "/expense-category",
    element: <PrivateRoute><CategoryExpense /></PrivateRoute>
  },
  {
    path: "/inventory-ajustment/:id?",
    element: <PrivateRoute><InventoryAdjustment /></PrivateRoute>
  },
  {
    path: "/reports/sales",
    element: <PrivateRoute><SalesReport /></PrivateRoute>
  },
  {
    path: "/pending-accounts",
    element: <PrivateRoute><PendingAccounts /></PrivateRoute>
  },
  {
    path: "/kardex-card",
    element: <PrivateRoute><InventoryProduct /></PrivateRoute>
  },
  {
    path: "/expenses",
    element: <PrivateRoute><Expense /></PrivateRoute>
  }
]);

function App() {
  useEffect(() => {
    document.title = import.meta.env.VITE_COMPANY_NAME || 'Pagina web';

    const faviconPath = `/logo/${import.meta.env.VITE_COMPANY_LOGO}`;

    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = faviconPath;

    const existingFavicon = document.querySelector("link[rel='icon']");
    if (existingFavicon) {
      existingFavicon.parentNode?.removeChild(existingFavicon);
    }

    document.head.appendChild(link);
  }, []);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
