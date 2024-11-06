import { useState } from "react";
import FieldInput from "../../components/form/FieldInput";
import { CustomerProps, SaleProps, StepsProps } from "../../types/types";
import { showToast } from "../../components/Toast";
import { Toaster } from "react-hot-toast";
import { updatePass } from "../../api/sales/customers";
import ModalVoucherPayment from "./ModalVoucherPayment";

interface Props {
  currentCustomer: CustomerProps;
  step?: StepsProps;
  currentSale: SaleProps;
  onClose: () => void;
}

export default function EditPaymentModal({ currentCustomer, step, currentSale, onClose }: Props) {
  const [editableValues, setEditableValues] = useState<{ [key: string]: string }>({});
  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  const handleFieldChange = (id: string, value: string) => {
    setEditableValues(prevValues => {
      const updatedValues = { ...prevValues, [id]: value };

      const index = currentSale.accounts_receivable.findIndex(account => account.IDAccountsReceivable === id);

      if (index !== -1) {
        let previousBalance = parseFloat(currentSale.accounts_receivable[index - 1]?.balance || "0");
        let remainingBalance = previousBalance;

        for (let i = index; i < currentSale.accounts_receivable.length; i++) {
          const account = currentSale.accounts_receivable[i];
          const newOutflow = parseFloat(updatedValues[account.IDAccountsReceivable] || account.outflow);

          const newBalance = previousBalance - newOutflow;

          if (i === index) {
            const availableBalance = remainingBalance;

            if (newOutflow > availableBalance) {
              showToast(`El valor ingresado no puede ser mayor al saldo disponible de ${availableBalance.toFixed(2)}.`, false);
              return prevValues;
            }
          }

          account.balance = newBalance.toFixed(2);
          previousBalance = newBalance;
          remainingBalance -= newOutflow;
        }
      }

      return updatedValues;
    });
  };


  const handleSubmit = async () => {
    if (!step) return;

    const id = step.IDAccountsReceivable;
    const outflow = editableValues[step.IDAccountsReceivable] || "0";

    const formData = {
      outflow: outflow
    }

    const { success, error } = await updatePass(id, formData);

    if (success) {
      showToast('Abono actualizado correctamente', true);
      onClose();
    } else {
      showToast(error.message, false);
    }
  };

  return (
    <>
      <Toaster />
      <div id="default-modal" tabIndex={-1} aria-hidden="true" className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
        <div className="relative w-full max-w-[900px] h-[500px] flex flex-col bg-white rounded-xl">
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
              <h3 className="text-base font-semibold text-secondary">Historial de pagos</h3>

              <button onClick={onClose} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
              </button>
            </div>
            <div className="flex-grow flex flex-col md:flex-row justify-between w-full overflow-y-auto p-4">
              <div className="w-full">
                <h2 className="font-semibold mb-3">Cambio</h2>
                <table className="text-sm text-left rtl:text-right">
                  <thead className="[&>tr>th]:text-sm border-b border-gray-200 [&>tr>th]:text-primary [&>tr>th]:font-semibold">
                    <tr>
                      <th className="py-2 w-[80%]">Movimiento</th>
                      <th className="py-2">Monto</th>
                      <th className="py-2 w-1/3 text-right">Saldo</th>
                      <th className="py-2 w-24"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSale.accounts_receivable.map((account, index) => (
                      <tr key={index}>
                        <td className="py-2 w-[80%] text-sm text-primary font-medium">
                          {Number(account.outflow) === 0 ? 'Venta' : 'Abono'}
                        </td>
                        <td className="py-2">
                          <FieldInput
                            className="mb-0 w-32"
                            name=""
                            isNumber
                            readonly={account.IDAccountsReceivable !== step?.IDAccountsReceivable}
                            id={`pass-${account.IDAccountsReceivable}`}
                            value={editableValues[account.IDAccountsReceivable] ?? Number(account.outflow).toFixed(2)}
                            onChange={(e) => handleFieldChange(account.IDAccountsReceivable, e.target.value)}
                          />
                        </td>
                        <td className="py-2 w-[80%] text-sm text-right text-primary">
                          {parseFloat(account.balance).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center mx-10">
                <div className="h-full w-[0.5px] bg-gray-300" />
              </div>

              <div className="w-full mt-10 md:mt-0">
                <h2 className="font-semibold mb-3">Actual</h2>
                <table className="text-sm text-left rtl:text-right">
                  <thead className="[&>tr>th]:text-sm border-b border-gray-200 [&>tr>th]:text-primary [&>tr>th]:font-semibold">
                    <tr>
                      <th className="py-2 w-[30%]">Movimiento</th>
                      <th className="py-2">Monto</th>
                      <th className="py-2 w-1/3 text-right">Saldo</th>
                      <th className="py-2 w-24"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSale.accounts_receivable.map((account, index) => (
                      <tr key={index}>
                        <td className="py-2 w-[80%] text-sm text-primary font-medium">
                          {Number(account.outflow) === 0 ? 'Venta' : 'Abono'}
                        </td>
                        <td className="py-2">
                          <FieldInput
                            className="mb-0 w-32"
                            name=""
                            isNumber
                            readonly
                            id={`pass-${account.IDAccountsReceivable}`}
                            value={parseFloat(account.outflow).toFixed(2)}
                          />
                        </td>
                        <td className="py-2 w-[80%] text-sm text-right text-primary">
                          {parseFloat(account.balance).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="flex items-center p-4 md:px-5 border-t border-gray-200 rounded-b">
              <button
                type="button"
                onClick={handleSubmit}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Aceptar
              </button>
              <button
                onClick={() => setIsShowModal(true)}
                type="button"
                className="text-primary font-semibold ml-3 bg-[#e3e3e3] shadow-sm border border-gray-300 hover:bg-[#d4d4d4] focus:outline-none rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Comprobante de pago
              </button>
              <button
                onClick={onClose}
                type="button"
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      </div>

      {isShowModal && <ModalVoucherPayment
        codeSale={currentSale.salesCode}
        codePayment={step.paymentCode}
        department={currentCustomer.department}
        municipality={currentCustomer.municipality_name}
        address={currentCustomer.address}
        paymentMethod={step.PaymentMethod}
        customer={currentCustomer.name}
        phone={currentCustomer.phone}
        amount={Number(step.description)}
        onClose={() => setIsShowModal(false)}
      />}
    </>
  );
}
