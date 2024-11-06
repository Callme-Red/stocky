import { useState, useEffect } from 'react';
import { CategoryExpenseProps } from '../../types/types';
import { ThreeDots } from '../../icons/icons';
import CheckBox from '../../components/form/CheckBox';
import ToolTip from '../../components/ToolTip';
import DropDownCategoryExpense from './DropDownCategoryExpense';
import StatusTags from '../../components/StatusTags';

interface CategoriesTableProps {
  categories: CategoryExpenseProps[];
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
  onLoadCategory: () => void;
  handleChangeStateCategory(selectedCategory: CategoryExpenseProps[])
}

const CategoryTable: React.FC<CategoriesTableProps> = ({ handleChangeStateCategory, onLoadCategory, categories, showOptions, setShowOptions }) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryExpenseProps[]>([]);

  const headers = [
    { title: 'Nombre', className: 'pl-2 w-[10%]' },
    { title: 'Estado', className: 'px-6' },
  ];

  function onLoadCategoryFunction() {
    setSelectedCategory([])
    onLoadCategory();
  }

  useEffect(() => {
    setShowOptions(selectedCategory.length === 0);
  }, [selectedCategory, setShowOptions]);

  useEffect(() => {
    const allSelected = categories.every(cat => selectedCategory.some(selected => selected.IDExpenseCategory === cat.IDExpenseCategory));
    setIsChecked(allSelected);
  }, [selectedCategory, categories]);

  const handleCheckBoxChange = (newValue: boolean) => {
    if (newValue) {
      setSelectedCategory(categories.map(cat => ({ IDExpenseCategory: cat.IDExpenseCategory, description: cat.description, name: cat.name, state: cat.state })));
    } else {
      setSelectedCategory([]);
    }
  };

  const handleRowCheckBoxChange = (category: CategoryExpenseProps, newValue: boolean) => {
    let updatedSelectedCategories = [...selectedCategory];

    if (newValue) {
      updatedSelectedCategories.push(category);
    } else {
      updatedSelectedCategories = updatedSelectedCategories.filter(cat => cat.IDExpenseCategory !== category.IDExpenseCategory);
    }

    setSelectedCategory(updatedSelectedCategories);
  };

  const refreshCategory = async () => {
    handleChangeStateCategory(selectedCategory)
    setIsOpen(false)
    setSelectedCategory([]);
  };

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-gray-300 border-b-0">
      <table className="w-full text-left">
        <thead className="bg-[whiting2] border-b border-gray-300">
          <tr className="[&>th]:font-medium [&>th]:text-[13px] [&>th]:text-secondary [&>th]:py-3 px-2">
            <th scope="col" className="p-2 w-4">
              <CheckBox
                onChange={handleCheckBoxChange}
                name=''
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
                <div className='flex items-center justify-end'>
                  <div className='absolute right-2 flex'>
                    <div role="button"
                      onClick={() => setIsOpen(!isOpen)} data-tooltip-id="options" className='bg-white border border-gray-300 shadow-md size-8 ml-1 flex items-center justify-center rounded-md'>
                      <ThreeDots />
                      <ToolTip id='options' title='Mas opciones' />
                    </div>
                    <DropDownCategoryExpense onRefreshCategory={refreshCategory} onLoadCategory={onLoadCategoryFunction} selectedCategory={selectedCategory} isOpen={isOpen} />
                  </div>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.IDExpenseCategory} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50">
              <td className="w-4 p-2">
                <CheckBox
                  name=""
                  initialValue={selectedCategory.some(cat => cat.IDExpenseCategory === category.IDExpenseCategory)}
                  onChange={(value) => handleRowCheckBoxChange(category, value)}
                />
              </td>
              <td className="pl-2 text-left w-[30%] py-4">
                {category.name}
              </td>
              <td className="px-6 py-4">
                <StatusTags text={category.state ? 'Activo' : 'Inactivo'} status={category.state} />
              </td>
              <td className="px-6 py-4">
                {category.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryTable;
