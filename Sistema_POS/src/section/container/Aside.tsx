import { useState, useEffect, useMemo, useRef, Dispatch, SetStateAction } from "react";
import MenuItem from "../../components/MenuItem";
import SubMenuItem from "../../components/SubMenuItem";
import { Customers, Expense, Home, Orders, Products, Settings, Vendor } from "../../icons/icons";
import { useLocation } from "react-router-dom";
import SettingsDrawer from '../../section/container/Settings'

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

interface Props {
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  settingsMenu: boolean;
  setSettingsMenu: Dispatch<SetStateAction<boolean>>;
}

function Aside({ setIsSidebarOpen, isSidebarOpen, setSettingsMenu, settingsMenu }: Props) {
  const [activeMenuItem, setActiveMenuItem] = useState<number | null>(null);
  const [activeSubItem, setActiveSubItem] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const { pathname } = useLocation();

  const reports = [
    {
      id: 9, Icon: Orders, name: "Ventas", subSubItems: [
        { name: "Ventas", url: '/reports/sales/' },
        { name: "Ventas diarias", url: '/reports/sales-day/' },
        { name: "Ventas mensuales", url: '/reports/sales-month/' },
        { name: "Ventas anuales", url: '/reports/sales-year/' },
        { name: "Ventas por clientes mensuales", url: '/reports/sales-customers-month/' },
        { name: "Ventas por clientes anuales", url: '/reports/sales-customers-year/' },
      ],
    },
    {
      id: 10, Icon: Products, name: "Inventario", subSubItems: [
        { name: "Inventario por producto", url: "/reports/products-inventory/" },
        { name: "Inventario por producto monetario", url: "/reports/products-inventory-money/" },
        { name: "Productos mas vendidos mensualmente", url: "/reports/products-month/" },
        { name: "Productos mas vendidos anual", url: "/reports/products-year/" },
        { name: "Productos mas comprados mensualmente", url: "/reports/products-purchases-month/" },
        { name: "Productos mas comprados anualmente", url: "/reports/products-purchases-year/" },
        { name: "Categoria mas vendidas mensualmente", url: "/reports/category-sales-month/" },
        { name: "Categoria mas vendidas anualmente", url: "/reports/category-sales-year/" },
        { name: "Categoria mas compradas mensualmente", url: "/reports/category-purchase-month/" },
        { name: "Categoria mas compradas anualmente", url: "/reports/category-purchase-year/" },
      ]
    },
    {
      id: 11, Icon: Expense, name: "Gastos", subSubItems: [
        { name: "Gastos Mensuales", url: '/reports/expense-month' },
        { name: 'Gastos anuales', url: '/reports/expense-year/' },
        { name: 'Categoria de gastos', url: '/reports/expense-category/' },
      ]
    }
  ]

  const menuItems = useMemo<MenuItemType[]>(() => [
    { id: 1, Icon: Home, text: "Inicio", url: '/' },
    { id: 2, Icon: Orders, text: "Ventas", subItems: [{ name: "Ventas", url: '/sales/' }, { name: "Nueva venta", url: '/sales/add' }, { name: "Cotizacion", url: '/quoteation/' }, { name: "Nueva cotizacion", url: '/quoteation/add/' }] },
    { id: 3, Icon: Customers, text: "Clientes", subItems: [{ name: "Clientes", "url": '/customers/' }, { name: "Nuevo cliente", url: '/customers/add/' }, { name: 'Estado de cuenta', url: '/account-receivable/' }, { name: 'Cuentas pendiente', url: '/pending-accounts/' }] },
    { id: 4, Icon: Vendor, text: "Compras", subItems: [{ name: 'Compras', url: '/purchases/' }, { name: "Nueva compra", url: '/purchase/add' }, { name: "Proveedor", url: '/vendor/' }, { name: "Nuevo proveedor", url: "/vendor/add/" }] },
    { id: 5, Icon: Expense, text: "Gastos", subItems: [{ name: "Gastos", url: '/expenses/' }, { name: "Nuevo gastos", url: '/expense/add/' }, { name: "Categorias", url: '/expense-category/' }], url: '/expenses/' },
    { id: 6, Icon: Products, text: "Productos", subItems: [{ name: "Productos", url: '/products/' }, { name: "Nuevo producto", url: '/products/add/' }, { name: "Categorías", url: '/categories' }, { name: 'Inventario', url: '/kardex-card/' }, { name: "Ajustes de inventario", url: '/inventory-ajustment/' }] },
    { id: 8, Icon: Settings, text: 'Configuración' }
  ], []);

  function handleSetting() {
    setSettingsMenu(true)
    setIsSidebarOpen(false)
  }

  useEffect(() => {
    const pathnameReplace = pathname.replace(/\/$/, '');
    const foundSubItem = menuItems.some(item =>
      item.subItems?.some(subItem => subItem.url.replace(/\/$/, '') === pathnameReplace)
    );

    if (foundSubItem) {
      const matchingItem = menuItems.find(item =>
        item.subItems?.some(subItem => subItem.url.replace(/\/$/, '') === pathnameReplace)
      );

      const currentSubItem = matchingItem?.subItems?.find(subItem => subItem.url.replace(/\/$/, '') === pathnameReplace);
      setActiveMenuItem(matchingItem?.id || null);
      setActiveSubItem(currentSubItem ? currentSubItem.name : null);
    } else {
      setActiveMenuItem(null);
      setActiveSubItem(null);
    }
  }, [pathname, menuItems]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSidebarOpen]);

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-black bg-opacity-50 lg:hidden"
          style={{ height: 'calc(100% - 60px)', top: '60px' }}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        ref={sidebarRef}
        className={`fixed  flex flex-col justify-between bottom-0 z-50 left-0 w-64 bg-whiting2 p-6 overflow-y-auto transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:w-[300px] lg:z-auto`}
      >
        <div>
          <span className="text-[15px] text-primary font-semibold mb-2 inline-block">Ventas</span>
          {menuItems.slice(1, 3).map(({ id, text, Icon: icon, subItems }) => (
            <div key={id}>
              <button className="w-full text-left" onClick={() => { setActiveMenuItem(activeMenuItem === id ? null : id) }}>
                <MenuItem
                  Icon={icon}
                  text={text}
                  className={id === activeMenuItem ? 'bg-white py-1' : ''}
                />
              </button>
              {subItems && id === activeMenuItem && (
                <SubMenuItem
                  items={subItems}
                  activeSubItem={activeSubItem}
                  onSubItemClick={setActiveSubItem}
                />
              )}
            </div>
          ))}

          <span className="text-[15px] text-primary font-semibold mb-2 inline-block">Compras</span>
          {menuItems.slice(3, 5).map(({ id, text, Icon: icon, subItems }) => (
            <div key={id}>
              <button className="w-full text-left" onClick={() => { setActiveMenuItem(activeMenuItem === id ? null : id) }}>
                <MenuItem
                  Icon={icon}
                  text={text}
                  className={id === activeMenuItem ? 'bg-white py-1' : ''}
                />
              </button>
              {subItems && id === activeMenuItem && (
                <SubMenuItem
                  items={subItems}
                  activeSubItem={activeSubItem}
                  onSubItemClick={setActiveSubItem}
                />
              )}
            </div>
          ))}

          <span className="text-[15px] text-primary font-semibold mb-2 inline-block">Inventario</span>
          {menuItems.slice(5, 6).map(({ id, text, Icon: icon, subItems }) => (
            <div key={id}>
              <button className="w-full text-left" onClick={() => { setActiveMenuItem(activeMenuItem === id ? null : id) }}>
                <MenuItem
                  Icon={icon}
                  text={text}
                  className={id === activeMenuItem ? 'bg-white py-1' : ''}
                />
              </button>
              {subItems && id === activeMenuItem && (
                <SubMenuItem
                  items={subItems}
                  activeSubItem={activeSubItem}
                  onSubItemClick={setActiveSubItem}
                />
              )}
            </div>
          ))}

          <span className="text-[15px] text-primary font-semibold mb-2 inline-block">Reportes</span>
          {reports.map((report) => (
            <div key={report.id}>
              <button className="w-full text-left" onClick={() => { setActiveMenuItem(activeMenuItem === report.id ? null : report.id) }}>
                <MenuItem
                  Icon={report.Icon}
                  text={report.name}
                  className={report.id === activeMenuItem ? 'bg-white py-1' : ''}
                />
              </button>
              {report.subSubItems && report.id === activeMenuItem && (
                <SubMenuItem
                  items={report.subSubItems}
                  activeSubItem={activeSubItem}
                  onSubItemClick={setActiveSubItem}
                />
              )}
            </div>
          ))}

        </div>
        {menuItems.slice(6, 7).map(({ Icon, id, text }) => (
          <button key={id} onClick={handleSetting}><MenuItem key={id} Icon={Icon} text={text} /></button>
        ))}
      </aside >

      <SettingsDrawer onClose={() => setSettingsMenu(false)} isOpen={settingsMenu} />
    </>
  );

}

export default Aside;
