import { Delete, Edit } from '../../icons/icons';
import { useNavigate } from 'react-router-dom';
import { deleteVendor } from '../../api/purchase/vendor';
import { showToast } from '../../components/Toast';

interface DropDownVendorProps {
  isOpen: boolean;
  selectedVendors: { IDVendor: string; state: boolean }[];
  refreshVendors: () => void;
}

const DropDownVendor: React.FC<DropDownVendorProps> = ({ isOpen, selectedVendors, refreshVendors }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const allActive = selectedVendors.every(vendor => vendor.state);
  const allInactive = selectedVendors.every(vendor => !vendor.state);
  const hasMixedStates = !allActive && !allInactive;

  const handleEditVendorClick = () => {
    navigate(`/vendor/add/${selectedVendors[0].IDVendor}`);
  };

  const handleStateChangeClick = async () => {
    let newState: boolean | null = null;

    if (allActive) {
      newState = false;
    } else if (allInactive) {
      newState = true;
    } else if (hasMixedStates) {
      for (const vendor of selectedVendors) {
        const { success, error } = await deleteVendor(vendor.IDVendor, { state: !vendor.state });
        if (!success) {
          showToast(error.message, false);
        }
      }
      refreshVendors();
      return;
    }

    if (newState !== null) {
      for (const vendor of selectedVendors) {
        const { success, error } = await deleteVendor(vendor.IDVendor, { state: newState });
        if (!success) {
          showToast(error.message, false);
        }
      }
      refreshVendors();
    }
  };

  return (
    <div
      id="dropdown"
      className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10 ${isOpen ? 'block' : 'hidden'}`}
    >
      <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
        {selectedVendors.length === 1 && (
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Edit />
            <button onClick={handleEditVendorClick} className="block text-primary px-2 py-2">Editar proveedor</button>
          </li>
        )}

        <li className='flex items-center pl-2 hover:bg-gray-100'>
          <Delete className='size-6 text-red-900' />
          <button
            onClick={handleStateChangeClick}
            className="block text-red-900 px-2 py-2"
          >
            {allActive
              ? `Eliminar proveedor${selectedVendors.length > 1 ? 'es' : ''}`
              : allInactive
                ? `Activar proveedor${selectedVendors.length > 1 ? 'es' : ''}`
                : `Invertir estado${selectedVendors.length > 1 ? 's' : ''}`}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default DropDownVendor;
