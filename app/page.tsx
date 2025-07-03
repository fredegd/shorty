"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Link, Check, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createShortUrl, isValidUrl } from "@/lib/url-service"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function Home() {
  const [url, setUrl] = useState("")
  const [shortenedUrl, setShortenedUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Handle URL shortening
  const handleShorten = async () => {
    setError("")
    setShortenedUrl("")
    setCopied(false)
    setLoading(true)

    try {
      if (!url.trim()) {
        setError("Please enter a URL")
        return
      }

      if (!isValidUrl(url)) {
        setError("URL must start with http:// or https://")
        return
      }

      const { shortCode, error: dbError, isLocal } = await createShortUrl(url)

      if (dbError) {
        setError(dbError)
        return
      }

      // Set shortened URL
      const shortened = `https://shorty.app/${shortCode}`
      setShortenedUrl(shortened)
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Handle redirect (simulate clicking on short URL)
  const handleRedirect = () => {
    const shortCode = shortenedUrl.split("/").pop()
    if (shortCode) {
      window.open(`/${shortCode}`, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Link className="h-8 w-8 text-indigo-600" />
              <CardTitle className="text-3xl font-bold text-gray-900">Shorty</CardTitle>
            </div>
            <p className="text-gray-600">Make your URLs short and sweet</p>
            {isSupabaseConfigured ? (
              <p className="text-xs text-green-600 font-medium">✅ Cloud storage enabled</p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-amber-600 font-medium">⚠️ Using local storage (browser only)</p>
                <p className="text-xs text-gray-500">Add Supabase integration for universal URLs</p>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="Paste your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 text-base"
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleShorten()}
                  disabled={loading}
                />
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                onClick={handleShorten}
                className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700"
                disabled={!url.trim() || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Short URL...
                  </>
                ) : (
                  "Shorten URL"
                )}
              </Button>
            </div>

            {shortenedUrl && (
              <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Your shortened URL:</p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 p-3 bg-white rounded border text-sm font-mono cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={handleRedirect}
                  >
                    {shortenedUrl}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopy}
                    className="h-12 w-12 bg-white hover:bg-gray-50"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {copied && <p className="text-sm text-green-600 font-medium">Copied to clipboard!</p>}
                <div className="space-y-1">
                  {isSupabaseConfigured ? (
                    <p className="text-xs text-gray-600">✅ This URL works from any device, anywhere!</p>
                  ) : (
                    <p className="text-xs text-amber-600">⚠️ This URL only works in this browser</p>
                  )}
                  <p className="text-xs text-gray-600">Click the URL above to test the redirect</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
