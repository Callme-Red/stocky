import { ChangeEvent, forwardRef, useEffect, useState } from 'react';
import { allowNumber } from '../../utils/function.ts';

interface Props {
  name?: string;
  placeholder?: string;
  id: string;
  className?: string;
  isNumber?: boolean;
  readonly?: boolean;
  classNameInput?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  disabled?: boolean;
  autofocus?: boolean;
  required?: boolean;
}

const FieldInput = forwardRef<HTMLInputElement, Props>((
  {
    name,
    placeholder = '',
    id,
    className,
    isNumber = false,
    readonly = false,
    classNameInput,
    onChange,
    value,
    disabled = false,
    autofocus = false,
    required = true,
  }, ref) => {

  const [inputValue, setInputValue] = useState<string>(value?.toString() || '');

  useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (isNumber) {
      allowNumber(e);
    }
    setInputValue(e.target.value);

    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`${className}`}>
      {name && <label htmlFor={id} className="block mb-2 text-left text-sm font-medium text-primary">{name}</label>}
      <input
        ref={ref}
        type="text"
        id={id}
        className={`bg-gray-50 text-primary ${classNameInput} outline-none border placeholder-primary border-gray-600 text-sm font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1`}
        placeholder={placeholder}
        required={required}
        autoFocus={autofocus}
        onChange={handleChangeInput}
        readOnly={readonly}
        value={inputValue}
        disabled={disabled}
      />
    </div>
  );
});

export default FieldInput;
