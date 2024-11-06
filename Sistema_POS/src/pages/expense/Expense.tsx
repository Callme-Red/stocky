import { useCallback, useEffect, useRef, useState } from 'react';
import Container from '../../layout/Container';
import FilterTable from '../../components/FilterTable';
import { ExpenseProps, SelectedExpensesProps } from '../../types/types';
import HeaderTable from '../../components/HeaderTable';
import ExpenseTable from '../../section/expense/ExpenseTable';
import { getExpenses } from '../../api/purchase/expense';
import ModalMonthSales from '../../section/reports/ModalMonthSales';
import { exportDataForExcel, formatDate } from '../../utils/function';
import { useNavigate } from 'react-router-dom';
import FieldInput from '../../components/form/FieldInput';
import { Close } from '../../icons/icons';
import DropDownOrder from '../../section/productList/DropDownOrderProducts';
import DropDownFilterForDates from '../../section/productList/DropDownFilterForDates';
import { showToast } from '../../components/Toast';
import { Toaster } from 'react-hot-toast';

export default function Expense() {
  const EXPENSE_FOR_PAGINATION = 25;
  const FILTERS_EXPENSE = ['Todos', 'Activos', 'Eliminados'];
  const ORDER_EXPENSE = ["Nombre", "Categoria", "Fecha de creación", "Monto"];

  const expenseRef = useRef<ExpenseProps[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const [nameDate, setNameDate] = useState<string>('Ultimo dia');
  const navigate = useNavigate();
  const [expense, setExpense] = useState<ExpenseProps[]>([]);
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (isSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearch]);

  useEffect(() => {
    if (activeFilter === 0) {
      setExpense(expenseRef.current);
    } else if (activeFilter === 1) {
      setExpense(expenseRef.current.filter(expense => expense.state === true))
    } else if (activeFilter === 2) {
      setExpense(expenseRef.current.filter(expense => expense.state === false))
    }
  }, [activeFilter])

  useEffect(() => {
    if (searchTerm === '') {
      setExpense(expenseRef.current);
    } else {
      const searchResults = expenseRef.current.filter(product => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const expenseName = product.name.toLowerCase();
        const expenseCategory = product.category.toLowerCase();

        return searchWords.every(word =>
          expenseName.includes(word) ||
          expenseCategory.includes(word)
        );
      });
      setExpense(searchResults);
    }
  }, [searchTerm]);

  const [isShowModal, setIsShowModal] = useState({
    ModalOrder: false,
    ModalDates: false,
    ModalMonth: false
  });


  const onApply = useCallback(async (year: number, month: number) => {
    const startDate = new Date(year, month - 2, 1);
    const endDate = new Date(year, month, 0);

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    getExpensesByDate(formattedStartDate, formattedEndDate)
  }, []);

  async function getExpensesByDate(startDate: string, endDate: string) {
    const { data } = await getExpenses(startDate, endDate);
    expenseRef.current = data;
    setExpense(data);
  }

  useEffect(() => {
    async function loadExpense() {
      const today = new Date();
      getExpensesByDate(formatDate(today), formatDate(today));
    }

    loadExpense();
  }, []);


  const handleSortSelection = (index: number) => {
    const sortedSales = expense;

    const sortFunctions: { [key: number]: (a: ExpenseProps, b: ExpenseProps) => number } = {
      0: (a, b) => a.name.localeCompare(b.name),
      1: (a, b) => a.category.localeCompare(b.category),
      2: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      3: (a, b) => b.amount - a.amount,
    };

    const sortFunction = sortFunctions[index];
    if (sortFunction) {
      sortedSales.sort(sortFunction);
      setIsShowModal({ ...isShowModal, ModalOrder: false })
    }

    setExpense(sortedSales);
  };

  const indexOfLastExpense = currentPage * EXPENSE_FOR_PAGINATION;
  const indexOfFirstExpense = indexOfLastExpense - EXPENSE_FOR_PAGINATION;
  const currentExpenses = expense.slice(indexOfFirstExpense, indexOfLastExpense);

  const totalPages = Math.ceil(expense.length / EXPENSE_FOR_PAGINATION);
  const totalExpenses = expense.length;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleChangeStateExpenses = (selectedExpenses: SelectedExpensesProps[]) => {
    const updateExpenses = expense.filter(
      expense => !selectedExpenses.some(selected => selected.IDExpense === expense.IDExpense)
    );

    setExpense(updateExpenses);
    expenseRef.current = updateExpenses;
    setActiveFilter(0);

    showToast("Gastos eliminados exitosamente", true);
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
      getExpensesByDate(start, end);
      setNameDate(name);
      setIsShowModal({ ...isShowModal, ModalDates: false })
    }
  }

  const exportToExcel = () => {
    const filteredData = expense.map(({ name, amount, date, state }) => ({
      Fecha: new Date(date).toLocaleDateString(),
      Nombre: name,
      Monto: amount,
      Estado: state ? 'Activo' : 'Inactivo'
    }));

    exportDataForExcel("gastos", filteredData);
  };

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

  return (
    <>
      <Toaster />
      <Container>
        <section className='p-5'>
          <HeaderTable secondaryButtonOnClick={exportToExcel} primaryButtonOnClick={() => navigate('/expense/add/')} primaryButtonText='Nuevo gasto' name='Gastos' />
          <FilterTable
            onClickSecondaryButton={() => setIsShowModal({ ...isShowModal, ModalDates: false, ModalOrder: !isShowModal.ModalOrder })}
            onClickPrimaryButton={() => { setIsSearch(!isSearch); setSearchTerm('') }}
            filters={FILTERS_EXPENSE}
            isOpen={isShowModal.ModalOrder}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            secondChildren={<FilterSalesByDate />}
          >
            <DropDownOrder orders={ORDER_EXPENSE} onSelect={handleSortSelection} />
          </FilterTable>

          <div
            className={`transition-all duration-300 ease-in-out ${isSearch ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
          >
            <div className='border-x border-t space-x-3 py-2 px-3 bg-white border-gray-300 flex items-center'>
              <FieldInput
                className='w-full'
                id='search'
                ref={searchRef}
                placeholder='Buscar por nombre, categoria y más...'
                classNameInput='h-10'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button onClick={() => { setIsSearch(false); setSearchTerm('') }} className='bg-[#e3e3e3] shadow-sm hover:bg-[#d4d4d4] p-2 rounded-md border border-gray-300'>
                <Close />
              </button>
            </div>
          </div>
          {currentExpenses && (
            <ExpenseTable
              onRefreshExpenses={handleChangeStateExpenses}
              expense={currentExpenses}
              showOptions={showOptions}
              setShowOptions={setShowOptions}
            />
          )}
          <div className='border-x border-b py-2 px-3 bg-whiting2 border-gray-300 rounded-b-lg flex  md:flex-row flex-col items-center  justify-between'>
            <div className='md:mb-0 mb-3'>
              <span className='text-secondary font-medium text-sm'>
                Mostrando <span className="font-semibold text-primary">{indexOfFirstExpense + 1} - {Math.min(indexOfLastExpense, totalExpenses)}</span> de <span className="font-semibold text-primary">{totalExpenses}</span>
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
