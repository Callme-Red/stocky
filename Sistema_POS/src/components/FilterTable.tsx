import ToolTip from "./ToolTip";
import { Filter, Search, Sort } from "../icons/icons"

interface FilterTableProps {
  isOpen?: boolean
  filters: string[];
  activeFilter: number;
  setActiveFilter: (index: number) => void;
  onClickPrimaryButton?: () => void;
  onClickSecondaryButton?: () => void;
  children?: JSX.Element;
  secondChildren?: JSX.Element;
}

const FilterTable: React.FC<FilterTableProps> = ({ isOpen, children, onClickPrimaryButton, onClickSecondaryButton, secondChildren, filters, activeFilter, setActiveFilter }) => {
  return (
    <div className='border-x border-t py-2 px-3 bg-white border-gray-300 rounded-t-lg flex flex-wrap items-center justify-between gap-2'>
      <div className="flex flex-wrap gap-2 md:gap-2">
        {filters.map((filter, index) => (
          <button
            onClick={() => setActiveFilter(index)}
            key={index}
            className={`${index === activeFilter ? 'bg-whiting2' : 'bg-transparent'} px-1 py-2 md:p-2 text-xs md:text-[13px] font-semibold rounded-md text-secondary/90`}>
            {filter}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 md:gap-2 relative justify-end md:ml-0 ml-auto">
        {secondChildren}
        <div role="button" onClick={onClickPrimaryButton} data-tooltip-id="search" className='bg-white text-secondary/80 cursor-pointer shadow-md border border-gray-300 h-8 px-2 md:px-2 flex items-center justify-center rounded-md'>
          <Search className='md:size-5 size-4' />
          <Filter className='md:size-5 size-4' />
          <ToolTip id="search" title="Buscar y filtrar (F)" />
        </div>
        <div role="button" onClick={onClickSecondaryButton} data-tooltip-id="sort" className='bg-white cursor-pointer shadow-md p-1 md:p-1 border border-gray-300 h-8 flex items-center justify-center rounded-md'>
          <Sort className='md:size-5 size-4' />
          <ToolTip id="sort" title="Ordenar" />
        </div>
        {isOpen && children}
      </div>
    </div>
  );
}

export default FilterTable;
