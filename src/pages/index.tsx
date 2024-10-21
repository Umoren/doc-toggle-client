import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Users, FolderOpen } from 'lucide-react'

// Mock data (replace with actual data fetching)
const mockStats = {
  totalCategories: 5,
  totalDocuments: 25,
  totalUsers: 10
}

const mockRecentActivity = [
  { id: 1, type: 'document', action: 'created', title: 'Q1 Financial Report', user: 'John Doe', timestamp: '2024-01-20T10:30:00Z' },
  { id: 2, type: 'category', action: 'updated', title: 'Marketing', user: 'Jane Smith', timestamp: '2024-01-19T15:45:00Z' },
  { id: 3, type: 'document', action: 'deleted', title: 'Old Project Proposal', user: 'Mike Johnson', timestamp: '2024-01-18T09:15:00Z' },
]

export default function Home() {
  const [stats, setStats] = useState(mockStats)
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity)

  // Simulating data fetching
  useEffect(() => {
    // Replace with actual API calls
    const fetchData = async () => {
      // const statsResponse = await fetch('/api/stats')
      // const stats = await statsResponse.json()
      // setStats(stats)

      // const activityResponse = await fetch('/api/recent-activity')
      // const activity = await activityResponse.json()
      // setRecentActivity(activity)
    }

    fetchData()
  }, [])

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Welcome to Document Manager</h1>
        <p className="text-xl mb-8">
          Efficiently manage your documents, categories, and user roles all in one place.
        </p>

        {/* Summary Statistics */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Category
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Document
          </Button>
        </div>

        {/* Recent Activity Feed */}
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="p-4">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{activity.user}</h3>
                        <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {activity.action} {activity.type} "{activity.title}"
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}