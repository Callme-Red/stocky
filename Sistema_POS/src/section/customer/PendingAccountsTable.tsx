import { PendingAccountsProps } from '../../types/types';

interface PendingAccountsTableProps {
  pendingAccounts: PendingAccountsProps[];
}

const PendingAccountsTable: React.FC<PendingAccountsTableProps> = ({ pendingAccounts }) => {
  const headers = [
    { title: 'Cliente', className: 'px-4 w-[20%]' },
    { title: 'Pendientes', className: 'px-2 w-52 text-right' },
    { title: 'Venta', className: 'py-2 px-4' },
    { title: 'Total', className: 'px-2 text-right' },
    { title: 'Saldo', className: 'px-2 text-right' },
    { title: 'Fecha', className: 'py-2 px-4' },
  ];

  const getExpirationClass = (expirationDate: string): string => {
    const today = new Date();
    const expirationDateObj = new Date(expirationDate);

    const diffTime = expirationDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 5 ? 'text-red-900' : 'text-secondary';
  };

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-gray-300 rounded-b-0">
      <table className="w-full text-left relative">
        <thead className="bg-[whiting2] border-b border-gray-300">
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
          </tr>
        </thead>
        <tbody>
          {pendingAccounts.map(({ name, lastName, nearest_pending_sale, pending_sales_count }) => (
            <tr key={nearest_pending_sale.salesCode} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50">
              <td className="p-4">
                {name.split(' ')[0]} {lastName.split(' ')[0]}
              </td>
              <td className="p-2 text-right">
                {pending_sales_count} cuenta{pending_sales_count > 1 && 's'} pendiente{pending_sales_count > 1 && 's'}
              </td>
              <td className="py-2 px-4">
                {nearest_pending_sale.salesCode}
              </td>
              <td className="p-2 text-right">
                {nearest_pending_sale.total.toFixed(2)}
              </td>
              <td className="p-2 text-right">
                {nearest_pending_sale.balance.toFixed(2)}
              </td>
              <td className="p-2">
                <span className={`${getExpirationClass(nearest_pending_sale.expirationDate)} text-[13px] font-semibold`}>
                  {nearest_pending_sale.expirationDate}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PendingAccountsTable;
