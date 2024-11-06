import { useState } from 'react';
import StatusTags from '../../components/StatusTags';
import { SalesProps } from '../../types/types';
import { Down } from '../../icons/icons';
import DropDownSales from './DropDownSales';
import { currencyFormatter } from '../../utils/function';

interface SalesTableProps {
  sales: SalesProps[];
  handleDeleteSales: (saleId: string) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ sales, handleDeleteSales }) => {
  const [isSalesOpen, setIsSalesOpen] = useState<string>();

  const headers = [
    { title: 'Codigo', className: 'px-2 w-[15%]' },
    { title: 'Cliente', className: 'pl-2 w-[20%]' },
    { title: 'Tipo', className: 'pl-2 hidden xl:table-cell' },
    { title: 'Tipo Factura', className: 'pl-2 hidden xl:table-cell' },
    { title: 'Forma Pago', className: 'pl-2 hidden lg:table-cell' },
    { title: 'Subtotal', className: 'px-2 sm:table-cell hidden text-right' },
    { title: 'Descuento', className: 'px-2 sm:table-cell hidden text-right' },
    { title: 'Envio', className: 'px-2 sm:table-cell hidden text-right' },
    { title: 'Total', className: 'px-2 text-right' },
  ];

  function handleUpdateSalesState(newState: string, saleId: string) {
    sales.forEach((sale) => {
      if (sale.IDSale === saleId) {
        sale.state = newState;
      }
    })
  }

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-b-0 border-gray-300">
      <table className="w-full text-left">
        <thead className="bg-whiting2 border-b border-gray-300">
          <tr className="[&>th]:font-medium [&>th]:text-[13px] [&>th]:text-secondary [&>th]:py-3 px-2">
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className={header.className}
              >
                {header.title}
              </th>
            ))}
            <th className='md:w-12 w-8 ' />
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, index) => (
            <tr key={sale.IDSale} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50">
              <td className="px-2 py-4">{sale.salesCode}</td>
              <td className="pl-2 py-4">{sale.Client}</td>
              <td className="px-2 py-4 hidden xl:table-cell">
                <StatusTags text={!sale.typeSale ? 'Contado' : 'Credito'} status={!sale.typeSale} />
              </td>
              <td className="px-2 py-4 hidden xl:table-cell">
                <StatusTags textColor={!sale.isVoucher ? 'text-[#014b40]' : 'text-white'} color={!sale.isVoucher ? 'bg-[#affebf]' : "bg-[#005bd3]"} text={!sale.isVoucher ? 'Voucher' : 'Membretada'} status={!sale.isVoucher} />
              </td>
              <td className="p-2 hidden lg:table-cell">{sale.PaymentMethod}</td>
              <td className="p-2 text-right sm:table-cell hidden">{currencyFormatter(sale.subTotal)}</td>
              <td className="p-2 text-right sm:table-cell hidden">{currencyFormatter(sale.discount)}</td>
              <td className="p-2 text-right sm:table-cell hidden">{currencyFormatter(sale.shippingCost)}</td>
              <td className="p-2 text-right">{currencyFormatter(sale.total)}</td>

              <td className='relative pr-1 text-right'>
                <div onClick={() => isSalesOpen !== sale.IDSale ? setIsSalesOpen(sale.IDSale) : setIsSalesOpen(null)} className='bg-whiting2 w-8 cursor-pointer border border-gray-300 py-1.5 shadow-lg rounded-lg flex items-center justify-center'>
                  <Down className='size-5' />
                </div>
                {isSalesOpen === sale.IDSale && (
                  <div className={`absolute left-0 mt-1 z-10 ${index === sales.length - 1 || index === sales.length - 2 ? '-top-10' : 'top-0'}`}>
                    <DropDownSales
                      handleDeleteSales={handleDeleteSales}
                      onClose={() => setIsSalesOpen(null)}
                      handleUpdateSalesState={handleUpdateSalesState}
                      currentSale={sale}
                    />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
