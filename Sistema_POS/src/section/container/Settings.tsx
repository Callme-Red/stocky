import { useState, useEffect } from 'react';
import { decryptName, encryptName } from '../../utils/function';
import { COLORS } from '../../constants/constants';
import { LogOut, MultiUsers, NewUser, Password, User } from '../../icons/icons';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AddUser from '../settings/AddUser';
import ChangePassword from '../settings/ChangePassword';
import Users from '../settings/Users';
import GeneralInfo from '../settings/GeneralInfo';

export default function Settings({ isOpen, onClose }: { isOpen: boolean, onClose: () => void; }) {
  const [active, setActive] = useState<number>(0);


  const [user, setUser] = useState({
    name: '',
    email: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const name = decryptName(localStorage.getItem('name'));
    const email = decryptName(localStorage.getItem('email'));
    setUser({ name, email });
  }, []);

  const imageURL = `https://ui-avatars.com/api/?name=${user.name}&background=${COLORS.redprimary.substring(1)}&color=fff&bold=true&&length=2`;

  const menuItems = [
    { name: 'General', icon: <User /> },
    { name: 'Usuarios', icon: <MultiUsers /> },
    { name: 'Nuevo usuario', icon: <NewUser /> },
    { name: 'Cambio de contraseña', icon: <Password /> },
  ];

  function handleLogOut() {
    const encryptedName = encryptName("tokenUser");
    localStorage.removeItem(encryptedName)
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");

    document.cookie = `csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    navigate('/');
  }
  return (
    <>
      <Toaster />
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        ></div>
      )}

      <div
        id="drawer-bottom-example"
        className={`fixed bottom-0 md:overflow-hidden overflow-auto rounded-t-xl border-t border-gray-300 h-[90%] left-0 right-0 z-40 w-full p-4 transition-all duration-300 ease-in-out bg-white transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        tabIndex={-1}
        aria-labelledby="drawer-bottom-label"
      >
        <button
          type="button"
          onClick={onClose}
          aria-controls="drawer-bottom-example"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center"
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

        <div className='max-w-screen-lg md:h-[90%] h-auto py-10 md:space-x-5 space-x-0 mx-auto flex flex-col md:flex-row justify-between'>
          <aside className='h-full md:w-96 w-full rounded-lg'>
            <header className='py-4 rounded-t-lg border border-gray-300 bg-whiting2 px-2 flex items-center space-x-3'>
              <img className='size-8 rounded-md' alt='Profile' src={imageURL} />

              <div>
                <h3 className='font-semibold text-primary text-sm'>{user.name}</h3>
                <p className='font-medium text-secondary text-sm'>{user.email}</p>
              </div>
            </header>

            <main className='border border-t-0 border-gray-300 rounded-b-lg py-4 px-2 flex flex-col md:h-full'>
              {menuItems.map((item, index) => (
                <button onClick={() => setActive(index)} key={index} type='button' className={`flex ${active === index && "bg-whiting2"} p-2 items-center rounded-md w-full font-semibold text-sm text-secondary`}>
                  {item.icon}
                  <span className='ml-2'>{item.name}</span>
                </button>
              ))}

              <button onClick={handleLogOut} type='button' className={`flex mt-auto p-2 items-center rounded-md w-full font-semibold text-sm text-secondary`}>
                <LogOut />
                <span className='ml-2'>Cerrar sesión</span>
              </button>
            </main>

          </aside>

          <main className='w-full overflow-hidden md:mt-0 mt-5'>
            {active === 0 && <GeneralInfo />}
            {active === 1 && <Users />}
            {active === 2 && <AddUser />}
            {active === 3 && <ChangePassword />}
          </main>
        </div>
      </div >
    </>
  );
}
