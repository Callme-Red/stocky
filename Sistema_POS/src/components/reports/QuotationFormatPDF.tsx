import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { COLORS } from '../../constants/constants';
import { currencyFormatter } from '../../utils/function';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-500-normal.woff' }
  ]
})

interface Products {
  name: string;
  price: number;
  discount: number;
  quantity: number;
  subtotal: number;
  total: number;
}

interface Props {
  products: Products[],
  customer: string;
  department: string;
  municipality: string;
  quotationCode: string;
  address: string;
  date: Date;
  phone: string;
  subTotal: number;
  discount: number;
  deliveryCost: number;
  total: number;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: COLORS.primary
  },
  table: {
    width: 'auto',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    fontSize: 13,
    marginTop: 5,
    padding: 5,
  },
})

export default function QuotationFormatPDF({ products = [], customer, department, municipality, quotationCode, date, address, deliveryCost, discount, phone, subTotal, total }: Props) {
  return (
    <Document>
      <Page style={{ paddingVertical: 30 }} size="A4">
        <View style={{ paddingHorizontal: 60, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', backgroundColor: COLORS.whiting2, height: 50, width: "100%" }}>
          <Text style={{ fontSize: 20, textAlign: 'right', color: COLORS.primary, fontWeight: 'bold', fontFamily: 'Roboto' }}>COTIZACIÓN</Text>
        </View>

        <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginTop: 10, paddingHorizontal: 60, width: '100%' }}>
          <Image src={`./${import.meta.env.VITE_COMPANY_LOGO}`} style={{ width: 80, height: 80 }} />

          <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Text style={[styles.text, { textAlign: 'right' }]}>Referencia: </Text>
              <Text style={{ fontSize: 13, textAlign: 'right', color: COLORS.primary, fontWeight: 'bold', fontFamily: 'Roboto' }}> {quotationCode}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5 }}>
              <Text style={[styles.text, { textAlign: 'right' }]}>Fecha: </Text>
              <Text style={{ fontSize: 13, textAlign: 'right', color: COLORS.primary, fontWeight: 'bold', fontFamily: 'Roboto' }}> {new Date(date).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginHorizontal: 40, marginTop: 20 }}>
          <Text style={{ fontSize: 18, color: COLORS.primary, fontWeight: 'bold', fontFamily: 'Roboto', marginBottom: 15 }}>INFORMACIÓN DEL CLIENTE</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Text style={[styles.text, { width: 70, textAlign: 'left', fontWeight: 'bold', fontFamily: 'Roboto' }]}>Nombre:</Text>
            <Text style={{ fontSize: 13, color: COLORS.primary }}>
              {customer}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Text style={[styles.text, { width: 70, textAlign: 'left', fontWeight: 'bold', fontFamily: 'Roboto' }]}>Numero:</Text>
            <Text style={{ fontSize: 13, color: COLORS.primary }}>
              {phone}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Text style={[styles.text, { width: 70, textAlign: 'left', fontWeight: 'bold', fontFamily: 'Roboto' }]}>Dirección:</Text>
            <Text style={{ fontSize: 13, color: COLORS.primary }}>
              {address}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Text style={[styles.text, { width: 70, textAlign: 'left', fontWeight: 'bold', fontFamily: 'Roboto' }]}>Ubicación:</Text>
            <Text style={{ fontSize: 13, color: COLORS.primary }}>
              {department}, {municipality}
            </Text>
          </View>
        </View>

        <View style={{ marginHorizontal: 40, marginTop: 30 }}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={{ width: "10%", backgroundColor: COLORS.primary }}>
                <Text style={[styles.tableCell, { borderLeft: 0.5, borderColor: "#fff", color: "#fff", fontWeight: 'bold', fontFamily: 'Roboto' }]}>Cant.</Text>
              </View>
              <View style={{ width: "40%", backgroundColor: COLORS.primary }}>
                <Text style={[styles.tableCell, { borderLeft: 0.5, borderColor: "#fff", color: "#fff", fontWeight: 'bold', fontFamily: 'Roboto' }]}>Producto</Text>
              </View>
              <View style={{ width: "20%", backgroundColor: COLORS.primary }}>
                <Text style={[styles.tableCell, { borderLeft: 0.5, borderColor: "#fff", color: "#fff", textAlign: 'right', fontWeight: 'bold', fontFamily: 'Roboto' }]}>Precio</Text>
              </View>
              <View style={{ width: "20%", backgroundColor: COLORS.primary }}>
                <Text style={[styles.tableCell, { borderLeft: 0.5, borderColor: "#fff", color: "#fff", textAlign: 'right', fontWeight: 'bold', fontFamily: 'Roboto' }]}>Subtotal</Text>
              </View>
              <View style={{ width: "20%", backgroundColor: COLORS.primary }}>
                <Text style={[styles.tableCell, { borderLeft: 0.5, borderColor: "#fff", color: "#fff", textAlign: 'right', fontWeight: 'bold', fontFamily: 'Roboto' }]}>Descuento</Text>
              </View>
              <View style={{ width: "30%", backgroundColor: COLORS.primary }}>
                <Text style={[styles.tableCell, { borderLeft: 0.5, borderColor: "#fff", color: "#fff", textAlign: 'right', fontWeight: 'bold', fontFamily: 'Roboto' }]}>Total</Text>
              </View>
            </View>
          </View>

          {products.map(({ name, quantity, price, total, discount: discountProduct, subtotal: subTotalProduct }, index) => (
            <View key={index}>
              <View style={styles.tableRow}>
                <View style={{ width: "12%" }}>
                  <Text style={styles.tableCell}>{quantity}</Text>
                </View>
                <View style={{ width: "45% " }}>
                  <Text style={styles.tableCell}>{name}</Text>
                </View>
                <View style={{ width: "25%" }}>
                  <Text style={[styles.tableCell, { textAlign: 'right' }]}>{currencyFormatter(price)}</Text>
                </View>
                <View style={{ width: "25%" }}>
                  <Text style={[styles.tableCell, { textAlign: 'right' }]}>{currencyFormatter(subTotalProduct)}</Text>
                </View>
                <View style={{ width: "25%" }}>
                  <Text style={[styles.tableCell, { textAlign: 'right' }]}>{currencyFormatter(discountProduct)}</Text>
                </View>
                <View style={{ width: "35%" }}>
                  <Text style={[styles.tableCell, { textAlign: 'right' }]}>{currencyFormatter(total)}</Text>
                </View>
              </View>

              <View style={{ width: "100%", height: 1, backgroundColor: COLORS.primary, marginBottom: 5 }} />
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', marginHorizontal: 40, marginTop: 30, justifyContent: 'space-between' }}>
          <View style={{ width: "50%" }}>
            <Text style={{ fontSize: 15, color: COLORS.primary, fontWeight: 'bold', fontFamily: 'Roboto', marginBottom: 10 }}>CONTACTO</Text>

            <Text style={{ fontSize: 13, marginBottom: 5, color: COLORS.primary }}>{import.meta.env.VITE_COMPANY_ADDRESS}</Text>
            <Text style={{ fontSize: 13, marginBottom: 5, color: COLORS.primary }}>{import.meta.env.VITE_COMPANY_PHONE}</Text>
            <Text style={{ fontSize: 13, color: COLORS.primary }}>{import.meta.env.VITE_COMPANY_EMAIL}</Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Text style={[styles.text, { width: 90, textAlign: 'left' }]}>
                Subtotal
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.primary, marginLeft: 'auto', textAlign: 'right' }}>
                {currencyFormatter(subTotal)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Text style={[styles.text, { width: 90, textAlign: 'left' }]}>
                Descuento
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.primary, marginLeft: 'auto', textAlign: 'right' }}>
                {currencyFormatter(discount)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Text style={[styles.text, { width: 90, textAlign: 'left' }]}>
                Delivery
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.primary, marginLeft: 'auto', textAlign: 'right' }}>
                {currencyFormatter(deliveryCost)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', backgroundColor: COLORS.whiting2, paddingVertical: 5, paddingRight: 5, paddingLeft: 15, alignItems: 'center', marginTop: 10 }}>
              <Text style={[styles.text, { width: 90, fontSize: 15, textAlign: 'left', fontWeight: 'bold', fontFamily: 'Roboto' }]}>
                TOTAL
              </Text>
              <Text style={{ fontSize: 15, color: COLORS.primary, marginLeft: 'auto', textAlign: 'right', fontWeight: 'bold', fontFamily: 'Roboto' }}>
                {currencyFormatter(total)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document >
  );
}