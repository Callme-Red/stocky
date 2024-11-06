import { useState, useEffect } from 'react';
import { CategoryProps } from '../../types/types';
import { ThreeDots } from '../../icons/icons';
import CheckBox from '../../components/form/CheckBox';
import ToolTip from '../../components/ToolTip';
import DropDownCategory from './DropDownCategory';
import StatusTags from '../../components/StatusTags';

interface CategoriesTableProps {
  categories: CategoryProps[];
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
  onLoadCategory: () => void;
  handleChangeStateCategory(selectedCategory: CategoryProps[])
}

const CategoryTable: React.FC<CategoriesTableProps> = ({ categories, showOptions, setShowOptions, onLoadCategory, handleChangeStateCategory }) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryProps[]>([]);

  const headers = [
    { title: 'Nombre', className: 'pl-2 w-[10%]' },
    { title: 'Estado', className: 'px-4' },
  ];

  useEffect(() => {
    setShowOptions(selectedCategory.length === 0);
  }, [selectedCategory, setShowOptions]);

  useEffect(() => {
    const allSelected = categories.every(cat => selectedCategory.some(selected => selected.IDCategoria === cat.IDCategoria));
    setIsChecked(allSelected);
  }, [selectedCategory, categories]);

  const refreshCategory = async () => {
    handleChangeStateCategory(selectedCategory)
    setIsOpen(false)
    setSelectedCategory([]);
  };

  const handleCheckBoxChange = (newValue: boolean) => {
    if (newValue) {
      setSelectedCategory(categories.map(cat => ({ IDCategoria: cat.IDCategoria, descripcion: cat.descripcion, NombreCategoria: cat.NombreCategoria, estado: cat.estado })));
    } else {
      setSelectedCategory([]);
    }
  };

  const handleRowCheckBoxChange = (category: CategoryProps, newValue: boolean) => {
    let updatedSelectedCategories = [...selectedCategory];

    if (newValue) {
      updatedSelectedCategories.push(category);
    } else {
      updatedSelectedCategories = updatedSelectedCategories.filter(cat => cat.IDCategoria !== category.IDCategoria);
    }

    setSelectedCategory(updatedSelectedCategories);
  };

  function onLoadCategoryFunction() {
    setSelectedCategory([])
    onLoadCategory();
  }

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-b-0 border-gray-300">
      <table className="w-full text-left">
        <thead className="bg-[whiting2] border-b border-gray-300">
          <tr className="[&>th]:font-medium [&>th]:text-[13px] [&>th]:text-secondary [&>th]:py-3 px-2">
            <th scope="col" className="p-2 w-4">
              <CheckBox
                onChange={handleCheckBoxChange}
                name=""
                initialValue={isChecked}
              />
            </th>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className={header.className}
                style={{ opacity: showOptions ? 1 : 0 }}
              >
                {header.title}
              </th>
            ))}
            <th scope="col" className="px-6 w-[80%] font-medium relative">
              {showOptions ? (
                "Descripción"
              ) : (
                <div className="flex items-center justify-end">
                  <div className="absolute right-2 flex">
                    <div
                      role="button"
                      onClick={() => setIsOpen(!isOpen)}
                      data-tooltip-id="options"
                      className="bg-white border border-gray-300 shadow-md size-8 ml-1 flex items-center justify-center rounded-md"
                    >
                      <ThreeDots />
                      <ToolTip id="options" title="Mas opciones" />
                    </div>
                    <DropDownCategory onRefreshCategory={refreshCategory} onLoadCategory={onLoadCategoryFunction} selectedCategory={selectedCategory} isOpen={isOpen} />
                  </div>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.IDCategoria} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50">
              <td className="w-4 p-2">
                <CheckBox
                  name=""
                  initialValue={selectedCategory.some(cat => cat.IDCategoria === category.IDCategoria)}
                  onChange={(value) => handleRowCheckBoxChange(category, value)}
                />
              </td>
              <td className="pl-2 text-left w-[30%] py-4">
                {category.NombreCategoria}
              </td>
              <td className="p-4">
                <StatusTags text={category.estado ? 'Activo' : 'Inactivo'} status={category.estado} />
              </td>
              <td className="px-6 py-4">
                {category.descripcion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
