import { useEffect, useState } from 'react';
import { ProductsProps, SelectedProductsProps } from '../../types/types';
import { currencyFormatter } from '../../utils/function';
import { Down, ThreeDots } from '../../icons/icons';
import { useNavigate } from 'react-router-dom';
import CheckBox from '../../components/form/CheckBox';
import StatusTags from '../../components/StatusTags';
import Button from '../../components/form/Button';
import ToolTip from '../../components/ToolTip';
import DropDownProduct from './DropDownProduct';

interface ProductsTableProps {
  onRefreshProducts: (selectedProducts: SelectedProductsProps[]) => void;
  products: ProductsProps[];
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ onRefreshProducts, products, showOptions, setShowOptions }) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductsProps[]>([]);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const allSelected = products.every(product => selectedProducts.some(selected => selected.IDProduct === product.IDProducto));
    setIsChecked(allSelected);
  }, [selectedProducts, products]);

  useEffect(() => {
    setShowOptions(selectedProducts.length === 0);
  }, [selectedProducts, setShowOptions]);

  const handleCheckBoxChange = (newValue: boolean) => {
    if (newValue) {
      setSelectedProducts(products.map(product => ({ IDProduct: product.IDProducto, estado: product.estado })));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleRowCheckBoxChange = (id: string, estado: boolean, newValue: boolean) => {
    let updatedSelectedCustomers = [...selectedProducts];

    if (newValue) {
      updatedSelectedCustomers.push({ IDProduct: id, estado: estado });
    } else {
      updatedSelectedCustomers = updatedSelectedCustomers.filter(product => product.IDProduct !== id);
    }

    setSelectedProducts(updatedSelectedCustomers);
  };

  const refreshProducts = async () => {
    onRefreshProducts(selectedProducts);
    setIsOpen(false)
    setSelectedProducts([])
  };

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-b-0 border-gray-300">
      <table className="w-full text-left">
        <thead className="bg-whiting2 border-b border-gray-300">
          <tr className="[&>th]:font-medium [&>th]:text-[13px] [&>th]:text-secondary [&>th]:py-3 px-2">
            <th scope="col" className="p-2 flex">
              <CheckBox
                onChange={handleCheckBoxChange}
                name=''
                initialValue={isChecked}
              />
            </th>
            <th scope="col" className="px-2 font-medium hidden sm:table-cell" style={{ opacity: showOptions ? 1 : 0 }}>
              Código
            </th>
            <th scope="col" className="pl-2 w-[20%] font-medium" style={{ opacity: showOptions ? 1 : 0 }}>
              Producto
            </th>
            <th scope="col" className="px-2 font-medium hidden md:table-cell" style={{ opacity: showOptions ? 1 : 0 }}>
              Estado
            </th>
            <th scope="col" className="px-2 font-medium hidden lg:table-cell" style={{ opacity: showOptions ? 1 : 0 }}>
              Inventario
            </th>
            <th scope="col" className="px-2 font-medium hidden lg:table-cell" style={{ opacity: showOptions ? 1 : 0 }}>
              Minimo
            </th>
            <th scope="col" className="pr-6 font-medium text-right" style={{ opacity: showOptions ? 1 : 0 }}>
              Precio
            </th>
            <th scope="col" className="pr-6 font-medium text-right hidden xl:table-cell" style={{ opacity: showOptions ? 1 : 0 }}>
              Costo
            </th>
            <th scope="col" className="px-2 font-medium text-right hidden 2xl:table-cell" style={{ opacity: showOptions ? 1 : 0 }}>
              Ganancia
            </th>
            <th scope="col" className="px-2 w-72 font-medium relative">
              {showOptions ? (
                "Categoría"
              ) : (
                <div className='flex items-center justify-end'>
                  <div className='flex absolute items-center'>
                    <Button onClick={() => navigate(`/products/add/${selectedProducts[0].IDProduct}`)} name='Editar' className='bg-white shadow-md border border-gray-300' />
                    <div role='button' onClick={toggleDropdown} data-tooltip-id="options" className='bg-white border border-gray-300 shadow-md size-8 ml-1 flex items-center justify-center rounded-md'>
                      <ThreeDots />
                      <ToolTip id='options' title='Más opciones' />
                    </div>
                    <DropDownProduct isOpen={isOpen} selectedProducts={selectedProducts} refreshProducts={refreshProducts} />
                  </div>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map(({ IDProducto, estado, cantidadMinima, NombreProducto, precio_producto, nombre_categoria, CodigoProducto, existencias }) => (
            <tr onDoubleClick={() => navigate(`/products/add/${IDProducto}`)} key={IDProducto} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50 cursor-pointer">
              <td className="w-4 p-2">
                <CheckBox
                  name=''
                  initialValue={selectedProducts.some(product => product.IDProduct === IDProducto)}
                  onChange={(value) => handleRowCheckBoxChange(IDProducto, estado, value)}
                />
              </td>
              <td className="pl-2 py-4 hidden sm:table-cell">
                {CodigoProducto}
              </td>
              <td className="pl-2 py-4">
                {NombreProducto}
              </td>
              <td className="px-2 py-4 hidden md:table-cell">
                <StatusTags text={estado ? 'Activo' : 'Inactivo'} status={estado} />
              </td>
              <td className="px-2 py-4 w-[20%] hidden lg:table-cell">
                <span className={`${existencias < cantidadMinima ? 'text-red-900' : 'text-green-600'}`}>{existencias} en inventario</span>
              </td>
              <td className="px-2 hidden lg:table-cell py-4 text-right">
                {Number(cantidadMinima).toFixed(0)}
              </td>
              <td className="py-2  text-right">
                <button
                  data-tooltip-id={
                    Number(parseFloat(precio_producto.Precio.toString()).toFixed(0)) === 0 && 'price'
                  }
                  onClick={() => navigate(`/products/add/${IDProducto}`)}
                  className="hover:bg-[#F3F3F3] cursor-pointer inline-flex items-center py-3 px-1 rounded-lg group"
                >
                  <span className="text-right">
                    {currencyFormatter(precio_producto.Precio)}
                  </span>
                  <Down className="size-5 text-whiting invisible group-hover:visible" />

                  {Number(parseFloat(precio_producto.Precio.toString()).toFixed(0)) === 0 && (
                    <ToolTip
                      id="price"
                      title={
                        Number(parseFloat(precio_producto.Costo.toString()).toFixed(0)) === 0
                          ? 'Este producto no tiene un costo definido. Por favor, realiza una compra para poder determinar un precio adecuado.'
                          : 'Este producto no tiene un precio asignado. Haz clic para establecer uno.'
                      }
                    />
                  )}
                </button>
              </td>

              <td className="py-2 text-right hidden xl:table-cell">
                <button
                  data-tooltip-id={
                    Number(parseFloat(precio_producto.Costo.toString()).toFixed(0)) === 0 && 'cost'
                  }
                  onClick={() => Number(parseFloat(precio_producto.Costo.toString()).toFixed(0)) === 0 && navigate('/purchase/add')}
                  className="hover:bg-[#F3F3F3] cursor-pointer inline-flex items-center py-3 px-1 rounded-lg group ml-auto"
                >
                  <span className="text-right">
                    {currencyFormatter(precio_producto.Costo)}
                  </span>
                  <Down className="size-5 text-whiting invisible group-hover:visible" />

                  {Number(parseFloat(precio_producto.Precio.toString()).toFixed(0)) === 0 &&
                    <ToolTip
                      id="cost"
                      title='Este producto no tiene un costo asignado. Por favor realice una compra para poder estimarlo.' />}
                </button>
              </td>

              <td className={`p-2 text-right hidden 2xl:table-cell ${Number(parseFloat(Number(precio_producto.Precio - precio_producto.Costo).toString()).toFixed(2)) <= 0 ? 'text-red-900' : 'text-primary'}`}>
                {currencyFormatter(precio_producto.Precio - precio_producto.Costo)}
              </td>
              <td className="py-2 px-2">
                {nombre_categoria}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductsTable;
