import { useState, useEffect } from 'react';
import CheckBox from '../../components/form/CheckBox';
import StatusTags from '../../components/StatusTags';
import { PurchaseProps } from '../../types/types';
import Button from '../../components/form/Button';
import { ThreeDots } from '../../icons/icons';
import ToolTip from '../../components/ToolTip';
import DropDownPurchase from './DropDownPurchase';
import { currencyFormatter } from '../../utils/function';
import { useNavigate } from 'react-router-dom';

interface PurchaseTableProps {
  purchase: PurchaseProps[];
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
  handleDeletePurchase: (purchaseId: string) => void;
}

const PurchaseTable: React.FC<PurchaseTableProps> = ({ handleDeletePurchase, purchase, showOptions, setShowOptions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<string>(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const headers = [
    { title: 'Codigo', className: 'pl-2' },
    { title: 'Estado', className: 'pl-2 xl:table-cell hidden' },
    { title: 'Forma pago', className: 'px-2 md:table-cell hidden' },
    { title: 'Proveedor', className: 'px-2 px-2 sm:table-cell hidden' },
    { title: 'Subtotal', className: 'px-2 sm:table-cell hidden text-right' },
    { title: 'Descuento', className: 'px-2 text-right' },
  ];

  useEffect(() => {
    setShowOptions(currentPurchase === null);
  }, [currentPurchase, setShowOptions]);

  const handleRowCheckBoxChange = (id: string) => {
    setCurrentPurchase(id);
  };

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-b-0 border-gray-300">
      <table className="w-full text-left">
        <thead className="bg-[whiting2] border-b border-gray-300">
          <tr className="[&>th]:font-medium [&>th]:text-[13px] [&>th]:text-secondary [&>th]:py-3 px-2">
            <th />
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
            <th scope="col" className="px-2 text-right w-28 font-medium relative">
              {showOptions ? (
                "Total"
              ) : (
                <div className='flex items-center justify-end'>
                  <div className='absolute right-2 flex'>
                    <Button onClick={() => navigate(`/purchase/add/${currentPurchase}`)} name='Editar' className='bg-white shadow-md border border-gray-300' />
                    <div onClick={toggleDropdown} data-tooltip-id="options" className='bg-white cursor-pointer border border-gray-300 shadow-md size-8 ml-1 flex items-center justify-center rounded-md'>
                      <ThreeDots />
                      {isOpen && <ToolTip id='options' title='Más opciones' />}
                    </div>
                    <DropDownPurchase handleDeletePurchase={handleDeletePurchase} isOpen={isOpen} selectedPurchases={currentPurchase} />
                  </div>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {purchase.map(({ IDPurchase, PaymentMethod, Supplier, state, purchaseCode, discount, subTotal, total }) => (
            <tr key={IDPurchase} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50">
              <td className="w-4 p-2">
                <CheckBox
                  name=''
                  initialValue={currentPurchase === IDPurchase}
                  onChange={() => handleRowCheckBoxChange(IDPurchase === currentPurchase ? null : IDPurchase)}
                />
              </td>
              <td className="pl-2 py-4">
                {purchaseCode}
              </td>
              <td className="px-2 py-4 xl:table-cell hidden">
                <StatusTags text={state ? 'Activo' : 'Inactivo'} status={state} />
              </td>
              <td className="px-2 py-4 md:table-cell hidden">
                {PaymentMethod}
              </td>
              <td className="p-2 sm:table-cell hidden">
                {Supplier}
              </td>
              <td className="p-2 text-right">
                {currencyFormatter(subTotal)}
              </td>
              <td className="p-2 sm:table-cell hidden text-right">
                {currencyFormatter(discount)}
              </td>
              <td className="p-2 text-right">
                {currencyFormatter(total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PurchaseTable;
