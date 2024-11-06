import Container from "../../layout/Container";
import FieldInput from "../../components/form/FieldInput";
import FieldSelect from "../../components/form/FieldSelect";
import FieldInputWithElement from "../../components/form/FieldInputWithElement";
import TextArea from "../../components/form/TextArea";
import { Toaster } from "react-hot-toast";
import { mapToSelectOptions } from "../../utils/function";
import { createExpense, getCategoryExpense, getExpenseById, updateExpense } from "../../api/purchase/expense";
import { showToast } from "../../components/Toast";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Back } from "../../icons/icons";
import { useParams } from "react-router-dom";

export default function AddExpense() {
  const INITIAL_FORM_STATE = {
    name: '',
    amout: 0,
    description: '',
    category: ''
  }

  const { id } = useParams() ?? { id: '' };
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [categoryExpense, setCategoryExpense] = useState([]);

  const handleChangeFormDateState = useCallback((name: keyof typeof formState, value: string | number | boolean) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, [])

  useEffect(() => {
    async function loadCategoryExpense() {
      const { data } = await getCategoryExpense();
      const options = mapToSelectOptions(data, 'IDExpenseCategory', 'name');
      setCategoryExpense(options);
      handleChangeFormDateState("category", options[0].value)
    }

    async function loadExpense(id: string) {
      const { data } = await getExpenseById(id);
      setFormState({
        name: data.name,
        amout: data.amount,
        description: data.description,
        category: data.IDExpenseCategory
      })
    }

    if (id) loadExpense(id);

    loadCategoryExpense()
  }, [handleChangeFormDateState, id])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = {
      name: formState.name,
      IDExpenseCategory: formState.category,
      amount: formState.amout,
      description: formState.description
    }

    const { success, error } = !id ? await createExpense(formData) : await updateExpense(id, formData);

    if (success) {
      showToast(`Gasto ${id ? 'actualizado' : 'guardado'} exitosamente`, true)
      handleReset();
    } else {
      showToast(error.message, false)
    }
  }

  function handleFormSubmit() {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }

  function handleReset() {
    setFormState(INITIAL_FORM_STATE);
  }


  return (
    <Container text='Gasto no guardado' save onSaveClick={handleFormSubmit} onClickSecondary={handleReset}>
      <>
        <Toaster />
        <section className="flex flex-col items-center h-full">
          <div className="max-w-screen-lg mt-5 w-full mx-auto">
            <header className="flex items-center">
              <Back />
              <h2 className="ml-4 text-lg font-semibold text-secondary">Nuevo gasto</h2>
            </header>
            <form onSubmit={handleSubmit} ref={formRef} className="flex flex-col md:flex-row items-start">
              <div className="flex-1 md:w-auto w-full">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 px-4 py-5">
                  <FieldInput value={formState.name} onChange={(e) => handleChangeFormDateState("name", e.target.value)} name="Gasto" id="expense" classNameInput="h-10" />
                  <div className="flex items-center w-full my-5">
                    <FieldSelect value={formState.category} onChange={(value) => handleChangeFormDateState("category", value)} name="Categoria" id="IDExpenseCategory" className="w-full" options={categoryExpense} />
                    <FieldInputWithElement value={formState.amout} onChange={(e) => handleChangeFormDateState("amout", Number(e.target.value))} appendChild={<span>C$</span>} name="Costo" id="amount" isNumber className="w-full ml-3" />
                  </div>
                  <TextArea value={formState.description} onChange={(e) => handleChangeFormDateState("description", e.target.value)} name="Descripción" id="description" rows={5} />
                </div>
              </div>

              <div className="w-full md:w-1/3">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 w-full px-3 py-5 md:ml-8">
                  <h2 className={`font-semibold text-[15px] mb-3`}>Estado</h2>
                  <FieldSelect name="" id="state" options={[
                    { name: 'Activo', value: 1 },
                    { name: 'Inactivo', value: 2 },
                  ]} />
                </div>
              </div>
            </form>
          </div>
        </section>
      </>
    </Container>
  )
}
