import { useCallback, useEffect, useRef, useState } from "react";
import FilterTable from "../../components/FilterTable";
import HeaderTable from "../../components/HeaderTable";
import Container from "../../layout/Container";
import { getSalesByDates } from "../../api/sales/sales";
import { SalesProps } from "../../types/types";
import SalesTable from "../../section/sales/SalesTable";
import { useNavigate } from "react-router-dom";
import ModalMonthSales from "../../section/reports/ModalMonthSales";
import { exportDataForExcel, formatDate } from "../../utils/function";
import FieldInput from "../../components/form/FieldInput";
import { Close } from "../../icons/icons";
import DropDownOrder from "../../section/productList/DropDownOrderProducts";
import DropDownFilterForDates from "../../section/productList/DropDownFilterForDates";

export default function SalesList() {
  const SALES_FOR_PAGINATION = 25;
  const ORDER_SALE = ["Codigo", "Cliente", "Tipo factura", "Tipo de venta", "Metodo de pago", "Fecha", "Monto"]

  const salesRef = useRef<SalesProps[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [nameDate, setNameDate] = useState<string>('Ultimo dia');
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const filters = ['Todas', 'Contado', 'Credito', "Voucher", "Membretadas", "Pendientes"];

  const [sales, setSales] = useState<SalesProps[]>([]);
  const [isShowModal, setIsShowModal] = useState({
    ModalOrder: false,
    ModalDates: false,
    ModalMonth: false
  });

  const navigate = useNavigate();

  const onApply = useCallback(async (year: number, month: number) => {
    const startDate = new Date(year, month - 2, 1);
    const endDate = new Date(year, month, 0);

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    getSales(formattedStartDate, formattedEndDate)
  }, []);

  async function getSales(startDate: string, endDate: string) {
    const { data } = await getSalesByDates(startDate, endDate);
    salesRef.current = data;
    setSales(data);
  }

  useEffect(() => {
    const today = new Date();
    getSales(formatDate(today), formatDate(today))
  }, [])

  useEffect(() => {
    if (activeFilter === 0) {
      setSales(salesRef.current);
    } else if (activeFilter === 3) {
      setSales(salesRef.current.filter(sale => sale.isVoucher === false))
    } else if (activeFilter === 4) {
      setSales(salesRef.current.filter(sale => sale.isVoucher === true))
    } else if (activeFilter === 5) {
      setSales(salesRef.current.filter(sale => sale.state === '2'))
    } else {
      setSales(salesRef.current.filter(sales => sales.typeSale === (activeFilter !== 1)))
    }
  }, [activeFilter])

  useEffect(() => {
    if (isSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearch]);

  useEffect(() => {
    if (searchTerm === '') {
      setSales(salesRef.current);
    } else {
      const searchResults = salesRef.current.filter(product => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const productName = product.Client.toLowerCase();
        const productCode = product.salesCode.toLowerCase();

        return searchWords.every(word =>
          productName.includes(word) ||
          productCode.includes(word)
        );
      });
      setSales(searchResults);
    }
  }, [searchTerm]);

  function handleDeleteSales(saleId: string) {
    const salesFiltered = sales.filter((sale) => sale.IDSale !== saleId);

    setSales(salesFiltered);
    salesRef.current = salesFiltered;
    setActiveFilter(0);
  }

  const handleSortSelection = (index: number) => {
    const sortedSales = sales;

    const sortFunctions: { [key: number]: (a: SalesProps, b: SalesProps) => number } = {
      0: (a, b) => a.salesCode.localeCompare(b.salesCode),
      1: (a, b) => a.Client.localeCompare(b.Client),
      2: (a, b) => (a.isVoucher === b.isVoucher ? 0 : a.isVoucher ? 1 : -1),
      3: (a, b) => (a.typeSale === b.typeSale ? 0 : a.typeSale ? 1 : -1),
      4: (a, b) => a.PaymentMethod.localeCompare(b.PaymentMethod),
      5: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      6: (a, b) => b.total - a.total,
    };

    const sortFunction = sortFunctions[index];
    if (sortFunction) {
      sortedSales.sort(sortFunction);
      setIsShowModal({ ...isShowModal, ModalOrder: false })
    }

    setSales(sortedSales);
  };

  function handleSalesForDate(index: number) {
    const today = new Date();

    const dateRanges = [
      {
        start: formatDate(today),
        end: formatDate(today),
        name: "Último día"
      },
      {
        start: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)),
        end: formatDate(today),
        name: "Últimos 7 días"
      },
      {
        start: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30)),
        end: formatDate(today),
        name: "Últimos 30 días"
      },
      {
        start: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        end: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
        name: "Último mes"
      },
      {
        start: formatDate(new Date(today.getFullYear(), today.getMonth() - 2, 1)),
        end: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
        name: "Últimos 3 meses"
      }
    ];

    setActiveFilter(0)

    if (index === 5) {
      setIsShowModal({ ...isShowModal, ModalMonth: true, ModalDates: false })
      setNameDate("Personalizado")
      return;
    }

    if (index >= 0 && index < dateRanges.length) {
      const { start, end, name } = dateRanges[index];
      getSales(start, end);
      setNameDate(name);
      setIsShowModal({ ...isShowModal, ModalDates: false })
    }
  }

  const FilterSalesByDate = () => {
    const toggleDropdown = () => {
      setIsShowModal({ ...isShowModal, ModalDates: !isShowModal.ModalDates, ModalOrder: false })
    };

    return (
      <div className="relative inline-block">
        <button
          onClick={toggleDropdown}
          className="inline-flex items-center text-secondary font-medium bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg text-sm px-3 py-1.5"
          type="button"
        >
          <svg
            className="w-3 h-3 text-gray-700 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z" />
          </svg>
          {nameDate}
          <svg
            className="w-2.5 h-2.5 ms-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>

        {isShowModal.ModalDates && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <DropDownFilterForDates onSelect={handleSalesForDate} />
          </div>
        )}
      </div>
    );
  };

  const indexOfLastProduct = currentPage * SALES_FOR_PAGINATION;
  const indexOfFirstProduct = indexOfLastProduct - SALES_FOR_PAGINATION;
  const currentSales = sales.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(sales.length / SALES_FOR_PAGINATION);
  const totalProducts = sales.length;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const exportToExcel = () => {
    const filteredData = sales.map(({ salesCode, Client, typeSale, isVoucher, PaymentMethod, subTotal, discount, shippingCost, total }) => ({
      Codigo: salesCode,
      Cliente: Client,
      Tipo: typeSale ? 'Credito' : 'Contado',
      Factura: isVoucher ? 'Membretada' : 'Voucher',
      Pago: PaymentMethod,
      Subtotal: subTotal,
      Descuento: discount,
      Envio: shippingCost,
      Total: total
    }));

    exportDataForExcel("ventas", filteredData);
  };

  return (
    <>
      <Container>
        <section className='p-5'>
          <HeaderTable secondaryButtonOnClick={exportToExcel} primaryButtonOnClick={() => navigate('/sales/add')} primaryButtonText='Nueva venta' name='Ventas' />
          <FilterTable
            onClickSecondaryButton={() => setIsShowModal({ ...isShowModal, ModalDates: false, ModalOrder: !isShowModal.ModalOrder })}
            onClickPrimaryButton={() => { setIsSearch(!isSearch); setSearchTerm('') }}
            filters={filters}
            isOpen={isShowModal.ModalOrder}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            secondChildren={<FilterSalesByDate />}
          >
            <DropDownOrder orders={ORDER_SALE} onSelect={handleSortSelection} />
          </FilterTable>

          <div
            className={`transition-all duration-300 ease-in-out ${isSearch ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
          >
            <div className='border-x border-t space-x-3 py-2 px-3 bg-white border-gray-300 flex items-center'>
              <FieldInput
                className='w-full'
                id='search'
                ref={searchRef}
                placeholder='Buscar por codigo, cliente...'
                classNameInput='h-10'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button onClick={() => { setIsSearch(false); setSearchTerm('') }} className='bg-[#e3e3e3] shadow-sm hover:bg-[#d4d4d4] p-2 rounded-md border border-gray-300'>
                <Close />
              </button>
            </div>
          </div>
          {currentSales &&
            <SalesTable handleDeleteSales={handleDeleteSales} sales={currentSales} />
          }
          <div className='border-x border-b py-2 px-3 bg-whiting2 border-gray-300 rounded-b-lg flex  md:flex-row flex-col items-center  justify-between'>
            <div className='md:mb-0 mb-3'>
              <span className='text-secondary font-medium text-sm'>
                Mostrando <span className="font-semibold text-primary">{indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, totalProducts)}</span> de <span className="font-semibold text-primary">{totalProducts}</span>
              </span>
            </div>

            <nav aria-label="Page navigation example">
              <ul className="inline-flex -space-x-px text-sm">
                <li>
                  <button onClick={() => handlePageChange(currentPage - 1)} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 font-medium bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700">
                    Anterior
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handlePageChange(index + 1)}
                      className={`flex items-center justify-center px-3 h-8 font-medium leading-tight ${currentPage === index + 1 ? 'text-blue-600 border border-gray-300 bg-blue-50' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'}`}
                      aria-current={currentPage === index + 1 ? 'page' : undefined}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li>
                  <button onClick={() => handlePageChange(currentPage + 1)} className="flex font-medium items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700">
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </section>
      </Container>

      {isShowModal.ModalMonth && <ModalMonthSales onClose={() => setIsShowModal({ ...isShowModal, ModalMonth: false })} onApply={onApply} />}
    </>
  )

}
