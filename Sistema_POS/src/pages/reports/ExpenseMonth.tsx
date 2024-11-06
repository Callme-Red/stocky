
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ExpensesMonthProps } from '../../types/types';
import { COLORS } from '../../constants/constants';
import { currencyFormatter } from '../../utils/function';

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

const ExpenseMonth = ({ data, startDate, endDate }: { data?: ExpensesMonthProps, startDate: string; endDate: string; }) => {
  return (
    <Document style={{ backgroundColor: 'red' }}>
      <Page size="A4" style={styles.page}>
        <Text style={[styles.title, { color: '#1E90FF' }]}>{import.meta.env.VITE_COMPANY_NAME}</Text>
        <Text style={styles.title}>Reporte de gastos mensuales</Text>
        <Text style={[styles.title, { marginBottom: 20 }]}>Del {startDate} al {endDate}</Text>
        {data.categories.map(({ category, expenses, total }, index) => (
          <View key={index} style={styles.expenseContainer}>
            <Text style={styles.category}>{category}</Text>
            {expenses.map(({ amount, name }, subIndex) => (
              <View key={subIndex} style={styles.expenseItem}>
                <Text style={styles.expenseDescription}>{name}</Text>
                <Text style={styles.expenseAmount}>{currencyFormatter(amount)}</Text>
              </View>
            ))}
            <View style={{ alignSelf: 'flex-end', width: 100, height: 1, backgroundColor: "#000" }} />
            <View style={styles.expenseItem}>
              <Text style={styles.expenseDescription}>Total gastos de {category}</Text>
              <Text style={styles.expenseAmount}>{currencyFormatter(total)}</Text>
            </View>
          </View>
        ))}

        <View style={styles.expenseItem}>
          <Text style={[styles.expenseDescription, { marginLeft: 0 }]}>Total de gastos</Text>
          <Text style={styles.expenseAmount}>{currencyFormatter(data.total_global)}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ExpenseMonth;
