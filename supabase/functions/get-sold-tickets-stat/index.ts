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
    soldData = wallet_tickets?.filter(ticket => orders.some(order => order.order_id === ticket.order_id) || ticket.order_id === 'free');
    statsCounts = statsCounts.map(stat => stat.key === 'sold' ? { ...stat, data: soldData.length ?? [] } : stat);

    const { count, error: usersFollowingEventCountError } = await supabase.from('users').select('*', { count: 'estimated', head: true }).contains('event_ids_following', [eventId]);
    if (usersFollowingEventCountError) {
      throw new Error(usersFollowingEventCountError.message);
    }
    statsCounts = statsCounts.map(stat => stat.key === 'following' ? { ...stat, data: count ?? 0 } : stat);

    graphStats = soldData.length || usedData.length ? getGraphStats(usedData, soldData) : [];

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
  const startDate = new Date(Math.min(...soldData.map(ticket => new Date(ticket.created_at ?? '').getTime())));
  const endDate = new Date();

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffHours = diffTime / (1000 * 60 * 60);
  
  const timeFrame = determineTimeFrame(diffHours);

  const soldStats = groupByTimeFrameWithCumulative(soldData, 'created_at', timeFrame);
  const usedStats = groupByTimeFrameWithCumulative(usedData, 'used_at', timeFrame);

  const combinedStats: { name: string, formattedName: string, sold: number, used: number }[] = [];
  let prevDate: Date | undefined;

  const allDates = [...new Set([...Object.keys(soldStats), ...Object.keys(usedStats)])].sort();

  for (const currentDate = new Date(startDate); currentDate <= endDate; currentDate.setMinutes(currentDate.getMinutes() + timeFrame)) {
    const dateKey = new Date(currentDate);
    dateKey.setMinutes(Math.floor(dateKey.getMinutes() / timeFrame) * timeFrame);
    dateKey.setSeconds(0);
    dateKey.setMilliseconds(0);
    
    // If this is the last iteration and doesn't match the current time, break the loop
    if (currentDate > endDate && dateKey.getTime() !== endDate.getTime()) {
      break;
    }
    
    // Use the actual endDate for the last point
    const isLastPoint = currentDate >= endDate;
    const dateKeyString = isLastPoint ? endDate.toISOString() : dateKey.toISOString();
    const dateKeyStringFormatted = formatDate(isLastPoint ? endDate : dateKey, prevDate);
    prevDate = isLastPoint ? endDate : dateKey;

    const closestIndex = binarySearch(allDates, dateKeyString);
    const closestDate = allDates[closestIndex] || dateKeyString;

    const totalSold = soldStats[closestDate]?.cumulative || 0;
    const totalUsed = usedStats[closestDate]?.cumulative || 0;

    combinedStats.push({
      name: dateKeyString,
      formattedName: dateKeyStringFormatted,
      sold: totalSold,
      used: totalUsed
    });

    // If we've just added the last point (current time), break the loop
    if (isLastPoint) {
      break;
    }
  }

  // If the last point is not the current time, add it
  if (combinedStats[combinedStats.length - 1].name !== endDate.toISOString()) {
    const lastClosestIndex = binarySearch(allDates, endDate.toISOString());
    const lastClosestDate = allDates[lastClosestIndex] || endDate.toISOString();

    const lastTotalSold = soldStats[lastClosestDate]?.cumulative || combinedStats[combinedStats.length - 1].sold;
    const lastTotalUsed = usedStats[lastClosestDate]?.cumulative || combinedStats[combinedStats.length - 1].used;

    combinedStats.push({
      name: endDate.toISOString(),
      formattedName: formatDate(endDate, new Date(combinedStats[combinedStats.length - 1].name)),
      sold: lastTotalSold,
      used: lastTotalUsed
    });
  }

  return combinedStats;
};

const groupByTimeFrameWithCumulative = (walletTickets: Partial<WalletTicket>[], key: 'created_at' | 'used_at', timeFrame: number) => {
  const stats: Record<string, { count: number, cumulative: number }> = {};
  let cumulative = 0;

  walletTickets.sort((a, b) => new Date(a[key] ?? '').getTime() - new Date(b[key] ?? '').getTime())
    .forEach(ticket => {
      const date = new Date(ticket[key] ?? '');
      date.setMinutes(Math.floor(date.getMinutes() / timeFrame) * timeFrame);
      date.setSeconds(0);
      date.setMilliseconds(0);
      const dateKey = date.toISOString();
      
      if (!stats[dateKey]) {
        stats[dateKey] = { count: 0, cumulative: 0 };
      }
      stats[dateKey].count++;
      cumulative++;
      stats[dateKey].cumulative = cumulative;
    });

  return stats;
};

const binarySearch = (arr: string[], target: string): number => {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return left - 1; // Return the index of the closest smaller or equal element
};

const determineTimeFrame = (diffHours: number): number => {
  if (diffHours < 0.5) return 1; // 1 minute
  if (diffHours < 1) return 5; // 5 minutes
  if (diffHours < 3) return 15; // 15 minutes
  if (diffHours < 10) return 30; // 30 minutes
  if (diffHours < 72) return 60; // 1 hour
  if (diffHours < 168) return 300; // 5 hours
  if (diffHours < 720) return 1440; // 1 day
  return 10080; // 1 week
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
