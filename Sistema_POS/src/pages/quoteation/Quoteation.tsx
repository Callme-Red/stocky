import { useCallback, useEffect, useRef, useState } from 'react';
import Container from '../../layout/Container';
import FilterTable from '../../components/FilterTable';
import { Quotation } from '../../types/types';
import HeaderTable from '../../components/HeaderTable';
import { useNavigate } from 'react-router-dom';
import QuoteationTable from '../../section/quoteation/QuoteationTable';
import { getQuotationByDates } from '../../api/sales/quotations';
import FieldInput from '../../components/form/FieldInput';
import { Close } from '../../icons/icons';
import DropDownOrder from '../../section/productList/DropDownOrderProducts';
import { exportDataForExcel, formatDate } from '../../utils/function';
import DropDownFilterForDates from '../../section/productList/DropDownFilterForDates';
import ModalMonthSales from '../../section/reports/ModalMonthSales';

export default function Quoteation() {
  const QUOTATION_FOR_PAGINATION = 25;
  const FILTERS_QUOTATION = ['Todos', 'Activas', 'Realizadas', "Inactivas", "Delivery"];
  const ORDER_QUOTATION = ["Codigo", "Cliente", "Delivery", "Total", "Fecha"];

  const navigate = useNavigate();
  const quoteation = useRef<Quotation[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const [filteredQuoteation, setFilteredQuoteation] = useState<Quotation[]>([]);
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [nameDate, setNameDate] = useState<string>('Ultimo dia');
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isShowModal, setIsShowModal] = useState({
    ModalOrder: false,
    ModalDates: false,
    ModalMonth: false
  });

  const handleSortSelection = (index: number) => {
    const sortedProducts = filteredQuoteation;
    if (index === 0) {
      sortedProducts.sort((a, b) => a.quotationCode.localeCompare(b.quotationCode));
    } else if (index === 1) {
      sortedProducts.sort((a, b) => a.Client.localeCompare(b.Client));
    } else if (index === 2) {
      sortedProducts.sort((a, b) => a.typeShipping === b.typeShipping ? 0 : a.typeShipping ? -1 : 1);
    } else if (index === 3) {
      sortedProducts.sort((a, b) => Number(b.total) - Number(a.total))
    } else if (index === 4) {
      sortedProducts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    setFilteredQuoteation(sortedProducts);
    setIsShowModal({ ...isShowModal, ModalOrder: false })
  };

  async function getQuotationByDate(startDate: string, endDate: string) {
    const { data } = await getQuotationByDates(startDate, endDate);
    quoteation.current = data;
    setFilteredQuoteation(data);
  }

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
      console.log({ start, end })
      getQuotationByDate(start, end);
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

  const exportToExcel = () => {
    const filteredData = filteredQuoteation.map(({ quotationCode, Client, date, shippingCost, state, total, subTotal, discount, }) => ({
      Codigo: quotationCode,
      Fecha: new Date(date).toLocaleDateString(),
      Cliente: Client,
      Estado: state === '0' ? 'Pendiente' : state === '1' ? 'Realizada' : 'Completada',
      Subtotal: Number(subTotal).toFixed(2),
      Descuento: Number(discount).toFixed(2),
      Envio: Number(shippingCost).toFixed(2),
      Total: Number(total).toFixed(2)
    }));

    exportDataForExcel("cotizaciones", filteredData);
  };

  useEffect(() => {
    if (activeFilter === 0) {
      setFilteredQuoteation(quoteation.current);
    } else if (activeFilter === 1) {
      setFilteredQuoteation(quoteation.current.filter(quoteation => quoteation.state === "1"));
    } else if (activeFilter === 2) {
      setFilteredQuoteation(quoteation.current.filter(quoteation => quoteation.state === "2"));
    } else if (activeFilter === 3) {
      setFilteredQuoteation(quoteation.current.filter(quoteation => quoteation.state === "0"));
    } else {
      setFilteredQuoteation(quoteation.current.filter(quoteation => quoteation.typeShipping));
    }


  }, [activeFilter]);

  useEffect(() => {
    const today = new Date();
    getQuotationByDate(formatDate(today), formatDate(today));
  }, [])

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredQuoteation(quoteation.current);
    } else {
      const searchResults = quoteation.current.filter(quotation => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const quotationCode = quotation.quotationCode.toLowerCase();
        const quotationCustomer = quotation.Client.toLowerCase();

        return searchWords.every(word =>
          quotationCode.includes(word) ||
          quotationCode.includes(word) ||
          quotationCustomer.includes(word)
        );
      });
      setFilteredQuoteation(searchResults);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearch]);

  const onApply = useCallback(async (year: number, month: number) => {
    const startDate = new Date(year, month - 2, 1);
    const endDate = new Date(year, month, 0);

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    getQuotationByDate(formattedStartDate, formattedEndDate)
  }, []);

  const indexOfLastQuotation = currentPage * QUOTATION_FOR_PAGINATION;
  const indexOfFirstQuotation = indexOfLastQuotation - QUOTATION_FOR_PAGINATION;
  const currentQuotations = filteredQuoteation.slice(indexOfFirstQuotation, indexOfLastQuotation);

  const totalPages = Math.ceil(filteredQuoteation.length / QUOTATION_FOR_PAGINATION);
  const totalQuotations = filteredQuoteation.length;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <>
      <Container>
        <section className='p-5'>
          <HeaderTable secondaryButtonOnClick={exportToExcel} primaryButtonOnClick={() => navigate('/quoteation/add')} primaryButtonText='Nueva cotización' name='Cotizaciones' />
          <FilterTable
            filters={FILTERS_QUOTATION}
            activeFilter={activeFilter}
            isOpen={isShowModal.ModalOrder}
            onClickSecondaryButton={() => setIsShowModal({ ...isShowModal, ModalDates: false, ModalOrder: !isShowModal.ModalOrder })}
            onClickPrimaryButton={() => { setIsSearch(!isSearch); setSearchTerm('') }}
            setActiveFilter={setActiveFilter}
            secondChildren={<FilterSalesByDate />}
          >
            <DropDownOrder orders={ORDER_QUOTATION} onSelect={handleSortSelection} />
          </FilterTable>
          <div
            className={`transition-all duration-300 ease-in-out ${isSearch ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
          >
            <div className='border-x border-t space-x-3 py-2 px-3 bg-white border-gray-300 flex items-center'>
              <FieldInput
                className='w-full'
                id='search'
                ref={searchRef}
                placeholder='Buscar por codigo, nombre, categoria y más...'
                classNameInput='h-10'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button onClick={() => { setIsSearch(false); setSearchTerm('') }} className='bg-[#e3e3e3] shadow-sm hover:bg-[#d4d4d4] p-2 rounded-md border border-gray-300'>
                <Close />
              </button>
            </div>
          </div>
          {currentQuotations &&
            <QuoteationTable
              quoteation={currentQuotations}
              showOptions={showOptions}
              setShowOptions={setShowOptions}
            />
          }
          <div className='border-x border-b py-2 px-3 bg-whiting2 border-gray-300 rounded-b-lg flex  md:flex-row flex-col items-center  justify-between'>
            <div className='md:mb-0 mb-3'>
              <span className='text-secondary font-medium text-sm'>
                Mostrando <span className="font-semibold text-primary">{indexOfFirstQuotation + 1} - {Math.min(indexOfLastQuotation, totalQuotations)}</span> de <span className="font-semibold text-primary">{totalQuotations}</span>
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
  );
}

