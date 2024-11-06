import { useEffect, useRef, useState } from 'react';
import { getProducts } from '../../api/inventory/products';
import Container from '../../layout/Container';
import ProductTable from '../../section/productList/ProductTable';
import { ProductsProps, SelectedProductsProps } from '../../types/types';
import FilterTable from '../../components/FilterTable';
import HeaderTable from '../../components/HeaderTable';
import { useNavigate } from 'react-router-dom';
import FieldInput from '../../components/form/FieldInput';
import { Close } from '../../icons/icons';
import DropDownOrder from '../../section/productList/DropDownOrderProducts';
import { exportDataForExcel } from '../../utils/function';

export default function Products() {
  const navigate = useNavigate();
  const ORDERS_PRODUCTS = ['Nombre producto', 'Inventario', 'Fecha de creación']
  const FILTERS_PRODUCTS = ['Todos', 'Activos', 'Inactivos', 'Stock mínimo'];
  const PRODUCT_FOR_PAGINATION = 25;

  const products = useRef<ProductsProps[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const [filteredProducts, setFilteredProducts] = useState<ProductsProps[]>([]);
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const loadProducts = async () => {
    const { data } = await getProducts();
    products.current = data;
    setFilteredProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeFilter === 0) {
      setFilteredProducts(products.current);
    } else if (activeFilter === 3) {
      setFilteredProducts(products.current.filter(product => product.existencias < product.cantidadMinima));
    } else {
      setFilteredProducts(products.current.filter(product => product.estado === (activeFilter === 1)));
    }
  }, [activeFilter]);

  const exportToExcel = () => {
    const filteredData = filteredProducts.map(product => ({
      Codigo: product.CodigoProducto,
      Producto: product.NombreProducto,
      Categoria: product.nombre_categoria,
      estado: product.estado,
      StockMinimo: product.cantidadMinima,
      Precio: product.precio_producto.Precio,
      Costo: product.precio_producto.Costo,
      Ganancia: product.precio_producto.Ganancia,
      Margen: product.precio_producto.Margen,
      Existencias: product.existencias,
    }));

    exportDataForExcel("productos", filteredData);
  };

  const handleChangeStateProducts = (selectedPrododucts: SelectedProductsProps[]) => {
    const updateProducts = filteredProducts.map(products => {
      const selectedProduct = selectedPrododucts.find(selected => selected.IDProduct === products.IDProducto);
      if (selectedProduct) {
        return { ...products, estado: !selectedProduct.estado };
      }
      return products;
    });

    setFilteredProducts(updateProducts);
    products.current = updateProducts;
    setActiveFilter(0)
  };

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredProducts(products.current);
    } else {
      const searchResults = products.current.filter(product => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const productName = product.NombreProducto.toLowerCase();
        const productCode = product.CodigoProducto.toLowerCase();
        const categoryName = product.nombre_categoria.toLowerCase();

        return searchWords.every(word =>
          productName.includes(word) ||
          productCode.includes(word) ||
          categoryName.includes(word)
        );
      });
      setFilteredProducts(searchResults);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearch]);

  const indexOfLastProduct = currentPage * PRODUCT_FOR_PAGINATION;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCT_FOR_PAGINATION;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCT_FOR_PAGINATION);
  const totalProducts = filteredProducts.length;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSortSelection = (index: number) => {
    const sortedProducts = filteredProducts;
    if (index === 0) {
      sortedProducts.sort((a, b) => a.NombreProducto.localeCompare(b.NombreProducto));
    } else if (index === 1) {
      sortedProducts.sort((a, b) => b.existencias - a.existencias);
    } else if (index === 2) {
      sortedProducts.sort((a, b) => new Date(b.FechaIngreso).getTime() - new Date(a.FechaIngreso).getTime());
    }

    setFilteredProducts(sortedProducts);
    setIsOpen(false)
  };

  return (
    <Container>
      <section className='p-5'>
        <HeaderTable secondaryButtonOnClick={exportToExcel} primaryButtonOnClick={() => navigate('/products/add/')} primaryButtonText='Nuevo producto' name='Productos' />
        <FilterTable
          filters={FILTERS_PRODUCTS}
          activeFilter={activeFilter}
          isOpen={isOpen}
          onClickSecondaryButton={() => setIsOpen(!isOpen)}
          onClickPrimaryButton={() => { setIsSearch(!isSearch); setSearchTerm('') }}
          setActiveFilter={setActiveFilter}
        >
          <DropDownOrder orders={ORDERS_PRODUCTS} onSelect={handleSortSelection} />
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

        {currentProducts && (
          <ProductTable
            onRefreshProducts={handleChangeStateProducts}
            products={currentProducts}
            setShowOptions={setShowOptions}
            showOptions={showOptions}
          />
        )}
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
    </Container >
  );
}
