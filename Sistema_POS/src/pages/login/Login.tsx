import { FormEvent, useState } from "react";
import FieldInput from "../../components/form/FieldInput";
import StatusTags from "../../components/StatusTags";
import { Eye } from "../../icons/icons";
import { getUserLogin } from "../../api/admin/login";
import { showToast } from "../../components/Toast";
import { UserProps } from "../../types/types";
import { encryptName } from "../../utils/function";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [isPassword, setIsPassword] = useState(true);
  const [user, setUser] = useState({
    email: '',
    password: ''
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newUser = {
      email: user.email,
      password: user.password
    };

    const { success, error, data } = await getUserLogin(newUser);
    const dataUser: UserProps = data;

    if (success) {
      const encryptedName = encryptName("tokenUser");
      const hourExpiration = new Date(new Date().getTime() + 1000 * 60 * 60 * 6);
      const username = encryptName(dataUser.username)
      const email = encryptName(dataUser.email)
      const userId = encryptName(dataUser.user_id)

      localStorage.setItem(encryptedName, dataUser.token);
      localStorage.setItem('hourExpiration', hourExpiration.toString());
      localStorage.setItem("name", username);
      localStorage.setItem("email", email);
      localStorage.setItem("userId", userId);

      navigate('/home/')
    } else {
      showToast(error.message, false);
    }
  }

  function handleChangeUser(name: keyof typeof user, value: string) {
    setUser({ ...user, [name]: value });
  }

  return (
    <>
      <Toaster />
      <div className="h-screen w-screen py-0 flex items-center justify-center">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <section className="text-primary sm:w-[450px] sm:h-auto size-full p-8 rounded-lg bg-white">
          <header className="flex items-center justify-between">
            <h1 className="text-primary font-bold text-xl">{import.meta.env.VITE_COMPANY_NAME}</h1>
            <StatusTags text="Administrativo" status />
          </header>

          <main className="mt-10">
            <h2 className="text-primary text-2xl font-semibold">Hola, bienvenido</h2>
            <p className="font-medium text-whiting">Inicia sesión para poder acceder al sistema</p>

            <form onSubmit={handleSubmit} className="mt-3">
              <FieldInput onChange={(e) => handleChangeUser("email", e.target.value)} className="mt-8" classNameInput="h-10" autofocus name="Correo electrónico" id="email" />

              <div className="mt-3">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-primary">Contraseña</label>
                <div
                  className={`bg-gray-50 border rounded-lg flex justify-between items-center px-3 py-1 h-10 w-full ${isFocused ? 'border-blue-500' : 'border-gray-600'}`}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                >
                  <input
                    id="password"
                    type={isPassword ? "password" : "text"}
                    onChange={(e) => handleChangeUser("password", e.target.value)}
                    required
                    className={`bg-gray-50 outline-none text-sm font-medium placeholder-primary w-full text-primary h-full`}
                  />

                  <button type="button" onClick={() => setIsPassword(!isPassword)}>
                    <Eye className="size-[22px] text-secondary/80" />
                  </button>
                </div>
              </div>

              <button type="submit" className="bg-primary rounded-lg text-white shadow-lg text-[15px] w-full mt-8 py-3 border-gray-300 border">
                Iniciar sesión
              </button>

              <div className="w-full text-center mt-5">
                <span className="text-seconda font-semibold text-sm inline-block">
                  ¿Has olvidado tu contraseña? <span className="text-[#005bd3] cursor-pointer hover:underline">Cámbiala</span>
                </span>
              </div>
            </form>
          </main>
        </section>
      </div>
    </>
  );
}
