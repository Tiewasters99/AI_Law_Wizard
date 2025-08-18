'use client'

import Layout from '@/components/Layout'
import OneDriveInterface from '@/components/OneDriveInterface'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

export default function OneDrivePage() {
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    toast({
      title: "File Selected",
      description: `"${file.name}" has been selected and is ready for processing.`,
    })
  }

  const handleFolderSelect = (folderId: string, folderName: string) => {
    toast({
      title: "Folder Selected",
      description: `Opened folder: "${folderName}"`,
    })
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OneDrive Integration
          </h1>
          <p className="text-gray-600">
            Browse, upload, and manage your OneDrive files directly from the AI Wizard.
          </p>
        </div>

        <div className="grid gap-6">
          {/* OneDrive Interface */}
          <OneDriveInterface
            onFileSelect={handleFileSelect}
            onFolderSelect={handleFolderSelect}
            showUpload={true}
            showDownload={true}
            className="w-full"
          />

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Selected File
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Type:</strong> {selectedFile.type || 'Unknown'}</p>
                <p><strong>Last Modified:</strong> {new Date(selectedFile.lastModified).toLocaleString()}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How to Use OneDrive
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• <strong>Browse Files:</strong> Click on folders to navigate through your OneDrive</p>
              <p>• <strong>Search:</strong> Use the search box to find specific files</p>
              <p>• <strong>Upload:</strong> Select a file and click &quot;Upload&quot; to add it to OneDrive</p>
              <p>• <strong>Download:</strong> Click the &quot;Download&quot; button to save files locally</p>
              <p>• <strong>Select Files:</strong> Click on any file to select it for processing</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
