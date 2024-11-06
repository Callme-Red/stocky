import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import FieldInputWithElement from '../../components/form/FieldInputWithElement';
import TextArea from '../../components/form/TextArea';
import { showToast } from '../../components/Toast';
import { getBalanceSalesCredit, getLastPaymentCode } from '../../api/sales/sales';
import { savePass } from '../../api/sales/customers';
import { Toaster } from 'react-hot-toast';
import FieldSelect from '../../components/form/FieldSelect';
import FieldInput from '../../components/form/FieldInput';
import { mapToSelectOptions } from '../../utils/function';
import { getPaymentMethod } from '../../api/purchase/payment';
import ModalVoucherPayment from '../account-receivable/ModalVoucherPayment';

interface BalanceInformationProps {
  last_balance: string;
  id_client: string;
  client_lastname: string;
  phone: string;
  address: string;
  municipality: string;
  department: string;
}

interface Props {
  codeSale: string;
  customer: string;
  codePayment: string;
  phone: string;
  address: string;
  department: string;
  municipality: string;
  amount: number;
  paymentMethod: string;
}


export default function ModalAddPayment({ onClose, saleId, salesCode, handleUpdateSalesState }: { onClose: () => void, saleId: string, salesCode: string, handleUpdateSalesState: (newState: string, saleId: string) => void }) {
  const PAYMENT_METHOD_NAME = "transferencia"
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [voucher, setVoucher] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<boolean>();
  const [voucherData, setVoucherData] = useState<Props>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({
    name: '',
    value: ''
  });


  const [information, setInformation] = useState<BalanceInformationProps>();
  const [payment, setPayment] = useState({
    amount: 0,
    description: '',
  });

  useEffect(() => {
    async function loadBalanceDate() {
      const { data }: { data: BalanceInformationProps } = await getBalanceSalesCredit(saleId);
      setInformation(data);
    }

    async function loadPaymentMethod() {
      const { data } = await getPaymentMethod();
      const options = mapToSelectOptions(data, 'IDPaymentMethod', 'name').reverse();
      setPaymentMethod(options);
      setSelectedPaymentMethod({ name: options[0].name, value: options[0].value })
    }

    loadPaymentMethod();
    loadBalanceDate();
  }, [saleId])


  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (Number(payment.amount.toFixed(0)) === 0) {
      showToast("El abono no puede ser igual a 0.", false);
      return;
    }

    const formData = {
      IDSale: saleId,
      IDClient: information.id_client,
      outflow: payment.amount,
      description: payment.description || '',
      type: false,
      IDPaymentMethod: selectedPaymentMethod.value,
      voucher: selectedPaymentMethod.name.toLowerCase() === PAYMENT_METHOD_NAME ? voucher : null,
    };

    const { success, error } = await savePass(formData);

    if (success) {
      showToast("Abono guardado exitosamente", true);
      const codePayment = await loadLastPaymentCode();
      dowloadPDF(codePayment);
      updateState();
    } else {
      showToast(error.message, false);
    }
  }

  function updateState() {
    if (Number(payment.amount) === Number(information.last_balance)) {
      handleUpdateSalesState('3', saleId);
    }
  }

  async function loadLastPaymentCode() {
    const { data } = await getLastPaymentCode();
    return data.latest_payment_code;
  }

  async function dowloadPDF(codePayment: string) {
    const pdfData = {
      codeSale: salesCode,
      customer: information.client_lastname,
      codePayment: codePayment,
      phone: information.phone,
      address: information.address,
      department: information.department,
      municipality: information.municipality,
      amount: payment.amount,
      paymentMethod: selectedPaymentMethod.name,
    };

    setShowModal(true)
    setVoucherData(pdfData);
  }

  const onChangePass = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = Number(e.target.value);
    const balance = Number(information.last_balance)

    if (inputValue <= balance) {
      setPayment({ ...payment, amount: inputValue });
    } else {
      showToast("El abono no puede ser mayor que el saldo pendiente.", false);
    }
  };

  return (
    <>
      <Toaster />
      <div
        id="default-modal"
        tabIndex={-1}
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
      >
        <div className="relative w-full max-w-[500px] flex flex-col bg-white rounded-xl">
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
              <h3 className="text-base font-semibold text-secondary">Agregar pago</h3>
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
            <form onSubmit={handleSubmit}>
              {information &&
                <div className="flex-grow text-left py-5 overflow-y-auto px-4">
                  <FieldInputWithElement focus className='mb-3' prependChild={<span className='text-sm'>NIO</span>} appendChild={<span className='text-base'>C$</span>} name="Monto" value={payment.amount} required onChange={onChangePass} placeholder="C$ 0.00" isNumber id="amount" />
                  <FieldInputWithElement className='mb-3' prependChild={<span className='text-sm'>NIO</span>} appendChild={<span className='text-base'>C$</span>} value={Number(information.last_balance).toFixed(2) ?? 0} name='Saldo' id='balance' readOnly />

                  <div className='flex items-center space-x-2 mb-5'>
                    <FieldSelect className='w-full' value={selectedPaymentMethod.value} onChangeValue={(value, name) => setSelectedPaymentMethod({ value: value.toString(), name })} options={paymentMethod} id='paymentMethod' name='Metodo de pago' />
                    {selectedPaymentMethod.name.toLocaleLowerCase() === PAYMENT_METHOD_NAME &&
                      <FieldInput name='No voucher' id='voucher' value={voucher} onChange={(e) => setVoucher(e.target.value)} className='w-full' classNameInput='h-10' />
                    }
                  </div>

                  <TextArea value={payment.description} onChange={(e) => setPayment({ ...payment, description: e.target.value })} id='description' name='Descripción' rows={5} />
                </div>
              }
              <footer className="flex items-center p-4 md:px-5 border-t border-gray-200 rounded-b">
                <button
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
            </form>
          </div>
        </div>
      </div>

      {showModal && <ModalVoucherPayment {...voucherData} onClose={onClose} />}
    </>
  );
}
