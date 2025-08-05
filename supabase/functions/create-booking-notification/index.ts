
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const { record, old_record, type } = await req.json()
    
    console.log('Booking notification trigger called:', { type, booking_id: record?.id })
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get garage owner information
    const { data: garage, error: garageError } = await supabase
      .from('garages')
      .select('owner_id, name')
      .eq('id', record.garage_id)
      .single()
    
    if (garageError || !garage) {
      console.error('Error fetching garage:', garageError)
      return new Response(JSON.stringify({ error: 'Garage not found' }), { status: 404 })
    }
    
    let notificationData: any = {
      user_id: garage.owner_id,
      type: 'booking',
      data: {
        booking_id: record.id,
        garage_id: record.garage_id,
        customer_name: record.customer_name,
        service_names: record.service_names,
        booking_date: record.booking_date,
        booking_time: record.booking_time,
        total_amount: record.total_amount
      }
    }
    
    // Different notifications based on the action
    if (type === 'INSERT') {
      notificationData.title = '🚗 New Booking Received!'
      notificationData.message = `New booking from ${record.customer_name || 'Customer'} for ${record.service_names || 'services'} on ${record.booking_date} at ${record.booking_time}${record.total_amount ? ` - $${record.total_amount}` : ''}`
    } else if (type === 'UPDATE') {
      // Only notify on status changes
      if (old_record.status !== record.status) {
        notificationData.title = '📋 Booking Status Updated'
        notificationData.message = `Booking #${record.id.slice(0, 8)} status changed to ${record.status.toUpperCase()}`
      } else {
        // Skip notification for other updates
        return new Response(JSON.stringify({ success: true, skipped: true }), { status: 200 })
      }
    }
    
    // Create the notification
    const { error } = await supabase
      .from('notifications')
      .insert(notificationData)
    
    if (error) {
      console.error('Error creating notification:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
    
    console.log('Notification created successfully for booking:', record.id)
    
    return new Response(
      JSON.stringify({ success: true, notification_created: true }),
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
