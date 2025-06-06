import { createClient } from "@/utils/supabase/server"

// Cache duration in milliseconds (30 minutes)
const CACHE_TTL = 30 * 60 * 1000

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface JobConstants {
  jobRoles: Array<{ value: string; label: string }>
  primaryProducts: Array<{ value: string; label: string }>
  jobTypes: Array<{ value: string; label: string }>
  countries: Array<{ value: string; label: string }>
}

// In-memory cache
let cache: {
  jobRoles?: CacheEntry<JobConstants["jobRoles"]>
  primaryProducts?: CacheEntry<JobConstants["primaryProducts"]>
  jobTypes?: CacheEntry<JobConstants["jobTypes"]>
  countries?: CacheEntry<JobConstants["countries"]>
} = {}

// Fallback constants (your current hardcoded values)
const FALLBACK_JOB_ROLES = [
  { value: "consultant", label: "Consultant" },
  { value: "project_manager", label: "Project Manager" },
  { value: "developer", label: "Developer" },
  { value: "solution_architect", label: "Solution Architect" },
  { value: "technical_architect", label: "Technical Architect" },
  { value: "business_analyst", label: "Business Analyst" },
  { value: "functional_consultant", label: "Functional Consultant" },
  { value: "technical_consultant", label: "Technical Consultant" },
  { value: "system_administrator", label: "System Administrator" },
  { value: "data_analyst", label: "Data Analyst" },
  { value: "power_platform_developer", label: "Power Platform Developer" },
  { value: "dynamics_developer", label: "Dynamics Developer" },
  { value: "sharepoint_developer", label: "SharePoint Developer" },
  { value: "integration_specialist", label: "Integration Specialist" },
  { value: "product_owner", label: "Product Owner" },
  { value: "scrum_master", label: "Scrum Master" },
  { value: "team_lead", label: "Team Lead" },
  { value: "senior_consultant", label: "Senior Consultant" },
  { value: "principal_consultant", label: "Principal Consultant" },
]

const FALLBACK_PRIMARY_PRODUCTS = [
  { value: "power_apps", label: "Power Apps" },
  { value: "power_automate", label: "Power Automate" },
  { value: "power_bi", label: "Power BI" },
  { value: "power_pages", label: "Power Pages" },
  { value: "power_virtual_agents", label: "Power Virtual Agents" },
  { value: "dynamics_365_sales", label: "Dynamics 365 Sales" },
  { value: "dynamics_365_marketing", label: "Dynamics 365 Marketing" },
  { value: "dynamics_365_customer_service", label: "Dynamics 365 Customer Service" },
  { value: "dynamics_365_field_service", label: "Dynamics 365 Field Service" },
  { value: "dynamics_365_finance", label: "Dynamics 365 Finance" },
  { value: "dynamics_365_supply_chain", label: "Dynamics 365 Supply Chain Management" },
  { value: "dynamics_365_business_central", label: "Dynamics 365 Business Central" },
  { value: "dynamics_365_commerce", label: "Dynamics 365 Commerce" },
  { value: "dynamics_365_human_resources", label: "Dynamics 365 Human Resources" },
  { value: "microsoft_365", label: "Microsoft 365" },
  { value: "sharepoint", label: "SharePoint" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "outlook", label: "Outlook" },
  { value: "excel", label: "Excel" },
  { value: "azure", label: "Microsoft Azure" },
  { value: "azure_devops", label: "Azure DevOps" },
  { value: "sql_server", label: "SQL Server" },
  { value: "dotnet", label: ".NET" },
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "c_sharp", label: "C#" },
  { value: "powershell", label: "PowerShell" },
]

const FALLBACK_JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
]

const FALLBACK_COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "AU", label: "Australia" },
  { value: "NL", label: "Netherlands" },
  { value: "SE", label: "Sweden" },
  { value: "DK", label: "Denmark" },
  { value: "NO", label: "Norway" },
]

function isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_TTL
}

async function fetchJobRolesFromDB(): Promise<JobConstants["jobRoles"]> {
  try {
    const supabase = await createClient()

    // Get unique job roles from the jobs table
    const { data, error } = await supabase
      .from("transformed_jobs")
      .select("job_role")
      .not("job_role", "is", null)
      .order("job_role")

    if (error) throw error

    // Get unique values and create label from value
    const uniqueRoles = [...new Set(data.map((item) => item.job_role))].filter(Boolean).map((role) => ({
      value: role,
      label: role
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }))

    return uniqueRoles.length > 0 ? uniqueRoles : FALLBACK_JOB_ROLES
  } catch (error) {
    console.warn("Failed to fetch job roles from database, using fallback:", error)
    return FALLBACK_JOB_ROLES
  }
}

async function fetchPrimaryProductsFromDB(): Promise<JobConstants["primaryProducts"]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("transformed_jobs")
      .select("primary_product")
      .not("primary_product", "is", null)
      .order("primary_product")

    if (error) throw error

    const uniqueProducts = [...new Set(data.map((item) => item.primary_product))].filter(Boolean).map((product) => ({
      value: product,
      label: product
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }))

    return uniqueProducts.length > 0 ? uniqueProducts : FALLBACK_PRIMARY_PRODUCTS
  } catch (error) {
    console.warn("Failed to fetch primary products from database, using fallback:", error)
    return FALLBACK_PRIMARY_PRODUCTS
  }
}

async function fetchJobTypesFromDB(): Promise<JobConstants["jobTypes"]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("transformed_jobs")
      .select("job_type")
      .not("job_type", "is", null)
      .order("job_type")

    if (error) throw error

    const uniqueTypes = [...new Set(data.map((item) => item.job_type))].filter(Boolean).map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    }))

    return uniqueTypes.length > 0 ? uniqueTypes : FALLBACK_JOB_TYPES
  } catch (error) {
    console.warn("Failed to fetch job types from database, using fallback:", error)
    return FALLBACK_JOB_TYPES
  }
}

async function fetchCountriesFromDB(): Promise<JobConstants["countries"]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("transformed_jobs")
      .select("location_country")
      .not("location_country", "is", null)
      .order("location_country")

    if (error) throw error

    const uniqueCountries = [...new Set(data.map((item) => item.location_country))].filter(Boolean).map((country) => ({
      value: country,
      label: country, // You might want to map country codes to full names
    }))

    return uniqueCountries.length > 0 ? uniqueCountries : FALLBACK_COUNTRIES
  } catch (error) {
    console.warn("Failed to fetch countries from database, using fallback:", error)
    return FALLBACK_COUNTRIES
  }
}

// Public API functions
export async function getJobRoles(): Promise<JobConstants["jobRoles"]> {
  if (isCacheValid(cache.jobRoles)) {
    return cache.jobRoles!.data
  }

  const data = await fetchJobRolesFromDB()
  cache.jobRoles = { data, timestamp: Date.now() }
  return data
}

export async function getPrimaryProducts(): Promise<JobConstants["primaryProducts"]> {
  if (isCacheValid(cache.primaryProducts)) {
    return cache.primaryProducts!.data
  }

  const data = await fetchPrimaryProductsFromDB()
  cache.primaryProducts = { data, timestamp: Date.now() }
  return data
}

export async function getJobTypes(): Promise<JobConstants["jobTypes"]> {
  if (isCacheValid(cache.jobTypes)) {
    return cache.jobTypes!.data
  }

  const data = await fetchJobTypesFromDB()
  cache.jobTypes = { data, timestamp: Date.now() }
  return data
}

export async function getCountries(): Promise<JobConstants["countries"]> {
  if (isCacheValid(cache.countries)) {
    return cache.countries!.data
  }

  const data = await fetchCountriesFromDB()
  cache.countries = { data, timestamp: Date.now() }
  return data
}

// Utility to get all constants at once
export async function getAllJobConstants(): Promise<JobConstants> {
  const [jobRoles, primaryProducts, jobTypes, countries] = await Promise.all([
    getJobRoles(),
    getPrimaryProducts(),
    getJobTypes(),
    getCountries(),
  ])

  return { jobRoles, primaryProducts, jobTypes, countries }
}

// Force cache refresh
export async function refreshJobConstantsCache(): Promise<void> {
  cache = {}
  await getAllJobConstants()
}
