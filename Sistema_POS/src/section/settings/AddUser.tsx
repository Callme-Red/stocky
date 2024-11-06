import { FormEvent, useRef, useState } from 'react'
import { getFormData } from '../../utils/function';
import { showToast } from '../../components/Toast';
import FieldInput from '../../components/form/FieldInput';
import { createUser } from '../../api/admin/login';
import { Eye } from '../../icons/icons';
import Button from '../../components/form/Button';

export default function AddUser() {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [isFocused, setIsFocused] = useState(false);
  const [isPassword, setIsPassword] = useState(true);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = getFormData(formRef);

    const newUser = {
      username: formData.username,
      email: formData.email,
      password: formData.password
    }

    const { success, error } = await createUser(newUser);

    if (success) {
      showToast("Usuario agregado exitosamente", true);
      formRef.current.reset();
    } else {
      showToast(error.message, false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h2 className="text-xl mb-5 font-bold text-secondary">Nuevo usuario</h2>

      <section className='bg-white shadow-md border border-gray-300 p-4 rounded-lg'>
        <h4 className="text-sm mb-5 font-bold text-primary">Información general</h4>
        <FieldInput name='Nombre de usuario' id='username' autofocus classNameInput='h-10' className='mb-5' />

        <div className='flex md:flex-row flex-col items-center md:space-x-3 space-x-0 space-y-5 md:space-y-0'>
          <FieldInput name='Correo electronico' id='email' autofocus classNameInput='h-10' className='w-full' />

          <div className='w-full'>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-primary">Contraseña</label>
            <div
              className={`bg-gray-50 border rounded-lg flex justify-between items-center px-3 py-1 h-10 w-full ${isFocused ? 'border-blue-500' : 'border-gray-600'}`}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            >
              <input
                id="password"
                type={isPassword ? "password" : "text"}
                required
                className={`bg-gray-50 outline-none text-sm font-medium placeholder-primary w-full text-primary h-full`}
              />

              <button type="button" onClick={() => setIsPassword(!isPassword)}>
                <Eye className="size-[22px] text-secondary/80" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className='flex justify-end mt-5'>
        <Button type='submit' name='Guardar' className='bg-primary w-24 text-white shadow-lg border border-gray-300 rounded-lg' />
      </div>
    </form>
  )
}
