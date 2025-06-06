"use client"

// Client-side cache for job constants
// This fetches from the API endpoint instead of directly from the database

interface JobConstants {
  jobRoles: Array<{ value: string; label: string }>
  primaryProducts: Array<{ value: string; label: string }>
  jobTypes: Array<{ value: string; label: string }>
  countries: Array<{ value: string; label: string }>
}

// Simple in-memory cache for the client
let clientCache: {
  data?: JobConstants
  timestamp?: number
} = {}

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// Fallback constants (same as server-side)
const FALLBACK_CONSTANTS: JobConstants = {
  jobRoles: [
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
  ],
  primaryProducts: [
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
  ],
  jobTypes: [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Internship" },
  ],
  countries: [
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
  ],
}

function isCacheValid(): boolean {
  if (!clientCache.data || !clientCache.timestamp) return false
  return Date.now() - clientCache.timestamp < CACHE_TTL
}

async function fetchConstantsFromAPI(): Promise<JobConstants> {
  try {
    const response = await fetch("/api/constants")

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch constants")
    }

    return result.data
  } catch (error) {
    console.warn("Failed to fetch constants from API, using fallback:", error)
    return FALLBACK_CONSTANTS
  }
}

// Public API for client components
export async function getAllJobConstantsClient(): Promise<JobConstants> {
  if (isCacheValid()) {
    return clientCache.data!
  }

  const data = await fetchConstantsFromAPI()
  clientCache = { data, timestamp: Date.now() }
  return data
}

export async function getJobRolesClient(): Promise<JobConstants["jobRoles"]> {
  const constants = await getAllJobConstantsClient()
  return constants.jobRoles
}

export async function getPrimaryProductsClient(): Promise<JobConstants["primaryProducts"]> {
  const constants = await getAllJobConstantsClient()
  return constants.primaryProducts
}

export async function getJobTypesClient(): Promise<JobConstants["jobTypes"]> {
  const constants = await getAllJobConstantsClient()
  return constants.jobTypes
}

export async function getCountriesClient(): Promise<JobConstants["countries"]> {
  const constants = await getAllJobConstantsClient()
  return constants.countries
}

// Clear cache (useful for testing or force refresh)
export function clearClientCache(): void {
  clientCache = {}
}
