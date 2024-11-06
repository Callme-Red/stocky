import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from '@react-pdf/renderer';
import { SalesByYear } from '../../types/types';

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

const SalesYearReport = ({ sales = [], startDate, endDate }: { sales: SalesByYear[], startDate: string, endDate: string }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{import.meta.env.VITE_COMPANY_NAME}</Text>
          </View>
          <View>
            <Text>Ventas anuales</Text>
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
              <Text>Mes</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Ventas</Text>
            </View>
          </View>

          {sales && sales.map((sale, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text>{sale.month}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{sale.sales}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default SalesYearReport;
