import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from '@react-pdf/renderer';
import { currencyFormatter } from '../../utils/function';
import { COLORS } from '../../constants/constants';
import { SalesByCategoryProductsProps } from '../../types/types';
const styles = StyleSheet.create({
  page: {
    padding: 16,
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  expenseContainer: {
    marginBottom: 20,
  },
  category: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expenseDescription: {
    fontSize: 14,
    marginLeft: 20,
    marginTop: 10,
    fontWeight: 'medium',
    color: COLORS.secondary,
  },
  expenseAmount: {
    fontSize: 14,
    marginLeft: 20,
    marginTop: 10,
    fontWeight: 'medium',
    color: COLORS.secondary,
  },
});
const BestSellingCategoryProducts = ({ name, products, startDate, endDate }: { products: SalesByCategoryProductsProps, startDate: string, endDate: string, name: string }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={[styles.title, { color: '#1E90FF' }]}>{import.meta.env.VITE_COMPANY_NAME}</Text>
        <Text style={styles.title}>{name}</Text>
        <Text style={[styles.title, { marginBottom: 20 }]}>Del {startDate} al {endDate}</Text>
        {products.categories.map(({ category, values, total, total_quantity }, index) => (
          <View key={index} style={styles.expenseContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.category, { flex: 4 }]}>{category}</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 2 }}>
                <Text style={[styles.category, { width: 70, textAlign: 'right' }]}>Cantidad</Text>
                <Text style={[styles.category, { width: 100, textAlign: 'right' }]}>Total</Text>
              </View>
            </View>

            {values.map(({ NombreProducto, total_earned, total_quantity: quantity }, subIndex) => (
              <View key={subIndex}>
                <View style={styles.expenseItem}>
                  <Text style={[styles.expenseDescription, { flex: 4 }]}>{NombreProducto}</Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 2 }}>
                    <Text style={[styles.expenseAmount, { width: 70, textAlign: 'right' }]}>{quantity}</Text>
                    <Text style={[styles.expenseAmount, { width: 100, textAlign: 'right' }]}>{currencyFormatter(total_earned)}</Text>
                  </View>
                </View>
              </View>
            ))}

            <View style={{ alignSelf: 'flex-end', width: 140, height: 1, backgroundColor: "#000", marginTop: 5 }} />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text style={[styles.expenseDescription, { flex: 4 }]}>Total de {category}</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 2 }}>
                <Text style={[styles.expenseAmount, { width: 70, textAlign: 'right' }]}>{total_quantity}</Text>
                <Text style={[styles.expenseAmount, { width: 100, textAlign: 'right' }]}>{currencyFormatter(total)}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.expenseItem}>
          <Text style={[styles.expenseDescription, { marginLeft: 0 }]}>Total de gastos</Text>
          <Text style={styles.expenseAmount}>{currencyFormatter(products.total_global)}</Text>
        </View>

        <View style={styles.expenseItem}>
          <Text style={[styles.expenseDescription, { marginLeft: 0 }]}>Total de cantidad</Text>
          <Text style={styles.expenseAmount}>{products.total_quantity_global}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default BestSellingCategoryProducts;
