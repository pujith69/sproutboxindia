import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const profile = await getCurrentProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('order_id')
    const status = searchParams.get('status')

    let query = supabase.from('invoices').select(`
      *,
      orders!inner (
        id,
        restaurant_id,
        items,
        total_trays,
        status,
        delivery_date
      ),
      restaurant:profiles!invoices_restaurant_id_fkey (
        id,
        full_name,
        email
      ),
      grower:profiles!invoices_grower_id_fkey (
        id,
        full_name,
        email
      )
    `)

    // Filter based on role
    if (profile.role === 'restaurant') {
      query = query.eq('restaurant_id', profile.id)
    } else if (profile.role === 'grower') {
      // Growers can see invoices for orders they contributed to
      query = query.eq('grower_id', profile.id)
    }
    // Admins can see all

    if (orderId) {
      query = query.eq('order_id', orderId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data: invoices, error } = await query

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Error in GET /api/invoices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const supabase = await createClient()
    const body = await request.json()

    const {
      order_id,
      grower_id,
      subtotal,
      tax_amount = 0,
      due_date,
      notes,
    } = body

    if (!order_id || !due_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, restaurant_id, items, total_trays, status')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const totalAmount = (subtotal || 0) + (tax_amount || 0)

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        order_id,
        restaurant_id: order.restaurant_id,
        grower_id,
        invoice_number: invoiceNumber,
        status: 'draft',
        subtotal: subtotal || 0,
        tax_amount: tax_amount || 0,
        total_amount: totalAmount,
        currency: 'INR',
        due_date,
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating invoice:', error)
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
    }

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/invoices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}