"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { getOriginalUrl, trackClick } from "@/lib/url-service"
import { getBaseUrl } from "@/lib/utils"

export default function RedirectPage() {
  const params = useParams()
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const shortCode = params.shortCode as string

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const { url, error: fetchError } = await getOriginalUrl(shortCode)

        if (fetchError || !url) {
          setError(fetchError || "URL not found")
          return
        }

        setOriginalUrl(url)

        // Track the click
        await trackClick(shortCode)

        // Auto-redirect after 0.1 seconds
        setTimeout(() => {
          window.location.href = url
        }, 100)
      } catch (err) {
        setError("Failed to load URL")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUrl()
  }, [shortCode])

  const handleRedirect = () => {
    if (originalUrl) {
      window.location.href = originalUrl
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your URL...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !originalUrl) {
    const baseUrl = getBaseUrl()
    const displayDomain = baseUrl.replace('https://', '').replace('http://', '')

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h1 className="text-xl font-semibold text-gray-900">URL Not Found</h1>
            <p className="text-gray-600">
              The short URL <code className="bg-gray-100 px-2 py-1 rounded">{displayDomain}/{shortCode}</code> doesn't exist
              or has expired.
            </p>
            <Link href="/">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Create New Short URL
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <ExternalLink className="h-12 w-12 text-indigo-600 mx-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Redirecting...</h1>
            <p className="text-gray-600">You'll be redirected to:</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm font-mono break-all text-gray-800">{originalUrl}</p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleRedirect} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <ExternalLink className="h-4 w-4 mr-2" />
              Go Now
            </Button>

            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shorty
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-500">Automatic redirect in 3 seconds...</p>
        </CardContent>
      </Card>
    </div>
  )
}
