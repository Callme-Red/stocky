import { useState, useEffect } from 'react';
import { CategoryProps } from '../../types/types';
import CheckBox from '../../components/form/CheckBox';

interface Props {
  category: CategoryProps[];
  selectedCategory: string | null;
  onSelected: (category: string | null) => void;
}

export default function DropDownFilterProductByCategory({ category, selectedCategory, onSelected }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCategoryId(selectedCategory);
  }, [selectedCategory]);

  const handleCheckBoxToggle = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
      onSelected(null);
    } else {
      setSelectedCategoryId(categoryId);
      onSelected(categoryId);
    }
  };

  return (
    <div
      id="dropdown"
      className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10`}
    >
      <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700 px-2" aria-labelledby="dropdownDefaultButton">
        {category.map(({ NombreCategoria, IDCategoria }, index) => (
          <li key={index} className='flex items-center hover:bg-gray-100'>
            <CheckBox
              initialValue={selectedCategoryId === IDCategoria}
            />
            <button
              className="block text-secondary ml-2 w-full text-left py-2"
              onClick={() => handleCheckBoxToggle(IDCategoria)}
            >
              {NombreCategoria}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
