import { Delete, Edit } from '../../icons/icons';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../components/Toast';
import { deleteExpense } from '../../api/purchase/expense';
import { SelectedExpensesProps } from '../../types/types';

interface DropDownExpenseProps {
  isOpen: boolean;
  selectedExpenses: SelectedExpensesProps[];
  refreshExpense: (selectedProducts: SelectedExpensesProps[]) => void;
}

const DropDownExpense: React.FC<DropDownExpenseProps> = ({ isOpen, selectedExpenses, refreshExpense }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleEditExpenseClick = () => {
    navigate(`/expense/add/${selectedExpenses[0].IDExpense}`);
  };

  const handleStateChangeClick = () => {
    selectedExpenses.forEach(async ({ IDExpense }) => {
      const { success, error } = await deleteExpense(IDExpense);
      if (!success) {
        showToast(error.message, false);
        return;
      }

      refreshExpense(selectedExpenses);

    })
  };

  return (
    <div
      id="dropdown"
      className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10 ${isOpen ? 'block' : 'hidden'}`}
    >
      <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
        {selectedExpenses.length === 1 && (
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Edit />
            <button onClick={handleEditExpenseClick} className="block text-primary px-2 py-2">Editar gasto</button>
          </li>
        )}

        <li className='flex items-center pl-2 hover:bg-gray-100'>
          <Delete className='size-6 text-red-900' />
          <button
            onClick={handleStateChangeClick}
            className="block text-red-900 px-2 py-2"
          >
            Eliminar gasto
          </button>
        </li>
      </ul>
    </div >
  );
};

export default DropDownExpense;
