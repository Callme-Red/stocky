import { useEffect, useRef, useState } from 'react';
import Container from '../../layout/Container';
import FilterTable from '../../components/FilterTable';
import HeaderTable from '../../components/HeaderTable';
import { getPendingAccounts } from '../../api/sales/customers';
import { PendingAccountsProps } from '../../types/types';
import PendingAccountsTable from '../../section/customer/PendingAccountsTable';
import { useNavigate } from 'react-router-dom';
import FieldInput from '../../components/form/FieldInput';
import { Close } from '../../icons/icons';
import DropDownOrder from '../../section/productList/DropDownOrderProducts';

export default function PendingAccounts() {
  const PENDING_FOR_PAGINATION = 25;
  const ORDERS_PENDING = ["Cliente", "Venta pendientes", "Codigo venta", "Total", "Saldo", "Fecha"]
  const pendingRef = useRef<PendingAccountsProps[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccountsProps[]>([]);
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const filters = ['Todos'];
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPendingAccounts() {
      const { data } = await getPendingAccounts();
      pendingRef.current = data;
      setPendingAccounts(data)
    }

    loadPendingAccounts();
  }, [])

  useEffect(() => {
    if (searchTerm === '') {
      setPendingAccounts(pendingRef.current);
    } else {
      const searchResults = pendingRef.current.filter(pending => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const customerName = pending.name.toLowerCase();
        const customerLastName = pending.lastName.toLowerCase();

        return searchWords.every(word =>
          customerName.includes(word) ||
          customerLastName.includes(word)
        );
      });
      setPendingAccounts(searchResults);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearch]);

  const indexOfLastPending = currentPage * PENDING_FOR_PAGINATION;
  const indexOfFirstPending = indexOfLastPending - PENDING_FOR_PAGINATION;
  const currentPending = pendingAccounts.slice(indexOfFirstPending, indexOfLastPending);

  const totalPages = Math.ceil(pendingAccounts.length / PENDING_FOR_PAGINATION);
  const totalPendings = pendingAccounts.length;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSortSelection = (index: number) => {
    const sortedVendors = pendingAccounts;
    if (index === 0) {
      sortedVendors.sort((a, b) => a.name.localeCompare(b.name));
    } else if (index === 1) {
      sortedVendors.sort((a, b) => b.pending_sales_count - a.pending_sales_count);
    } else if (index === 2) {
      sortedVendors.sort((a, b) => a.nearest_pending_sale.salesCode.localeCompare(b.nearest_pending_sale.salesCode));
    } else if (index === 3) {
      sortedVendors.sort((a, b) => b.nearest_pending_sale.total - a.nearest_pending_sale.total);
    } else if (index === 4) {
      sortedVendors.sort((a, b) => b.nearest_pending_sale.balance - a.nearest_pending_sale.balance);
    } else if (index === 5) {
      sortedVendors.sort((a, b) => new Date(b.nearest_pending_sale.expirationDate).getTime() - new Date(a.nearest_pending_sale.expirationDate).getTime());
    }

    setPendingAccounts(sortedVendors);
    setIsOpen(false)
  };

  return (
    <Container>
      <section className='p-5'>
        <HeaderTable primaryButtonOnClick={() => navigate('/sales/add/')} primaryButtonText='Nueva venta' name='Cuentas pendiente' />
        <FilterTable
          isOpen={isOpen}
          onClickPrimaryButton={() => { setIsSearch(!isSearch); setSearchTerm('') }}
          onClickSecondaryButton={() => setIsOpen(!isOpen)}
          filters={filters}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        >
          <DropDownOrder orders={ORDERS_PENDING} onSelect={handleSortSelection} />
        </FilterTable>
        <div
          className={`transition-all duration-300 ease-in-out ${isSearch ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
        >
          <div className='border-x border-t space-x-3 py-2 px-3 bg-white border-gray-300 flex items-center'>
            <FieldInput
              className='w-full'
              id='search'
              ref={searchRef}
              placeholder='Buscar por nombre, razón social, ruc y más...'
              classNameInput='h-10'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button onClick={() => { setIsSearch(false); setSearchTerm('') }} className='bg-[#e3e3e3] shadow-sm hover:bg-[#d4d4d4] p-2 rounded-md border border-gray-300'>
              <Close />
            </button>
          </div>
        </div>
        {currentPending &&
          <PendingAccountsTable
            pendingAccounts={currentPending}
          />
        }
        <div className='border-x border-b py-2 px-3 bg-whiting2 border-gray-300 rounded-b-lg flex  md:flex-row flex-col items-center  justify-between'>
          <div className='md:mb-0 mb-3'>
            <span className='text-secondary font-medium text-sm'>
              Mostrando <span className="font-semibold text-primary">{indexOfFirstPending + 1} - {Math.min(indexOfLastPending, totalPendings)}</span> de <span className="font-semibold text-primary">{totalPendings}</span>
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
  );
}

