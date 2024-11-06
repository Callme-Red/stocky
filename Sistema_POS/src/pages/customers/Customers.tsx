import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerProps, SelectedCustomerProps } from '../../types/types';
import { getCustomers } from '../../api/sales/customers';
import Container from '../../layout/Container';
import FilterTable from '../../components/FilterTable';
import HeaderTable from '../../components/HeaderTable';
import CustomerTable from '../../section/customer/CustomerTable';
import FieldInput from '../../components/form/FieldInput';
import { Close } from '../../icons/icons';
import DropDownOrder from '../../section/productList/DropDownOrderProducts';
import { exportDataForExcel } from '../../utils/function';

export default function Customers() {
  const navigate = useNavigate();
  const FILTERS_CUSTOMERS = ['Todos', 'Activos', 'Eliminados', 'Cuentas pendientes'];
  const ORDERS_CUSTOMERS = ['Nombre cliente', 'Apellido', 'Teléfono', 'Municipio', 'Fecha de creación'];
  const CUSTOMERS_FOR_PAGINATION = 25;

  const searchRef = useRef<HTMLInputElement>(null);
  const customers = useRef<CustomerProps[]>([]);

  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerProps[]>([]);
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  async function loadCustomers() {
    const { data }: { data: CustomerProps[] } = await getCustomers();
    customers.current = data;
    setFilteredCustomers(data);
    console.log(data)
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function exportToExcel() {
    const customer = filteredCustomers.map(({ name, lastName, phone, email, address, department, municipality_name }) => ({
      Nombre: name,
      Apellido: lastName,
      Telefono: phone,
      Correo: email,
      Direccion: address,
      Departamento: department,
      Municipio: municipality_name
    }));

    exportDataForExcel("Clientes", customer);
  }

  useEffect(() => {
    if (activeFilter === 0) {
      setFilteredCustomers(customers.current);
    } else if (activeFilter === 3) {
      setFilteredCustomers(customers.current.filter(customer => customer.isCredit));
    } else {
      setFilteredCustomers(customers.current.filter(customer => customer.state === (activeFilter === 1)));
    }
  }, [activeFilter]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredCustomers(customers.current);
    } else {
      const searchResults = customers.current.filter(customer => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const customerName = `${customer.name.toLowerCase()} ${customer.lastName.toLowerCase()}`;
        // const customerPhone = customer.phone.toLowerCase();
        // const customerEmail = customer.email.toLowerCase();
        // const customerDepartment = customer.department.toLowerCase();
        // const customerMunicipality = customer.municipality_name.toLowerCase();

        return searchWords.every(word =>
          customerName.includes(word)
          // customerPhone.includes(word) ||
          // customerEmail.includes(word) ||
          // customerDepartment.includes(word) ||
          // customerMunicipality.includes(word)
        );
      });
      setFilteredCustomers(searchResults);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearch]);

  const handleSortSelection = (index: number) => {
    const sortedCustomers = [...filteredCustomers];
    if (index === 0) {
      sortedCustomers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (index === 1) {
      sortedCustomers.sort((a, b) => a.lastName.localeCompare(b.lastName));
    } else if (index === 2) {
      sortedCustomers.sort((a, b) => a.phone.localeCompare(b.phone));
    } else if (index === 3) {
      sortedCustomers.sort((a, b) => a.municipality_name.localeCompare(b.municipality_name));
    } else if (index === 4) {
      sortedCustomers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    setFilteredCustomers(sortedCustomers);
    setIsOpen(false);
  };

  const handleChangeStateCustomer = (selectedCustomers: SelectedCustomerProps[]) => {
    const updatedCustomers = filteredCustomers.map(customer => {
      const selectedCustomer = selectedCustomers.find(selected => selected.IDClient === customer.IDClient);
      if (selectedCustomer) {
        return { ...customer, state: !selectedCustomer.state };
      }
      return customer;
    });

    setFilteredCustomers(updatedCustomers);
    customers.current = updatedCustomers;
    setActiveFilter(0)
  };

  const indexOfLastCustomer = currentPage * CUSTOMERS_FOR_PAGINATION;
  const indexOfFirstCustomer = indexOfLastCustomer - CUSTOMERS_FOR_PAGINATION;
  const currentCustomer = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const totalPages = Math.ceil(filteredCustomers.length / CUSTOMERS_FOR_PAGINATION);
  const totalCustomers = filteredCustomers.length;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <Container>
      <section className='p-5'>
        <HeaderTable
          primaryButtonOnClick={() => navigate('/customers/add/')}
          primaryButtonText='Nuevo cliente'
          name='Clientes'
          secondaryButtonOnClick={exportToExcel}
        />
        <FilterTable
          onClickPrimaryButton={() => { setIsSearch(!isSearch); setSearchTerm(''); }}
          onClickSecondaryButton={() => setIsOpen(!isOpen)}
          filters={FILTERS_CUSTOMERS}
          activeFilter={activeFilter}
          isOpen={isOpen}
          setActiveFilter={setActiveFilter}
        >
          <DropDownOrder orders={ORDERS_CUSTOMERS} onSelect={handleSortSelection} />
        </FilterTable>

        <div className={`transition-all duration-300 ease-in-out ${isSearch ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className='border-x border-t space-x-3 py-2 px-3 bg-white border-gray-300 flex items-center'>
            <FieldInput
              className='w-full'
              id='search'
              ref={searchRef}
              placeholder='Buscar por nombre, telefono, correo y más...'
              classNameInput='h-10'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => { setIsSearch(false); setSearchTerm(''); }}
              className='bg-[#e3e3e3] shadow-sm hover:bg-[#d4d4d4] p-2 rounded-md border border-gray-300'
            >
              <Close />
            </button>
          </div>
        </div>

        {currentCustomer && (
          <CustomerTable
            refreshCustomer={handleChangeStateCustomer}
            customer={currentCustomer ?? []}
            showOptions={showOptions}
            setShowOptions={setShowOptions}
          />
        )}

        <div className='border-x border-b py-2 px-3 bg-white border-gray-300 rounded-b-lg flex md:flex-row flex-col items-center justify-between'>
          <div className='md:mb-0 mb-3'>
            <span className='text-secondary font-medium text-sm'>
              Mostrando <span className="font-semibold text-primary">{indexOfFirstCustomer + 1} - {Math.min(indexOfLastCustomer, totalCustomers)}</span> de <span className="font-semibold text-primary">{totalCustomers}</span>
            </span>
          </div>

          <nav aria-label="Page navigation example">
            <ul className="inline-flex -space-x-px text-sm">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 font-medium bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
                >
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
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 font-medium bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700"
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </Container>
  );
}
