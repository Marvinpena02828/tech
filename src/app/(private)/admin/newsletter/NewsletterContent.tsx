'use client'

import { useState } from 'react'
import { Trash2, Download, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Subscriber {
  id: string
  email: string
  subscribed_at: string
  is_active: boolean
}

export default function NewsletterContent({ subscribers: initialSubscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter()
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete subscriber ${email}?`)) return
    
    setIsDeleting(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('newsletter_subscriptions')
      .delete()
      .eq('id', id)
    
    setIsDeleting(null)
    
    if (error) {
      toast.error('Failed to delete subscriber')
    } else {
      toast.success('Subscriber deleted')
      setSubscribers(subscribers.filter(s => s.id !== id))
      router.refresh()
    }
  }

  const handleExport = () => {
    setIsExporting(true)
    
    const csv = [
      ['Email', 'Subscribed Date', 'Status'],
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.subscribed_at).toISOString(),
        sub.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    setIsExporting(false)
    toast.success('Exported successfully')
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Mail className="text-pink-600" size={32} />
                Newsletter Subscriptions
              </h1>
              <p className="text-gray-600 mt-1">Manage newsletter email subscribers ({subscribers.length} total)</p>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting || subscribers.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Table */}
        {subscribers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Mail className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No subscribers yet</h3>
            <p className="text-gray-600">Newsletter subscriptions will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{sub.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sub.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sub.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(sub.id, sub.email)}
                        disabled={isDeleting === sub.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                        title="Delete subscriber"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
