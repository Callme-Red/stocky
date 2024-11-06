import { useState, ChangeEvent, useEffect } from 'react';
import { allowNumber } from '../../utils/function';

interface Props {
  name: string;
  placeholder?: string;
  id: string;
  className?: string;
  prependChild?: JSX.Element;
  appendChild?: JSX.Element;
  isNumber?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  required?: boolean;
  readOnly?: boolean;
  focus?: boolean;
}

export default function FieldInputWithElement({
  name,
  placeholder,
  id,
  className,
  prependChild,
  appendChild,
  isNumber = false,
  onChange,
  value,
  required = true,
  readOnly = false,
  focus = false
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value?.toString() || '');

  useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (isNumber) {
      allowNumber(e);
    }
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`${className}`}>
      {name && <label htmlFor={id} className="block mb-2 text-sm font-medium text-primary">{name}</label>}
      <div
        className={`bg-gray-50 border rounded-lg flex justify-between items-center px-3 py-1 h-10 w-full ${isFocused ? 'border-blue-500' : 'border-gray-600'}`}
      >
        {appendChild && <div className="mr-2">{appendChild}</div>}
        <input
          id={id}
          className={`bg-gray-50 outline-none text-sm font-medium placeholder-primary w-full text-primary h-full`}
          placeholder={placeholder}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChangeInput}
          value={inputValue}
          readOnly={readOnly}
          autoFocus={focus}
        />
        {prependChild && <div className="ml-2">{prependChild}</div>}
      </div>
    </div>
  );
}
