import { useState, useEffect } from 'react';
import CheckBox from '../../components/form/CheckBox';
import { InventoryProps } from '../../types/types';
import { ThreeDots } from '../../icons/icons';
import ToolTip from '../../components/ToolTip';
import { currencyFormatter } from '../../utils/function';
import DropDownInventory from './DropDownInventory';

interface InventoryTableProps {
  inventory: InventoryProps[];
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventory, showOptions, setShowOptions }) => {
  const [selectedInventory, setSelectedInventory] = useState({
    movimentId: null,
    typeMoviment: null,
    movimentReference: null
  });
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const headers = [
    { title: 'Fecha', className: 'pl-2' },
    { title: 'Movimiento', className: 'pl-2' },
    { title: 'Entrada', className: 'pl-2 text-right' },
    { title: 'Salida', className: 'pl-2 text-right' },
    { title: 'Unidades', className: 'pl-2 text-right' },
    { title: 'Costo entrada', className: 'px-2 text-right' },
    { title: 'Costo salida', className: 'px-2 text-right' },
    { title: 'Saldo', className: 'px-2 text-right' },
  ];

  useEffect(() => {
    setShowOptions(selectedInventory.movimentId === null);
  }, [selectedInventory, setShowOptions]);

  const handleCheckBoxChange = (movimentId: string, typeMoviment: string, movimentReference: string) => {
    setSelectedInventory({ movimentId, typeMoviment, movimentReference })
  };

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-gray-300 border-0-b">
      <table className="w-full text-left relative">
        <thead className="bg-[whiting2] border-b border-gray-300">
          <tr className="[&>th]:font-medium [&>th]:text-[13px] [&>th]:text-secondary [&>th]:py-3 px-2">
            <th scope="col" className="p-2 w-10" />
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
            <th scope="col" className="px-2 text-right w-36 font-medium relative">
              {showOptions ? (
                "Costo promedio"
              ) : (
                <div className='flex relative items-center justify-end'>
                  <div className='flex absolute items-center'>
                    <div
                      data-tooltip-id="options"
                      className='bg-white border border-gray-300 shadow-md size-8 ml-1 flex items-center justify-center rounded-md cursor-pointer'
                      onClick={toggleDropdown}
                    >
                      <ThreeDots />
                      {isOpen && <ToolTip id='options' title='Más opciones' />}
                    </div>
                    {isOpen && <DropDownInventory movimentReference={selectedInventory.movimentReference} typeMoviment={selectedInventory.typeMoviment} />}
                  </div>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(({ IDInventario, IDPurchase, IDSale, entrada, salida, saldoUnidades, costoEntrada, costoSalida, costoSaldo, costoPromedio, fecha, tipoMovimiento }) => (
            <tr key={IDInventario} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50">
              <td className="w-4 p-2">
                <CheckBox
                  name=''
                  initialValue={selectedInventory.movimentId === IDInventario}
                  onChange={() => handleCheckBoxChange(IDInventario === selectedInventory.movimentId ? null : IDInventario,
                    tipoMovimiento,
                    IDInventario === selectedInventory.movimentId ? null : tipoMovimiento === '0' ? IDPurchase : IDSale
                  )}
                />
              </td>
              <td className="px-2 py-4">
                {new Date(fecha).toLocaleDateString()}
              </td>
              <td className="px-2 py-4">
                {tipoMovimiento === '0' ? 'Compra' : tipoMovimiento === '1' ? 'Venta' : tipoMovimiento === '2' ? 'Entrada por ajuste' : 'Salida por ajuste'}
              </td>
              <td className="px-2 py-4 text-right">
                {Number(entrada).toFixed(0) ?? 0}
              </td>
              <td className="px-2 py-4 text-right">
                {Number(salida).toFixed(0) ?? 0}
              </td>
              <td className="px-2 py-4 text-right">
                {Number(saldoUnidades).toFixed(0)}
              </td>
              <td className="p-2 text-right">
                {currencyFormatter(costoEntrada)}
              </td>
              <td className="p-2 text-right">
                {currencyFormatter(costoSalida)}
              </td>
              <td className="p-2 text-right">
                {currencyFormatter(costoSaldo)}
              </td>
              <td className="p-2 text-right">
                {currencyFormatter(costoPromedio)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;
