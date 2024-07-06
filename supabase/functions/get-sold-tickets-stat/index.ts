// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { WalletTicket } from "../_shared/typesplain.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3"
import { Database } from "../_shared/types.ts";

type StatsCounts = {
  key: string;
  subtitle: string;
  data: number | null;
}[];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { eventId }: { eventId: number } = await req.json();
    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let usedData: Partial<WalletTicket>[] = [];
    let soldData: Partial<WalletTicket>[] = [];
    let statsCounts: StatsCounts = ([
      { key: 'sold', subtitle: 'ticketsSold', data: null },
      { key: 'used', subtitle: 'ticketsUsed', data: null },
      { key: 'following', subtitle: 'usersFollowingEvent', data: null },
    ]);

    let graphStats: { name: string, sold: number, used: number }[] = [];

    const { data: wallet_tickets, error } = await supabase.from('wallet_tickets').select('order_id, used_at, created_at').eq('event_id', eventId);
    if (error) {
      throw new Error(error.message);
    }
    usedData = wallet_tickets?.filter(ticket => ticket.used_at !== null);
    statsCounts = statsCounts.map(stat => stat.key === 'used' ? { ...stat, data: usedData.length ?? [] } : stat);

    const { data: orders, error: ordersError } = await supabase.from('redsys_orders').select('order_id').eq('event_id', eventId).eq('order_status', 'PAYMENT_SUCCEEDED');
    if (ordersError) {
      throw new Error(ordersError.message);
    }
    soldData = wallet_tickets?.filter(ticket => orders.some(order => order.order_id === ticket.order_id));
    statsCounts = statsCounts.map(stat => stat.key === 'sold' ? { ...stat, data: soldData.length ?? [] } : stat);

    const { count, error: usersFollowingEventCountError } = await supabase.from('users').select('*', { count: 'estimated', head: true }).contains('event_ids_following', [eventId]);
    if (usersFollowingEventCountError) {
      throw new Error(usersFollowingEventCountError.message);
    }
    statsCounts = statsCounts.map(stat => stat.key === 'following' ? { ...stat, data: count ?? 0 } : stat);

    graphStats = getGraphStats(usedData, soldData);

    return new Response(JSON.stringify([statsCounts, graphStats]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify(error.message), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});


const getGraphStats = (usedData: Partial<WalletTicket>[], soldData: Partial<WalletTicket>[]) => {
  const startDate = new Date(Math.min(...(Array.isArray(soldData) ? soldData : [])?.map(ticket => new Date(ticket.created_at ?? '').getTime()) ?? []));
  const endDate = new Date();

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffHours = diffTime / (1000 * 60 * 60); // convert difference to hours
  
  let timeFrame;
  if (diffHours < 0.5) {
    timeFrame = 1; // 5 minutes
  } else if (diffHours < 1) {
    timeFrame = 5; // 5 minutes
  } else if (diffHours < 3) {
    timeFrame = 15; // 15 minutes
  } else if (diffHours < 10) {
    timeFrame = 30; // 30 minutes
  } else if (diffHours < 72) {
    timeFrame = 60; // 1 hour
  } else if (diffHours < 168) {
    timeFrame = 300; // 5 hours
  } else if (diffHours < 720) {
    timeFrame = 1440; // 1 day
  } else {
    timeFrame = 10080; // 1 week
  }

  const soldStats = groupByTimeFrame(soldData, 'created_at', timeFrame);
  const usedStats = groupByTimeFrame(usedData, 'used_at', timeFrame);

  const combinedStats = [];
  let totalSold = 0;
  let totalUsed = 0;
  let prevDate: Date | undefined;

  for (const date = startDate; date <= endDate; date.setMinutes(date.getMinutes() + timeFrame)) {
    const dateKey = new Date(date);
    dateKey.setMinutes(Math.floor(date.getMinutes() / timeFrame) * timeFrame);
    dateKey.setSeconds(0);
    dateKey.setMilliseconds(0);
    const dateKeyString = dateKey.toISOString();
    const dateKeyStringFormatted = formatDate(dateKey, prevDate);
    prevDate = dateKey;

    const sold = soldStats[dateKeyString] || 0;
    totalSold += sold;

    const used = usedStats[dateKeyString] || 0;
    totalUsed += used;

    combinedStats.push({
      name: dateKeyString,
      formattedName: dateKeyStringFormatted,
      sold: totalSold,
      used: totalUsed
    });
  }

  return combinedStats;
};

const groupByTimeFrame = (walletTickets: Partial<WalletTicket>[], key: 'created_at' | 'used_at', timeFrame: number) => {
  return walletTickets.reduce((acc, ticket) => {
    const date = new Date(ticket[key] ?? '');
    date.setMinutes(Math.floor(date.getMinutes() / timeFrame) * timeFrame);
    date.setSeconds(0);
    date.setMilliseconds(0);
    const dateKey = date.toISOString();
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

const formatDate = (date: Date, prevDate?: Date) => {
  let options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid'
  };
  if (!prevDate || prevDate.getDate() !== date.getDate() || prevDate.getMonth() !== date.getMonth()) {
    options = {
      ...options,
      day: '2-digit',
      month: '2-digit'
    };
  }
  //Code to show year in the date
  // if (!prevDate || prevDate.getFullYear() !== date.getFullYear()) {
  //   options = {
  //     ...options,
  //     year: 'numeric'
  //   };
  // }
  return new Intl.DateTimeFormat('es-ES', options).format(date);
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-sold-tickets-stat' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
