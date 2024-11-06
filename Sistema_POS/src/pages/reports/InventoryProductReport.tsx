import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from '@react-pdf/renderer';
import { ProductsProps } from '../../types/types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    color: '#1E90FF',
    fontSize: 24,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  subTitle: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
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

const InventoryProductReport = ({ products = [] }: { products: ProductsProps[] }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{import.meta.env.VITE_COMPANY_NAME}</Text>
          </View>
          <View>
            <Text style={styles.subTitle}>Inventario por productos al {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableColHeader]}>
            <View style={styles.tableCol}>
              <Text>Producto</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Codigo</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Esperado</Text>
            </View>
            <View style={styles.tableCol} >
              <Text>Existente</Text>
            </View>
          </View>

          {products && products.map(({ NombreProducto, CodigoProducto, existencias }, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text>{NombreProducto}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{CodigoProducto}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{existencias}</Text>
              </View>
              <View style={styles.tableCol} />
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default InventoryProductReport;
