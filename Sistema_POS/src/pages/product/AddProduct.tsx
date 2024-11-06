import { FormEvent, useEffect, useRef, useState } from 'react';
import Container from '../../layout/Container';
import ProductFormFields from '../../section/product/ProductFormFields';
import ProductStatus from '../../section/product/ProductStatus';
import { Toaster } from 'react-hot-toast';
import { createProduct, getProductID, updateProduct } from '../../api/inventory/products';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast } from '../../components/Toast';
import { CategoryProps } from '../../types/types';
import { getCategorys } from '../../api/inventory/category';
import SubHeader from '../../components/SubHeader';

export default function ProductForm() {
  const [category, setCategory] = useState<CategoryProps[]>();
  const [selectedCategory, setSelectedCategory] = useState<{ label: string; value: string } | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    status: '1',
    price: 0,
    cost: 0,
    minStock: 0,
  });

  const formRef = useRef<HTMLFormElement | null>(null);
  const navigation = useNavigate();
  const { id } = useParams() ?? { id: '' };

  useEffect(() => {
    async function loadProduct(id: string) {
      const { data } = await getProductID(id);
      setFormData({
        code: data.CodigoProducto,
        title: data.NombreProducto || '',
        description: data.descripcion || '',
        status: data.estado ? '1' : '0',
        price: data.precio_producto.Precio,
        cost: data.precio_producto.Costo,
        minStock: data.cantidadMinima
      });

      setSelectedCategory({
        label: data.nombre_categoria,
        value: data.IDCategoria,
      });
    }

    if (id) loadProduct(id);

    async function loadCategorys() {
      const { data }: { data: CategoryProps[] } = await getCategorys();
      setCategory(data.filter(category => category.estado));
    }

    loadCategorys();
  }, [id]);

  function handleCategoryChange(selectedOption: { label: string; value: string } | null) {
    setSelectedCategory(selectedOption);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newProductData = {
      CodigoProducto: formData.code,
      NombreProducto: formData.title,
      descripcion: formData.description,
      IDCategoria: selectedCategory?.value,
      estado: formData.status,
      cantidadMinima: formData.minStock,
      precio_producto: {
        Precio: formData.price,
        Costo: formData.cost,
        Margen: 0,
        Ganancia: 0
      },
    };

    const { success, error } = !id ? await createProduct(newProductData) : await updateProduct(id, newProductData);

    if (success) {
      showToast('Producto guardado exitosamente', true);
      if (id) return;
      setFormData({
        code: '',
        title: '',
        description: '',
        status: '1',
        price: 0,
        cost: 0,
        minStock: 0
      });
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
    <Container save={true} text='Producto sin guardar' onSaveClick={handleFormSubmit} onClickSecondary={() => navigation('/products')}>
      <>
        <Toaster />
        <section className="flex flex-col items-center h-full">
          <div className="max-w-screen-lg mt-5 w-full mx-auto">
            <SubHeader title='Agregar producto' />
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-start">
              <div className="flex-1 w-full lg:w-auto">
                <ProductFormFields
                  formData={formData}
                  setFormData={setFormData}
                  category={category}
                  selectedCategory={selectedCategory}
                  handleCategoryChange={handleCategoryChange}
                />
              </div>

              <div className="w-full lg:w-1/3 lg:mr-0 mr-10">
                <ProductStatus
                  minStock={Number(formData.minStock)}
                  onChangeStock={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                  status={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                />
              </div>
            </form>
          </div>
        </section>
      </>
    </Container >
  );
}
