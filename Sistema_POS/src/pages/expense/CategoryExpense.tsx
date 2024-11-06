import { useEffect, useRef, useState } from 'react';
import Container from '../../layout/Container';
import FilterTable from '../../components/FilterTable';
import { CategoryExpenseProps } from '../../types/types';
import HeaderTable from '../../components/HeaderTable';
import CategoryTable from '../../section/expense/CategoryTable';
import { getCategoryExpense } from '../../api/purchase/expense';
import CategoryExpenseModal from '../../section/expense/CategoryExpenseModal';
import FieldInput from '../../components/form/FieldInput';
import { Close } from '../../icons/icons';
import { exportDataForExcel } from '../../utils/function';
import DropDownOrder from '../../section/productList/DropDownOrderProducts';

export default function CategoryExpense() {
  const CATEGORY_FOR_PAGINATION = 25;
  const ORDERS_CATEGORY = ["Nombre"];
  const FILTERS_CATEGORY = ['Todos', 'Activos', 'Eliminados'];

  const [categories, setCategories] = useState<CategoryExpenseProps[]>([]);
  const categoryRef = useRef<CategoryExpenseProps[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  async function loadCategories() {
    const { data } = await getCategoryExpense();
    categoryRef.current = data;
    setCategories(data);
  }

  useEffect(() => {
    if (searchTerm === '') {
      setCategories(categoryRef.current);
    } else {
      const searchResults = categoryRef.current.filter(product => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const categoryName = product.name.toLowerCase();

        return searchWords.every(word =>
          categoryName.includes(word)
        );
      });
      setCategories(searchResults);
    }
  }, [searchTerm]);

  const handleSortSelection = (index: number) => {
    const sortedProducts = categories;
    if (index === 0) {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    setCategories(sortedProducts);
    setIsOpen(false)
  };

  useEffect(() => {
    if (activeFilter === 0) {
      setCategories(categoryRef.current);
    } else if (activeFilter === 1) {
      setCategories(categoryRef.current.filter((category) => category.state === true))
    } else if (activeFilter === 2) {
      setCategories(categoryRef.current.filter((category) => category.state === false))
    }
  }, [activeFilter]);

  useEffect(() => {
    if (isSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearch]);


  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [])

  function onClose() {
    setShowModal(false);
    loadCategories();
  }

  const exportToExcel = () => {
    const filteredData = categories.map(({ name, description }) => ({
      Nombre: name,
      Descripcion: description
    }));

    exportDataForExcel("categorias de gastos", filteredData);
  };
  const handleChangeStateCategory = (selectedCategory: CategoryExpenseProps[]) => {
    const updatedCategories = categories.map(cat => {
      const selectedCustomer = selectedCategory.find(selected => selected.IDExpenseCategory === cat.IDExpenseCategory);
      if (selectedCustomer) {
        return { ...cat, state: !selectedCustomer.state };
      }
      return cat;
    });

    setCategories(updatedCategories);
    categoryRef.current = updatedCategories;
    setActiveFilter(0)
  };

  const indexOfLastCategory = currentPage * CATEGORY_FOR_PAGINATION;
  const indexOfFirstCategory = indexOfLastCategory - CATEGORY_FOR_PAGINATION;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);

  const totalPages = Math.ceil(categories.length / CATEGORY_FOR_PAGINATION);
  const totalCategories = categories.length;

  return (
    <Container>
      <>
        <section className='p-5'>
          <HeaderTable secondaryButtonOnClick={exportToExcel} name='Categorias de gastos' primaryButtonText='Nueva categoria' primaryButtonOnClick={() => setShowModal(true)} />
          <FilterTable
            filters={FILTERS_CATEGORY}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            isOpen={isOpen}
            onClickSecondaryButton={() => setIsOpen(!isOpen)}
            onClickPrimaryButton={() => { setIsSearch(!isSearch); setSearchTerm('') }}
          >
            <DropDownOrder orders={ORDERS_CATEGORY} onSelect={handleSortSelection} />
          </FilterTable>
          <div
            className={`transition-all duration-300 ease-in-out ${isSearch ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
          >
            <div className='border-x border-t space-x-3 py-2 px-3 bg-white border-gray-300 flex items-center'>
              <FieldInput
                className='w-full'
                id='search'
                ref={searchRef}
                placeholder='Buscar por nombre de categoria...'
                classNameInput='h-10'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button onClick={() => { setIsSearch(false); setSearchTerm('') }} className='bg-[#e3e3e3] shadow-sm hover:bg-[#d4d4d4] p-2 rounded-md border border-gray-300'>
                <Close />
              </button>
            </div>
          </div>
          {currentCategories &&
            <CategoryTable
              handleChangeStateCategory={handleChangeStateCategory}
              onLoadCategory={loadCategories}
              categories={currentCategories}
              showOptions={showOptions}
              setShowOptions={setShowOptions}
            />
          }
          <div className='border-x border-b py-2 px-3 bg-whiting2 border-gray-300 rounded-b-lg flex  md:flex-row flex-col items-center  justify-between'>
            <div className='md:mb-0 mb-3'>
              <span className='text-secondary font-medium text-sm'>
                Mostrando <span className="font-semibold text-primary">{indexOfFirstCategory + 1} - {Math.min(indexOfLastCategory, totalCategories)}</span> de <span className="font-semibold text-primary">{totalCategories}</span>
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
        {showModal && <CategoryExpenseModal isSave onClose={onClose} />}
      </>
    </Container >
  );
}

