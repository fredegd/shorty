"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bug, Search } from "lucide-react"
import { getUrlStats } from "@/lib/url-service"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function DebugPanel() {
    const [shortCode, setShortCode] = useState("")
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleCheck = async () => {
        if (!shortCode.trim()) {
            setError("Please enter a short code")
            return
        }

        setLoading(true)
        setError("")

        try {
            const result = await getUrlStats(shortCode)
            if (result.error) {
                setError(result.error)
                setStats(null)
            } else {
                setStats(result)
            }
        } catch (err) {
            setError("Failed to fetch stats")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (!isSupabaseConfigured) {
        return null // Don't show debug panel for localStorage mode
    }

    return (
        <Card className="mt-6 border-dashed border-orange-300 bg-orange-50">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg text-orange-800">Debug Panel</CardTitle>
                    <Badge variant="outline" className="text-xs">Development</Badge>
                </div>
                <p className="text-sm text-orange-700">Check click statistics for any short code</p>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter short code (e.g., abc123)"
                        value={shortCode}
                        onChange={(e) => setShortCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !loading && handleCheck()}
                        disabled={loading}
                    />
                    <Button
                        onClick={handleCheck}
                        disabled={loading || !shortCode.trim()}
                        size="icon"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {stats && (
                    <div className="space-y-2 p-3 bg-white rounded border">
                        <h4 className="font-medium text-gray-900">Statistics for: {shortCode}</h4>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Click Count:</span>
                                <span className="font-mono font-medium">{stats.click_count || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Accessed:</span>
                                <span className="font-mono text-xs">
                                    {stats.last_accessed
                                        ? new Date(stats.last_accessed).toLocaleString()
                                        : "Never"
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="font-mono text-xs">
                                    {new Date(stats.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
