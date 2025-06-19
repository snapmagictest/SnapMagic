export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          SnapMagic
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered image and video transformation for AWS events
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🚀 Coming Soon
          </h2>
          <p className="text-gray-600">
            Transform your selfies into amazing AI-generated images and videos!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              📸 Transform Pictures
            </h3>
            <p className="text-gray-600 text-sm">
              Turn your selfies into creative AI-generated images
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🎬 Transform Videos
            </h3>
            <p className="text-gray-600 text-sm">
              Create short video reels from your photos
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              👍 Rate Experience
            </h3>
            <p className="text-gray-600 text-sm">
              Share your feedback with gesture recognition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
