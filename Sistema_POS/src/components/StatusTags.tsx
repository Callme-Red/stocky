interface Props {
  status: boolean;
  text: string;
  className?: string;
  color?: string;
  textColor?: string;
}

export default function StatusTags({ status, text, className = '', color, textColor }: Props) {
  return (
    <span className={`${className} ${!textColor ? status ? 'text-[#014b40]' : 'text-[#d10000]' : textColor} ${!color ? status ? 'bg-[#affebf]' : 'bg-[#ffabab]' : color} text-xs font-semibold py-1 px-2 rounded-md`}>{text}</span>
  )
}
