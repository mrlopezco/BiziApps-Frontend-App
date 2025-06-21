"use client"

import { useState } from "react"
import { SavedSearch } from "@/lib/database.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  MapPin,
  Briefcase,
  Building,
  Home,
  DollarSign,
} from "lucide-react"
import { deleteSavedSearch, updateSavedSearchLastUsed } from "@/lib/actions/saved-searches"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/components/ui/use-toast"

interface SavedSearchesPageContentProps {
  savedSearches: SavedSearch[]
}

export function SavedSearchesPageContent({ savedSearches: initialSavedSearches }: SavedSearchesPageContentProps) {
  const [savedSearches, setSavedSearches] = useState(initialSavedSearches)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleUseSearch = async (savedSearch: SavedSearch) => {
    setLoading(savedSearch.id)

    try {
      // Update last used timestamp
      await updateSavedSearchLastUsed(savedSearch.id)

      // Build query parameters
      const params = new URLSearchParams()

      if (savedSearch.job_role) params.append("job_role", savedSearch.job_role)
      if (savedSearch.primary_product) params.append("primary_product", savedSearch.primary_product)
      if (savedSearch.location_country) params.append("location_country", savedSearch.location_country)
      if (savedSearch.job_type) params.append("job_type", savedSearch.job_type)
      if (savedSearch.remote) params.append("remote", "true")
      if (savedSearch.has_salary) params.append("has_salary", "true")

      // Navigate to jobs page with filters
      const url = `/jobs${params.toString() ? `?${params.toString()}` : ""}`
      router.push(url)

      toast({
        title: "Search Applied",
        description: `Navigating to jobs with "${savedSearch.name}" filters applied.`,
      })
    } catch (error) {
      console.error("Error using saved search:", error)
      toast({
        title: "Error",
        description: "Failed to apply saved search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteSearch = async (id: string) => {
    try {
      const result = await deleteSavedSearch(id)
      if (result.success) {
        setSavedSearches((prev) => prev.filter((search) => search.id !== id))
        toast({
          title: "Search Deleted",
          description: "Your saved search has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete search. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting saved search:", error)
      toast({
        title: "Error",
        description: "Failed to delete search. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getFilterBadges = (savedSearch: SavedSearch) => {
    const badges = []

    if (savedSearch.job_role) {
      badges.push({ label: savedSearch.job_role.replace(/_/g, " "), icon: <Briefcase className="h-3 w-3" /> })
    }
    if (savedSearch.primary_product) {
      badges.push({ label: savedSearch.primary_product.replace(/_/g, " "), icon: <Building className="h-3 w-3" /> })
    }
    if (savedSearch.location_country) {
      badges.push({ label: savedSearch.location_country.replace(/_/g, " "), icon: <MapPin className="h-3 w-3" /> })
    }
    if (savedSearch.job_type) {
      badges.push({ label: savedSearch.job_type.replace(/_/g, " "), icon: <Briefcase className="h-3 w-3" /> })
    }
    if (savedSearch.remote) {
      badges.push({ label: "Remote", icon: <Home className="h-3 w-3" /> })
    }
    if (savedSearch.has_salary) {
      badges.push({ label: "With Salary", icon: <DollarSign className="h-3 w-3" /> })
    }

    return badges
  }

  if (savedSearches.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Saved Searches</h2>
            <p className="text-muted-foreground mb-6">
              Save your job searches to quickly access them later. Go to the jobs page, set your filters, and save them.
            </p>
            <Button onClick={() => router.push("/jobs")} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Browse Jobs
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Saved Searches</h1>
            <p className="text-muted-foreground mt-2">Quickly access your saved job search filters</p>
          </div>
          <Button onClick={() => router.push("/jobs")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Search
          </Button>
        </div>

        <div className="grid gap-6">
          {savedSearches.map((savedSearch) => (
            <Card key={savedSearch.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{savedSearch.name}</CardTitle>
                    {savedSearch.description && (
                      <CardDescription className="mt-2">{savedSearch.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUseSearch(savedSearch)}
                      disabled={loading === savedSearch.id}
                      className="gap-2"
                    >
                      {loading === savedSearch.id ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Use Search
                        </>
                      )}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Saved Search</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &quot;{savedSearch.name}&quot;? This action cannot be
                            undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button onClick={() => handleDeleteSearch(savedSearch.id)}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filter badges */}
                  <div className="flex flex-wrap gap-2">
                    {getFilterBadges(savedSearch).map((badge, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 capitalize">
                        {badge.icon}
                        {badge.label}
                      </Badge>
                    ))}
                    {getFilterBadges(savedSearch).length === 0 && <Badge variant="outline">No specific filters</Badge>}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {formatDistanceToNow(new Date(savedSearch.created_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Search className="h-4 w-4" />
                      Last used {formatDistanceToNow(new Date(savedSearch.last_used_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
