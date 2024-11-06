import { useState } from "react";
import { SalesByMonth } from "../../../types/types";
import Container from "../../../layout/Container";
import PDFContainer from "../../../layout/PDFContainer";
import SalesMonthReport from "../SalesMonthReport";
import { getSalesByMonth } from "../../../api/sales/sales";
import ModalTypeSales from "../../../section/reports/ModalTypeSales";

export default function SalesMonth() {
    const [isShowModal, setIsShowModal] = useState(true);
    const [sales, setSales] = useState<SalesByMonth[] | null>(null);
    const [datesMonth, setDatesMonth] = useState({
        startDate: '',
        endDate: ''
    });

    async function onApply(year: number, month: number, voucher: boolean, letterhead: boolean) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        setDatesMonth({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() });
        const { data } = await getSalesByMonth(year, month, voucher, letterhead);
        setSales(data);
    }

    return (
        <Container>
            <div className="h-full">
                {isShowModal && <ModalTypeSales onClose={() => setIsShowModal(false)} onApply={onApply} visible />}
                {sales && (
                    <PDFContainer name="Reporte de ventas por clientes mensualmente">
                        <SalesMonthReport
                            sales={sales}
                            startDate={datesMonth.startDate}
                            endDate={datesMonth.endDate}
                        />
                    </PDFContainer>
                )}
            </div>
        </Container>
    );
}
