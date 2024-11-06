import { useNavigate } from 'react-router-dom';
import FieldInput from '../../components/form/FieldInput';
import { showToast } from '../../components/Toast';
import { Delete } from '../../icons/icons'
import { ProductActive } from '../../types/types';
import { currencyFormatter } from '../../utils/function';

interface Props {
  productsActive: ProductActive[];
  setProductsActive: React.Dispatch<React.SetStateAction<ProductActive[]>>;
  setSelectedProductForDiscount: React.Dispatch<React.SetStateAction<ProductActive | null>>;
  handleChangeModal: (name: 'DiscountProduct', value: boolean) => void;
}

export default function SaleListProduct({ productsActive, setProductsActive, setSelectedProductForDiscount, handleChangeModal }: Props) {
  const navigate = useNavigate();

  const handleDeleteProduct = (IDProduct: string) => {
    setProductsActive((prevProductsActive) =>
      prevProductsActive.filter((product) => product.IDProduct !== IDProduct)
    );
  }

  const handleQuantityChange = (IDProduct: string, newQuantity: number) => {
    setProductsActive((prevProductsActive) =>
      prevProductsActive.map((product) => {
        if (product.IDProduct === IDProduct) {
          if (newQuantity > product.existencia) {
            showToast(`La cantidad ingresada (${newQuantity}) supera la cantidad en existencias (${product.existencia}).`, false);
          }
          return { ...product, quantity: newQuantity };
        }
        return product;
      })
    );
  };

  const handleOpenDiscountModal = (product: ProductActive) => {
    setSelectedProductForDiscount(product);
    handleChangeModal('DiscountProduct', true);
  };

  return (
    <>
      {productsActive.length !== 0 && (
        <div className="relative overflow-x-auto">
          <div className="md:hidden">
            {productsActive.map((product) => (
              <div key={product.IDProduct} className="bg-white rounded-lg p-4 mb-4">
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <span role='button' onClick={() => navigate(`/products/add/${product.IDProduct}/`)} className="text-[#005bd3] text-[15px] cursor-pointer font-medium hover:underline">
                      {product.NombreProducto}
                    </span>
                    <button
                      type="button"
                      className="hover:bg-gray-200 p-1 rounded-lg cursor-pointer"
                      onClick={() => handleDeleteProduct(product.IDProduct)}
                    >
                      <Delete className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  {product.discount !== 0 && (
                    <span className="text-gray-500 text-[13px] font-medium">{`Descuento (-C$ ${product.discount.toFixed(2)}) NIO`}</span>
                  )}
                  <div className="flex items-center mt-2">
                    <span
                      onClick={() => handleOpenDiscountModal(product)}
                      role="button"
                      className="text-[#005bd3] text-[15px] cursor-pointer font-medium hover:underline"
                    >
                      C$ <span>{(product.price - product.discount).toFixed(2)}</span>
                    </span>
                    {product.discount !== 0 && (
                      <span className="text-gray-400 ml-2 line-through text-sm font-medium">{`C$ ${Number(product.price).toFixed(2)}`}</span>
                    )}
                  </div>
                  <div className="flex">
                    <div className="mt-2 flex flex-col">
                      <span className="font-medium mr-2">Cantidad</span>
                      <FieldInput
                        className="mb-0 w-32"
                        name=""
                        isNumber
                        id={`quantity-${product.IDProduct}`}
                        value={product.quantity}
                        onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value))}
                      />
                    </div>
                    <div className="mt-2 flex flex-col ml-3">
                      <span className="font-medium mr-2">Total</span>
                      <span className="text-right font-medium text-lg">
                        {currencyFormatter((product.price - product.discount) * product.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <table className="w-full text-sm text-left rtl:text-right hidden md:table">
            <thead className="[&>tr>th]:text-sm border-b border-gray-200 [&>tr>th]:text-primary [&>tr>th]:font-semibold">
              <tr>
                <th className="py-3 px-4 w-[80%]">Producto</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3 w-1/3 text-right">Total</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {productsActive.map((product) => (
                <tr key={product.IDProduct}>
                  <td className="px-4 py-3 w-[80%] text-sm text-primary">
                    <div className="w-full flex flex-col">
                      <div>
                        <span role='button' onClick={() => navigate(`/products/add/${product.IDProduct}/`)} className="text-[#005bd3] text-[15px] cursor-pointer font-medium hover:underline">
                          {product.NombreProducto}
                        </span>
                      </div>
                      {product.discount !== 0 && (
                        <span className="text-whiting text-[13px] font-medium">{`Descuento (-C$ ${product.discount.toFixed(2)}) NIO`}</span>
                      )}
                      <div className="flex items-center">
                        <span
                          onClick={() => handleOpenDiscountModal(product)}
                          role="button"
                          className="text-[#005bd3] w-auto text-[13px] cursor-pointer font-medium hover:underline mt-1"
                        >
                          C$ <span>{(product.price - product.discount).toFixed(2)}</span>
                        </span>
                        {product.discount !== 0 && (
                          <span className="text-whiting ml-2 line-through text-sm font-medium">{`C$ ${Number(product.price).toFixed(2)}`}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <FieldInput
                      className="mb-0 w-32"
                      name=""
                      isNumber
                      id={`quantity-${product.IDProduct}`}
                      value={product.quantity}
                      onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value))}
                    />
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span>
                      <span>{currencyFormatter((product.price - product.discount) * product.quantity)}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      className="hover:bg-whiting2 p-1 rounded-lg cursor-pointer"
                      onClick={() => handleDeleteProduct(product.IDProduct)}
                    >
                      <Delete className="size-5 text-graying" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      }
    </>
  )
}
