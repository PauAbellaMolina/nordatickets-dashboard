// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3"
import { Database } from "../_shared/types.ts";

type TicketsSummary = {
  event_tickets_name: string;
  revenue: number;
  quantitySold: number;
  quantityUsed: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { eventId }: { eventId: number } = await req.json()

    const { data: wallet_tickets, error } = await supabase.from('wallet_tickets').select('event_tickets_name, price, order_id, used_at').eq('event_id', eventId);
    if (error) {
      throw new Error(error.message);
    }

    const { data: orders, error: ordersError } = await supabase.from('redsys_orders').select('order_id').eq('event_id', eventId).eq('order_status', 'PAYMENT_SUCCEEDED');
    if (ordersError) {
      throw new Error(ordersError.message);
    }
    const filteredWalletTickets = wallet_tickets?.filter(ticket => orders.some(order => order.order_id === ticket.order_id) || ticket.order_id === 'free');

    const ticketsSummary = filteredWalletTickets.reduce<Record<string, TicketsSummary>>((acc, ticket) => {
      const { event_tickets_name, used_at } = ticket;
      const key = event_tickets_name ?? 'Unknown';
      if (!acc[key]) {
        acc[key] = {
          event_tickets_name: key,
          revenue: 0,
          quantitySold: 0,
          quantityUsed: 0
        };
      }
      acc[key].revenue += ticket.price ?? 0;
      acc[key].quantitySold += 1;
      if (used_at) {
        acc[key].quantityUsed += 1;
      }
      return acc;
    }, {});

    return new Response(
      JSON.stringify(Object.values(ticketsSummary)),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-tickets-summary-table-data' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
