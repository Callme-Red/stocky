import { useState, useEffect } from 'react';
import CheckBox from '../../components/form/CheckBox';
import StatusTags from '../../components/StatusTags';
import { SelectedVendorsProps, VendorProps } from '../../types/types';
import Button from '../../components/form/Button';
import { ThreeDots } from '../../icons/icons';
import ToolTip from '../../components/ToolTip';
import DropDownVendor from './DropDownVendor';
import { useNavigate } from 'react-router-dom';

interface VendorTableProps {
  vendor: VendorProps[];
  onRefreshVendors: (selectedVendors: SelectedVendorsProps[]) => void;
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
}

const VendorTable: React.FC<VendorTableProps> = ({ vendor, showOptions, setShowOptions, onRefreshVendors }) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<SelectedVendorsProps[]>([]);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const refreshVendors = async () => {
    onRefreshVendors(selectedVendors)
    setIsOpen(false)
    setSelectedVendors([]);
  };

  const headers = [
    { title: 'Nombre', className: 'pl-2 w-[25%]' },
    { title: 'Estado', className: 'xl:table-cell hidden pl-2' },
    { title: 'Razón Social', className: 'md:table-cell hidden px-2' },
    { title: 'RUC', className: 'px-2 sm:table-cell hidden' },
    { title: 'Telefono', className: 'px-2' },
  ];

  useEffect(() => {
    setShowOptions(selectedVendors.length === 0);
  }, [selectedVendors, setShowOptions]);


  useEffect(() => {
    const allSelected = vendor.every(vendor => selectedVendors.some(selected => selected.IDVendor === vendor.IDSupplier));
    setIsChecked(allSelected);
  }, [selectedVendors, vendor]);

  const handleCheckBoxChange = (newValue: boolean) => {
    if (newValue) {
      setSelectedVendors(vendor.map(vendor => ({ IDVendor: vendor.IDSupplier, state: vendor.state })));
    } else {
      setSelectedVendors([]);
    }
  };

  const handleRowCheckBoxChange = (id: string, state: boolean, newValue: boolean) => {
    let updatedSelectedVendors = [...selectedVendors];

    if (newValue) {
      updatedSelectedVendors.push({ IDVendor: id, state: state });
    } else {
      updatedSelectedVendors = updatedSelectedVendors.filter(vendor => vendor.IDVendor !== id);
    }

    setSelectedVendors(updatedSelectedVendors);
  };

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-b-0 border-gray-300">
      <table className="w-full text-left">
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
            <th scope="col" className="px-2 w-3 font-medium relative">
              {showOptions ? (
                "Correo"
              ) : (
                <div className='flex items-center justify-end'>
                  <div className='flex absolute items-center'>
                    <Button onClick={() => navigate(`/vendor/add/${selectedVendors[0].IDVendor}`)} name='Editar' className='bg-white shadow-md border border-gray-300' />
                    <div onClick={toggleDropdown} data-tooltip-id="options" className='bg-white cursor-pointer border border-gray-300 shadow-md size-8 ml-1 flex items-center justify-center rounded-md'>
                      <ThreeDots />
                      {isOpen && <ToolTip id='options' title='Más opciones' />}
                    </div>
                    <DropDownVendor refreshVendors={refreshVendors} isOpen={isOpen} selectedVendors={selectedVendors} />
                  </div>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {vendor.map(({ IDSupplier, SocialReason, email, name, phone, ruc, state }) => (
            <tr key={IDSupplier} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50">
              <td className="w-4 p-2">
                <CheckBox
                  name=''
                  initialValue={selectedVendors.some(vendor => vendor.IDVendor === IDSupplier)}
                  onChange={(value) => handleRowCheckBoxChange(IDSupplier, state, value)}
                />
              </td>
              <td className="pl-2 py-4">
                {name}
              </td>
              <td className="px-2 py-4 xl:table-cell hidden">
                <StatusTags text={state ? 'Activo' : 'Inactivo'} status={state} />
              </td>
              <td className="px-2 py-4 md:table-cell hidden">
                <span>{SocialReason === null || SocialReason.trim() === '' ? 'N/A' : SocialReason}</span>
              </td>
              <td className="px-2 py-4 sm:table-cell hidden">
                {ruc === null || ruc.trim() === '' ? 'N/A' : ruc}
              </td>
              <td className="p-2">
                {phone === null || phone.trim() === '' ? 'N/A' : phone}
              </td>
              <td className="p-2">
                {email === null || email.trim() === '' ? 'N/A' : email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VendorTable;
