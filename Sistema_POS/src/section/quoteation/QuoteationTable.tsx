import { useState, useEffect } from 'react';
import CheckBox from '../../components/form/CheckBox';
import StatusTags from '../../components/StatusTags';
import { Quotation } from '../../types/types';
import { ThreeDots } from '../../icons/icons';
import ToolTip from '../../components/ToolTip';
import { currencyFormatter } from '../../utils/function';
import DropDownQuotation from './DropDownQuotation';

interface QuoteationTableProps {
  quoteation: Quotation[];
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
}

const QuoteationTable: React.FC<QuoteationTableProps> = ({ quoteation, showOptions, setShowOptions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuoteation, setSelectedQuoteation] = useState<Quotation | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const headers = [
    { title: 'Codigo', className: 'pl-2' },
    { title: 'Cliente', className: 'pl-2' },
    { title: 'Estado', className: 'xl:table-cell hidden px-2' },
    { title: 'Fecha', className: 'lg:table-cell hidden px-2' },
    { title: 'Delivery', className: 'md:table-cell hidden px-2' },
    { title: 'Costo', className: 'px-2 text-right xs:table-cell hidden' },
    { title: 'Subtotal', className: 'px-2 text-right xs:table-cell hidden' },
    { title: 'Descuento', className: 'px-2 xs:table-cell hidden text-right' },
  ];

  useEffect(() => {
    setShowOptions(selectedQuoteation === null);
  }, [selectedQuoteation, setShowOptions]);

  const handleCheckBoxChange = (quotation: Quotation) => {
    setSelectedQuoteation(quotation)
  };

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-gray-300 border-b-0">
      <table className="w-full text-left">
        <thead className="bg-[whiting2] border-b border-gray-300">
          <tr className="[&>th]:font-medium [&>th]:text-[13px] [&>th]:text-secondary [&>th]:py-3 px-2">
            <td />
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className={header.className}
                style={{ opacity: showOptions ? 1 : 0 }}
              >
                {header.title}
              </th>
            ))}
            <th scope="col" className="px-2 w-28 font-medium text-right relative">
              {showOptions ? (
                "Total"
              ) : (
                <div className='flex items-center justify-end'>
                  <div className='absolute right-2 flex'>
                    <div onClick={toggleDropdown} data-tooltip-id="options" className='bg-white cursor-pointer border border-gray-300 shadow-md size-8 ml-1 flex items-center justify-center rounded-md'>
                      <ThreeDots />
                      {isOpen && <ToolTip id='options' title='Más opciones' />}
                    </div>
                    {isOpen && <DropDownQuotation currentQuotation={selectedQuoteation} />}
                  </div>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {quoteation.map((quotation) => (
            <tr key={quotation.IDQuotation} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50">
              <td className="w-4 p-2">
                <CheckBox
                  name=''
                  initialValue={selectedQuoteation?.IDQuotation === quotation.IDQuotation}
                  onChange={() => handleCheckBoxChange(selectedQuoteation?.IDQuotation === quotation.IDQuotation ? null : quotation)}
                />
              </td>
              <td className="pl-2 py-4">
                {quotation.quotationCode}
              </td>
              <td className="pl-2 py-4">
                {quotation.Client}
              </td>
              <td className="px-2 py-4 xl:table-cell hidden">
                {quotation.state !== "2" && <StatusTags text={quotation.state ? 'Activo' : 'Inactivo'} status={quotation.state === "1"} />}
                {quotation.state === "2" && <StatusTags text="Completada" status />}
              </td>
              <td className="px-2 py-4 lg:table-cell hidden">
                <span>{new Date(quotation.date).toLocaleDateString()}</span>
              </td>
              <td className="p-2 md:table-cell hidden">
                <StatusTags text={quotation.typeShipping ? 'Delivery' : 'No aplica'} status={quotation.typeShipping} />
              </td>
              <td className="px-2 py-4 text-right xs:table-cell hidden">
                {currencyFormatter(quotation.shippingCost)}
              </td>
              <td className="p-2 text-right xs:table-cell hidden">
                {currencyFormatter(quotation.subTotal)}
              </td>
              <td className="p-2 xs:table-cell hidden text-right">
                {currencyFormatter(quotation.discount)}
              </td>
              <td className="p-2  text-right">
                {currencyFormatter(quotation.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuoteationTable;
