import { useNavigate } from "react-router-dom";
import { Delete, Edit, Eye, History, Marketing, Orders } from "../../icons/icons";
import { useState } from "react";
import { SalesProps } from "../../types/types";
import ModalPaymentHistory from "./ModalPaymentHistory";
import ModalAddPayment from "./ModalAddPayment";
import ModalPreviewSale from "./ModalPreviewSale";
import ModalSalesVoucher from "./ModalSalesVoucher";
import { deleteSale } from "../../api/sales/sales";
import { showToast } from "../../components/Toast";

interface DropDownSalesProps {
  currentSale: SalesProps;
  onClose: () => void;
  handleUpdateSalesState: (newState: string, saleId) => void;
  handleDeleteSales: (saleId: string) => void;
}

export default function DropDownSales({ currentSale, onClose, handleUpdateSalesState, handleDeleteSales }: DropDownSalesProps) {
  const navigate = useNavigate();
  const [isShowModal, setIsShowModal] = useState({
    ModalHistory: false,
    ModalPayment: false,
    ModalViewSale: false,
    ModalViewVoucher: false
  });

  function onCloseAddPayment() {
    handleChangeShowModal("ModalPayment", false);
    onClose();
  }

  const handleEditVendorClick = () => {
    navigate(`/sales/add/${currentSale.IDSale}`);
  };

  const handleViewSaleClick = () => {
    handleChangeShowModal("ModalViewSale", true)
  }

  const handleChangeShowModal = (name: keyof typeof isShowModal, value: boolean) => {
    setIsShowModal({ ...isShowModal, [name]: value });
  };

  const handleDeleteSaleClick = async () => {
    const { success, error } = await deleteSale(currentSale.IDSale);
    if (success) {
      showToast("Venta eliminada exitosamente", true);
      handleDeleteSales(currentSale.IDSale)
    } else {
      showToast(error.message, false);
    }
  }

  return (
    <>
      <div
        id="dropdown"
        className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-60 z-10`}
      >
        <ul className="py-2 [&>li>button]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Eye className="size-6" />
            <button onClick={handleViewSaleClick} className="block text-left w-full text-primary px-2 py-2">Ver venta</button>
          </li>
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Edit />
            <button onClick={handleEditVendorClick} className="block text-left w-full text-primary px-2 py-2">Editar venta</button>
          </li>
          {currentSale.typeSale &&
            <>
              <li className='flex items-center pl-2 hover:bg-gray-100'>
                <History />
                <button onClick={() => handleChangeShowModal("ModalHistory", true)} className="block text-left w-full text-primary px-2 py-2">Historial de pago</button>
              </li>
              {currentSale.state !== "3" &&
                <li className='flex items-center pl-2 hover:bg-gray-100'>
                  <Orders />
                  <button onClick={() => handleChangeShowModal("ModalPayment", true)} className="block text-left w-full text-primary px-2 py-2">Agregar pago</button>
                </li>
              }
            </>
          }
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Marketing />
            <button onClick={() => handleChangeShowModal("ModalViewVoucher", true)} className="block text-left w-full text-primary px-2 py-2">Imprimir</button>
          </li>
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Delete className="size-6 text-red-900" />
            <button onClick={handleDeleteSaleClick} className="block text-left w-full text-red-900 px-2 py-2">Eliminar venta</button>
          </li>
        </ul>
      </div >
      {isShowModal.ModalHistory && <ModalPaymentHistory address={currentSale.address} codeSale={currentSale.salesCode} department={currentSale.department} municipality={currentSale.municipality} phone={currentSale.phone} onClose={() => handleChangeShowModal("ModalHistory", false)} saleId={currentSale.IDSale} />}
      {isShowModal.ModalPayment && <ModalAddPayment salesCode={currentSale.salesCode} saleId={currentSale.IDSale} onClose={onCloseAddPayment} handleUpdateSalesState={handleUpdateSalesState} />}
      {isShowModal.ModalViewVoucher &&
        <ModalSalesVoucher
          userName={currentSale.Username ?? ''}
          phone={currentSale.phone}
          customer={currentSale.Client}
          date={currentSale.date}
          deliveryCost={currentSale.shippingCost}
          department={currentSale.department}
          address={currentSale.address}
          discount={currentSale.discount}
          municipality={currentSale.municipality}
          products={currentSale.details.map((product) => ({
            name: product.productName,
            price: Number(product.productPrice),
            discount: Number(product.discount),
            quantity: product.quantity,
            subtotal: Number(product.subTotal),
            total: Number(product.total),
          }))}
          codeSale={currentSale.salesCode}
          subTotal={currentSale.subTotal}
          total={currentSale.total}
          onClose={() => handleChangeShowModal("ModalViewVoucher", false)}
          paymentMethod={currentSale.PaymentMethod}
        />
      }
      {isShowModal.ModalViewSale && <ModalPreviewSale
        userName={currentSale.Username ?? ''}
        address={currentSale.address}
        date={currentSale.date}
        department={currentSale.department}
        municipality={currentSale.municipality}
        codeSale={currentSale.salesCode}
        customer={currentSale.Client}
        dateExpiration={currentSale.expirationDate ? new Date(currentSale.expirationDate).toLocaleDateString() : 'N/A'}
        deliveryCost={currentSale.shippingCost}
        discount={currentSale.discount}
        isVoucher={currentSale.isVoucher ? 'Membretada' : 'Voucher'}
        paymentMethod={currentSale.PaymentMethod}
        products={currentSale.details.map((product) => ({
          name: product.productName,
          price: Number(product.productPrice),
          discount: Number(product.discount),
          quantity: product.quantity,
          subtotal: Number(product.subTotal),
          total: Number(product.total),
        }))}
        subTotal={currentSale.subTotal}
        total={currentSale.total}
        typeSale={currentSale.typeSale ? 'Credito' : 'Contado'}
        voucher={currentSale.voucher ?? 'N/A'}
        onClose={() => handleChangeShowModal("ModalViewSale", false)}
      />}
    </>
  );
}
