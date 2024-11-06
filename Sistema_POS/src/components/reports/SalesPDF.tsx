import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from '@react-pdf/renderer';
import { SalesProps } from '../../types/types';
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
    width: '14.28%',
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

const SalesDay = ({ sales = [], startDate, endDate }: { sales: SalesProps[], startDate: string, endDate: string }) => {
  const subTotalSales = sales.reduce((acc, sale) => Number(acc) + Number(sale.subTotal), 0);
  const totalDiscount = sales.reduce((acc, sale) => Number(acc) + Number(sale.discount), 0);
  const totalSales = sales.reduce((acc, sale) => Number(acc) + Number(sale.total), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{import.meta.env.VITE_COMPANY_NAME}</Text>
          </View>
          <View>
            <Text>Ventas diarias</Text>
            <Text>{`Del ${startDate} al ${endDate}`}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text>{import.meta.env.VITE_COMPANY_NAME}</Text>
          <Text>Direccion: {import.meta.env.VITE_COMPANY_ADDRESS}</Text>
          <Text>Telefono: {import.meta.env.VITE_COMPANY_PHONE}</Text>
          <Text>Correo: {import.meta.env.VITE_COMPANY_EMAIL}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableColHeader]}>
            <View style={styles.tableCol}>
              <Text>NoVenta</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Fecha</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Cliente</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Forma Pago</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>SubTotal</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Descuento</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Total</Text>
            </View>
          </View>

          {sales && sales.map((sale, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text>{sale.salesCode}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{new Date(sale.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{sale.Client}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{sale.PaymentMethod}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{sale.subTotal}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{sale.discount}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{sale.total}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Text style={{ fontWeight: 'bold' }}>SUBTOTAL: </Text>
          <Text style={{ marginLeft: 10 }}>{currencyFormatter(subTotalSales)}</Text>
        </View>
        <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Text style={{ fontWeight: 'bold' }}>DESCUENTO: </Text>
          <Text style={{ marginLeft: 10 }}>{currencyFormatter(totalDiscount)}</Text>
        </View>
        <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Text style={{ fontWeight: 'bold' }}>TOTAL: </Text>
          <Text style={{ marginLeft: 10 }}>{currencyFormatter(totalSales)}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SalesDay;
