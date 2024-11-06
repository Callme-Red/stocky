import { useState } from 'react';

interface Props {
  onSelect: (index: number) => void;
}

export default function DropDownFilterForDates({ onSelect }: Props) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleOptionChange = (index: number) => {
    setSelectedOption(index);
    onSelect(index);
  };

  const dates = ['Ultimo dia', 'Ultimos 7 dias', 'Ultimos 30 dias', 'Ultimos mes', 'Ultimos 3 meses', "Personalizado"];

  return (
    <div
      id="dropdownRadio"
      className="z-10 block w-48 bg-white divide-y divide-gray-100 rounded-lg shadow"
    >
      <ul
        className="p-3 space-y-1 text-sm text-gray-700"
        aria-labelledby="dropdownRadioButton"
      >
        {dates.map((date, index) => (
          <li key={index} className='cursor-pointer'>
            <div
              role='button'
              onClick={() => handleOptionChange(index)}
              className="flex items-center p-2 rounded-md hover:bg-gray-100"
            >
              <input
                id={`radiobutton-${index}`}
                type="radio"
                name="filter-radio"
                checked={selectedOption === index}
                onChange={() => handleOptionChange(index)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
              />
              <label
                htmlFor={`radiobutton-${index}`}
                className="w-full ms-2 cursor-pointer text-sm font-medium text-gray-900 rounded"
              >
                {date}
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
