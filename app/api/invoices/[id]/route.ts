import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentProfile()
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { id } = await params

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
    `).eq('id', id)

    // Filter based on role
    if (profile.role === 'restaurant') {
      query = query.eq('restaurant_id', profile.id)
    } else if (profile.role === 'grower') {
      query = query.eq('grower_id', profile.id)
    }

    const { data: invoice, error } = await query.single()

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error in GET /api/invoices/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    const {
      status,
      subtotal,
      tax_amount,
      due_date,
      notes,
      paid_at,
    } = body

    const updates: Record<string, any> = {}

    if (status !== undefined) updates.status = status
    if (subtotal !== undefined) updates.subtotal = subtotal
    if (tax_amount !== undefined) updates.tax_amount = tax_amount
    if (due_date !== undefined) updates.due_date = due_date
    if (notes !== undefined) updates.notes = notes
    if (paid_at !== undefined) updates.paid_at = paid_at

    // If status changed to paid, set paid_at
    if (status === 'paid' && !paid_at) {
      updates.paid_at = new Date().toISOString()
    }

    // Recalculate total if subtotal or tax changed
    if (subtotal !== undefined || tax_amount !== undefined) {
      const { data: current } = await supabase
        .from('invoices')
        .select('subtotal, tax_amount')
        .eq('id', id)
        .single()

      const newSubtotal = subtotal ?? current?.subtotal ?? 0
      const newTax = tax_amount ?? current?.tax_amount ?? 0
      updates.total_amount = newSubtotal + newTax
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating invoice:', error)
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error in PUT /api/invoices/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const supabase = await createClient()
    const { id } = await params

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting invoice:', error)
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/invoices/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}