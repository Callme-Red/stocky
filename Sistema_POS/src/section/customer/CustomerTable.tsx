import { useState, useEffect } from 'react';
import CheckBox from '../../components/form/CheckBox';
import StatusTags from '../../components/StatusTags';
import { CustomerProps, SelectedCustomerProps } from '../../types/types';
import Button from '../../components/form/Button';
import { ThreeDots } from '../../icons/icons';
import ToolTip from '../../components/ToolTip';
import DropdownCustomers from './DropdownCustomers';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface CustomerTableProps {
  customer: CustomerProps[];
  showOptions: boolean;
  refreshCustomer: (selectedCustomer: SelectedCustomerProps[]) => void;
  setShowOptions: (show: boolean) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ refreshCustomer, customer, showOptions, setShowOptions }) => {
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [selectedCustomers, setSelectedCustomers] = useState<{ IDClient: string; isCredit: boolean, state: boolean; }[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setCustomers(customer ?? []);
  }, [customer]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const headers = [
    { title: 'Nombres', className: 'pl-2 w-[20%]' },
    { title: 'Apellidos', className: 'pl-2 w-[20%]' },
    { title: 'Estado', className: 'pl-2 xl:table-cell hidden' },
    { title: 'Municipio', className: 'md:table-cell hidden px-2' },
    { title: 'Correo', className: 'px-2 sm:table-cell hidden' },
  ];

  useEffect(() => {
    setShowOptions(selectedCustomers.length === 0);
  }, [selectedCustomers, setShowOptions]);

  useEffect(() => {
    const allSelected = customer.every(customer => selectedCustomers.some(selected => selected.IDClient === customer.IDClient));
    setIsChecked(allSelected);
  }, [selectedCustomers, customer]);

  const handleCheckBoxChange = (newValue: boolean) => {
    if (newValue) {
      setSelectedCustomers(customer.map(customer => ({ IDClient: customer.IDClient, isCredit: customer.isCredit, state: customer.state })));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleRowCheckBoxChange = (id: string, isCredit: boolean, state: boolean, newValue: boolean) => {
    let updatedSelectedCustomers = [...selectedCustomers];

    if (newValue) {
      updatedSelectedCustomers.push({ IDClient: id, isCredit, state });
    } else {
      updatedSelectedCustomers = updatedSelectedCustomers.filter(customer => customer.IDClient !== id);
    }

    setSelectedCustomers(updatedSelectedCustomers);
  };

  function onRefresh() {
    refreshCustomer(selectedCustomers);
    setIsOpen(false)
    setSelectedCustomers([])
  }

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-b-0 border-gray-300">
      <Toaster />
      <table className="w-full text-left relative">
        <thead className="bg-[whiting2] border-b border-gray-300">
          <tr className="[&>th]:font-medium [&>th]:text-[13px] [&>th]:text-secondary [&>th]:py-3 px-2">
            <th scope="col" className="p-2 w-10">
              <CheckBox
                onChange={handleCheckBoxChange}
                name=''
                initialValue={isChecked}
              />
            </th>
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
            <th scope="col" className="px-2  w-24 font-medium relative">
              {showOptions ? (
                "Telefono"
              ) : (
                <div className='flex relative items-center justify-end'>
                  <div className='flex absolute items-center'>
                    <Button onClick={() => navigate(`/customers/add/${selectedCustomers[0].IDClient}`)} name='Editar' className='bg-white shadow-md border border-gray-300' />
                    <div
                      data-tooltip-id="options"
                      className='bg-white border border-gray-300 shadow-md size-8 ml-1 flex items-center justify-center rounded-md cursor-pointer'
                      onClick={toggleDropdown}
                    >
                      <ThreeDots />
                      {isOpen && <ToolTip id='options' title='Más opciones' />}
                    </div>
                    <DropdownCustomers refreshCustomers={onRefresh} isOpen={isOpen} selectedCustomers={selectedCustomers} />
                  </div>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map(({ IDClient, isCredit, name, lastName, municipality_name, state, phone, email }) => (
            <tr key={IDClient} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50">
              <td className="w-4 p-2">
                <CheckBox
                  name=''
                  initialValue={selectedCustomers.some(customer => customer.IDClient === IDClient)}
                  onChange={(value) => handleRowCheckBoxChange(IDClient, isCredit, state, value)}
                />
              </td>
              <td className="pl-2 py-4 flex items-center">
                <span className='mr-3'>{name}</span>
                {isCredit && <div className='size-2 rounded-full bg-redprimary' />}
              </td>
              <td className="px-2 py-4">
                <span>{lastName}</span>
              </td>
              <td className="px-2 xl:table-cell hidden py-4">
                <StatusTags status={state} text={state ? 'Activo' : 'Inactivo'} />
              </td>
              <td className="px-2 md:table-cell hidden py-4">
                {municipality_name}
              </td>
              <td className="p-2 sm:table-cell hidden">
                {email === null ? 'N/A' : email}
              </td>
              <td className="p-2">
                {phone === null || phone.trim() === '' ? 'N/A' : phone}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerTable;
