import { useState } from "react";
import { Eye, Marketing } from "../../icons/icons";
import { Quotation } from "../../types/types";
import ModalPreviewQuotation from "./ModalPreviewQuotation";
import ModalViewQuotation from "./ModalViewQuotation";

export default function DropDownQuotation({ currentQuotation }: { currentQuotation: Quotation }) {
  const [isShowModal, setIsShowModal] = useState({
    ModalPreview: false,
    ModalViewQuotation: false,
  });

  const handleChangeShowModal = (name: keyof typeof isShowModal, value: boolean) => {
    setIsShowModal({ ...isShowModal, [name]: value });
  };

  return (
    <>
      <div
        id="dropdown"
        className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10`}
      >
        <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Eye className="size-6" />
            <button onClick={() => handleChangeShowModal("ModalViewQuotation", true)} className="block text-left w-full text-primary px-2 py-2">Ver cotización</button>
          </li>
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Marketing />
            <button onClick={() => handleChangeShowModal("ModalPreview", true)} className="block text-left w-full text-primary px-2 py-2">Imprimir</button>
          </li>
        </ul>
      </div>
      {isShowModal.ModalPreview && <ModalPreviewQuotation
        address={currentQuotation.address}
        phone={currentQuotation.phone}
        date={new Date(currentQuotation.date)}
        department={currentQuotation.department}
        municipality={currentQuotation.municipality}
        onClose={() => handleChangeShowModal("ModalPreview", false)}
        customer={currentQuotation.Client}
        quotationCode={currentQuotation.quotationCode}
        discount={Number(currentQuotation.discount)}
        shippingCost={Number(currentQuotation.shippingCost)}
        subTotal={Number(currentQuotation.subTotal)}
        total={Number(currentQuotation.total)}
        products={currentQuotation.details.map(({ name, price, discount, quantity }) => ({
          name: name,
          price: Number(price),
          discount: Number(discount),
          quantity: Number(quantity),
          subtotal: Number(price) * Number(quantity),
          total: Number(Number(price) - Number(discount)) * Number(quantity),
        }))}
        deliveryCost={Number(currentQuotation.shippingCost)}
      />}

      {isShowModal.ModalViewQuotation && <ModalViewQuotation
        address={currentQuotation.address}
        discount={Number(currentQuotation.discount)}
        subTotal={Number(currentQuotation.subTotal)}
        total={Number(currentQuotation.total)}
        phone={currentQuotation.phone}
        date={new Date(currentQuotation.date)}
        department={currentQuotation.department}
        municipality={currentQuotation.municipality}
        onClose={() => handleChangeShowModal("ModalViewQuotation", false)}
        products={currentQuotation.details.map(({ name, price, discount, quantity }) => ({
          name: name,
          price: Number(price),
          discount: Number(discount),
          quantity: Number(quantity),
          subtotal: Number(price) * Number(quantity),
          total: Number(Number(price) - Number(discount)) * Number(quantity),
        }))}
        deliveryCost={Number(currentQuotation.shippingCost)}
        codeQuotation={currentQuotation.quotationCode}
        customer={currentQuotation.Client}
      />}
    </>
  )
}
