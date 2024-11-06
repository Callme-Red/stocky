import { useMemo } from "react";
import { Orders, Right } from "../../icons/icons";
import Customers from "../../pages/customers/Customers";
import Vendor from "../../pages/vendor/Vendor";
import Expense from "../../pages/expense/Expense";
import Products from "../../pages/product/Products";
import { useNavigate } from "react-router-dom";

interface SubMenu {
  name: string;
  url: string;
}

interface MenuItemType {
  id: number;
  Icon: React.ComponentType;
  text: string;
  url?: string;
  subItems?: SubMenu[];
}

interface DropDownSearchProps {
  text: string;
}

export default function DropDownSearch({ text }: DropDownSearchProps) {
  const navigate = useNavigate();
  const menuItems = useMemo<MenuItemType[]>(() => [
    {
      id: 2,
      Icon: Orders,
      text: "Ventas",
      subItems: [
        { name: "Ventas", url: "/sales/" },
        { name: "Nueva venta", url: "/sales/add" },
        { name: "Cotizacion", url: "/quoteation/" },
        { name: "Nueva cotizacion", url: "/quoteation/add/" }
      ]
    },
    {
      id: 3,
      Icon: Customers,
      text: "Clientes",
      subItems: [
        { name: "Clientes", url: "/customers/" },
        { name: "Nuevo cliente", url: "/customers/add/" },
        { name: "Estado de cuenta", url: "/account-receivable/" },
        { name: "Cuentas pendiente", url: "/pending-accounts/" }
      ]
    },
    {
      id: 4,
      Icon: Vendor,
      text: "Compras",
      subItems: [
        { name: "Compras", url: "/purchases/" },
        { name: "Nueva compra", url: "/purchase/add" },
        { name: "Proveedor", url: "/vendor/" },
        { name: "Nuevo proveedor", url: "/vendor/add/" }
      ]
    },
    {
      id: 5,
      Icon: Expense,
      text: "Gastos",
      subItems: [
        { name: "Gastos", url: "/expenses/" },
        { name: "Nuevo gasto", url: "/expense/add/" },
        { name: "Categorias", url: "/expense-category/" }
      ],
      url: "/expenses/"
    },
    {
      id: 6,
      Icon: Products,
      text: "Productos",
      subItems: [
        { name: "Productos", url: "/products/" },
        { name: "Nuevo producto", url: "/products/add/" },
        { name: "Categorías", url: "/categories" },
        { name: "Inventario", url: "/kardex-card/" },
        { name: "Ajustes de inventario", url: "/inventory-ajustment/" }
      ]
    }
  ], []);

  const filteredItems = useMemo(() => {
    const lowercasedText = text.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.text.toLowerCase().includes(lowercasedText) ||
        item.subItems?.some((sub) => sub.name.toLowerCase().includes(lowercasedText))
    );
  }, [text, menuItems]);

  return (
    <div className="relative p-4 w-full h-[400px] bg-white rounded-lg shadow border">
      <div className="relative flex flex-col h-full">
        <div className="flex items-center justify-between border-b rounded-t">
          <h3 className="text-lg font-semibold text-gray-900">Buscar entre la pagina</h3>
          <button
            type="button"
            className="text-gray-400 hover:bg-gray-200 rounded-lg text-sm h-8 w-8 flex items-center justify-center"
          >
            <svg
              className="w-3 h-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1 7 7m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>

        <p className="text-gray-500 my-4">Reciente</p>
        <div className="flex-grow overflow-y-auto">
          <ul className="space-y-2 mb-4">
            {filteredItems.map(({ subItems }) => (
              <>
                {subItems.map((subItem, index) => (
                  <li
                    onClick={() => navigate(subItem.url)}
                    key={index}
                    className="bg-whiting2 flex justify-between font-medium text-sm py-2 rounded-md px-2 border text-primary border-gray-300"
                  >
                    {subItem.name}
                    <Right />
                  </li>
                ))}
              </>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
