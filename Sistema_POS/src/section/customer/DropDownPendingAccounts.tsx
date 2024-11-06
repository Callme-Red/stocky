import { CashRegister } from '../../icons/icons';
import { useNavigate } from 'react-router-dom';

interface DropdownPendingAccountsProps {
  isOpen: boolean;
  selectedPendingAccounts: { IDClient: string }[];
}

const DropDownPendingAccounts: React.FC<DropdownPendingAccountsProps> = ({ isOpen, selectedPendingAccounts }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAccountReceivableClick = () => {
    navigate(`/account-receivable/${selectedPendingAccounts[0].IDClient}`);
  };

  return (
    <div
      id="dropdown"
      className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10 ${isOpen ? 'block' : 'hidden'}`}
    >
      <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
        {selectedPendingAccounts.length === 1 && (
          <>
            {selectedPendingAccounts[0].IDClient && (
              <li className='flex items-center pl-2 hover:bg-gray-100'>
                <CashRegister />
                <button onClick={handleAccountReceivableClick} className="block text-primary px-2 py-2">Estado de cuenta</button>
              </li>
            )}
          </>
        )}
      </ul>
    </div>
  );
};

export default DropDownPendingAccounts;
