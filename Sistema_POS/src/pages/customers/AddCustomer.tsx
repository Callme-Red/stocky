import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import FieldInput from '../../components/form/FieldInput';
import FieldSelect from '../../components/form/FieldSelect';
import TextArea from '../../components/form/TextArea';
import { Back } from '../../icons/icons';
import Container from '../../layout/Container';
import { createCustomer, getCustomerId, getDepartments, getMunicipalities, updateCustomer } from '../../api/sales/customers';
import { getFormData } from '../../utils/function';
import { CustomerProps, DepartmentProps, MunicipalityProps } from '../../types/types';
import { Toaster } from 'react-hot-toast';
import { showToast } from '../../components/Toast';
import { useNavigate, useParams } from 'react-router-dom';

interface FormData {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  IDMunicipality: string;
  address: string;
  description: string;
  state: string;
}

export default function AddCustomer() {
  const navigate = useNavigate();
  const { id } = useParams() ?? { id: '' };
  const formRef = useRef<HTMLFormElement | null>(null);
  const [department, setDepartment] = useState([]);
  const [municipality, setMunicipality] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    department: '',
    municipality: '',
    phone: '',
    address: '',
    description: '',
    state: '1'
  });

  const handleSelectChange = useCallback(async (value: string | number) => {
    const { data }: { data: MunicipalityProps[] } = await getMunicipalities(value);

    const options = data.map(customer => ({
      name: customer.name,
      value: customer.IDMunicipality,
    }));

    setMunicipality(options);
    setFormData(prevFormData => ({ ...prevFormData, department: value.toString() }));
  }, []);

  useEffect(() => {
    async function loadCustomer(id: string) {
      const { data }: { data: CustomerProps } = await getCustomerId(id);

      setFormData({
        name: data.name,
        lastName: data.lastName,
        email: data.email ?? '',
        phone: data.phone ?? '',
        department: data.IDDepartment,
        municipality: data.IDMunicipality,
        address: data.address,
        description: data.description ?? '',
        state: data.state ? '1' : '0'
      });

      await handleSelectChange(data.IDDepartment);
    }

    async function loadDepartments() {
      const { data }: { data: DepartmentProps[] } = await getDepartments();

      const options = data.map(customer => ({
        name: customer.name,
        value: customer.IDDepartment,
      }));

      console.log(options)
      
      setDepartment(options);

      if (id) {
        await loadCustomer(id);
      } else {
        if (options.length > 0) {
          const firstDepartmentId = options[0].value;
          setFormData(prevFormData => ({ ...prevFormData, department: firstDepartmentId }));
          await handleSelectChange(firstDepartmentId);
        }
      }
    }

    loadDepartments();
  }, [id, handleSelectChange]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data: FormData = getFormData(formRef);

    const newCustomer = {
      name: formData.name,
      lastName: formData.lastName,
      phone: formData.phone.trim() === '' ? null : formData.phone,
      email: formData.email.trim() === '' ? null : formData.email,
      IDMunicipality: data.IDMunicipality,
      address: formData.address,
      description: formData.description.trim() === '' ? null : formData.description,
      state: formData.state
    };

    const { success, error } = !id ? await createCustomer(newCustomer) : await updateCustomer(id, newCustomer);

    if (success) {
      showToast('Cliente guardado exitosamente', true);
      navigate('/customers');
    } else {
      showToast(error.message, false);
    }
  }

  function handleFormSubmit() {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }

  return (
    <Container text='Cliente no guardado' onClickSecondary={() => navigate('/customers')} save onSaveClick={handleFormSubmit}>
      <>
        <Toaster />
        <section className="flex flex-col items-center h-full">
          <div className="max-w-screen-lg mt-5 w-full mx-auto">
            <header className="flex items-center">
              <Back />
              <h2 className="ml-4 text-lg font-semibold text-secondary">Nuevo Cliente</h2>
            </header>
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col md:flex-row items-start">
              <div className="flex-1 md:w-auto w-full">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 px-4 py-5">
                  <h2 className={`font-semibold mb-3`}>Datos generales</h2>
                  <div className='flex items-center w-full mb-5'>
                    <FieldInput name='Nombres' id='name' className='w-full' classNameInput='h-9' value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

                    <FieldInput name='Apellidos' id='lastName' className='w-full ml-2' classNameInput='h-9' value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                  <FieldInput required={false} name='Correo' className='mb-5' id='email' classNameInput='h-9' value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

                  <FieldInput required={false} isNumber name='Telefono' id='phone' classNameInput='h-9' value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 px-4 py-5">
                  <h2 className={`font-semibold mb-3`}>Dirección</h2>
                  <div className='flex items-center w-full mb-5'>
                    <FieldSelect value={formData.department} onChange={handleSelectChange} name='Departamento' className='w-full' id='IDDepartment' options={department} />
                    <FieldSelect value={formData.municipality} onChange={(value) => setFormData({ ...formData, municipality: value.toString() })} name='Municipio' className='w-full ml-2' id='IDMunicipality' options={municipality} />
                  </div>
                  <TextArea value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} name='Dirección' id='address' rows={8} />
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 w-full px-3 py-5 md:ml-8">
                  <h2 className={`font-semibold text-[15px] mb-3`}>Estado</h2>
                  <FieldSelect name="" id="state" options={[
                    { name: 'Activo', value: 1 },
                    { name: 'Inactivo', value: 0 },
                  ]}
                    value={formData.state}
                    onChange={(value) => setFormData({ ...formData, state: value.toString() })}
                  />
                </div>

                <div className="bg-white border border-gray-300 mt-3 shadow-sm rounded-lg w-full px-3 py-5 md:ml-8">
                  <h2 className={`font-semibold text-[15px] mb-3`}>Información adicional</h2>
                  <TextArea required={false} name='Descripción' id='description' rows={5} value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
            </form>
          </div>
        </section>
      </>
    </Container>
  );
}
