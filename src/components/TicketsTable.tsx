import React from 'react';
import { ActivityIndicator } from './ActivityIndicator';
import { I18n } from 'i18n-js';
import EyeIcon from '../assets/eye.svg';
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
                <td colSpan={4}>
                  {userData.user_fullname}
                  <br/>
                  {userData.user_email}
                </td>
              </tr>
              <tr className="header-row">
                <td className="small-row">{i18n?.t("id")}</td>
                <td>{i18n?.t("ticketName")}</td>
                <td>{i18n?.t("price")}</td>
                <td>{i18n?.t("deactivatedAt")}</td>
              </tr>
              {userData.tickets.map((ticket, ticketIndex) => (
                <tr key={`${userIndex}-${ticketIndex}`}>
                  <td className="small-row centerAligned">{ticket.id}</td>
                  <td>{ticket.event_tickets_name}</td>
                  <td className="rightAligned">{ticket.price / 100}€</td>
                  <td className="centerAligned">{ticket.used_at ? new Date(ticket.used_at).getFullYear() === 1970 ? i18n?.t("expired") : new Date(ticket.used_at).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit' }).split(' ').reverse().join(' ').replace(/,$/, '') : '-'}</td>
                  { ticket.ticket_form_submit.length ?
                    <td onClick={() => handleFormSubmitClick(ticket.ticket_form_submit)} style={{ cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <img src={EyeIcon} alt="eye icon" className="eyeIcon small" />
                      {i18n?.t("formSubmissions")}
                    </td>
                  : null }
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