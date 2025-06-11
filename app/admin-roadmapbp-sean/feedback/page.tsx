import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FeedbackPage() {
  // Fetch feedback data from Supabase
  const { data: feedbackData, error } = await supabase
    .from('feedback')
    .select(`
      *,
      roadmaps (
        id,
        user_input
      )
    `)
    .order('created_at', { ascending: false })

  // Handle error
  if (error) {
    console.error('Error fetching feedback:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Feedback Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading feedback data. Please try again later.</p>
          <p className="text-sm mt-2">Error details: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 py-8">
      <h1 className="text-2xl font-bold mb-6">Feedback Dashboard</h1>
      <Link 
        href="/admin"
        className="inline-block mb-6 text-blue-600 hover:underline dark:text-blue-400"
      >
        &larr; Back to Admin
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sentiment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Roadmap ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {feedbackData && feedbackData.length > 0 ? (
                feedbackData.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      <div>{new Date(feedback.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        feedback.sentiment === 'up'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {feedback.sentiment === 'up' ? 'Positive' : 'Negative'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {feedback.email || 'Not provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {feedback.roadmaps ? (
                        <div 
                         
                          className="text-slate-900 dark:text-slate-200"
                        >
                          {feedback.roadmaps.id}
                        </div>
                      ) : (
                        'Not associated with a roadmap'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No feedback data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 