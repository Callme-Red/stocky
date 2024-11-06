import { FormEvent, useEffect, useState } from 'react'
import Button from '../../components/form/Button'
import { Toaster } from 'react-hot-toast';
import FieldInput from '../../components/form/FieldInput';
import { decryptName, encryptName } from '../../utils/function';
import { showToast } from '../../components/Toast';
import { ApiResponseProps } from '../../types/types';
import { updateEmail, updateUsername } from '../../api/admin/login';

export default function GeneralInfo() {
  const [user, setUser] = useState({
    email: '',
    username: ''
  });

  const emailLocal = decryptName(localStorage.getItem('email'));
  const usernameLocal = decryptName(localStorage.getItem('name'));
  const userId = decryptName(localStorage.getItem('userId'));

  useEffect(() => {
    const email = emailLocal
    const username = usernameLocal;

    setUser({ email, username })
  }, [emailLocal, usernameLocal])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const encryptedName = encryptName("tokenUser");
    const token = localStorage.getItem(encryptedName);

    const emailChanged = user.email !== emailLocal;
    const usernameChanged = user.username !== usernameLocal;

    if (!emailChanged && !usernameChanged) {
      showToast("No se realizaron cambios", false);
      return;
    }

    let emailUpdateResult: ApiResponseProps = { success: true };
    let usernameUpdateResult: ApiResponseProps = { success: true };


    if (emailChanged) {
      emailUpdateResult = await updateEmail(userId, { new_email: user.email, token });
    }

    if (usernameChanged) {
      usernameUpdateResult = await updateUsername(userId, { new_username: user.username, token });
    }

    if (emailUpdateResult.success && usernameUpdateResult.success) {
      showToast("Usuario cambiado exitosamente", true);

      localStorage.setItem("name", encryptName(user.username));
      localStorage.setItem("email", encryptName(user.email));
    } else {
      const errorMessage = !emailUpdateResult.success
        ? emailUpdateResult.error?.message || "Error actualizando el email"
        : usernameUpdateResult.error?.message || "Error actualizando el nombre de usuario";

      showToast(errorMessage, false);
    }

  }

  return (
    <>
      <Toaster />
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl mb-5 font-bold text-secondary">General</h2>
        <section className='bg-white shadow-md border border-gray-300 p-4 rounded-lg'>
          <h4 className="text-sm mb-5 font-bold text-primary">Información general</h4>

          <FieldInput onChange={(e) => setUser({ ...user, username: e.target.value })} name='Nombre de usuario' id='username' classNameInput='h-10' value={user.username} />
          <FieldInput onChange={(e) => setUser({ ...user, email: e.target.value })} name='Correo electronico' id='email' classNameInput='h-10' className='mt-5' value={user.email} />
        </section>

        <div className='flex justify-end mt-5'>
          <Button type='submit' name='Guardar' className='bg-primary w-24 text-white shadow-lg border h-10 border-gray-300 rounded-lg' />
        </div>
      </form>
    </>
  )
}
