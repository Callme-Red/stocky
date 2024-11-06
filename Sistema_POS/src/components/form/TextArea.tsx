interface Props {
  name: string;
  placeholder?: string;
  id: string;
  rows: number;
  value?: string;
  required?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function TextArea({ name, required = true, placeholder, id, rows, value, onChange }: Props) {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-primary">{name}</label>
      <textarea
        rows={rows}
        id={id}
        className="bg-gray-50 resize-none outline-none border placeholder-primary border-gray-600 text-primary text-sm font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}
