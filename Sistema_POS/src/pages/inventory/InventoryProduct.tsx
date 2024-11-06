import { useCallback, useEffect, useRef, useState } from 'react';
import Container from '../../layout/Container';
import FilterTable from '../../components/FilterTable';
import HeaderTable from '../../components/HeaderTable';
import InventoryTable from '../../section/inventory/InventoryTable';
import { getKardexByDate } from '../../api/inventory/inventory';
import ProductSearch from '../../section/product/ProductSearch';
import { getProducts } from '../../api/inventory/products';
import { InventoryProps, ProductsProps } from '../../types/types';
import FieldInput from '../../components/form/FieldInput';
import { Close } from '../../icons/icons';
import DropDownOrder from '../../section/productList/DropDownOrderProducts';
import { exportDataForExcel, formatDate } from '../../utils/function';
import DropDownFilterForDates from '../../section/productList/DropDownFilterForDates';
import ModalMonthSales from '../../section/reports/ModalMonthSales';
import { useNavigate } from 'react-router-dom';

interface CategoryOption {
  label: string;
  value: string;
}

export default function InventoryProduct() {
  const navigate = useNavigate();
  const INVENTORY_FOR_PAGINATION = 25;
  const ORDERS_INVENTORY = ["Tipo movimiento", "Entrada", "Salida", "Unidades", "Costo entrada", "Costo salida", "Costo saldo", "Costo promedio", "Fecha creación"]
  const FILTERS_INVENTORY = ['Todos', 'Entradas', 'Salidas', 'Entrada Ajustes', 'Salida Ajustes'];

  const searchRef = useRef<HTMLInputElement>();
  const inventoryRef = useRef<InventoryProps[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [products, setProducts] = useState<CategoryOption[]>();
  const [inventory, setInventory] = useState<InventoryProps[]>([]);
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [nameDate, setNameDate] = useState<string>('Ultimo dia');
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentProduct, setCurrentProduct] = useState<string>('');

  const [isShowModal, setIsShowModal] = useState({
    ModalOrder: false,
    ModalDates: false,
    ModalMonth: false
  });

  const loadInventory = useCallback(async (startDate: string, endDate: string) => {
    if (currentProduct.trim() === '') return;

    const { data } = await getKardexByDate(currentProduct, startDate, endDate);
    setActiveFilter(0)
    inventoryRef.current = data;
    setInventory(data);
  }, [currentProduct])

  useEffect(() => {
    const today = new Date();
    loadInventory(formatDate(today), formatDate(today));
  }, [currentProduct, loadInventory])

  useEffect(() => {
    if (activeFilter === 0) {
      setInventory(inventoryRef.current);
    } else if (activeFilter === 1) {
      setInventory(inventoryRef.current.filter(inventory => inventory.tipoMovimiento === '0'));
    } else if (activeFilter === 2) {
      setInventory(inventoryRef.current.filter(inventory => inventory.tipoMovimiento === '1'));
    } else if (activeFilter === 3) {
      setInventory(inventoryRef.current.filter(inventory => inventory.tipoMovimiento === '2'));
    } else if (activeFilter === 4) {
      setInventory(inventoryRef.current.filter(inventory => inventory.tipoMovimiento === '3'));
    }
  }, [activeFilter]);

  const handleSortSelection = (index: number) => {
    const sortedSales = inventory;

    const sortFunctions: { [key: number]: (a: InventoryProps, b: InventoryProps) => number } = {
      0: (a, b) => a.tipoMovimiento.localeCompare(b.tipoMovimiento),
      1: (a, b) => Number(b.entrada) - Number(a.entrada),
      2: (a, b) => Number(b.salida) - Number(a.salida),
      3: (a, b) => Number(b.saldoUnidades) - Number(a.saldoUnidades),
      4: (a, b) => Number(b.costoEntrada) - Number(a.costoEntrada),
      5: (a, b) => Number(b.costoSalida) - Number(a.costoSalida),
      6: (a, b) => Number(b.costoSaldo) - Number(a.costoSaldo),
      7: (a, b) => Number(b.costoSaldo) - Number(a.costoSaldo),
      8: (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    };

    const sortFunction = sortFunctions[index];
    if (sortFunction) {
      sortedSales.sort(sortFunction);
      setIsShowModal({ ...isShowModal, ModalOrder: false })
    }

    setInventory(sortedSales);
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
      loadInventory(start, end);
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
    const filteredData = inventory.map(({ fecha, tipoMovimiento, entrada, saldoUnidades, salida, costoEntrada, costoSaldo, costoPromedio, costoSalida }) => ({
      Fecha: new Date(fecha).toLocaleDateString(),
      Movimiento: tipoMovimiento === '0' ? 'Compra' : tipoMovimiento === '1' ? 'Venta' : tipoMovimiento === '2' ? 'Entrada por ajuste' : 'Salida por ajuste',
      Entrada: Number(entrada).toFixed(2),
      Salida: Number(salida).toFixed(2),
      Existencia: Number(saldoUnidades).toFixed(2),
      CostoEntrada: Number(costoEntrada).toFixed(2),
      CostoSalida: Number(costoSalida).toFixed(2),
      Costo: Number(costoSaldo).toFixed(2),
      CostoPromedio: Number(costoPromedio).toFixed(2)
    }));

    exportDataForExcel("inventario", filteredData);
  };

  useEffect(() => {
    if (isSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearch]);

  useEffect(() => {
    if (searchTerm === '') {
      setInventory(inventoryRef.current);
    } else {
      const searchResults = inventoryRef.current.filter(product => {
        const inventoryType = product.tipoMovimiento === '0' ? 'Compra' : product.tipoMovimiento === '1' ? 'Venta' : product.tipoMovimiento === '2' ? 'Entrada por ajuste' : 'Salida por ajuste'

        const searchWords = searchTerm.toLowerCase().split(' ');
        const inventory = inventoryType.toLowerCase();

        return searchWords.every(word =>
          inventory.includes(word)
        );
      });
      setInventory(searchResults);
    }
  }, [searchTerm]);

  useEffect(() => {
    async function loadProducts() {
      const { data } = await getProducts();
      const dataProduct: ProductsProps[] = data;

      const products = dataProduct.map((product) => ({
        value: product.IDProducto,
        label: product.NombreProducto
      }));

      setProducts(products);
    }

    loadProducts();
  }, [])

  const indexOfLastInventory = currentPage * INVENTORY_FOR_PAGINATION;
  const indexOfFirstInventory = indexOfLastInventory - INVENTORY_FOR_PAGINATION;
  const currentInventory = inventory.slice(indexOfFirstInventory, indexOfLastInventory);

  const totalPages = Math.ceil(inventory.length / INVENTORY_FOR_PAGINATION);
  const totalInventories = inventory.length;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const onApply = useCallback(async (year: number, month: number) => {
    const startDate = new Date(year, month - 2, 1);
    const endDate = new Date(year, month, 0);

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    loadInventory(formattedStartDate, formattedEndDate)
  }, [loadInventory]);

  return (
    <>
      <Container>
        <section className='p-5'>
          <HeaderTable secondaryButtonOnClick={exportToExcel} primaryButtonOnClick={() => navigate('/sales/add/')} primaryButtonText='Nuevo venta' name='Tarjeta kardex' />

          <div className='mb-5'>
            <ProductSearch
              products={products}
              onProductSelect={(product) => { setCurrentProduct(product); setNameDate('Ultimo dia') }}
            />
          </div>

          {currentInventory &&
            <>
              <FilterTable
                filters={FILTERS_INVENTORY}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                isOpen={isShowModal.ModalOrder}
                onClickSecondaryButton={() => setIsShowModal({ ...isShowModal, ModalDates: false, ModalOrder: !isShowModal.ModalOrder })}
                onClickPrimaryButton={() => { setIsSearch(!isSearch); setSearchTerm('') }}
                secondChildren={<FilterSalesByDate />}
              >
                <DropDownOrder orders={ORDERS_INVENTORY} onSelect={handleSortSelection} />
              </FilterTable>
              <div
                className={`transition-all duration-300 ease-in-out ${isSearch ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
              >
                <div className='border-x border-t space-x-3 py-2 px-3 bg-white border-gray-300 flex items-center'>
                  <FieldInput
                    className='w-full'
                    id='search'
                    ref={searchRef}
                    placeholder='Buscar por movimiento...'
                    classNameInput='h-10'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <button onClick={() => { setIsSearch(false); setSearchTerm('') }} className='bg-[#e3e3e3] shadow-sm hover:bg-[#d4d4d4] p-2 rounded-md border border-gray-300'>
                    <Close />
                  </button>
                </div>
              </div>
              <InventoryTable
                inventory={currentInventory}
                showOptions={showOptions}
                setShowOptions={setShowOptions}
              />
              <div className='border-x border-b py-2 px-3 bg-whiting2 border-gray-300 rounded-b-lg flex  md:flex-row flex-col items-center  justify-between'>
                <div className='md:mb-0 mb-3'>
                  <span className='text-secondary font-medium text-sm'>
                    Mostrando <span className="font-semibold text-primary">{indexOfFirstInventory + 1} - {Math.min(indexOfLastInventory, totalInventories)}</span> de <span className="font-semibold text-primary">{totalInventories}</span>
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
            </>
          }
        </section>
      </Container>
      {isShowModal.ModalMonth && <ModalMonthSales onClose={() => setIsShowModal({ ...isShowModal, ModalMonth: false })} onApply={onApply} />}
    </>
  );
}
