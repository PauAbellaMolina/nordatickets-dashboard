import React from 'react';
import { ActivityIndicator } from './ActivityIndicator';
import { I18n } from 'i18n-js';

type TicketsSummaryTableStruct = {
  event_tickets_name: string;
  revenue: number;
  quantitySold: number;
  quantityUsed: number;
}[];

interface TicketsSummaryTableProps {
  ticketsSummaryTableData: TicketsSummaryTableStruct;
  waitingForTableData: boolean;
  i18n: I18n | null;
}

const TicketsSummaryTable: React.FC<TicketsSummaryTableProps> = ({ ticketsSummaryTableData, waitingForTableData, i18n }) => {
  return (
    <div className="tableContainer">
      {waitingForTableData ? 
        <div className="spinnerContainer">
          <ActivityIndicator />
        </div>
      : null}
      <table className="ticketsSummaryTable" style={{ opacity: waitingForTableData ? 0.5 : 1, pointerEvents: waitingForTableData ? 'none' : 'auto' }}>
        <tbody>
          <tr className="header-row">
            <td>{i18n?.t("ticketName")}</td>
            <td>{i18n?.t("quantitySold")}</td>
            <td>{i18n?.t("quantityUsed")}</td>
            <td>{i18n?.t("revenue")}</td>
          </tr>
          {ticketsSummaryTableData.map((ticket, index) => (
            <tr key={index}>
              <td>{ticket.event_tickets_name}</td>
              <td className="centerAligned">{ticket.quantitySold}</td>
              <td className="centerAligned">{ticket.quantityUsed}</td>
              <td className="rightAligned">{ticket.revenue / 100}€</td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} style={{ fontWeight: 'bold' }}  className="rightAligned">
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{i18n?.t("total")}:</span><br/>
              {ticketsSummaryTableData.reduce((acc, curr) => acc + curr.revenue, 0) / 100}€
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TicketsSummaryTable;