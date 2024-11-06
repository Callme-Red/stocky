import { FormEvent, useEffect, useRef, useState } from 'react';
import FieldInput from '../../components/form/FieldInput'
import FieldSelect from '../../components/form/FieldSelect'
import Container from '../../layout/Container'
import { Toaster } from 'react-hot-toast';
import { createVendor, getVendorId, updateVendor } from '../../api/purchase/vendor';
import { showToast } from '../../components/Toast';
import SubHeader from '../../components/SubHeader';
import { useNavigate, useParams } from 'react-router-dom';


export default function AddVendor() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const { id } = useParams() ?? { id: '' };
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ruc: '',
    name: '',
    SocialReason: '',
    phone: '',
    email: '',
    state: '1'
  });

  useEffect(() => {
    async function loadVendor(id: string) {
      const { data } = await getVendorId(id);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone,
        ruc: data.ruc,
        SocialReason: data.SocialReason,
        state: data.state
      });
    }

    if (id) loadVendor(id);
  }, [id])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newVendor = {
      ruc: formData.ruc,
      name: formData.name,
      SocialReason: formData.SocialReason,
      phone: formData.phone,
      email: formData.email,
      state: '1'
    }

    const { success, error } = !id ? await createVendor(newVendor) : await updateVendor(id, newVendor);

    if (success) {
      showToast('Proveedor guardado exitosamente', true)
      navigate('/vendor')
      formRef.current?.reset();
    } else {
      showToast(error.message, false)
    }
  }

  function handleFormSubmit() {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }

  return (
    <Container text='Proveedor no guardado' save onSaveClick={handleFormSubmit}>
      <>
        <Toaster />
        <section className="flex flex-col items-center h-full">
          <div className="max-w-screen-lg mt-5 w-full mx-auto">
            <SubHeader title='Agregar proveedor' />
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col md:flex-row items-start">
              <div className="flex-1 md:w-auto w-full">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 px-4 py-5">
                  <h2 className={`font-semibold mb-3`}>Datos generales</h2>
                  <FieldInput name='Nombre' value={formData.name} id='name' classNameInput='h-9' onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  <div className='flex items-center w-full mt-5'>
                    <FieldInput required={false} value={formData.ruc} name='RUC' id='ruc' className='w-full' classNameInput='h-9' onChange={(e) => setFormData({ ...formData, ruc: e.target.value })} />
                    <FieldInput required={false} name='Razón Social' value={formData.SocialReason} id='SocialReason' className='w-full ml-2' classNameInput='h-9' onChange={(e) => setFormData({ ...formData, SocialReason: e.target.value })} />
                  </div>
                </div>

                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 px-4 py-5">
                  <h2 className={`font-semibold mb-3`}>Metodos de contacto</h2>
                  <FieldInput required={false} name='Correo' value={formData.email} id='email' className='mb-5' classNameInput='h-9' onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  <FieldInput required={false} name='Telefono' value={formData.phone} id='phone' classNameInput='h-9' onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 w-full px-3 py-5 md:ml-8">
                  <h2 className={`font-semibold text-[15px] mb-3`}>Estado</h2>
                  <FieldSelect name="" id="state" options={[
                    { name: 'Activo', value: 1 },
                    { name: 'Inactivo', value: 2 },
                  ]}
                    value={formData.state}
                    onChange={(value) => setFormData({ ...formData, state: value.toString() })}
                  />
                </div>
              </div>
            </form>
          </div>
        </section>
      </>
    </Container>
  )
}
