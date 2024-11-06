import { FC } from 'react';

interface MenuItemProps {
  Icon: React.ElementType;
  text: string;
  className?: string;
  active?: boolean;
}

const MenuItem: FC<MenuItemProps> = ({ Icon, text, className = "", active = false }) => (
  <div className={`flex items-center ${active ? 'bg-white' : 'bg-transparent'} w-full ${!active && 'hover:bg-white/30'} mb-2 cursor-pointer py-1 px-3 rounded-lg ${className}`}>
    <Icon />
    <h3 className="text-black font-semibold text-sm ml-3">{text}</h3>
  </div>
);

export default MenuItem;
