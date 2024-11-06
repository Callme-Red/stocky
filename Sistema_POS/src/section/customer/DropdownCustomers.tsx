import { CashRegister, Delete, Edit } from '../../icons/icons';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../components/Toast';
import { deleteCustomer } from '../../api/sales/customers';
import { Toaster } from 'react-hot-toast';
import { SelectedCustomerProps } from '../../types/types';

interface DropdownCustomersProps {
  isOpen: boolean;
  selectedCustomers: SelectedCustomerProps[];
  refreshCustomers: (selectedCustomer: SelectedCustomerProps[]) => void;
}

const DropdownCustomers: React.FC<DropdownCustomersProps> = ({ refreshCustomers, isOpen, selectedCustomers }) => {
  const navigate = useNavigate();
  const allActive = selectedCustomers.every(customers => customers.state);
  const allInactive = selectedCustomers.every(customers => !customers.state);
  const hasMixedStates = !allActive && !allInactive;

  if (!isOpen) return null;

  const handleAccountReceivableClick = () => {
    navigate(`/account-receivable/${selectedCustomers[0].IDClient}`);
  };

  const handleEditCustomersClick = () => {
    navigate(`/customers/add/${selectedCustomers[0].IDClient}`)
  }

  const handleStateChangeClick = async () => {
    let newState: boolean | null = null;

    if (allActive) {
      newState = false;
    } else if (allInactive) {
      newState = true;
    } else if (hasMixedStates) {
      for (const customer of selectedCustomers) {
        const { success, error } = await deleteCustomer(customer.IDClient, { state: !customer.state });
        if (!success) {
          showToast(error.message, false);
          return;
        }
      }
      refreshCustomers(selectedCustomers);
      return;
    }

    if (newState !== null) {
      for (const customer of selectedCustomers) {
        const { success, error } = await deleteCustomer(customer.IDClient, { state: newState });
        if (!success) {
          showToast(error.message, false);
          return;
        }
      }
      refreshCustomers(selectedCustomers);
    }
  };

  return (
    <>
      <Toaster />
      <div
        id="dropdown"
        className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10 ${isOpen ? 'block' : 'hidden'}`}
      >
        <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
          {selectedCustomers.length === 1 && (
            <>
              {selectedCustomers[0].isCredit && (
                <li className='flex items-center pl-2 hover:bg-gray-100'>
                  <CashRegister />
                  <button onClick={handleAccountReceivableClick} className="block text-primary px-2 py-2">Estado de cuenta</button>
                </li>
              )}
              <li className='flex items-center pl-2 hover:bg-gray-100'>
                <Edit />
                <button onClick={handleEditCustomersClick} className="block text-primary px-2 py-2">Editar cliente</button>
              </li>
            </>
          )}

          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Delete className='size-6 text-red-900' />
            <button
              onClick={handleStateChangeClick}
              className="block text-red-900 px-2 py-2"
            >
              {allActive
                ? `Eliminar cliente${selectedCustomers.length > 1 ? 's' : ''}`
                : allInactive
                  ? `Activar cliente${selectedCustomers.length > 1 ? 's' : ''}`
                  : `Invertir estado${selectedCustomers.length > 1 ? 's' : ''}`}
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default DropdownCustomers;
