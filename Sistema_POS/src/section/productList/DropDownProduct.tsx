import { Delete, Edit } from '../../icons/icons';
import { useNavigate } from 'react-router-dom';
import { deleteProduct } from '../../api/inventory/products';
import { showToast } from '../../components/Toast';
import { Inventory } from '../../icons/icons';
import { SelectedProductsProps } from '../../types/types';

interface DropDownProductProps {
  isOpen: boolean;
  selectedProducts: { IDProduct: string, estado: boolean }[];
  refreshProducts: (selectedProducts: SelectedProductsProps[]) => void;
}

const DropDownProduct: React.FC<DropDownProductProps> = ({ isOpen, selectedProducts, refreshProducts }) => {
  const navigate = useNavigate();
  const allActive = selectedProducts.every(product => product.estado);
  const allInactive = selectedProducts.every(product => !product.estado);
  const hasMixedStates = !allActive && !allInactive;

  if (!isOpen) return null;

  const handleEditProductClick = () => {
    navigate(`/products/add/${selectedProducts[0].IDProduct}`)
  }

  const handleAdjustmentProductClick = () => {
    navigate(`/inventory-ajustment/${selectedProducts[0].IDProduct}`)
  }

  const handleStateChangeClick = async () => {
    let newState: boolean | null = null;

    if (allActive) {
      newState = false;
    } else if (allInactive) {
      newState = true;
    } else if (hasMixedStates) {
      for (const product of selectedProducts) {
        const { success, error } = await deleteProduct(product.IDProduct, { estado: !product.estado });
        if (!success) {
          showToast(error.message, false);
          return;
        }
      }
      refreshProducts(selectedProducts);
      return;
    }

    if (newState !== null) {
      for (const product of selectedProducts) {
        const { success, error } = await deleteProduct(product.IDProduct, { estado: newState });
        if (!success) {
          showToast(error.message, false);
          return;
        }
      }
      refreshProducts(selectedProducts);
    }
  };

  return (
    <div
      id="dropdown"
      className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10 ${isOpen ? 'block' : 'hidden'}`}
    >
      <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
        {selectedProducts.length === 1 && (
          <>
            <li className='flex items-center pl-2 hover:bg-gray-100'>
              <Edit />
              <button onClick={handleEditProductClick} className="block text-primary px-2 py-2">Editar producto</button>
            </li>

            <li className='flex items-center pl-2 hover:bg-gray-100'>
              <Inventory />
              <button onClick={handleAdjustmentProductClick} className="block text-primary px-2 py-2">Ajuste de inventario</button>
            </li>
          </>
        )}

        <li className='flex items-center pl-2 hover:bg-gray-100'>
          <Delete className='size-5 text-red-900' />
          <button
            onClick={handleStateChangeClick}
            className="block text-red-900 px-2 py-2"
          >
            {allActive
              ? `Eliminar producto${selectedProducts.length > 1 ? 's' : ''}`
              : allInactive
                ? `Activar producto${selectedProducts.length > 1 ? 's' : ''}`
                : `Invertir estado${selectedProducts.length > 1 ? 's' : ''}`}
          </button>
        </li>
      </ul>
    </div>
  );
}

export default DropDownProduct;
