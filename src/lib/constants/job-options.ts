// Job Roles - based on common roles in the Microsoft ecosystem
export const JOB_ROLES = [
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
] as const

// Primary Products - Microsoft ecosystem products
export const PRIMARY_PRODUCTS = [
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
] as const

// Type definitions for type safety
export type JobRole = (typeof JOB_ROLES)[number]["value"]
export type PrimaryProduct = (typeof PRIMARY_PRODUCTS)[number]["value"]

// Helper functions
export const getJobRoleLabel = (value: JobRole): string => {
  return JOB_ROLES.find((role) => role.value === value)?.label || value
}

export const getPrimaryProductLabel = (value: PrimaryProduct): string => {
  return PRIMARY_PRODUCTS.find((product) => product.value === value)?.label || value
}

export const getJobRoleLabels = (values: JobRole[]): string[] => {
  return values.map((value) => getJobRoleLabel(value))
}

export const getPrimaryProductLabels = (values: PrimaryProduct[]): string[] => {
  return values.map((value) => getPrimaryProductLabel(value))
}
