import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "../../components/form/Button";
import { COLORS } from "../../constants/constants";
import { Menu, MessageAlert, Search } from "../../icons/icons";
import DropDownUser from "../login/DropDownUser";
import { decryptName } from "../../utils/function";
import FieldInput from "../../components/form/FieldInput";
import DropDownSearch from "./DropDownSearch";

interface HeaderProps {
  text?: string;
  save?: boolean;
  onClick?: () => void;
  onClickSecondary?: () => void;
  onClickAside?: () => void;
  settingsMenu: boolean;
  setSettingsMenu: Dispatch<SetStateAction<boolean>>;
}

export default function Header({ setSettingsMenu, onClickAside, text, save = false, onClick, onClickSecondary }: HeaderProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [textSearch, setTextSearch] = useState<string>("");
  const [user, setUser] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    const name = decryptName(localStorage.getItem('name'));
    const email = decryptName(localStorage.getItem('email'));

    setUser({ name, email })
  }, [])

  const imageURL = `https://ui-avatars.com/api/?name=${user.name}&background=${COLORS.redprimary.substring(1)}&color=fff&bold=true&&length=2`;

  function handleSearch() {
    if (save) return;
  }

  return (
    <header className='[grid-area:header] flex justify-between items-center bg-primary py-2.5 px-6 w-full'>
      <div className="items-center space-x-1 hidden lg:flex lg:mr-0 mr-10">
        <img src={`/logo/${import.meta.env.VITE_COMPANY_LOGO}`} className="size-12" alt={`Logo de la empresa ${import.meta.env.VITE_COMPANY_NAME}`} />
        <h1 className="text-xl text-white font-bold">{import.meta.env.VITE_COMPANY_NAME}</h1>
      </div>
      <div className="items-center justify-center size-5 lg:hidden mr-5 flex">
        <button onClick={onClickAside} className="text-white">
          <Menu />
        </button>
      </div>

      <div
        role="button"
        onClick={handleSearch}
        className="h-full bg-secondary text-[#ebebeb90] lg:w-[40%] w-[70%] rounded-xl flex items-center justify-between md:px-4 px-1 border-[0.5px] border-whiting cursor-pointer relative" // Añade "relative"
      >
        {!save ? (
          <div>
            <div className="flex items-center w-full">
              <Search className="size-5" />
              <FieldInput
                id="search"
                placeholder="Buscar..."
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                className="bg-transparent"
                classNameInput="h-10 placeholder-whiting2 text-white border-0 bg-transparent w-full"
              />
            </div>

            <div className="absolute mt-5 top-full left-0 right-0 w-full z-50">
              {textSearch.length > 0 && <DropDownSearch text={textSearch} />}
            </div>
          </div>
        ) : (
          <>
            <div className="items-center md:flex hidden">
              <MessageAlert className="size-4 text-whiting2" />
              <h2 className="text-sm text-whiting2/80 font-medium ml-2">{text}</h2>
            </div>

            <div className="flex items-center md:w-auto w-full">
              <Button
                type="button"
                onClick={onClickSecondary}
                name="Descartar"
                className="bg-[#404040] w-full text-white"
              />
              <Button
                type="button"
                name="Guardar"
                className="bg-white text-primary w-full ml-2"
                onClick={onClick}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center">
        <button onClick={() => setIsOpen(!isOpen)} className="flex rounded-full ml-4 justify-between items-center lg:px-2 lg:py-1 bg-secondary">
          <img src={imageURL} alt="Profile" className="w-8 h-8 rounded-full" />
          <h3 className="font-bold lg:block hidden text-sm text-white ml-3">{user.name}</h3>
        </button>

        {isOpen && (
          <div className="absolute top-16 right-5 mt-2 z-10">
            <DropDownUser setSettingsMenu={setSettingsMenu} isOpen={isOpen} />
          </div>
        )}
      </div>
    </header>
  );
}
