"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default function DebugDatabasePage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/database")
      if (response.ok) {
      const data = await response.json()
        setDebugData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch debug data")
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch debug data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Database Debug</h1>
          <div className="flex gap-2">
            <Button onClick={fetchDebugData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh Debug Data"}
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                setLoading(true)
                try {
                  const response = await fetch("/api/debug/fix-database", { method: "POST" })
                  if (response.ok) {
                    const result = await response.json()
                    alert("Database fixed successfully!")
                    fetchDebugData()
                  } else {
                    const error = await response.json()
                    alert(`Failed to fix database: ${error.error}`)
                  }
                } catch (error: any) {
                  alert(`Error: ${error.message}`)
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
            >
              Fix Database Structure
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-800 font-semibold">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {debugData && (
          <div className="space-y-6">
            {/* Counts */}
            <Card>
              <CardHeader>
                <CardTitle>Database Counts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Retros</p>
                    <p className="text-2xl font-bold">{debugData.counts.retros}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="text-2xl font-bold">{debugData.counts.participants}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retros Structure */}
            <Card>
              <CardHeader>
                <CardTitle>Retros Table Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Column</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Nullable</th>
                        <th className="text-left p-2">Default</th>
                        <th className="text-left p-2">Max Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debugData.retrosStructure.map((col: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-mono">{col.column_name}</td>
                          <td className="p-2">{col.data_type}</td>
                          <td className="p-2">{col.is_nullable}</td>
                          <td className="p-2">{col.column_default || "NULL"}</td>
                          <td className="p-2">{col.character_maximum_length || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Participants Structure */}
            <Card>
              <CardHeader>
                <CardTitle>Participants Table Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Column</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Nullable</th>
                        <th className="text-left p-2">Default</th>
                        <th className="text-left p-2">Max Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debugData.participantsStructure.map((col: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-mono">{col.column_name}</td>
                          <td className="p-2">{col.data_type}</td>
                          <td className="p-2">{col.is_nullable}</td>
                          <td className="p-2">{col.column_default || "NULL"}</td>
                          <td className="p-2">{col.character_maximum_length || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Foreign Keys */}
            <Card>
              <CardHeader>
                <CardTitle>Foreign Key Constraints</CardTitle>
              </CardHeader>
              <CardContent>
                {debugData.foreignKeys.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Constraint</th>
                          <th className="text-left p-2">Table</th>
                          <th className="text-left p-2">Column</th>
                          <th className="text-left p-2">References</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debugData.foreignKeys.map((fk: any, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-mono">{fk.constraint_name}</td>
                            <td className="p-2">{fk.table_name}</td>
                            <td className="p-2">{fk.column_name}</td>
                            <td className="p-2">{fk.foreign_table_name}.{fk.foreign_column_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No foreign key constraints found</p>
                )}
              </CardContent>
            </Card>

            {/* Latest Retros */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Retros</CardTitle>
              </CardHeader>
              <CardContent>
                {debugData.latestRetros.length > 0 ? (
                  <div className="space-y-2">
                    {debugData.latestRetros.map((retro: any, index: number) => (
                      <div key={index} className="p-3 border rounded">
                        <p className="font-semibold">{retro.title}</p>
                        <p className="text-sm text-gray-600">ID: {retro.id}</p>
                        <p className="text-sm text-gray-600">Status: {retro.status}</p>
                        <p className="text-sm text-gray-600">Created: {new Date(retro.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No retros found</p>
                )}
              </CardContent>
            </Card>

            {/* Latest Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Participants</CardTitle>
              </CardHeader>
              <CardContent>
                {debugData.latestParticipants.length > 0 ? (
                  <div className="space-y-2">
                    {debugData.latestParticipants.map((participant: any, index: number) => (
                      <div key={index} className="p-3 border rounded">
                        <p className="font-semibold">{participant.name}</p>
                        <p className="text-sm text-gray-600">Retro: {participant.retro_title}</p>
                        <p className="text-sm text-gray-600">Retro ID: {participant.retro_id}</p>
                        <p className="text-sm text-gray-600">Role: {participant.role || "N/A"}</p>
                        <p className="text-sm text-gray-600">Joined: {new Date(participant.joined_at).toLocaleString()}</p>
                      </div>
                    ))}
              </div>
                ) : (
                  <p className="text-gray-500">No participants found</p>
            )}
          </CardContent>
        </Card>
          </div>
        )}
      </div>
    </div>
  )
}
