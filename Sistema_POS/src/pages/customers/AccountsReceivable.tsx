import Container from '../../layout/Container';
import ClientSearch from '../../section/account-receivable/ClientSearch';
import FieldInput from '../../components/form/FieldInput';
import Tabs from '../../section/account-receivable/Tabs';
import PaymentHistory from '../../section/account-receivable/PaymentHistory';
import TextArea from '../../components/form/TextArea';
import EditPaymentModal from '../../section/account-receivable/EditPaymentModal';
import { useState, useCallback, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Back } from '../../icons/icons';
import { getFormData, mapToSelectOptions } from '../../utils/function';
import { showToast } from '../../components/Toast';
import { getCustomerId, getCustomers, getPendingSales, savePass } from '../../api/sales/customers';
import { CustomerProps, SaleProps, StepsProps } from '../../types/types';
import { getLastPaymentCode } from '../../api/sales/sales';
import FieldSelect from '../../components/form/FieldSelect';
import { getPaymentMethod } from '../../api/purchase/payment';
import ModalVoucherPayment from '../../section/account-receivable/ModalVoucherPayment';

interface FormData {
  outflow: number;
  description: string;
  voucher: string;
}

interface CategoryOption {
  label: string;
  value: string;
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

export default function AccountsReceivable() {
  const PAYMENT_METHOD_NAME = 'transferencia';
  const formRef = useRef<HTMLFormElement | null>(null);
  const { id } = useParams() ?? { id: '' };
  const [customerID, setCustomerID] = useState<string>(id);
  const [customer, setCustomer] = useState<CustomerProps | null>(null);
  const [customersBySelected, setCustomersBySelected] = useState<CategoryOption[]>();
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({
    name: '',
    value: ''
  });
  const [tabs, setTabs] = useState<{ label: string; value: string }[]>([]);
  const [steps, setSteps] = useState<StepsProps[]>([]);
  const [activeTab, setActiveTab] = useState<string>(id);
  const [salesData, setSalesData] = useState<SaleProps[]>([]);
  const [currentSale, setCurrentSale] = useState<SaleProps | null>(null);
  const [selectedStep, setSelectedStep] = useState<StepsProps | null>(null);
  const [voucherData, setVoucherData] = useState<Props>();
  const [showModal, setShowModal] = useState({
    ModalEditPayment: false,
    ModalVoucher: false
  });

  const [account, setAccount] = useState({
    IDAccountsReceivable: '',
    outflow: 0,
  });

  const handleEditPayment = (step: StepsProps) => {
    if (!step.IDAccountsReceivable) return;
    setSelectedStep(step);
    setShowModal({ ...showModal, ModalEditPayment: true });
  }

  const getLatestBalance = useCallback(() => {
    if (currentSale) {
      const receivables = currentSale.accounts_receivable;
      if (receivables.length > 0) {
        const currentBalance = Number(receivables[receivables.length - 1].balance);
        return currentBalance;
      }
    }
    return '0.00';
  }, [currentSale]);

  async function handleShowModal() {
    setShowModal({ ...showModal, ModalEditPayment: false });
    await loadCustomerData();
  }

  useEffect(() => {
    async function loadCustomers() {
      const { data } = await getCustomers();
      const customer: CustomerProps[] = data;
      const customerOption: CategoryOption[] = customer
        .filter(customer => customer.isCredit)
        .map(customer => ({
          label: customer.name,
          value: customer.IDClient,
        }));

      setCustomersBySelected(customerOption);
    }

    async function loadPaymentMethod() {
      const { data } = await getPaymentMethod();
      const options = mapToSelectOptions(data, 'IDPaymentMethod', 'name').reverse();
      setPaymentMethod(options);
      setSelectedPaymentMethod({ name: options[0].name, value: options[0].value })
    }

    loadPaymentMethod();
    loadCustomers();
  }, [])

  const loadCustomerData = useCallback(async () => {
    if (!customerID) return;

    try {
      const { data } = await getCustomerId(customerID);
      setCustomer(data);

      const { data: sales } = await getPendingSales(customerID);
      setSalesData(sales);

      const fetchedTabs = sales
        .filter((sale: SaleProps) => sale.state === '2')
        .map((sale: SaleProps) => ({
          label: sale.salesCode,
          value: sale.IDSale,
        }));

      setTabs(fetchedTabs);
      setActiveTab(fetchedTabs.find(tab => tab.value === activeTab)?.value || fetchedTabs[0]?.value || '');
    } catch (error) {
      console.error('Error loading customer data:', error);
    }
  }, [customerID, activeTab]);

  const onChangePass = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = Number(e.target.value);
    const balance = Number(getLatestBalance().toString());

    if (inputValue <= balance) {
      setAccount({ ...account, outflow: inputValue });
    } else {
      showToast("El abono no puede ser mayor que el saldo pendiente.", false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  useEffect(() => {
    const sale = salesData.find(sale => sale.IDSale === activeTab);
    setCurrentSale(sale || null);
  }, [activeTab, salesData]);

  useEffect(() => {
    if (currentSale) {
      const saleDate = new Date(currentSale.date);
      const paymentDueDate = new Date(currentSale.expirationDate);

      const initialStep: StepsProps = {
        title: 'Venta',
        date: saleDate,
        description: parseFloat(currentSale.total.toString()).toFixed(2)
      };

      const receivablesSteps = currentSale.accounts_receivable
        .filter((_receivable, index) => index !== 0)
        .map(receivable => ({
          IDAccountsReceivable: receivable.IDAccountsReceivable,
          title: 'Abono',
          paymentCode: receivable.paymentCode,
          PaymentMethod: receivable.PaymentMethod,
          date: new Date(receivable.dateSale),
          description: parseFloat(receivable.outflow).toFixed(2)
        }));

      setSteps([initialStep, ...receivablesSteps, {
        title: 'Fin del plazo',
        date: paymentDueDate,
        description: Number(getLatestBalance()).toFixed(2)
      }]);
    }
  }, [currentSale, getLatestBalance]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data: FormData = getFormData(formRef);
    if (Number(parseFloat(data.outflow.toString()).toFixed(0)) === 0) {
      showToast("El abono no puede ser igual a 0.", false);
      return;
    }

    const formData = {
      IDSale: currentSale?.IDSale || '',
      IDClient: customerID,
      outflow: Number(data.outflow),
      description: data.description || '',
      voucher: selectedPaymentMethod.name.toLowerCase() === PAYMENT_METHOD_NAME ? data.voucher : null,
      type: false,
      IDPaymentMethod: selectedPaymentMethod.value,
    };

    const { success, error } = await savePass(formData);

    if (success) {
      showToast("Abono guardado exitosamente", true);
      const codePayment = await loadLastPaymentCode();
      dowloadPDF(formData.outflow, codePayment);
      formRef.current?.reset();
      setAccount({ IDAccountsReceivable: '', outflow: 0 })
      await loadCustomerData();
    } else {
      showToast(error.message, false);
    }
  }

  async function loadLastPaymentCode() {
    const { data } = await getLastPaymentCode();
    return data.latest_payment_code;
  }

  async function dowloadPDF(amout: number, codePayment: string) {
    const pdfData = {
      codeSale: currentSale.salesCode,
      customer: customer.name,
      codePayment: codePayment,
      phone: customer.phone,
      address: customer.address,
      department: customer.department,
      municipality: customer.municipality_name,
      amount: amout,
      paymentMethod: selectedPaymentMethod.name,
    };

    setShowModal({ ...showModal, ModalVoucher: true })
    setVoucherData(pdfData);
  }

  function handleFormSubmit() {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }

  const handleTabClick = (value: string) => {
    setActiveTab(value);
  };

  const handleClientSelect = (selectedClientID: string) => {
    setCustomerID(selectedClientID);
  };

  return (
    <Container save text='Abono no guardado' onSaveClick={handleFormSubmit}>
      <>
        <Toaster />
        <section className="flex flex-col items-center h-full">
          <div className="max-w-screen-lg mt-5 w-full mx-auto">
            <header className="flex items-center">
              <Back />
              <h2 className="ml-4 text-lg font-semibold text-secondary">Estado de cuenta {customer && 'de ' + customer.name}</h2>
            </header>
            <form onSubmit={handleSubmit} ref={formRef} className="flex flex-col lg:flex-row items-start">
              <div className="flex-1 w-full lg:w-auto">
                <div className="bg-white rounded-lg mt-8 px-4 py-5">
                  <ClientSearch
                    selectedClient={customerID && customersBySelected && { label: customersBySelected.find(c => c.value === customerID)?.label ?? null, value: customerID ?? null }}
                    customer={customersBySelected} onClientSelect={handleClientSelect} />
                </div>
                {customerID && tabs.length !== 0 &&
                  <div className="bg-white rounded-lg mt-4 px-4 py-5">
                    <Tabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />

                    <div className='flex mb-5 items-center mt-5 w-full'>
                      <FieldInput
                        name='Abono'
                        isNumber
                        id='outflow'
                        className='w-full'
                        placeholder='C$ 0.00'
                        classNameInput='h-10'
                        value={account.outflow}
                        onChange={onChangePass}
                      />
                      <FieldInput
                        name='Saldo'
                        readonly
                        value={Number(getLatestBalance().toString()).toFixed(2)}
                        isNumber
                        id='balance'
                        className='w-full ml-3'
                        placeholder='C$ 0.00'
                        classNameInput='h-10'
                      />
                    </div>

                    <div className='flex items-center space-x-2 mb-5'>
                      <FieldSelect className='w-full' value={selectedPaymentMethod.value} onChangeValue={(value, name) => setSelectedPaymentMethod({ value: value.toString(), name })} options={paymentMethod} id='paymentMethod' name='Metodo de pago' />
                      {selectedPaymentMethod.name.toLocaleLowerCase() === PAYMENT_METHOD_NAME &&
                        <FieldInput name='No voucher' id='voucher' className='w-full' classNameInput='h-10' />
                      }
                    </div>

                    <TextArea name='Concepto' id='description' rows={5} />
                  </div>
                }
              </div>

              {customerID && tabs.length !== 0 &&
                <div className="w-full lg:w-1/3 lg:mr-0 mr-10">
                  <div className="bg-white rounded-lg mt-8 w-full px-4 py-5 lg:ml-8 overflow-hidden">
                    <h2 className="font-semibold text-[15px] mb-3">Historial de pagos</h2>
                    <PaymentHistory onClick={handleEditPayment} steps={steps} />
                  </div>
                </div>
              }
            </form>
          </div>
        </section>
        {showModal.ModalEditPayment && <EditPaymentModal currentCustomer={customer} onClose={handleShowModal} step={selectedStep} currentSale={currentSale} />}
        {showModal.ModalVoucher && <ModalVoucherPayment {...voucherData} onClose={() => setShowModal({ ...showModal, ModalVoucher: false })} />}
      </>
    </Container>
  );
}
