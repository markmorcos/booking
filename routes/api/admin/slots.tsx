import { Handlers } from "$fresh/server.ts";
import { createSlotBatch } from "../../../utils/supabase.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      const { date, start_time, end_time, duration, is_booked } = body;

      if (!date || !start_time || !end_time || !duration) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const slots = await createSlotBatch([
        {
          date,
          start_time,
          end_time,
          duration,
          is_booked: is_booked || false,
        },
      ]);

      return new Response(JSON.stringify({ success: true, data: slots[0] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error creating slot:", error);
      return new Response(
        JSON.stringify({
          error: (error as Error).message || "Failed to create slot",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
