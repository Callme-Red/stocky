interface Props {
  name: string;
  className?: string;
  onClick?: () => void;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export default function Button({ name, className, onClick, type = "button" }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-3 py-2 font-semibold ${className} rounded-lg text-xs`}
    >
      {name}
    </button>
  );
}

