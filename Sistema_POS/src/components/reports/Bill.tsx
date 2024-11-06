import { Document, Text, Page, View, StyleSheet, Font } from "@react-pdf/renderer";
import { COLORS } from "../../constants/constants";
import { currencyFormatter } from "../../utils/function";

interface Products {
  name: string;
  price: number;
  discount: number;
  quantity: number;
  subtotal: number;
  total: number;
}

interface Props {
  saleCode: string;
  customer: string;
  direction: string;
  department: string;
  municipality: string;
  product: Products[],
  subTotal: number;
  deliveryCost: number;
  discount: number;
  total: number;
  date?: Date;
  userName: string;
}

const styles = StyleSheet.create({
  table: {
    width: 'auto',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    fontSize: 7,
    marginTop: 5,
    padding: 5,
  },
});

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-500-normal.woff' }
  ]
})

export default function Bill({ saleCode, product, userName, deliveryCost, discount, total, customer, department, direction, subTotal, municipality, date = new Date() }: Props) {
  return (
    <Document>
      <Page size={[195, 10000]} style={{ paddingVertical: 10, paddingHorizontal: 5 }}>
        <View style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10
        }}>
        </View>
        <Text style={{ textAlign: "center", fontFamily: 'Roboto', fontWeight: 'bold', marginBottom: 5, fontSize: 14, textTransform: 'uppercase' }}>{import.meta.env.VITE_COMPANY_NAME}</Text>
        <Text style={{ textAlign: "center", fontFamily: 'Roboto', fontWeight: 'bold', marginBottom: 5, fontSize: 10 }}>{import.meta.env.VITE_COMPANY_ADDRESS}</Text>
        <Text style={{ textAlign: "center", fontFamily: 'Roboto', fontWeight: 'bold', marginBottom: 10, fontSize: 10 }}>Tel: {import.meta.env.VITE_COMPANY_PHONE}</Text>
        <View style={{ width: "100%", height: 1, backgroundColor: COLORS.primary, marginBottom: 20 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>Fecha</Text>
          <Text style={{ fontSize: 8, color: COLORS.primary }}>{new Date(date).toLocaleDateString()}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>Nº Venta</Text>
          <Text style={{ fontSize: 8, color: COLORS.primary }}>{saleCode}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>Vendedor</Text>
          <Text style={{ fontSize: 8, color: COLORS.primary }}>{userName}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>Cliente</Text>
          <Text style={{ fontSize: 8, color: COLORS.primary }}>{customer}</Text>
        </View>

        {deliveryCost !== 0 &&
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>Ubicación</Text>
              <Text style={{ fontSize: 8, color: COLORS.primary }}>{department}, {municipality}</Text>
            </View>

            <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 }}>Direccion: <Text style={{ fontSize: 8, fontWeight: 'thin', color: COLORS.primary }}>{direction}</Text></Text>
          </>
        }

        <View style={{ width: "100%", height: 1, backgroundColor: COLORS.primary }} />

        {product.map(({ name, price, quantity, total }, index) => (
          <View key={index}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Text style={{ fontSize: 8, color: COLORS.primary, fontWeight: 'bold', fontFamily: 'Roboto' }}>#{(index + 1)}: </Text>
              <Text style={{ fontSize: 8, color: COLORS.primary, marginLeft: 5 }}>{name}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 8, color: COLORS.primary, fontWeight: 'bold', fontFamily: 'Roboto' }}>{quantity}</Text>
                <Text style={{ fontSize: 8, color: COLORS.primary }}> x {currencyFormatter(price)}</Text>
              </View>
              <Text style={{ fontSize: 8, color: COLORS.primary, marginLeft: 2 }}>{currencyFormatter(total)}</Text>
            </View>
          </View>
        ))}

        <View style={{ width: "100%", height: 1, backgroundColor: COLORS.primary }} />
        <View>
          <Text style={styles.tableCell}>Articulos: <Text>{product.length}</Text></Text>
        </View>

        <View style={{ width: "100%", height: 1, backgroundColor: COLORS.primary, marginBottom: 5 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 5 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>Subtotal</Text>
          <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>{currencyFormatter(subTotal)}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>Descuento</Text>
          <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>{currencyFormatter(discount)}</Text>
        </View>
        {deliveryCost !== 0 &&
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>Delivery</Text>
            <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary }}>{currencyFormatter(deliveryCost)}</Text>
          </View>
        }

        <Text style={{ fontSize: 9, fontFamily: 'Roboto', fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' }}>Gran Total: <Text>{currencyFormatter(total)}</Text></Text>
      </Page>
    </Document >
  );
}