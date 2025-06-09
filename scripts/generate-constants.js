// Run this during build: npm run generate-constants
const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function generateConstants() {
  try {
    console.log("🔄 Generating constants from database...")

    // Fetch data from database
    const [jobRolesData, productsData, typesData, countriesData] = await Promise.all([
      supabase.from("transformed_jobs").select("job_role").not("job_role", "is", null),
      supabase.from("transformed_jobs").select("primary_product").not("primary_product", "is", null),
      supabase.from("transformed_jobs").select("job_type").not("job_type", "is", null),
      supabase.from("transformed_jobs").select("location_country").not("location_country", "is", null),
    ])

    // Process unique values
    const jobRoles = [...new Set(jobRolesData.data?.map((item) => item.job_role))].filter(Boolean)
    const products = [...new Set(productsData.data?.map((item) => item.primary_product))].filter(Boolean)
    const types = [...new Set(typesData.data?.map((item) => item.job_type))].filter(Boolean)
    const countries = [...new Set(countriesData.data?.map((item) => item.location_country))].filter(Boolean)

    // Generate TypeScript file
    const tsContent = `// Auto-generated constants from database
// Generated at: ${new Date().toISOString()}
// Do not edit manually - run 'npm run generate-constants' to update

export const JOB_ROLES = [
${jobRoles.map((role) => `  { value: "${role}", label: "${formatLabel(role)}" }`).join(",\n")}
] as const

export const PRIMARY_PRODUCTS = [
${products.map((product) => `  { value: "${product}", label: "${formatLabel(product)}" }`).join(",\n")}
] as const

export const JOB_TYPES = [
${types.map((type) => `  { value: "${type}", label: "${formatLabel(type)}" }`).join(",\n")}
] as const

export const COUNTRIES = [
${countries.map((country) => `  { value: "${country}", label: "${country}" }`).join(",\n")}
] as const

export type JobRole = (typeof JOB_ROLES)[number]["value"]
export type PrimaryProduct = (typeof PRIMARY_PRODUCTS)[number]["value"]
`

    // Write to file
    const outputPath = path.join(process.cwd(), "src/lib/constants/generated-job-options.ts")
    fs.writeFileSync(outputPath, tsContent)

    console.log("✅ Constants generated successfully!")
    console.log(`📄 Written to: ${outputPath}`)
    console.log(
      `📊 Generated: ${jobRoles.length} roles, ${products.length} products, ${types.length} types, ${countries.length} countries`,
    )
  } catch (error) {
    console.error("❌ Failed to generate constants:", error)
    process.exit(1)
  }
}

function formatLabel(value) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

generateConstants()
