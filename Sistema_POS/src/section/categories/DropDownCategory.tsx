import { useState } from 'react'
import { Delete, Edit } from '../../icons/icons'
import CategoryModal from './CategoryModal';
import { CategoryProps } from '../../types/types';
import { deleteCategory } from '../../api/inventory/category';
import { showToast } from '../../components/Toast';

export default function DropDownCategory({ isOpen, selectedCategory, onLoadCategory, onRefreshCategory }: { isOpen: boolean; selectedCategory: CategoryProps[]; onLoadCategory: () => void; onRefreshCategory: (selectedCategory: CategoryProps[]) => void }) {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  function onClose() {
    onLoadCategory();
    setIsShowModal(false);
  }

  if (!isOpen) return null;

  const allActive = selectedCategory.every(category => category.estado);
  const allInactive = selectedCategory.every(category => !category.estado);
  const hasMixedStates = !allActive && !allInactive;

  const handleStateChangeClick = async () => {
    let newState: boolean | null = null;

    if (allActive) {
      newState = false;
    } else if (allInactive) {
      newState = true;
    } else if (hasMixedStates) {
      for (const category of selectedCategory) {
        const { success, error } = await deleteCategory(category.IDCategoria, { estado: !category.estado });
        if (!success) {
          showToast(error.message, false);
        }
      }
      onRefreshCategory(selectedCategory);
      return;
    }

    if (newState !== null) {
      for (const category of selectedCategory) {
        const { success, error } = await deleteCategory(category.IDCategoria, { estado: newState });
        if (!success) {
          showToast(error.message, false);
        }
      }
      onRefreshCategory(selectedCategory);
    }
  };

  return (
    <>
      <div
        id="dropdown"
        className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10 ${isOpen ? 'block' : 'hidden'}`}
      >
        <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
          {selectedCategory.length === 1 &&
            <li className='flex items-center pl-2 hover:bg-gray-100'>
              <Edit />
              <button onClick={() => setIsShowModal(true)} className="block text-primary px-2 py-2">Editar categoria</button>
            </li>
          }
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Delete className='size-6 text-red-900' />
            <button
              onClick={handleStateChangeClick}
              className="block text-red-900 px-2 py-2"
            >
              {allActive
                ? `Eliminar categoria${selectedCategory.length > 1 ? 's' : ''}`
                : allInactive
                  ? `Activar categoria${selectedCategory.length > 1 ? 's' : ''}`
                  : `Invertir estado${selectedCategory.length > 1 ? 's' : ''}`}
            </button>
          </li>
        </ul>
      </div>
      {isShowModal && <CategoryModal isSave={false} onClose={onClose} selectedCategory={selectedCategory[0]} />}
    </>
  )
}
