
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { booking } = await req.json()
    
    // This will be called by the database trigger
    console.log('Creating notification for booking:', booking.id)
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in create-booking-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})
