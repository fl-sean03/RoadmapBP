import Link from 'next/link'
import { MessageSquare, BarChart, Database } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feedback Card */}
        <Link href="/admin-roadmapbp-sean/feedback" className="block">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">User Feedback</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              View and analyze user feedback for generated roadmaps
            </p>
            <div className="text-blue-600 dark:text-blue-400 font-medium">
              View Feedback &rarr;
            </div>
          </div>
        </Link>

       
      </div>
    </div>
  )
} 