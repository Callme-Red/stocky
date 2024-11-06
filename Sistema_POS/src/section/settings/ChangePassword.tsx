import { FormEvent, useRef, useState } from "react";
import { Eye } from "../../icons/icons";
import Button from "../../components/form/Button";
import { showToast } from "../../components/Toast";
import { Toaster } from "react-hot-toast";
import { changePassword } from "../../api/admin/login";
import { decryptName, encryptName, getFormData } from "../../utils/function";

export default function ChangePassword() {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [isFocused, setIsFocused] = useState({
    password: false,
    repeat: false
  });

  const [isPassword, setIsPassword] = useState({
    password: true,
    repeat: true
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = getFormData(formRef);

    if (formData.password !== formData.repeat) {
      showToast('La contraseñas no coinciden', false);
      return;
    }

    const userId = decryptName(localStorage.getItem('userId'));
    const tokeId = localStorage.getItem(encryptName("tokenUser"));

    const newUser = {
      token: tokeId,
      new_password: formData.password
    }

    const { success, error } = await changePassword(userId, newUser);

    if (success) {
      showToast("Contraseña cambiada exitosamente", true);
      formRef.current.reset();
    } else {
      showToast(error.message, false);
    }
  }

  return (
    <>
      <Toaster />
      <form ref={formRef} onSubmit={handleSubmit}>
        <h2 className="text-xl mb-5 font-bold text-secondary">Cambio de contraseña</h2>
        <section className='bg-white shadow-md border border-gray-300 p-4 rounded-lg'>
          <h4 className="text-sm mb-5 font-bold text-primary">Nueva contraseña</h4>

          <div className='flex md:flex-row flex-col items-center md:space-x-3 space-x-0 space-y-5 md:space-y-0'>
            <div className='w-full'>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-primary">Contraseña</label>
              <div
                className={`bg-gray-50 border rounded-lg flex justify-between items-center px-3 py-1 h-10 w-full ${isFocused.password ? 'border-blue-500' : 'border-gray-600'}`}
                onFocus={() => setIsFocused({ ...isFocused, password: true })}
                onBlur={() => setIsFocused({ ...isFocused, password: false })}
              >
                <input
                  id="password"
                  type={isPassword.password ? "password" : "text"}
                  required
                  className={`bg-gray-50 outline-none text-sm font-medium placeholder-primary w-full text-primary h-full`}
                />

                <button type="button" onClick={() => setIsPassword({ ...isPassword, password: !isPassword.password })}>
                  <Eye className="size-[22px] text-secondary/80" />
                </button>
              </div>
            </div>

            <div className='w-full'>
              <label htmlFor="repeat" className="block mb-2 text-sm font-medium text-primary">Repetir contraseña</label>
              <div
                className={`bg-gray-50 border rounded-lg flex justify-between items-center px-3 py-1 h-10 w-full ${isFocused.repeat ? 'border-blue-500' : 'border-gray-600'}`}
                onFocus={() => setIsFocused({ ...isFocused, repeat: true })}
                onBlur={() => setIsFocused({ ...isFocused, repeat: true })}
              >
                <input
                  id="repeat"
                  type={isPassword.repeat ? "password" : "text"}
                  required
                  className={`bg-gray-50 outline-none text-sm font-medium placeholder-primary w-full text-primary h-full`}
                />

                <button type="button" onClick={() => setIsPassword({ ...isPassword, repeat: !isPassword.repeat })}>
                  <Eye className="size-[22px] text-secondary/80" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className='flex justify-end mt-5'>
          <Button type='submit' name='Guardar' className='bg-primary w-24 text-white shadow-lg border h-10 border-gray-300 rounded-lg' />
        </div>
      </form>
    </>
  )
}
