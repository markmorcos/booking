import { Handlers } from "$fresh/server.ts";
import { createSlotBatch } from "../../../../utils/supabase.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      const { slots } = body;

      if (!slots || !Array.isArray(slots) || slots.length === 0) {
        return new Response(
          JSON.stringify({ error: "No valid slots provided" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (slots.length > 100) {
        return new Response(
          JSON.stringify({
            error: "Cannot create more than 100 slots at once",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Validate each slot
      for (const slot of slots) {
        if (
          !slot.date ||
          !slot.start_time ||
          !slot.end_time ||
          !slot.duration
        ) {
          return new Response(
            JSON.stringify({
              error: "One or more slots are missing required fields",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      const createdSlots = await createSlotBatch(slots);

      return new Response(
        JSON.stringify({ success: true, data: createdSlots }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error creating slots:", error);
      return new Response(
        JSON.stringify({
          error: (error as Error).message || "Failed to create slots",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
