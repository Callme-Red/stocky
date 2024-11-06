import { FormEvent, useRef, useState } from 'react';
import FieldInput from '../../components/form/FieldInput';
import TextArea from '../../components/form/TextArea';
import { CategoryProps } from '../../types/types';
import { createCategory, updateCategory } from '../../api/inventory/category';
import { showToast } from '../../components/Toast';
import { Toaster } from 'react-hot-toast';

export default function CategoryModal({ onClose, selectedCategory, isSave = true }: { onClose: () => void; selectedCategory?: CategoryProps; isSave?: boolean; }) {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [category, setCategory] = useState({
    NombreCategoria: selectedCategory?.NombreCategoria || '',
    descripcion: selectedCategory?.descripcion || ''
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newCategory = {
      NombreCategoria: category.NombreCategoria,
      descripcion: category.descripcion,
    }

    const { success, error } = isSave ? await createCategory(newCategory) : await updateCategory(selectedCategory.IDCategoria, newCategory);

    if (success) {
      showToast(`Categoria ${isSave ? 'guardada' : 'actualizada'} exitosamente`, true);
      onClose();
    } else {
      showToast(error.message, false);
    }
  }

  return (
    <>
      <Toaster />
      <div
        id="default-modal"
        tabIndex={-1}
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
      >
        <div className="relative w-full max-w-[500px] flex flex-col bg-white rounded-xl">
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
              <h3 className="text-base font-semibold text-secondary">Nueva categoria</h3>
              <button
                onClick={onClose}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex-grow py-5 overflow-y-auto px-4">
              <FieldInput onChange={(e) => setCategory({ ...category, NombreCategoria: e.target.value })} value={category.NombreCategoria} name="Categoria" id="NombreCategoria" classNameInput="h-10" className='mb-5' />
              <TextArea onChange={(e) => setCategory({ ...category, descripcion: e.target.value })} value={category.descripcion} name='Descripción' id='descripcion' rows={5} />

              <footer className="flex items-center py-4 border-t border-gray-200 rounded-b">
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Aceptar
                </button>
                <button
                  onClick={onClose}
                  type="button"
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                >
                  Cerrar
                </button>
              </footer>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
