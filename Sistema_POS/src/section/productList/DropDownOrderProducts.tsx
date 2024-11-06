import { useState } from 'react';
import CheckBox from '../../components/form/CheckBox';

interface DropDownOrderProductsProps {
  onSelect: (index: number) => void;
  orders: string[];
  children?: JSX.Element;
}

export default function DropDownOrder({ onSelect, orders, children }: DropDownOrderProductsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleCheckBoxToggle = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
      onSelect(-1);
    } else {
      setSelectedIndex(index);
      onSelect(index);
    }
  };

  return (
    <div
      id="dropdown"
      className={`absolute right-0 top-full p-2 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10`}
    >
      <span className='text-primary font-semibold text-sm'>Ordenar por</span>
      <ul className="py-2 [&>li>button]:font-medium text-sm" aria-labelledby="dropdownDefaultButton">
        {orders.map((label, index) => (
          <li key={index} className='flex items-center hover:bg-gray-100'>
            <CheckBox
              initialValue={selectedIndex === index}
              onChange={() => handleCheckBoxToggle(index)}
            />
            <button
              className="block text-secondary ml-2 w-full text-left py-2"
              onClick={() => handleCheckBoxToggle(index)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {children}
    </div>
  );
}
