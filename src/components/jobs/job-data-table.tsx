"use client"

import { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Bookmark, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { JobWithInteraction } from "@/lib/types/jobs"
import { formatDistance } from "date-fns"
import { toggleJobBookmark } from "@/lib/actions/job-interactions"
import { useTransition, useEffect } from "react"
import Flag from "react-world-flags"
import { JobDataTableColumnToggle } from "./job-data-table-column-toggle"

interface JobDataTableProps {
  jobs: JobWithInteraction[]
  onJobSelect: (job: JobWithInteraction) => void
  loading?: boolean
  externalSorting?: boolean // When true, disable internal sorting
}

const COLUMN_VISIBILITY_KEY = "job-table-column-visibility"

export function JobDataTable({ jobs, onJobSelect, loading = false, externalSorting = true }: JobDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [isPending, startTransition] = useTransition()

  // Load column visibility preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(COLUMN_VISIBILITY_KEY)
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved))
      } catch {
        // If parsing fails, use default visibility
      }
    }
  }, [])

  // Save column visibility preferences to localStorage
  const handleColumnVisibilityChange = (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
    const newVisibility = typeof updater === "function" ? updater(columnVisibility) : updater
    setColumnVisibility(newVisibility)
    localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(newVisibility))
  }

  const formatSalary = (min?: number | null, max?: number | null, currency = "USD") => {
    if (!min && !max) return "Not specified"

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    })

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    }

    return formatter.format(min || max || 0)
  }

  const formatLocation = (job: JobWithInteraction) => {
    if (job.is_remote) return "Remote"
    const parts = []
    if (job.location_city && job.location_city !== "Remote") parts.push(job.location_city)
    if (job.location_country) parts.push(job.location_country)
    return parts.length > 0 ? parts.join(", ") : "Not specified"
  }

  const getCompanyName = (job: JobWithInteraction) => {
    if (job.company?.company_name) {
      return job.company.company_name
    }
    if (job.source_site) {
      const cleanSite = job.source_site
        .replace(/\.com|\.co\.uk|\.org/gi, "")
        .replace(/jobs|careers|hiring/gi, "")
        .trim()
      if (cleanSite && cleanSite.length > 2) {
        return cleanSite.charAt(0).toUpperCase() + cleanSite.slice(1)
      }
    }
    return "Company"
  }

  const handleBookmarkToggle = async (job: JobWithInteraction, e: React.MouseEvent) => {
    e.stopPropagation()

    startTransition(async () => {
      await toggleJobBookmark(job.id)
    })
  }

  const columns: ColumnDef<JobWithInteraction>[] = [
    {
      accessorKey: "title",
      header: ({ column }) =>
        externalSorting ? (
          <div className="h-auto p-0 font-medium">Job Title</div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Job Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      enableSorting: !externalSorting,
      cell: ({ row }) => {
        const job = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium">{job.title}</div>
            <div className="text-sm text-muted-foreground">{getCompanyName(job)}</div>
          </div>
        )
      },
      size: 250,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const job = row.original
        const location = formatLocation(job)
        return (
          <div className="flex items-center gap-2">
            {job.location_country && (
              <Flag
                code={job.location_country}
                style={{ width: "16px", height: "12px" }}
                fallback={<span className="text-xs">{job.location_country}</span>}
              />
            )}
            <span className="text-sm">{location}</span>
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: "salary",
      header: ({ column }) =>
        externalSorting ? (
          <div className="h-auto p-0 font-medium">Salary</div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Salary
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      enableSorting: !externalSorting,
      cell: ({ row }) => {
        const job = row.original
        return <div className="text-sm">{formatSalary(job.min_salary, job.max_salary, job.currency || "USD")}</div>
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.min_salary || 0
        const b = rowB.original.min_salary || 0
        return a - b
      },
      size: 150,
    },
    {
      accessorKey: "job_type",
      header: "Type",
      cell: ({ row }) => {
        const job = row.original
        const jobTypes = []

        // Handle job_type which might be an array or string
        if (job.job_type) {
          if (Array.isArray(job.job_type)) {
            jobTypes.push(...job.job_type.slice(0, 2))
          } else if (typeof job.job_type === "string") {
            try {
              const parsedArray = JSON.parse(job.job_type)
              if (Array.isArray(parsedArray)) {
                jobTypes.push(...parsedArray.slice(0, 2))
              } else {
                jobTypes.push(job.job_type)
              }
            } catch {
              jobTypes.push(job.job_type)
            }
          }
        }

        if (job.is_remote) jobTypes.push("Remote")
        if (job.visa_sponsorship) jobTypes.push("Visa")

        return (
          <div className="flex flex-wrap gap-1">
            {jobTypes.slice(0, 3).map((type, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
            {jobTypes.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{jobTypes.length - 3}
              </Badge>
            )}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "date_posted",
      header: ({ column }) =>
        externalSorting ? (
          <div className="h-auto p-0 font-medium">Posted</div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Posted
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      enableSorting: !externalSorting,
      cell: ({ row }) => {
        const job = row.original
        if (!job.date_posted) return <span className="text-muted-foreground">Unknown</span>

        return (
          <span className="text-sm">{formatDistance(new Date(job.date_posted), new Date(), { addSuffix: true })}</span>
        )
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.date_posted ? new Date(rowA.original.date_posted).getTime() : 0
        const b = rowB.original.date_posted ? new Date(rowB.original.date_posted).getTime() : 0
        return b - a // Most recent first
      },
      size: 100,
    },
    {
      accessorKey: "relevance_score",
      header: ({ column }) =>
        externalSorting ? (
          <div className="h-auto p-0 font-medium">Match</div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Match
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      enableSorting: !externalSorting,
      cell: ({ row }) => {
        const job = row.original
        const score = job.relevance_score

        if (!score) return <span className="text-muted-foreground">-</span>

        let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
        let label = "Low"

        if (score >= 17) {
          variant = "default"
          label = "High"
        } else if (score >= 15) {
          variant = "secondary"
          label = "Medium"
        }

        return (
          <Badge variant={variant} className="text-xs">
            {label}
          </Badge>
        )
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.relevance_score || 0
        const b = rowB.original.relevance_score || 0
        return b - a
      },
      size: 80,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const job = row.original
        const isBookmarked = job.user_interaction?.is_favorite || false

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handleBookmarkToggle(job, e)}
              disabled={isPending}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current text-yellow-500" : ""}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onJobSelect(job)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(job.job_url, "_blank")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open job posting
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(job.job_url)}>
                  Copy job URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 100,
    },
  ]

  const table = useReactTable({
    data: jobs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: handleColumnVisibilityChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.column.columnDef.size,
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onJobSelect(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.columnDef.size,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and Controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <JobDataTableColumnToggle table={table} />
          <p className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} job(s) total</p>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
