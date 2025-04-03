import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, storage: localStorage },
});

// Types for our database tables
export interface AvailabilitySlot {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  is_booked: boolean;
}

export interface AppointmentRequest {
  id?: number;
  slot_id: number;
  name: string;
  email: string;
  status: "pending" | "confirmed" | "rejected";
  created_at?: string;
}

export async function getAllAppointments() {
  const { data, error } = await supabase
    .from("appointment_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Helper functions for slots
export async function getAvailableSlots() {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("is_booked", false)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAllSlots() {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getSlotById(id: number) {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getSlotsByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createSlotBatch(slots: Omit<AvailabilitySlot, "id">[]) {
  const { data, error } = await supabase
    .from("availability_slots")
    .insert(slots)
    .select();

  if (error) throw error;
  return data;
}

export async function updateSlot(
  id: number,
  updates: Partial<AvailabilitySlot>
) {
  const { data, error } = await supabase
    .from("availability_slots")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

// Helper functions for appointment requests
export async function createAppointmentRequest(
  request: Omit<AppointmentRequest, "id" | "created_at">
) {
  // Start a transaction to handle race conditions
  const { data: slot, error: slotError } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("id", request.slot_id)
    .eq("is_booked", false)
    .single();

  if (slotError) throw slotError;
  if (!slot) throw new Error("Slot is not available");

  // Update the slot as booked
  const { error: updateError } = await supabase
    .from("availability_slots")
    .update({ is_booked: true })
    .eq("id", request.slot_id)
    .eq("is_booked", false); // Optimistic concurrency control

  if (updateError) throw updateError;

  // Create the appointment request
  const { data, error } = await supabase
    .from("appointment_requests")
    .insert([request])
    .select();

  if (error) {
    // Rollback the slot booking if appointment creation fails
    await supabase
      .from("availability_slots")
      .update({ is_booked: false })
      .eq("id", request.slot_id);

    throw error;
  }

  return data[0];
}

export async function getAppointmentRequests(): Promise<
  Array<AppointmentRequest & { availability_slots: AvailabilitySlot }>
> {
  const { data, error } = await supabase
    .from("appointment_requests")
    .select(
      `
      *,
      availability_slots (*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateAppointmentStatus(
  id: number,
  status: "confirmed" | "rejected"
) {
  const { data, error } = await supabase
    .from("appointment_requests")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) throw error;

  // If rejected, make the slot available again
  if (status === "rejected") {
    const request = data[0];
    await supabase
      .from("availability_slots")
      .update({ is_booked: false })
      .eq("id", request.slot_id);
  }

  return data[0];
}

// Authentication functions
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}
