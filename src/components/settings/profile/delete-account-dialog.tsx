"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { deleteUserAccount } from "@/lib/account-actions"
import { useToast } from "@/components/ui/use-toast"

export function DeleteAccountDialog() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleDeleteAccount() {
    if (!email || !password) {
      toast({
        description: "Please enter your email and password to confirm",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await deleteUserAccount({ email, password })

      if (result?.error) {
        toast({
          description: result.message || "Failed to delete account",
          variant: "destructive",
        })
      } else {
        toast({
          description: "Account deleted successfully",
          variant: "default",
        })
        setIsOpen(false)
        // Redirect is handled by the server action
      }
    } catch {
      // Removed 'err' from here
      toast({
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleCancel() {
    setIsOpen(false)
    setEmail("")
    setPassword("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove all your data from our
            servers.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Once you delete your account, there is no going back. Please be certain.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="delete-email" className="text-sm font-medium">
              Confirm your email address
            </Label>
            <Input
              id="delete-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delete-password" className="text-sm font-medium">
              Confirm your password
            </Label>
            <Input
              id="delete-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
