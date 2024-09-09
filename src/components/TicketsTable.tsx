import React from 'react';
import { ActivityIndicator } from './ActivityIndicator';
import { I18n } from 'i18n-js';

type TicketsTableStruct = {
  user_fullname: string;
  user_email: string;
  tickets: {
    id: number;
    event_tickets_name: string;
    price: number;
    used_at: string;
    ticket_form_submit: string[];
  }[];
}[];

interface TicketsTableProps {
  ticketsTableData: TicketsTableStruct;
  waitingForTableData: boolean;
  i18n: I18n | null;
  handleFormSubmitClick: (formSubmit: string[]) => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (newPage: number) => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({
  ticketsTableData,
  waitingForTableData,
  i18n,
  handleFormSubmitClick,
  currentPage,
  totalPages,
  handlePageChange
}) => {
  return (
    <>
      <div className="tableContainer">
        {waitingForTableData ? 
          <div className="spinnerContainer">
            <ActivityIndicator />
          </div>
        : null}
        {ticketsTableData.map((userData, userIndex) => (
          <table key={`user-${userIndex}`} className="ticketsTable" style={{ opacity: waitingForTableData ? 0.5 : 1, pointerEvents: waitingForTableData ? 'none' : 'auto' }}>
            <tbody>
              <tr className="user-row">
                <td colSpan={5}>{userData.user_fullname} · {userData.user_email}</td>
              </tr>
              <tr className="header-row">
                <td className="small-row">{i18n?.t("id")}</td>
                <td>{i18n?.t("ticketName")}</td>
                <td>{i18n?.t("price")}</td>
                <td>{i18n?.t("deactivatedAt")}</td>
                <td>{i18n?.t("formSubmissions")}</td>
              </tr>
              {userData.tickets.map((ticket, ticketIndex) => (
                <tr key={`${userIndex}-${ticketIndex}`}>
                  <td className="small-row">{ticket.id}</td>
                  <td>{ticket.event_tickets_name}</td>
                  <td>{ticket.price / 100}€</td>
                  <td>{ticket.used_at ? new Date(ticket.used_at).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(',', '') : '-'}</td>
                  <td 
                    onClick={() => ticket.ticket_form_submit.length ? handleFormSubmitClick(ticket.ticket_form_submit) : null}
                    style={{ cursor: 'pointer' }}
                  >
                    {ticket.ticket_form_submit.length ? i18n?.t("clickToSee") : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button className="previousNextButton" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            {i18n?.t("previous")}
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
          <button className="previousNextButton" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            {i18n?.t("next")}
          </button>
        </div>
      )}
    </>
  );
};

export default TicketsTable;