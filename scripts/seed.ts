import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Sample data
const crops = [
  { name: 'Sunflower', pricePerKg: 800, daysToHarvest: 7, seedGramsPerTray: 150 },
  { name: 'Pea Shoots', pricePerKg: 600, daysToHarvest: 10, seedGramsPerTray: 200 },
  { name: 'Radish', pricePerKg: 500, daysToHarvest: 6, seedGramsPerTray: 100 },
  { name: 'Broccoli', pricePerKg: 900, daysToHarvest: 8, seedGramsPerTray: 120 },
  { name: 'Mustard', pricePerKg: 450, daysToHarvest: 5, seedGramsPerTray: 80 },
  { name: 'Arugula', pricePerKg: 700, daysToHarvest: 7, seedGramsPerTray: 100 },
  { name: 'Kale', pricePerKg: 850, daysToHarvest: 9, seedGramsPerTray: 130 },
  { name: 'Basil', pricePerKg: 1200, daysToHarvest: 12, seedGramsPerTray: 50 },
  { name: 'Cilantro', pricePerKg: 650, daysToHarvest: 10, seedGramsPerTray: 80 },
  { name: 'Amaranth', pricePerKg: 550, daysToHarvest: 6, seedGramsPerTray: 90 },
]

const growerNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
  'Anita Desai', 'Rohit Gupta', 'Meera Nair', 'Sanjay Verma', 'Kavita Joshi',
  'Arjun Menon', 'Deepa Iyer', 'Rahul Agarwal', 'Pooja Malhotra', 'Kiran Rao'
]

const restaurantNames = [
  'Green Leaf Bistro', 'Farm to Table Kitchen', 'Fresh Harvest Cafe', 'Organic Origins',
  'The Microgreen House', 'Garden Grill', 'Sprout & Co', 'Leafy Delights',
  'Urban Farm Kitchen', 'Nature\'s Plate', 'Verdant Veggies', 'Pure Greens',
  'Harvest Hub', 'Eco Eats', 'Sustainable Spoon'
]


function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

function generateTrayCode(): string {
  const prefix = 'SB'
  const num = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  return `${prefix}-${num}${letter}`
}

async function seedInvoicesDemo(growerIds: string[], restaurantIds: string[]) {
  console.log('Seeding demo invoices scenario...')

  // We need at least 1 grower and 1 restaurant
  if (growerIds.length === 0 || restaurantIds.length === 0) {
    console.log('Need at least 1 grower and 1 restaurant for demo invoices')
    return
  }

  const growerId = growerIds[0]
  const restaurantId = restaurantIds[0]

  // 1. Create a tray assignment for the grower (Sunflower, 7 days, price ₹800/kg)
  const crop = crops.find(c => c.name === 'Sunflower')!
  const trayCode = 'SB-1001A'
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)
  const expectedHarvestDate = new Date()
  expectedHarvestDate.setDate(expectedHarvestDate.getDate() - 1)

  const { data: tray, error: trayError } = await supabase
    .from('tray_assignments')
    .insert({
      grower_id: growerId,
      tray_code: trayCode,
      crop_name: crop.name,
      start_date: startDate.toISOString().split('T')[0],
      expected_harvest_date: expectedHarvestDate.toISOString().split('T')[0],
      status: 'completed',
      current_day: crop.daysToHarvest,
      total_days: crop.daysToHarvest,
      seed_type: `${crop.name} Seeds - Batch 100`,
      seed_batch_id: 'SB-100',
      seed_quantity_grams: crop.seedGramsPerTray,
    })
    .select()
    .single()

  if (trayError || !tray) {
    console.error('Error creating tray:', trayError)
    return
  }
  console.log(`Created tray: ${tray.tray_code} (${tray.crop_name})`)

  // 2. Create yield record - ~12kg harvest (150g seeds * 30% yield = ~45g, but for demo we want ~12kg)
  // For demo: we want restaurant invoice ~₹9,500 (at ₹800/kg = ~12kg)
  // Grower gets 50% cut = ~₹4,750
  const yieldWeightGrams = 12000 // 12kg
  const { error: yieldError } = await supabase
    .from('yield_records')
    .insert({
      tray_id: tray.id,
      weight_grams: yieldWeightGrams,
      quality_rating: 5,
      notes: 'Excellent quality, vibrant color - demo harvest',
    })

  if (yieldError) {
    console.error('Error creating yield record:', yieldError)
  } else {
    console.log(`Created yield record: ${yieldWeightGrams}g (${yieldWeightGrams/1000}kg)`)
  }

  // 3. Create milestones for this tray
  const milestones = [
    { day: 1, title: 'Seeds Planted', description: 'Sunflower seeds sown and covered' },
    { day: 3, title: 'Germination', description: 'First sprouts visible' },
    { day: 5, title: 'Cotyledons Open', description: 'First leaves fully expanded' },
    { day: 7, title: 'Harvest Ready', description: 'True leaves emerging, ready to harvest' },
  ]
  for (const m of milestones) {
    await supabase.from('milestones').insert({
      tray_id: tray.id,
      day_number: m.day,
      title: m.title,
      description: m.description,
      status: 'completed',
      image_url: `https://picsum.photos/seed/${tray.id}-${m.day}/400/300`,
    })
  }
  console.log('Created milestones')

  // 4. Create growth uploads
  for (let day = 1; day <= 7; day++) {
    await supabase.from('growth_uploads').insert({
      tray_id: tray.id,
      day_number: day,
      image_url: `https://picsum.photos/seed/${tray.id}-growth-${day}/600/400`,
      notes: `Day ${day} growth check - ${crop.name}`,
    })
  }
  console.log('Created growth uploads')

  // 5. Create order for restaurant - 12kg Sunflower at ₹800/kg = ₹9,600
  const orderItems = [{ crop_name: 'Sunflower', quantity_kg: 12 }]
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      restaurant_id: restaurantId,
      items: orderItems,
      total_trays: 1,
      status: 'delivered',
      delivery_date: new Date().toISOString().split('T')[0],
      notes: 'Delivered fresh and on time - demo order',
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Error creating order:', orderError)
    return
  }
  console.log(`Created order: ${order.id} - 12kg Sunflower for ₹9,600`)

  // 6. Create allocation linking order, tray, and grower
  await supabase.from('allocations').insert({
    order_id: order.id,
    tray_id: tray.id,
    grower_id: growerId,
  })
  console.log('Created allocation')

  // 7. Create INVOICE for restaurant (customer invoice) - ₹9,600
  const restaurantInvoiceItems = [{
    description: 'Sunflower Microgreens - 12kg',
    quantity: 12,
    unit_price: 800,
    total: 9600,
    crop_name: 'Sunflower',
    tray_ids: [tray.id],
  }]

  const { data: restaurantInvoice, error: restInvError } = await supabase
    .from('invoices')
    .insert({
      type: 'customer',
      status: 'paid',
      party_id: restaurantId,
      party_type: 'restaurant',
      items: restaurantInvoiceItems,
      subtotal: 9600,
      tax_amount: 0,
      total_amount: 9600,
      paid_amount: 9600,
      due_date: new Date().toISOString().split('T')[0],
      paid_at: new Date().toISOString(),
      notes: 'Demo invoice for delivered order',
      order_id: order.id,
    })
    .select()
    .single()

  if (restInvError || !restaurantInvoice) {
    console.error('Error creating restaurant invoice:', restInvError)
  } else {
    console.log(`Created restaurant invoice: ${restaurantInvoice.invoice_number} - ₹${restaurantInvoice.total_amount}`)
  }

  // 8. Create INVOICE for grower (payout invoice) - 50% cut = ₹4,800
  const growerInvoiceItems = [{
    description: 'Grower Payout - Sunflower Microgreens (12kg @ ₹400/kg grower rate)',
    quantity: 12,
    unit_price: 400,
    total: 4800,
    crop_name: 'Sunflower',
    tray_ids: [tray.id],
  }]

  const { data: growerInvoice, error: growerInvError } = await supabase
    .from('invoices')
    .insert({
      type: 'payout',
      status: 'paid',
      party_id: growerId,
      party_type: 'grower',
      items: growerInvoiceItems,
      subtotal: 4800,
      tax_amount: 0,
      total_amount: 4800,
      paid_amount: 4800,
      due_date: new Date().toISOString().split('T')[0],
      paid_at: new Date().toISOString(),
      notes: 'Demo payout for delivered order - 50% grower cut',
      order_id: order.id,
    })
    .select()
    .single()

  if (growerInvError || !growerInvoice) {
    console.error('Error creating grower invoice:', growerInvError)
  } else {
    console.log(`Created grower payout invoice: ${growerInvoice.invoice_number} - ₹${growerInvoice.total_amount}`)
  }

  console.log('================================')
  console.log('DEMO INVOICES SCENARIO COMPLETE!')
  console.log(`Restaurant Invoice: ₹9,600 (Customer pays)`)
  console.log(`Grower Payout: ₹4,800 (50% cut)`)
  console.log(`Platform Revenue: ₹4,800`)
}

async function main() {
  console.log('Starting database seed...')
  console.log('================================')

  // Note: Profiles need to be created via Supabase Auth first
  // This script assumes you have already created users in Supabase Auth
  // and the trigger has created profiles

  // Get existing profiles by role
  const { data: growers } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'grower')

  const { data: restaurants } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'restaurant')

  const growerIds = growers?.map(g => g.id) || []
  const restaurantIds = restaurants?.map(r => r.id) || []

  if (growerIds.length === 0 || restaurantIds.length === 0) {
    console.log('No profiles found. Please create users in Supabase Auth first.')
    console.log('Run this SQL in Supabase to create test users:')
    console.log(`
-- Create test users (run in Supabase SQL Editor)
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'grower1@sproutbox.test', '{"full_name": "Rajesh Kumar", "role": "grower"}', now(), now()),
  (gen_random_uuid(), 'grower2@sproutbox.test', '{"full_name": "Priya Sharma", "role": "grower"}', now(), now()),
  (gen_random_uuid(), 'restaurant1@sproutbox.test', '{"full_name": "Green Leaf Bistro", "role": "restaurant"}', now(), now()),
  (gen_random_uuid(), 'restaurant2@sproutbox.test', '{"full_name": "Farm to Table Kitchen", "role": "restaurant"}', now(), now()),
  (gen_random_uuid(), 'admin@sproutbox.test', '{"full_name": "Admin User", "role": "admin"}', now(), now());
    `)
    return
  }

  console.log(`Found ${growerIds.length} growers and ${restaurantIds.length} restaurants`)

  // Seed the DEMO invoices scenario (targeted data)
  await seedInvoicesDemo(growerIds, restaurantIds)

  console.log('================================')
  console.log('Seeding complete!')
}

main().catch(console.error)