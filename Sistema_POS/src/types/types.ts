/* eslint-disable @typescript-eslint/no-unused-vars */
interface PrecioProductoProps {
  Precio: number;
  Costo: number;
  Margen: number;
  Ganancia: number;
}

export interface ProductsProps {
  CodigoProducto: string;
  IDProducto: string;
  IDCategoria: string;
  NombreProducto: string;
  nombre_categoria?: string;
  descripcion: string;
  estado: boolean;
  cantidadMinima: number;
  FechaIngreso: Date;
  precio_producto: PrecioProductoProps;
  existencias: number;
}

export interface SelectedCustomerProps {
  IDClient: string;
  isCredit: boolean,
  state: boolean
}

export interface SelectedProductsProps {
  IDProduct: string;
  estado: boolean;
}

export interface SelectedVendorsProps {
  IDVendor: string;
  state: boolean
}

export interface SelectedExpensesProps {
  IDExpense: string;
  state: boolean;
}

export interface ProductInventoryMoneyProps {
  Producto: string;
  Comprado: number;
  Vendido: number;
  "En inventario": number;
  Ganancia: number;
}

interface Expense {
  IDExpense: string;
  description: string;
  amount: string;
  date: string;
  IDExpenseCategory: string;
  category: string;
  name: string;
}

interface Category {
  category: string;
  expenses: Expense[];
  total: number;
}

export interface ExpenseProps {
  IDExpense: string;
  name: string;
  description: string;
  amount: number;
  date: string;
  IDExpenseCategory: string;
  category: string;
  state: boolean;
}

interface CategoryExpenseYear {
  category: string;
  total: number;
}

export interface ExpenseYearProps {
  total_global: number;
  categories: CategoryExpenseYear[];
}


export interface ExpensesMonthProps {
  total_global: number;
  categories: Category[];
}

export interface ApiResponseProps {
  success: boolean;
  error?: {
    message: string;
  };
}

export interface Discount {
  discount: number,
  typeDiscount: boolean,
  general: boolean,
}

export interface UserLoginProps {
  id: string;
  username: string;
  email: string;
}

export interface ProductActive {
  IDProduct: string;
  CodigoProducto?: string;
  price: number;
  NombreProducto: string;
  quantity: number;
  discount: number;
  existencia?: number;
  cost?: number;
}

export interface CategoryProps {
  IDCategoria: string;
  NombreCategoria: string;
  descripcion: string;
  estado: boolean;
}

interface PurchaseDetail {
  IDProduct: string;
  IDPurchaseDetail: string;
  cost: number;
  productCode: string;
  discount: number;
  productName: string;
  quantity: number;
  state: boolean;
  subTotal: string;
  tax: number;
  total: number;
}

export interface PurchaseProps {
  IDPaymentMethod: string;
  IDPurchase: string;
  IDSupplier: string;
  PaymentMethod: string;
  Supplier: string;
  date: string;
  details: PurchaseDetail[];
  discount: number;
  purchaseCode: string;
  state: boolean;
  subTotal: number;
  tax: number;
  total: number;
}


export interface CategoryExpenseProps {
  IDExpenseCategory: string;
  name: string;
  description: string;
  state: boolean;
}

export interface VendorProps {
  IDSupplier: string;
  ruc: string;
  name: string;
  SocialReason: string;
  phone: string;
  email: string;
  state: boolean;
  date: Date;
}

export interface CustomerProps {
  IDClient: string;
  name: string;
  lastName: string;
  phone: string;
  email: string;
  IDDepartment: string;
  IDMunicipality: string;
  municipality_name: string;
  department: string;
  address: string;
  description: string;
  date: string;
  state: boolean;
  isCredit: boolean;
}

export interface BestSellingProductsProps {
  NombreProducto: string,
  CodigoProducto: string,
  total_quantity: number,
  total_earned: number
}

export interface BestBuyingProductsProps {
  NombreProducto: string,
  CodigoProducto: string,
  total_quantity: number,
  total_spent: number
}

export interface DepartmentProps {
  IDDepartment: string;
  name: string;
}

export interface MunicipalityProps {
  IDMunicipality: string;
  name: string;
}

export interface StepsProps {
  IDAccountsReceivable?: string;
  title: string;
  date: Date;
  PaymentMethod?: string;
  description: string;
  paymentCode?: string;
}

interface Expense {
  NombreProducto: string;
  CodigoProducto: string;
  total_quantity: number;
  total_earned: number;
}

interface CategoryProductsReport {
  category: string;
  values: Expense[];
  total: number;
  total_quantity: number;
}

export interface SalesByCategoryProductsProps {
  total_quantity_global: number;
  total_global: number;
  categories: CategoryProductsReport[];
}

interface CategoryExpenseReport {
  category: string;
  total_spent: number;
}

export interface CategoryExpenseReportProps {
  total_global: number;
  categories: CategoryExpenseReport[];
}


export interface AccountReceivable {
  IDAccountsReceivable: string;
  IDClient: string;
  paymentCode: string;
  PaymentMethod: string;
  IDSale: string;
  voucher: string;
  balance: string;
  dateSale: string;
  inflow: string;
  outflow: string;
  type: boolean;
}

interface QuotationDetail {
  IDProduct: string;
  discount: string;
  quantity: number;
  state: boolean;
  subTotal: string;
  tax: string;
  price: number;
  name: string;
  total: string;
  stock: number;
}

export interface UserProps {
  email: string;
  token: string;
  user_id: string;
  username: string;
}

export interface Quotation {
  Client: string;
  department: string;
  municipality: string;
  phone: string;
  address: string;
  IDClient: string;
  IDQuotation: string;
  date: string;
  details: QuotationDetail[];
  discount: string;
  quotationCode: string;
  shippingCost: string;
  state: string;
  subTotal: string;
  tax: string;
  total: string;
  typeShipping: boolean;
}

export interface SaleProps {
  IDSale: string;
  date: string;
  salesCode: string;
  total: number;
  expirationDate: Date;
  accounts_receivable: AccountReceivable[];
  state: string;
}

export type Option = {
  name: string;
  value: string;
};

export interface PendingAccountsProps {
  IDClient: string;
  lastName: string;
  name: string;
  nearest_pending_sale: {
    balance: number;
    expirationDate: string;
    salesCode: string;
    total: number;
  };
  pending_sales_count: number;
}

export interface InventoryProps {
  IDInventario: string;
  IDProducto: string;
  IDPurchase: string | null;
  IDSale: string | null;
  costoEntrada: string;
  costoPromedio: string;
  costoSaldo: string;
  costoSalida: string | null;
  entrada: string;
  fecha: Date;
  saldoUnidades: string;
  salida: string | null;
  tipoMovimiento: string;
}

export interface SalesByMonth {
  fecha: Date;
  nombre: string;
  tipo: string;
  total: number;
}

export interface SalesByCustomerMonthProps {
  name: string,
  lastName: string,
  total_spent: string,
  most_purchased_product: string,
  most_purchased_quantity: number,
  total_spent_on_product: string
}

export interface SalesByYear {
  month: number,
  sales: number,
}

interface SubMenu {
  name: string;
  url: string;
}


export interface MenuItemType {
  id: number;
  Icon: React.ComponentType;
  text: string;
  url?: string;
  subItems?: SubMenu[];
}

export interface DetailsSalesProps {
  IDProduct: string;
  IDSaleDetail: string;
  discount: string;
  productName: string;
  productCode: string;
  productPrice: string;
  quantity: number;
  state: boolean;
  subTotal: string;
  tax: string;
  stock: number;
  total: string;
}

export interface SalesProps {
  IDClient: string;
  salesCode: string;
  Username: string;
  IDUser: string;
  isVoucher: boolean;
  PaymentMethod: string;
  Client: string;
  department: string;
  municipality: string;
  address: string;
  phone: string;
  IDPaymentMethod: string;
  IDSale: string;
  date: Date;
  discount: number;
  shippingCost: number;
  state: string;
  expirationDate: Date;
  details: DetailsSalesProps[]
  subTotal: number;
  tax: number;
  total: number;
  typeSale: boolean;
  voucher: string;
  typeShipping: boolean;
}
