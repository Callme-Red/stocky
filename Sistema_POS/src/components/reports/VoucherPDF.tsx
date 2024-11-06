import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { COLORS } from "../../constants/constants";
import { currencyFormatter } from "../../utils/function";

interface Props {
  codeSale: string;
  customer: string;
  codePayment: string;
  phone: string;
  address: string;
  department: string;
  municipality: string;
  amount: number;
  paymentMethod: string;
}

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-500-normal.woff' }
  ]
});

const styles = StyleSheet.create({
  page: {
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  headerText: {
    fontFamily: 'Roboto',
    fontSize: 8,
    textAlign: 'center',
    fontWeight: "bold",
    color: COLORS.primary,
  },
  referenceText: {
    fontFamily: 'Roboto',
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  customerInfoText: {
    fontSize: 9,
    color: COLORS.primary,
    marginBottom: 7,
  },
  row: {
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  signatureContainer: {
    marginBottom: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  signatureLine: {
    width: "90%",
    height: 1,
    backgroundColor: COLORS.primary,
    marginBottom: 5,
  },
  signatureText: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 9,
    textAlign: 'center',
    color: COLORS.primary,
  },
});

export default function VoucherPDF({ codeSale, customer, codePayment, phone, address, department, municipality, amount, paymentMethod }: Props) {
  return (
    <Document>
      <Page size={[200, 500]} style={styles.page}>
        <View style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10
        }}>
          <Text style={{ textAlign: "center", fontFamily: 'Roboto', fontWeight: 'bold', marginBottom: 5, fontSize: 14, textTransform: 'uppercase' }}>{import.meta.env.VITE_COMPANY_NAME}</Text>
          <Text style={{ textAlign: "center", fontFamily: 'Roboto', fontWeight: 'bold', marginBottom: 5, fontSize: 10 }}>{import.meta.env.VITE_COMPANY_ADDRESS}</Text>
          <Text style={{ textAlign: "center", fontFamily: 'Roboto', fontWeight: 'bold', marginBottom: 10, fontSize: 10 }}>Tel: {import.meta.env.VITE_COMPANY_PHONE}</Text>
          <View style={{ width: "100%", height: 1, backgroundColor: COLORS.primary, marginBottom: 20 }} />
        </View>

        <Text style={[styles.referenceText, { marginTop: 10 }]}>
          Fecha: {new Date().toLocaleDateString()}
        </Text>
        <Text style={styles.referenceText}>
          Venta Referencia: <Text>{codeSale}</Text>
        </Text>
        <Text style={styles.referenceText}>
          Referencia de Pago: <Text>{codePayment}</Text>
        </Text>

        <Text style={styles.customerInfoText}>
          Cliente: <Text>{customer}</Text>
        </Text>
        <Text style={styles.customerInfoText}>
          Tel: <Text>{phone}</Text>
        </Text>
        <Text style={styles.customerInfoText}>
          Dirección: <Text>{address}</Text>
        </Text>
        <Text style={styles.customerInfoText}>
          {department}, {municipality}
        </Text>

        <View style={styles.row}>
          <Text style={[styles.customerInfoText, { fontFamily: 'Roboto', fontWeight: 'bold', }]}>Pago recibido</Text>
          <Text style={[styles.customerInfoText, { fontFamily: 'Roboto', fontWeight: 'bold', }]}>{currencyFormatter(amount)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.customerInfoText, { fontFamily: 'Roboto', fontWeight: 'bold', }]}>Tipo de pago</Text>
          <Text style={[styles.customerInfoText, { fontFamily: 'Roboto', fontWeight: 'bold', }]}>{paymentMethod}</Text>
        </View>

        <View style={{ flexGrow: 1 }} />

        <View style={styles.signatureContainer}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>Firma</Text>
        </View>
      </Page>
    </Document>
  );
}
