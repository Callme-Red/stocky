import Container from '../../layout/Container';
import { useCallback, useEffect, useRef, useState } from 'react';
import FilterTable from '../../components/FilterTable';
import HeaderTable from '../../components/HeaderTable';
import { getPurchaseByDate } from '../../api/purchase/purchase';
import { PurchaseProps } from '../../types/types';
import PurchaseTable from '../../section/purchase/PurchaseTable';
import FieldInput from '../../components/form/FieldInput';
import { Close } from '../../icons/icons';
import DropDownOrder from '../../section/productList/DropDownOrderProducts';
import { useNavigate } from 'react-router-dom';
import { exportDataForExcel, formatDate } from '../../utils/function';
import DropDownFilterForDates from '../../section/productList/DropDownFilterForDates';
import ModalMonthSales from '../../section/reports/ModalMonthSales';

export default function PurchaseList() {
  const purchaseRef = useRef<PurchaseProps[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const PURCHASES_FOR_PAGINATION = 25;
  const ORDER_PURCHASE = ["Codigo", "Proveedor", "Metodo de pago", "Monto", "Fecha"]
  const FILTERS_PURCHASE = ['Todos'];

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [nameDate, setNameDate] = useState<string>('Ultimo dia');
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [purchases, setPurchases] = useState<PurchaseProps[]>([]);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isShowModal, setIsShowModal] = useState({
    ModalOrder: false,
    ModalDates: false,
    ModalMonth: false
  });

  function handlePurchaseForDate(index: number) {
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
      getPurchases(start, end);
      setNameDate(name);
      setIsShowModal({ ...isShowModal, ModalDates: false })
    }
  }

  function handleDeletePurchase(purchaseId: string) {
    const purchasesFiltered = purchases.filter((purchase) => purchase.IDPurchase !== purchaseId);

    setPurchases(purchasesFiltered);
    purchaseRef.current = purchasesFiltered;
    setActiveFilter(0);
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
            <DropDownFilterForDates onSelect={handlePurchaseForDate} />
          </div>
        )}
      </div>
    );
  };

  const getPurchases = async (startDate: string, endDate: string) => {
    const { data } = await getPurchaseByDate(startDate, endDate);
    setPurchases(data);
    purchaseRef.current = data;
  };

  useEffect(() => {
    const today = new Date();
    getPurchases(formatDate(today), formatDate(today))
  }, [])

  useEffect(() => {
    if (activeFilter === 0) {
      setPurchases(purchaseRef.current);
    }
  }, [activeFilter])

  useEffect(() => {
    if (isSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearch]);

  useEffect(() => {
    if (searchTerm === '') {
      setPurchases(purchaseRef.current);
    } else {
      const searchResults = purchaseRef.current.filter(purchase => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const purchaseCode = purchase.purchaseCode.toLowerCase();
        const purchaseVendor = purchase.Supplier.toLowerCase();
        const purchasePayment = purchase.PaymentMethod.toLowerCase();

        return searchWords.every(word =>
          purchaseCode.includes(word) ||
          purchaseVendor.includes(word) ||
          purchaseVendor.includes(word) ||
          purchasePayment.includes(word)
        );
      });
      setPurchases(searchResults);
    }
  }, [searchTerm]);

  const handleSortSelection = (index: number) => {
    const sortedSales = purchases;

    const sortFunctions: { [key: number]: (a: PurchaseProps, b: PurchaseProps) => number } = {
      0: (a, b) => a.purchaseCode.localeCompare(b.purchaseCode),
      1: (a, b) => a.Supplier.localeCompare(b.Supplier),
      2: (a, b) => a.PaymentMethod.localeCompare(b.PaymentMethod),
      3: (a, b) => b.total - a.total,
      4: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    };

    const sortFunction = sortFunctions[index];
    if (sortFunction) {
      sortedSales.sort(sortFunction);
      setIsShowModal({ ...isShowModal, ModalOrder: false })
    }

    setPurchases(sortedSales);
  };

  const exportToExcel = () => {
    const filteredData = purchases.map(({ purchaseCode, PaymentMethod, Supplier, date, discount, state, subTotal, total }) => ({
      Codigo: purchaseCode,
      Pago: PaymentMethod,
      Proveedor: Supplier,
      Estado: state ? 'Activo' : 'Inactivo',
      Subtotal: subTotal,
      Descuento: discount,
      Total: total,
      Fecha: new Date(date).toLocaleDateString()
    }));

    exportDataForExcel("compras", filteredData);
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const indexOfLastPurchase = currentPage * PURCHASES_FOR_PAGINATION;
  const indexOfFirstPurchase = indexOfLastPurchase - PURCHASES_FOR_PAGINATION;
  const currentPurchase = purchases.slice(indexOfFirstPurchase, indexOfLastPurchase);

  const totalPages = Math.ceil(purchases.length / PURCHASES_FOR_PAGINATION);
  const totalPurchases = purchases.length;

  const onApply = useCallback(async (year: number, month: number) => {
    const startDate = new Date(year, month - 2, 1);
    const endDate = new Date(year, month, 0);

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    getPurchases(formattedStartDate, formattedEndDate)
  }, []);


  return (
    <>
      <Container>
        <section className='p-5'>
          <HeaderTable secondaryButtonOnClick={exportToExcel} primaryButtonOnClick={() => navigate('/purchase/add/')} primaryButtonText='Nueva compra' name='Compras' />
          <FilterTable
            isOpen={isShowModal.ModalOrder}
            onClickSecondaryButton={() => setIsShowModal({ ...isShowModal, ModalDates: false, ModalOrder: !isShowModal.ModalOrder })}
            onClickPrimaryButton={() => { setIsSearch(!isSearch); setSearchTerm('') }}
            filters={FILTERS_PURCHASE}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            secondChildren={<FilterSalesByDate />}
          >
            <DropDownOrder orders={ORDER_PURCHASE} onSelect={handleSortSelection} />
          </FilterTable>
          <div
            className={`transition-all duration-300 ease-in-out ${isSearch ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
          >
            <div className='border-x border-t space-x-3 py-2 px-3 bg-white border-gray-300 flex items-center'>
              <FieldInput
                className='w-full'
                id='search'
                ref={searchRef}
                placeholder='Buscar por codigo, cliente, metodo de pago y más...'
                classNameInput='h-10'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button onClick={() => { setIsSearch(false); setSearchTerm('') }} className='bg-[#e3e3e3] shadow-sm hover:bg-[#d4d4d4] p-2 rounded-md border border-gray-300'>
                <Close />
              </button>
            </div>
          </div>
          {currentPurchase &&
            <PurchaseTable
              handleDeletePurchase={handleDeletePurchase}
              purchase={currentPurchase}
              setShowOptions={setShowOptions}
              showOptions={showOptions}
            />
          }
          <div className='border-x border-b py-2 px-3 bg-whiting2 border-gray-300 rounded-b-lg flex  md:flex-row flex-col items-center  justify-between'>
            <div className='md:mb-0 mb-3'>
              <span className='text-secondary font-medium text-sm'>
                Mostrando <span className="font-semibold text-primary">{indexOfFirstPurchase + 1} - {Math.min(indexOfLastPurchase, totalPurchases)}</span> de <span className="font-semibold text-primary">{totalPurchases}</span>
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
      </Container >
      {isShowModal.ModalMonth && <ModalMonthSales onClose={() => setIsShowModal({ ...isShowModal, ModalMonth: false })} onApply={onApply} />}
    </>
  );
}
