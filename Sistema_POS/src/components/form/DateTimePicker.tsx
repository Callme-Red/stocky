interface Props {
  name?: string;
  className?: string;
  id: string;
  classNameInput?: string;
  placeholder?: string;
  readonly?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: string;
  max?: string;
  value?: string;
}

export default function DateTimePicker({
  name = '',
  className = '',
  id,
  classNameInput = '',
  placeholder = '',
  readonly = false,
  onChange,
  required = true,
  min,
  max,
  value
}: Props) {
  const isControlled = value !== undefined && onChange !== undefined;

  return (
    <div className={`${className}`}>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-primary">{name}</label>
      <input
        type="date"
        id={id}
        min={min}
        max={max}
        className={`bg-gray-50 ${classNameInput} outline-none border placeholder-primary border-gray-600 text-primary text-sm font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1`}
        placeholder={placeholder}
        required={required}
        readOnly={readonly || !isControlled}
        onChange={onChange}
        value={value ?? ''}
      />
    </div>
  );
}
