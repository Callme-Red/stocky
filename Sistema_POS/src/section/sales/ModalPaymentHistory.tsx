import { useEffect, useState } from "react";
import { AccountReceivable } from "../../types/types";
import { getHistoryPaymentSalesCredit } from "../../api/sales/sales";
import { currencyFormatter } from "../../utils/function";
import { Eye } from "../../icons/icons";
import ModalVoucherPayment from "../account-receivable/ModalVoucherPayment";

interface PaymentHistoryProps extends AccountReceivable {
  description: string;
  Client: string;
}

interface CurrentPaymentProps {
  customer: string;
  codePayment: string;
  amount: number;
  paymentMethod: string;
}

export default function ModalPaymentHistory({ onClose, saleId, codeSale, address, municipality, department, phone }: { onClose: () => void, address: string, saleId: string, codeSale: string, municipality: string, department: string, phone: string }) {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryProps[]>([]);
  const [currentPayment, setCurrenPayment] = useState<CurrentPaymentProps>()
  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  useEffect(() => {
    async function loadHistoryPayment() {
      const { data } = await getHistoryPaymentSalesCredit(saleId);
      setPaymentHistory(data)
    }

    loadHistoryPayment();
  }, [saleId])

  return (
    <>
      <div
        id="default-modal"
        tabIndex={-1}
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
      >
        <div className="relative w-full max-w-[1300px] flex flex-col bg-white rounded-xl">
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
              <h3 className="text-base font-semibold text-secondary">Historial de pagos</h3>
              <button
                onClick={onClose}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
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
            <div className="flex-grow py-5 overflow-y-auto px-4">
              <div className="relative overflow-y-auto h-[500px] rounded-lg border overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                  <thead className="text-xs border-b text-gray-700 uppercase bg-whiting2">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Referencia
                      </th>
                      <th scope="col" className="px-2 py-3">
                        Cliente
                      </th>
                      <th scope="col" className="px-2 py-3">
                        Metodo de pago
                      </th>
                      <th scope="col" className="px-2 py-3">
                        Voucher
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Valor
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Abono
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Saldo
                      </th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map(({ Client, dateSale, outflow, paymentCode, balance, PaymentMethod, voucher }, index) => (
                      <tr key={index} className={`bg-white ${index !== paymentHistory.length - 1 ? 'border-b' : ''}`}>
                        <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {paymentCode}
                        </th>
                        <td className="px-2 py-4">
                          {Client}
                        </td>
                        <td className="px-2 py-4">
                          {PaymentMethod ?? 'N/A'}
                        </td>
                        <td className="px-2 py-4">
                          {voucher ?? 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(dateSale).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {currencyFormatter(paymentHistory[0].inflow)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {currencyFormatter(outflow)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {currencyFormatter(balance)}
                        </td>
                        <td className="px-2">
                          {PaymentMethod &&
                            <button onClick={() => { setIsShowModal(true); setCurrenPayment({ amount: Number(outflow), codePayment: paymentCode, customer: Client, paymentMethod: PaymentMethod }) }} className="hover:bg-whiting2 flex items-center py-1 rounded-md justify-center w-10">
                              <Eye className="size-5" />
                            </button>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
            <footer className="flex items-center p-4 md:px-5 border-t border-gray-200 rounded-b">
              <button
                onClick={onClose}
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Aceptar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      </div>
      {isShowModal &&
        <ModalVoucherPayment
          address={address}
          amount={currentPayment.amount}
          codePayment={currentPayment.codePayment}
          codeSale={codeSale}
          customer={currentPayment.customer}
          department={department}
          municipality={municipality}
          onClose={() => setIsShowModal(false)}
          paymentMethod={currentPayment.paymentMethod}
          phone={phone}
        />
      }
    </>
  );
}
