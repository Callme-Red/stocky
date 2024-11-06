import { useNavigate } from "react-router-dom";
import { Eye } from "../../icons/icons";

interface Props {
  typeMoviment: string;
  movimentReference: string;
}

export default function DropDownInventory({ typeMoviment, movimentReference }: Props) {
  const navigate = useNavigate();

  console.log({ typeMoviment, movimentReference })
  function onViewMoviment() {
    if (typeMoviment === '0') {
      navigate(`/purchase/add/${movimentReference}/`)
    } else if (typeMoviment === '1') {
      navigate(`/sales/add/${movimentReference}/`)
    }
  }

  return (
    <div
      id="dropdown"
      className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10`}
    >
      <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
        {(typeMoviment === '0' || typeMoviment === '1') &&
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Eye className="size-6" />
            <button onClick={onViewMoviment} className="block text-left w-full text-primary px-2 py-2">Ver {typeMoviment === "0" ? "compra" : "venta"}</button>
          </li>
        }
      </ul>
    </div >
  )
}
