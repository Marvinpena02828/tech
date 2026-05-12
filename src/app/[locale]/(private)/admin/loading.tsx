export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading admin panel...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait</p>
      </div>
    </div>
  )
}
