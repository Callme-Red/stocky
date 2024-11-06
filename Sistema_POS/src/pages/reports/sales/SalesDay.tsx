import { useState } from "react";
import { SalesProps } from "../../../types/types";
import Container from "../../../layout/Container";
import PDFContainer from "../../../layout/PDFContainer";
import { getSalesByDates } from "../../../api/sales/sales";
import ModalDates from "../../../section/reports/ModalDates";
import SalesDay from "../../../components/reports/SalesPDF";

export default function SalesDayly() {
    const [isShowModal, setIsShowModal] = useState(true);
    const [sales, setSales] = useState<SalesProps[] | null>(null);
    const [datesMonth, setDatesMonth] = useState({
        startDate: '',
        endDate: ''
    });

    async function onApply(startDate: string, endDate: string, voucher: boolean, letterhead: boolean) {
        setDatesMonth({ startDate, endDate })
        const { data } = await getSalesByDates(startDate, endDate, voucher, letterhead);
        setSales(data);
    }

    return (
        <Container>
            <div className="h-full">
                {isShowModal && <ModalDates onClose={() => setIsShowModal(false)} onApply={onApply} />}
                {sales && (
                    <PDFContainer name="Reporte de ventas por clientes mensualmente">
                        <SalesDay
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
