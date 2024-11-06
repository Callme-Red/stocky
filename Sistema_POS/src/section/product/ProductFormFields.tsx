import { useEffect, useState } from 'react';
import FieldInput from '../../components/form/FieldInput';
import TextArea from '../../components/form/TextArea';
import SearchSelect from '../../components/form/SearchSelect';
import PriceProduct from '../../section/product/PriceProduct';
import { CategoryProps } from '../../types/types';
import { useParams } from 'react-router-dom';

type ProductFormFieldsProps = {
  formData: {
    code: string;
    title: string;
    description: string;
    price: number;
    cost: number;
  };
  setFormData: (data: unknown) => void;
  category: CategoryProps[];
  selectedCategory: { label: string; value: string } | null;
  handleCategoryChange: (selectedOption: { label: string; value: string } | null) => void;
};

export default function ProductFormFields({
  formData,
  setFormData,
  category,
  selectedCategory,
  handleCategoryChange,
}: ProductFormFieldsProps) {
  const [buffer, setBuffer] = useState('');
  const { id } = useParams() ?? { id: '' };

  useEffect(() => {
    const handleBarcodeInput = (event: KeyboardEvent) => {
      if (id) return;
      const activeElement = document.activeElement;

      if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
        return;
      }

      if (/^[a-zA-Z0-9]+$/.test(event.key) || event.key === 'Tab') {
        if (event.key === 'Tab') {
          setFormData({ ...formData, code: buffer });
          setBuffer('');
        } else {
          setBuffer((prev) => prev + event.key);
        }
      }
    };

    window.addEventListener('keydown', handleBarcodeInput);
    return () => {
      window.removeEventListener('keydown', handleBarcodeInput);
    };
  }, [buffer, setFormData, formData, id]);

  return (
    <>
      <div className="bg-white rounded-lg mt-8 px-4 py-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center w-full mb-5">
          <FieldInput
            name="Codigo"
            classNameInput='h-10'
            placeholder="Escanea el codigo"
            id="code"
            className="w-full lg:w-1/3"
            value={formData.code}
            // readonly
            // disabled
            onChange={(e)=>setFormData({...formData,code: e.target.value})}
          />
          <FieldInput
            name="Título"
            placeholder="Nombre del producto"
            id="title"
            className='w-full lg:w-2/3 lg:ml-2 mt-2 lg:mt-0'
            classNameInput="h-10"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <TextArea
          name="Descripcion"
          placeholder=""
          id="description"
          rows={8}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        {category && (
          <SearchSelect
            onChange={handleCategoryChange}
            value={selectedCategory}
            categorys={category}
          />
        )}
      </div>

      <div className="bg-white rounded-lg mt-8">
        <PriceProduct
          price={Number(formData.price)}
          cost={formData.cost}
          onPriceChange={(newPrice) => setFormData({ ...formData, price: newPrice })}
          onCostChange={(newCost) => setFormData({ ...formData, cost: newCost })}
        />
      </div>
    </>
  );
}
