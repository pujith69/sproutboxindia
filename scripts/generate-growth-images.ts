/**
 * Growth Image Generator for SproutBox
 *
 * This script generates placeholder images for microgreens growth stages.
 * Since we can't generate real photos, it creates:
 * 1. SVG placeholders with growth stage visualization
 * 2. Consistent URLs using picsum.photos or similar services
 * 3. A mapping of tray_id + day_number to image URLs
 *
 * Usage: npx tsx scripts/generate-growth-images.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Growth stage configurations for different crops
const growthStages: Record<string, Array<{ day: number; label: string; description: string; color: string }>> = {
  'Sunflower': [
    { day: 1, label: 'Seeds Soaking', description: 'Seeds soaking in water', color: '#8B4513' },
    { day: 2, label: 'Planted', description: 'Seeds planted on medium', color: '#8B4513' },
    { day: 3, label: 'Germination', description: 'First roots emerging', color: '#228B22' },
    { day: 4, label: 'Sprouts', description: 'White shoots visible', color: '#228B22' },
    { day: 5, label: 'Cotyledons', description: 'First leaves opening', color: '#32CD32' },
    { day: 6, label: 'Growing', description: 'Leaves expanding', color: '#228B22' },
    { day: 7, label: 'Harvest Ready', description: 'True leaves emerging', color: '#2E8B57' },
  ],
  'Pea Shoots': [
    { day: 1, label: 'Soaking', description: 'Peas soaking 12-24 hours', color: '#8B4513' },
    { day: 2, label: 'Planted', description: 'Dense planting on medium', color: '#8B4513' },
    { day: 3, label: 'Covered', description: 'Under weight for germination', color: '#8B4513' },
    { day: 4, label: 'Germination', description: 'Sprouts breaking through', color: '#228B22' },
    { day: 5, label: 'Uncovered', description: 'Exposed to light', color: '#32CD32' },
    { day: 6, label: 'Growing', description: 'Rapid vertical growth', color: '#228B22' },
    { day: 7, label: 'Tendrils', description: 'First tendrils forming', color: '#228B22' },
    { day: 8, label: 'Tall Shoots', description: '4-6 inch shoots', color: '#2E8B57' },
    { day: 9, label: 'Harvest Ready', description: 'Ready for first cut', color: '#2E8B57' },
    { day: 10, label: 'Regrowth', description: 'Second harvest possible', color: '#32CD32' },
  ],
  'Radish': [
    { day: 1, label: 'Planted', description: 'Seeds sown on medium', color: '#8B4513' },
    { day: 2, label: 'Germination', description: 'Very fast germination', color: '#228B22' },
    { day: 3, label: 'Cotyledons', description: 'Heart-shaped leaves', color: '#32CD32' },
    { day: 4, label: 'Expanding', description: 'Leaves growing rapidly', color: '#228B22' },
    { day: 5, label: 'Mature', description: 'Fully developed cotyledons', color: '#2E8B57' },
    { day: 6, label: 'Harvest Ready', description: 'Perfect for harvest', color: '#2E8B57' },
  ],
  'Broccoli': [
    { day: 1, label: 'Planted', description: 'Tiny seeds planted', color: '#8B4513' },
    { day: 2, label: 'Germination', description: 'Microscopic sprouts', color: '#228B22' },
    { day: 3, label: 'Cotyledons', description: 'First leaves appear', color: '#32CD32' },
    { day: 4, label: 'Growing', description: 'Leaves developing', color: '#228B22' },
    { day: 5, label: 'Expanding', description: 'Leaf surface increasing', color: '#228B22' },
    { day: 6, label: 'True Leaves', description: 'First true leaves', color: '#2E8B57' },
    { day: 7, label: 'Harvest Ready', description: 'Ready to harvest', color: '#2E8B57' },
    { day: 8, label: 'Peak Quality', description: 'Optimal harvest window', color: '#2E8B57' },
  ],
  'Mustard': [
    { day: 1, label: 'Planted', description: 'Seeds on moist medium', color: '#8B4513' },
    { day: 2, label: 'Germination', description: 'Rapid sprouting', color: '#228B22' },
    { day: 3, label: 'Cotyledons', description: 'Broad first leaves', color: '#32CD32' },
    { day: 4, label: 'Spicy Growth', description: 'Flavor developing', color: '#228B22' },
    { day: 5, label: 'Harvest Ready', description: 'Bold mustard flavor', color: '#2E8B57' },
  ],
  'default': [
    { day: 1, label: 'Planted', description: 'Seeds planted', color: '#8B4513' },
    { day: 2, label: 'Germination', description: 'Seeds sprouting', color: '#228B22' },
    { day: 3, label: 'Cotyledons', description: 'First leaves', color: '#32CD32' },
    { day: 4, label: 'Growing', description: 'Active growth', color: '#228B22' },
    { day: 5, label: 'Maturing', description: 'Leaves expanding', color: '#2E8B57' },
    { day: 6, label: 'Harvest Ready', description: 'Ready to harvest', color: '#2E8B57' },
    { day: 7, label: 'Peak', description: 'Best quality', color: '#2E8B57' },
  ],
}

function generateSVGPlaceholder(
  cropName: string,
  day: number,
  totalDays: number,
  stage: { label: string; description: string; color: string }
): string {
  const progress = Math.min(day / totalDays, 1)
  const width = 600
  const height = 400

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#f5f5f5"/>

  <!-- Progress bar background -->
  <rect x="50" y="${height - 60}" width="${width - 100}" height="20" rx="10" fill="#e0e0e0"/>
  <rect x="50" y="${height - 60}" width="${(width - 100) * progress}" height="20" rx="10" fill="${stage.color}"/>

  <!-- Crop name -->
  <text x="${width / 2}" y="60" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#333" text-anchor="middle">${cropName} Microgreens</text>

  <!-- Stage label -->
  <text x="${width / 2}" y="110" font-family="system-ui, sans-serif" font-size="24" fill="${stage.color}" text-anchor="middle">${stage.label}</text>

  <!-- Day indicator -->
  <text x="${width / 2}" y="150" font-family="system-ui, sans-serif" font-size="18" fill="#666" text-anchor="middle">Day ${day} of ${totalDays}</text>

  <!-- Description -->
  <text x="${width / 2}" y="190" font-family="system-ui, sans-serif" font-size="16" fill="#555" text-anchor="middle">${stage.description}</text>

  <!-- Visual representation - simple plant icons -->
  ${generatePlantIcons(day, totalDays, stage.color, width, height)}

  <!-- Progress text -->
  <text x="${width / 2}" y="${height - 20}" font-family="system-ui, sans-serif" font-size="14" fill="#888" text-anchor="middle">${Math.round(progress * 100)}% Complete</text>

  <!-- Watermark -->
  <text x="${width - 20}" y="${height - 20}" font-family="system-ui, sans-serif" font-size="10" fill="#ccc" text-anchor="end">SPROUTBOX PLACEHOLDER</text>
</svg>`
}

function generatePlantIcons(day: number, totalDays: number, color: string, width: number, height: number): string {
  const numPlants = Math.min(8, Math.max(3, Math.floor(day / totalDays * 8)))
  const plantHeight = Math.min(120, 30 + (day / totalDays) * 90)
  let icons = ''

  for (let i = 0; i < numPlants; i++) {
    const x = 80 + i * 65
    const y = height - 100
    const stemHeight = plantHeight * (0.7 + Math.random() * 0.3)
    const leafCount = Math.floor(day / totalDays * 4) + 1

    // Stem
    icons += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - stemHeight}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`

    // Leaves
    for (let l = 0; l < leafCount; l++) {
      const leafY = y - stemHeight * (0.3 + l * 0.2)
      const leafSize = 8 + l * 3
      // Left leaf
      icons += `<ellipse cx="${x - leafSize/2}" cy="${leafY}" rx="${leafSize}" ry="${leafSize/2}" fill="${color}" transform="rotate(-30 ${x - leafSize/2} ${leafY})"/>`
      // Right leaf
      icons += `<ellipse cx="${x + leafSize/2}" cy="${leafY}" rx="${leafSize}" ry="${leafSize/2}" fill="${color}" transform="rotate(30 ${x + leafSize/2} ${leafY})"/>`
    }
  }

  return icons
}

function generatePicsumUrl(trayId: string, day: number, width = 600, height = 400): string {
  // Use a consistent seed based on tray_id and day for reproducible images
  const seed = `${trayId}-day-${day}`.replace(/[^a-zA-Z0-9]/g, '')
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

async function generateGrowthImageMapping() {
  console.log('Fetching tray assignments...')

  const { data: trays, error } = await supabase
    .from('tray_assignments')
    .select('id, tray_code, crop_name, total_days, current_day, status')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching trays:', error)
    return
  }

  if (!trays || trays.length === 0) {
    console.log('No tray assignments found. Run seed script first.')
    return
  }

  console.log(`Found ${trays.length} tray assignments`)

  const mapping: Record<string, Record<number, { url: string; svg: string; stage: any }>> = {}
  const allImages: Array<{
    tray_id: string
    tray_code: string
    crop_name: string
    day: number
    url: string
    svg_path: string
    stage_label: string
  }> = []

  // Create output directory
  const outputDir = path.join(process.cwd(), 'public', 'growth-images')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  for (const tray of trays) {
    const stages = growthStages[tray.crop_name] || growthStages.default
    mapping[tray.id] = {}

    for (let day = 1; day <= tray.total_days; day++) {
      const stage = stages.find(s => s.day === day) || stages[stages.length - 1]

      // Generate SVG
      const svg = generateSVGPlaceholder(tray.crop_name, day, tray.total_days, stage)
      const svgFileName = `${tray.tray_code}-day-${day}.svg`
      const svgPath = path.join(outputDir, svgFileName)
      fs.writeFileSync(svgPath, svg)

      // Generate picsum URL
      const url = generatePicsumUrl(tray.id, day)

      mapping[tray.id][day] = {
        url,
        svg: `/growth-images/${svgFileName}`,
        stage,
      }

      allImages.push({
        tray_id: tray.id,
        tray_code: tray.tray_code,
        crop_name: tray.crop_name,
        day,
        url,
        svg_path: `/growth-images/${svgFileName}`,
        stage_label: stage.label,
      })
    }
  }

  // Save mapping as JSON
  const mappingPath = path.join(process.cwd(), 'scripts', 'growth-image-mapping.json')
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2))

  // Save CSV for easy reference
  const csvPath = path.join(process.cwd(), 'scripts', 'growth-images.csv')
  const csvHeader = 'tray_id,tray_code,crop_name,day,url,svg_path,stage_label\n'
  const csvRows = allImages.map(img =>
    `"${img.tray_id}","${img.tray_code}","${img.crop_name}",${img.day},"${img.url}","${img.svg_path}","${img.stage_label}"`
  ).join('\n')
  fs.writeFileSync(csvPath, csvHeader + csvRows)

  console.log(`Generated ${allImages.length} growth stage images`)
  console.log(`SVG files saved to: ${outputDir}`)
  console.log(`Mapping saved to: ${mappingPath}`)
  console.log(`CSV saved to: ${csvPath}`)

  // Also update growth_uploads with these image URLs
  console.log('\nUpdating growth_uploads with generated image URLs...')
  await updateGrowthUploads(trays)
}

async function updateGrowthUploads(trays: any[]) {
  // Get existing growth_uploads
  const { data: existingUploads } = await supabase
    .from('growth_uploads')
    .select('id, tray_id, day_number')

  const existingKeys = new Set(
    (existingUploads || []).map(u => `${u.tray_id}-${u.day_number}`)
  )

  const newUploads = []

  for (const tray of trays) {
    // Add uploads for days up to current_day (or total_days if completed)
    const maxDay = tray.status === 'completed' || tray.status === 'approved'
      ? tray.total_days
      : tray.current_day

    for (let day = 1; day <= maxDay; day++) {
      const key = `${tray.id}-${day}`
      if (!existingKeys.has(key) && Math.random() > 0.15) { // 85% chance
        newUploads.push({
          tray_id: tray.id,
          day_number: day,
          image_url: generatePicsumUrl(tray.id, day),
          notes: `Day ${day} growth check - ${tray.crop_name}`,
        })
      }
    }
  }

  if (newUploads.length > 0) {
    const { error } = await supabase.from('growth_uploads').insert(newUploads)
    if (error) {
      console.error('Error inserting growth uploads:', error)
    } else {
      console.log(`Added ${newUploads.length} new growth uploads`)
    }
  } else {
    console.log('No new growth uploads needed')
  }
}

async function generateMilestoneImages() {
  console.log('\nGenerating milestone images...')

  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, tray_id, day_number, title, status')
    .eq('status', 'completed')
    .is('image_url', null)

  if (!milestones || milestones.length === 0) {
    console.log('No milestones need images')
    return
  }

  console.log(`Updating ${milestones.length} milestones with images...`)

  for (const milestone of milestones) {
    const imageUrl = generatePicsumUrl(milestone.tray_id, milestone.day_number)
    const { error } = await supabase
      .from('milestones')
      .update({ image_url: imageUrl })
      .eq('id', milestone.id)

    if (error) {
      console.error(`Error updating milestone ${milestone.id}:`, error)
    }
  }

  console.log('Milestone images updated')
}

async function main() {
  console.log('================================')
  console.log('SproutBox Growth Image Generator')
  console.log('================================\n')

  await generateGrowthImageMapping()
  await generateMilestoneImages()

  console.log('\n================================')
  console.log('Growth image generation complete!')
  console.log('================================')
}

main().catch(console.error)