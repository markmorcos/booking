import { Handlers } from "$fresh/server.ts";
import { createAppointmentRequest } from "../../utils/supabase.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      const { slot_id, name, email } = body;

      if (!slot_id || !name || !email) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const appointmentRequest = await createAppointmentRequest({
        slot_id,
        name,
        email,
        status: "pending",
      });

      return new Response(
        JSON.stringify({ success: true, data: appointmentRequest }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error booking appointment:", error);
      return new Response(
        JSON.stringify({
          error: (error as Error).message || "Failed to book appointment",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
