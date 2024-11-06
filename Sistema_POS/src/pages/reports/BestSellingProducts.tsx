import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from '@react-pdf/renderer';
import { BestSellingProductsProps } from '../../types/types';
import { currencyFormatter } from '../../utils/function';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    color: '#1E90FF',
    fontSize: 24,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  table: {
    width: 'auto',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    padding: 5,
  },
  tableColHeader: {
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
  },
});

const BestSellingProducts = ({ products = [], startDate, endDate }: { products: BestSellingProductsProps[], startDate: string, endDate: string }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{import.meta.env.VITE_COMPANY_NAME}</Text>
          </View>
          <View>
            <Text>Productos mas vendidos</Text>
            <Text>{`Del ${startDate} al ${endDate}`}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text>{import.meta.env.VITE_COMPANY_NAME}</Text>
          <Text>Direccion: {import.meta.env.VITE_COMPANY_ADDRESS}</Text>
          <Text>Telefono: {import.meta.env.VITE_COMPANY_PHONE}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableColHeader]}>
            <View style={styles.tableCol}>
              <Text>Producto</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Codigo</Text>
            </View>
            <View style={[styles.tableCol, { textAlign: 'right' }]}>
              <Text>Cantidad comprada</Text>
            </View>
            <View style={[styles.tableCol, { textAlign: 'right' }]}>
              <Text>Total ganado</Text>
            </View>
          </View>

          {products && products.map(({ CodigoProducto, NombreProducto, total_earned, total_quantity }, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text>{CodigoProducto}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{NombreProducto}</Text>
              </View>
              <View style={[styles.tableCol, { textAlign: 'right' }]}>
                <Text>{currencyFormatter(total_earned)}</Text>
              </View>
              <View style={[styles.tableCol, { textAlign: 'right' }]}>
                <Text>{total_quantity}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default BestSellingProducts;
