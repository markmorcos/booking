import { Handlers } from "$fresh/server.ts";
import { updateAppointmentStatus } from "../../../../utils/supabase.ts";

export const handler: Handlers = {
  async PATCH(req, ctx) {
    try {
      const id = parseInt(ctx.params.id);
      const body = await req.json();
      const { status } = body;

      if (!status || !["confirmed", "rejected"].includes(status)) {
        return new Response(JSON.stringify({ error: "Invalid status" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const updatedAppointment = await updateAppointmentStatus(id, status);

      return new Response(
        JSON.stringify({ success: true, data: updatedAppointment }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error updating appointment:", error);
      return new Response(
        JSON.stringify({
          error: (error as Error).message || "Failed to update appointment",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
