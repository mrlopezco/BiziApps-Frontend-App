import { getSavedSearches } from "@/lib/actions/saved-searches"
import { SavedSearchesPageContent } from "@/components/settings/saved-searches/saved-searches-page-content"

export default async function SavedSearchesPage() {
  const savedSearches = await getSavedSearches()

  return <SavedSearchesPageContent savedSearches={savedSearches} />
}
