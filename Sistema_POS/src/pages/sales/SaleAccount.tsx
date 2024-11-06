import { Dispatch, SetStateAction } from "react";
import { Discount, ProductActive } from "../../types/types";

interface Props {
  productsActive: ProductActive[];
  calculateSubtotal: () => number;
  handleChangeModal: (name: 'DiscountProduct' | 'DeliveryModal', value: boolean) => void;
  discounts: Discount,
  setDiscounts: Dispatch<SetStateAction<Discount>>;
  costDelivery: number;
}

export default function SaleAccount({ productsActive, calculateSubtotal, handleChangeModal, discounts, setDiscounts, costDelivery }: Props) {
  return (
    <div className="border border-gray-300 rounded-lg py-2 px-3">
      <div className="md:grid md:grid-cols-3 flex items-center justify-between mt-4 w-full">
        {window.innerWidth < 768 ? (
          <div className="flex flex-col-reverse">
            <span className="font-medium text-sm text-secondary">
              Subtotal
            </span>
            <span className="text-sm text-whiting font-medium">
              {productsActive.length !== 0 ? productsActive.length + ' items' : ''}
            </span>
          </div>
        ) : (
          <>
            <span className="font-medium text-sm text-secondary">
              Subtotal
            </span>
            <span className="text-sm text-whiting font-medium">
              {productsActive.length !== 0 ? productsActive.length + ' items' : ''}
            </span>
          </>
        )}
        <span className="font-medium text-sm text-secondary text-right">
          C$ {calculateSubtotal().toFixed(2)}
        </span>
      </div>


      <div className="flex items-center justify-between mt-4 w-full md:grid md:grid-cols-3">
        {window.innerWidth < 768 ? (
          <div className="flex flex-col-reverse">
            <button
              disabled={productsActive.length === 0}
              onClick={() => {
                handleChangeModal('DiscountProduct', true);
                setDiscounts({ ...discounts, general: true });
              }}
              className={`font-medium text-left w-auto ${productsActive.length !== 0 ? 'text-[#005bd3] hover:underline' : 'text-[#bbb]'} text-sm `}
            >
              Agregar descuento
            </button>
            <span className="text-sm text-whiting font-medium">
              {discounts.discount === 0 ? '—' : 'Descuento aplicado'}
            </span>
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={productsActive.length === 0}
              onClick={() => {
                handleChangeModal('DiscountProduct', true);
                setDiscounts({ ...discounts, general: true });
              }}
              className={`font-medium text-left w-auto ${productsActive.length !== 0 ? 'text-[#005bd3] hover:underline' : 'text-[#bbb]'} text-sm `}
            >
              Agregar descuento
            </button>
            <span className="text-sm text-whiting font-medium">
              {discounts.discount === 0 ? '—' : 'Descuento aplicado'}
            </span>
          </>
        )}
        <span className="font-medium text-sm text-secondary text-right">
          -C$ {parseFloat(discounts.discount.toString()).toFixed(2)}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4 w-full md:grid md:grid-cols-3">
        {window.innerWidth < 768 ? (
          <div className="flex flex-col-reverse">
            <button
              disabled={productsActive.length === 0}
              onClick={() => handleChangeModal('DeliveryModal', true)}
              className={`font-medium text-left w-auto ${productsActive.length !== 0 ? 'text-[#005bd3] hover:underline' : 'text-[#bbb]'} text-sm `}
            >
              Agregar delivery
            </button>
            <span className="text-sm text-whiting font-medium">—</span>
          </div>
        ) : (
          <>
            <button
              disabled={productsActive.length === 0}
              type="button"
              onClick={() => handleChangeModal('DeliveryModal', true)}
              className={`font-medium w-auto text-left ${productsActive.length !== 0 ? 'text-[#005bd3] hover:underline' : 'text-[#bbb]'} text-sm `}
            >
              Agregar delivery
            </button>
            <span className="text-sm text-whiting font-medium">—</span>
          </>
        )}
        <span className="font-medium text-sm text-secondary text-right">
          C$ {Number(parseFloat(costDelivery.toString())).toFixed(2)}
        </span>
      </div>


      <div className="flex items-center justify-between mt-4 w-full md:grid md:grid-cols-3">
        {window.innerWidth < 768 ? (
          <div className="flex flex-col-reverse">
            <span className="font-medium text-sm text-[#bbb]">
              Impuesto
            </span>
            <span className="text-sm text-whiting font-medium">
              No calculado
            </span>
          </div>
        ) : (
          <>
            <span className="font-medium text-sm text-[#bbb]">
              Impuesto
            </span>
            <span className="text-sm text-whiting font-medium">
              No calculado
            </span>
          </>
        )}
        <span className="font-medium text-sm text-secondary text-right">
          C$ 0.00
        </span>
      </div>


      <div className="flex items-center mt-4 justify-between">
        <span className="font-semibold text-sm text-primary">
          Total
        </span>
        <span className="font-semibold text-sm text-primary">
          C$ {(calculateSubtotal() - discounts.discount + Number(costDelivery)).toFixed(2)}
        </span>
      </div>
    </div>
  )
}
