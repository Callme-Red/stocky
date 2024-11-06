import { useState, useEffect } from "react";
import { Check } from "../../icons/icons";

interface Props {
  name?: string;
  onChange?: (value: boolean) => void;
  initialValue: boolean;
  disabled?: boolean;
}

export default function CheckBox({ name, onChange, initialValue, disabled }: Props) {
  const [value, setValue] = useState<boolean>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const changeValue = () => {
    const newValue = !value;
    setValue(newValue);
    if (!onChange) return;
    onChange(newValue);
  };

  return (
    <div className="flex items-center">
      <button
        disabled={disabled}
        type="button"
        onClick={changeValue}
        className={`size-5 ${value ? 'bg-primary' : 'bg-white'} disabled:cursor-not-allowed border border-gray-500 flex items-center justify-center rounded-md transition-colors duration-200`}
      >
        {value && <Check />}
      </button>
      {name && <span className={`font-medium text-secondary text-sm ml-3`}>{name}</span>}
    </div>
  );
}
