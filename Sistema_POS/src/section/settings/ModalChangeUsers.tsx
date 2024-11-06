import { FormEvent, useState } from 'react';
import FieldInput from '../../components/form/FieldInput';
import { ApiResponseProps, UserLoginProps } from '../../types/types';
import { updateEmail, updateUsername } from '../../api/admin/login';
import { showToast } from '../../components/Toast';
import { encryptName } from '../../utils/function';


export default function ModalChangeUsers({ onClose, user, onApply }: { onClose: () => void; user: UserLoginProps; onApply: () => void }) {
  const [userData, setUserData] = useState({
    email: user.email,
    username: user.username
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const encryptedName = encryptName("tokenUser");
    const token = localStorage.getItem(encryptedName);

    const emailChanged = userData.email !== user.email;
    const usernameChanged = userData.username !== user.username;

    if (!emailChanged && !usernameChanged) {
      showToast("No se realizaron cambios", false);
      return;
    }

    let emailUpdateResult: ApiResponseProps = { success: true };
    let usernameUpdateResult: ApiResponseProps = { success: true };

    if (emailChanged) {
      emailUpdateResult = await updateEmail(user.id, { new_email: userData.email, token });
    }

    if (usernameChanged) {
      usernameUpdateResult = await updateUsername(user.id, { new_username: userData.username, token });
    }

    if (emailUpdateResult.success && usernameUpdateResult.success) {
      showToast("Usuario cambiado exitosamente", true);
      onApply();
      onClose();
    } else {
      const errorMessage = !emailUpdateResult.success
        ? emailUpdateResult.error?.message || "Error actualizando el email"
        : usernameUpdateResult.error?.message || "Error actualizando el nombre de usuario";

      showToast(errorMessage, false);
    }
  }

  return (
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
    >
      <div className="relative w-full max-w-[500px] flex flex-col bg-white rounded-xl">
        <div className="relative flex flex-col h-full">
          <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
            <h3 className="text-base font-semibold text-secondary">Datos del usuario</h3>
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
          <form onSubmit={handleSubmit}>
            <div className="flex-grow py-5 overflow-y-auto px-4">
              <FieldInput name='Nombre de usuario' id='username' classNameInput='h-10' onChange={(e) => setUserData({ ...userData, username: e.target.value })} autofocus value={userData.username} />

              <FieldInput name='Correo electronico' id='email' classNameInput='h-10' onChange={(e) => setUserData({ ...userData, email: e.target.value })} className='mt-5' value={userData.email} />
            </div>
            <footer className="flex items-center p-4 md:px-5 border-t border-gray-200 rounded-b">
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Aceptar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
              >
                Cerrar
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
