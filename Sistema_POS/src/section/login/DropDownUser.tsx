import { useNavigate } from "react-router-dom";
import { LogOut, Settings } from "../../icons/icons";
import { decryptName, encryptName } from "../../utils/function";
import { Dispatch, SetStateAction } from "react";

interface Props {
  setSettingsMenu: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}

export default function DropDownUser({ isOpen, setSettingsMenu }: Props) {
  const navigate = useNavigate();

  function handleLogOut() {
    const encryptedName = encryptName("tokenUser");
    localStorage.removeItem(encryptedName)
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");

    document.cookie = `csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Lax`;

    navigate('/');
  }

  return (
    <div id="dropdownAvatar" className={`z-10 ${isOpen ? 'block' : 'hidden'} bg-white divide-y divide-gray-100 rounded-lg shadow w-64`}>
      <div className="px-4 py-3 text-sm flex flex-col text-gray-900">
        <span className="font-semibold inline-block text-sm text-primary">{decryptName(localStorage.getItem('name'))}</span>
        <p className="font-medium inline-block truncate">{decryptName(localStorage.getItem('email'))}</p>
      </div>
      <ul className="py-2 text-sm text-primary font-semibold" aria-labelledby="dropdownUserAvatarButton">
        <li className='flex items-center pl-2 hover:bg-gray-100'>
          <Settings />
          <button onClick={() => setSettingsMenu(true)} className="block w-full text-left text-primary px-2 py-2">Configuración</button>
        </li>
      </ul>
      <li className='flex items-center pl-3 py-2 hover:bg-gray-100'>
        <LogOut />
        <button onClick={handleLogOut} className="block px-4 py-2 w-full text-left text-sm text-primary font-semibold">Sign out</button>
      </li>
    </div >
  )
}
