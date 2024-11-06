import { useState } from "react";
import FieldInputWithElement from "../../components/form/FieldInputWithElement";
import FieldSelect from "../../components/form/FieldSelect";

interface ProductActive {
  IDProduct: string;
  price: number;
  NombreProducto: string;
  quantity: number;
  discount: number;
}

interface Props {
  onClose: () => void;
  productActive?: ProductActive | null;
  onApplyDiscount: (discount: number, discountType: boolean) => void;
}

export default function DiscountModal({ onClose, onApplyDiscount }: Props) {
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<number>(0);

  const handleApply = () => {
    onApplyDiscount(discount, discountType === 1);
    onClose();
  };

  const handleSelectChange = (value: string | number) => {
    setDiscountType(Number(value));
  };

  return (
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
    >
      <div className="relative w-full max-w-[650px] flex flex-col bg-white rounded-xl">
        <div className="relative flex flex-col h-full">
          <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
            <h3 className="text-base font-semibold text-secondary">Agregar descuento</h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={onClose}
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
          <form onSubmit={handleApply}>
            <div className="flex-grow overflow-y-auto px-4 py-8">
              <div className="flex items-center">
                <FieldSelect
                  id="typeDiscount"
                  name="Tipo de descuento"
                  className="w-full"
                  options={[
                    { name: 'Cantidad', value: 0 },
                    { name: 'Porcentaje', value: 1 }
                  ]}
                  value={discountType}
                  onChange={handleSelectChange}
                />
                <FieldInputWithElement
                  isNumber
                  prependChild={<span>NIO</span>}
                  appendChild={<span>{discountType ? "%" : "C$"}</span>}
                  focus
                  id="discount"
                  name="Valor del descuento"
                  className="w-full ml-3 mb-0"
                  value={discount}
                  onChange={(e) => discountType === 1 ? Number(e.target.value) <= 100 && setDiscount(Number(e.target.value)) : setDiscount(Number(e.target.value))}
                />
              </div>
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
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                onClick={onClose}
              >
                Cancelar
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
