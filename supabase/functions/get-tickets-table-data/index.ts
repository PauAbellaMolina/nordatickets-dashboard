// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3"
import { Database } from "../_shared/types.ts";

type PaginationParams = {
  page: number;
  pageSize: number;
};

type TicketsTableStruct = {
  user_fullname: string;
  user_email: string;
  tickets: {
    id: number;
    event_tickets_name: string;
    price: number;
    used_at: string;
    ticket_form_submit: string[]
  }[];
}[];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { eventId, page = 1, pageSize = 10 }: { eventId: number } & PaginationParams = await req.json();
    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: wallet_tickets_ids, error: wallet_tickets_ids_error, count } = await supabase
      .from('wallet_tickets')
      .select('id, order_id', { count: 'exact' })
      .eq('event_id', eventId)
      .order('id', { ascending: false });
    if (wallet_tickets_ids_error) {
      throw new Error(wallet_tickets_ids_error.message);
    }

    const { data: orders, error: ordersError } = await supabase
      .from('redsys_orders')
      .select('order_id')
      .eq('event_id', eventId)
      .eq('order_status', 'PAYMENT_SUCCEEDED');
    if (ordersError) {
      throw new Error(ordersError.message);
    }

    const validOrderIds = new Set([...orders.map(order => order.order_id), 'free']);
    const filteredWalletTicketsIds = wallet_tickets_ids
      .filter(ticket => validOrderIds.has(ticket.order_id))
      .map(ticket => ticket.id);

    const filteredInvalidWalletTicketsIdsCount = wallet_tickets_ids.filter(ticket => !validOrderIds.has(ticket.order_id)).length;

    const { data: wallet_tickets, error } = await supabase
      .from('wallet_tickets')
      .select('id, user_id, event_tickets_name, price, ticket_form_submits_id, used_at', { count: 'exact' })
      .eq('event_id', eventId)
      .in('id', filteredWalletTicketsIds)
      .order('id', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (error) {
      throw new Error(error.message);
    }

    const { data: formSubmits, error: formSubmitsError } = await supabase
      .from('ticket_form_submits')
      .select('id, entries')
      .in('id', wallet_tickets.map(ticket => ticket.ticket_form_submits_id).filter(Boolean));
    if (formSubmitsError) {
      throw new Error(formSubmitsError.message);
    }
    
    const userIds = [...new Set(wallet_tickets.map(ticket => ticket.user_id))];
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, fullname')
      .in('id', userIds);
    if (userError) {
      throw new Error(userError.message);
    }
    
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers({
      perPage: 10000,
      page: 1
    })
    if (authUsersError) {
      throw new Error(authUsersError.message);
    }

    const userMap = new Map(users.map(user => [user.id, user.fullname]));
    const userEmailMap = new Map(authUsers.users.map(user => [user.id, user.email]));
    const formSubmitsMap = new Map(formSubmits.map(submit => [submit.id, submit.entries]));

    const ticketsTableStruct: TicketsTableStruct = [];
    const userIndexMap = new Map<string, number>();

    for (const ticket of wallet_tickets) {
      const userId = ticket.user_id ?? '';
      let userIndex = userIndexMap.get(userId);

      if (userIndex === undefined) {
        userIndex = ticketsTableStruct.length;
        userIndexMap.set(userId, userIndex);
        ticketsTableStruct.push({
          user_fullname: userMap.get(userId) || 'Unknown',
          user_email: userEmailMap.get(userId) || 'Unknown',
          tickets: []
        });
      }

      ticketsTableStruct[userIndex].tickets.push({
        id: ticket.id,
        event_tickets_name: ticket.event_tickets_name ?? '',
        price: ticket.price ?? 0,
        used_at: ticket.used_at ?? '',
        ticket_form_submit: ticket.ticket_form_submits_id ? formSubmitsMap.get(ticket.ticket_form_submits_id) ?? [] : []
      });
    }

    return new Response(JSON.stringify({ 
      tickets: ticketsTableStruct, 
      totalCount: count ? count - filteredInvalidWalletTicketsIdsCount : filteredInvalidWalletTicketsIdsCount,
      currentPage: page,
      totalPages: Math.ceil((count ? count - filteredInvalidWalletTicketsIdsCount : filteredInvalidWalletTicketsIdsCount) / pageSize)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify(error.message), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-tickets-table-data' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
