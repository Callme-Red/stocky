import { deletePurchase } from '../../api/purchase/purchase';
import { showToast } from '../../components/Toast';
import { Delete, Edit } from '../../icons/icons';
import { useNavigate } from 'react-router-dom';

interface DropDownPurchaseProps {
  isOpen: boolean;
  selectedPurchases: string;
  handleDeletePurchase: (purchaseId: string) => void;
}

const DropDownPurchase: React.FC<DropDownPurchaseProps> = ({ handleDeletePurchase, isOpen, selectedPurchases }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleEditVendorClick = () => {
    navigate(`/purchase/add/${selectedPurchases}`)
  }

  const handleDeletePurchaseClick = async () => {
    const { success, error } = await deletePurchase(selectedPurchases);
    if (success) {
      showToast("Compra eliminada exitosamente", true);
      handleDeletePurchase(selectedPurchases)
    } else {
      showToast(error.message, false);
    }
  }

  return (
    <div
      id="dropdown"
      className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10 ${isOpen ? 'block' : 'hidden'}`}
    >
      <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
        <li className='flex items-center pl-2 hover:bg-gray-100'>
          <Edit />
          <button onClick={handleEditVendorClick} className="block text-primary px-2 py-2">Editar compra</button>
        </li>
        <li className='flex items-center pl-2 hover:bg-gray-100'>
          <Delete className="size-6 text-red-900" />
          <button onClick={handleDeletePurchaseClick} className="block text-left w-full text-red-900 px-2 py-2">Eliminar compra</button>
        </li>
      </ul>
    </div>
  );
};

export default DropDownPurchase;
