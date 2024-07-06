import type { Database } from './supabase';

export type Event = Database['public']['Tables']['events']['Row'];
export type WalletTicket = Database['public']['Tables']['wallet_tickets']['Row'];
export type EventTicket = Database['public']['Tables']['event_tickets']['Row'];
export type RedsysOrder = Database['public']['Tables']['redsys_orders']['Row'];
