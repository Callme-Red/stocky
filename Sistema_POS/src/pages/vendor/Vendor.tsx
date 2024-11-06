import { useEffect, useRef, useState } from 'react';
import Container from '../../layout/Container';
import FilterTable from '../../components/FilterTable';
import { SelectedVendorsProps, VendorProps } from '../../types/types';
import VendorTable from '../../section/vendor/VendorTable';
import HeaderTable from '../../components/HeaderTable';
import { getVendors } from '../../api/purchase/vendor';
import { useNavigate } from 'react-router-dom';
import FieldInput from '../../components/form/FieldInput';
import { Close } from '../../icons/icons';
import DropDownOrder from '../../section/productList/DropDownOrderProducts';
import { exportDataForExcel } from '../../utils/function';

export default function Vendor() {
  const VENDOR_FOR_PAGINATION = 25;
  const FILTER_VENDORS = ['Todos', 'Activos', 'Eliminados'];
  const ORDERS_VENDORS = ["Nombre", "Razon social", "RUC", "phone", "Correo", "Fecha de creación"]

  const vendors = useRef<VendorProps[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<VendorProps[]>([]);
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  async function loadVendors() {
    const { data } = await getVendors();
    vendors.current = data;
    setFilteredVendors(data);
  }

  useEffect(() => {
    if (activeFilter === 0) {
      setFilteredVendors(vendors.current);
    } else {
      setFilteredVendors(vendors.current.filter(vendors => vendors.state === (activeFilter === 1)));
    }
  }, [activeFilter]);


  useEffect(() => {
    if (searchTerm === '') {
      setFilteredVendors(vendors.current);
    } else {
      const searchResults = vendors.current.filter(product => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const vendorName = product.name.toLowerCase();
        const vendorSocialReason = product.SocialReason.toLowerCase();
        const vendorRuc = product.ruc.toLowerCase();
        const vendorPhone = product.phone.toLowerCase();
        const vendorEmail = product.email.toLowerCase();

        return searchWords.every(word =>
          vendorName.includes(word) ||
          vendorSocialReason.includes(word) ||
          vendorRuc.includes(word) ||
          vendorPhone.includes(word) ||
          vendorEmail.includes(word)
        );
      });
      setFilteredVendors(searchResults);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearch]);


  useEffect(() => {
    loadVendors();
  }, [])

  function exportToExcel() {
    const vendorsData = filteredVendors.map(({ name, SocialReason, email, phone, ruc }) => ({
      Nombre: name,
      Apellido: SocialReason,
      RUC: ruc,
      Correo: email,
      Telefono: phone
    }));

    exportDataForExcel("proveedores", vendorsData);
  }

  const handleSortSelection = (index: number) => {
    const sortedVendors = filteredVendors;
    if (index === 0) {
      sortedVendors.sort((a, b) => a.name.localeCompare(b.name));
    } else if (index === 1) {
      sortedVendors.sort((a, b) => a.SocialReason.localeCompare(b.SocialReason));
    } else if (index === 2) {
      sortedVendors.sort((a, b) => a.ruc.localeCompare(b.ruc));
    } else if (index === 3) {
      sortedVendors.sort((a, b) => a.phone.localeCompare(b.phone));
    } else if (index === 4) {
      sortedVendors.sort((a, b) => a.email.localeCompare(b.email));
    } else if (index === 5) {
      sortedVendors.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    setFilteredVendors(sortedVendors);
    setIsOpen(false)
  };

  const indexOfLastVendor = currentPage * VENDOR_FOR_PAGINATION;
  const indexOfFirstVendor = indexOfLastVendor - VENDOR_FOR_PAGINATION;
  const currentVendor = filteredVendors.slice(indexOfFirstVendor, indexOfLastVendor);

  const totalPages = Math.ceil(filteredVendors.length / VENDOR_FOR_PAGINATION);
  const totalVendors = filteredVendors.length;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleChangeStateVendor = (selectedVendors: SelectedVendorsProps[]) => {
    const updatedVendors = filteredVendors.map(vendor => {
      const selectedVendor = selectedVendors.find(selected => selected.IDVendor === vendor.IDSupplier);
      if (selectedVendor) {
        return { ...vendor, state: !selectedVendor.state };
      }
      return vendor;
    });

    setFilteredVendors(updatedVendors);
    vendors.current = updatedVendors;
    setActiveFilter(0)
  };

  return (
    <Container>
      <section className='p-5'>
        <HeaderTable secondaryButtonOnClick={exportToExcel} primaryButtonOnClick={() => navigate('/vendor/add')} primaryButtonText='Nuevo proveedor' name='Proveedores' />
        <FilterTable
          isOpen={isOpen}
          onClickPrimaryButton={() => { setIsSearch(!isSearch); setSearchTerm('') }}
          onClickSecondaryButton={() => setIsOpen(!isOpen)}
          filters={FILTER_VENDORS}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        >
          <DropDownOrder orders={ORDERS_VENDORS} onSelect={handleSortSelection} />
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
        {currentVendor &&
          <VendorTable
            vendor={currentVendor}
            onRefreshVendors={handleChangeStateVendor}
            showOptions={showOptions}
            setShowOptions={setShowOptions}
          />
        }
        <div className='border-x border-b py-2 px-3 bg-whiting2 border-gray-300 rounded-b-lg flex  md:flex-row flex-col items-center  justify-between'>
          <div className='md:mb-0 mb-3'>
            <span className='text-secondary font-medium text-sm'>
              Mostrando <span className="font-semibold text-primary">{indexOfFirstVendor + 1} - {Math.min(indexOfLastVendor, totalVendors)}</span> de <span className="font-semibold text-primary">{totalVendors}</span>
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


