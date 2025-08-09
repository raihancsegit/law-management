'use client';
import { useState, useRef, ChangeEvent } from 'react';
import { uploadClientFile, deleteClientFile } from '@/app/actions/documentActions';

// একটি একক ফোল্ডার কার্ডের জন্য কম্পোনেন্ট
const FolderCard = ({ folder, files, clientRootPath, userId, onUploadSuccess, onDeleteSuccess }: {
  folder: any;
  files: any[];
  clientRootPath: string;
  userId: string;
  onUploadSuccess: (newFiles: any[], folderName: string) => void;
  onDeleteSuccess: (fileId: number, folderName: string) => void;
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(event.target.files);
    } else {
      setSelectedFiles(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please choose one or more files to upload.');
      return;
    }

    setIsUploading(true);
    const newUploadedFiles = [];

    for (const file of Array.from(selectedFiles)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderName', folder.name);
      formData.append('clientRootPath', clientRootPath);
      // ownerId আর ক্লায়েন্ট থেকে পাঠানো হচ্ছে না, সার্ভার অ্যাকশন নিজে আইডি নেবে।
      // formData.append('ownerId', userId); 

      const result = await uploadClientFile(formData);

      if (result.error) {
        alert(`Upload failed for ${file.name}: ${result.error}`);
        break;
      } else {
        newUploadedFiles.push(result.data);
      }
    }
    
    setIsUploading(false);
    if (newUploadedFiles.length > 0) {
        alert(`${newUploadedFiles.length} file(s) uploaded successfully!`);
        onUploadSuccess(newUploadedFiles, folder.name);
    }
    
    setSelectedFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileId: number, storagePath: string) => {
    if (confirm(`Are you sure you want to delete this file?`)) {
        const result = await deleteClientFile(fileId, storagePath);
        if (result.error) {
            alert('Delete failed: ' + result.error);
        } else {
            alert('File deleted successfully!');
            onDeleteSuccess(fileId, folder.name);
        }
    }
  };
  
  const iconMap: { [key: string]: { icon: string, bg: string, text: string } } = {
      'Financial': { icon: 'fa-chart-line', bg: 'bg-green-100', text: 'text-green-600' },
      'Property': { icon: 'fa-home', bg: 'bg-blue-100', text: 'text-law-blue' },
      'Debt': { icon: 'fa-receipt', bg: 'bg-red-100', text: 'text-red-600' },
      'Income': { icon: 'fa-dollar-sign', bg: 'bg-purple-100', text: 'text-purple-600' },
      'Legal': { icon: 'fa-gavel', bg: 'bg-indigo-100', text: 'text-indigo-600' },
      'Other': { icon: 'fa-file', bg: 'bg-gray-100', text: 'text-gray-600' },
      'Personal': { icon: 'fa-user', bg: 'bg-pink-100', text: 'text-pink-600' },
  };
  
  const folderStyle = iconMap[folder.name.split(' ')[0]] || iconMap['Other'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
      <div className="flex items-center mb-4">
        <div className={`flex items-center justify-center h-10 w-10 rounded-full ${folderStyle.bg} mr-3`}>
          <i className={`fa-solid ${folder.icon || 'fa-folder'} ${folderStyle.text}`}></i>
        </div>
        <div>
          <h4 className="text-lg font-medium text-gray-900">{folder.name}</h4>
          <span className={`text-xs px-2 py-1 rounded-full ${folder.isRequired ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
            {folder.isRequired ? 'Required' : 'Optional'}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-4 flex-grow">{folder.description}</p>
      
      <div className="space-y-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-law-blue hover:text-law-blue transition-colors duration-200"
        >
          <i className="fa-solid fa-cloud-upload-alt mr-2"></i>
          Choose Files
        </button>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
        
        {selectedFiles && selectedFiles.length > 0 && 
            <p className="text-xs text-center text-gray-500 truncate" title={Array.from(selectedFiles).map(f => f.name).join(', ')}>
                Selected: {Array.from(selectedFiles).map(f => f.name).join(', ')}
            </p>
        }

        <button
          onClick={handleUpload}
          disabled={!selectedFiles || isUploading}
          className="w-full px-4 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isUploading ? (
            <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Uploading...</>
          ) : (
            <><i className="fa-solid fa-upload mr-2"></i>Upload Files</>
          )}
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Uploaded files:</p>
          <div className="space-y-1">
            {files.map((file: any) => (
              <div key={file.id} className="flex items-center justify-between text-xs group">
                <div className="flex items-center truncate">
                  <i className="fa-solid fa-check text-green-500 mr-2"></i>
                  <span className="text-gray-700 truncate" title={file.file_name}>{file.file_name}</span>
                </div>
                <button
                  onClick={() => handleDelete(file.id, file.storage_path)}
                  className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  title="Delete file"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// মূল DocumentManager কম্পোনেন্ট
export default function DocumentManager({ predefinedFolders, customFolders, initialFiles, clientRootPath, userId, isAdminView = false }: {
  predefinedFolders: any[];
  customFolders: any[];
  initialFiles: any[];
  clientRootPath: string;
  userId: string;
  isAdminView?: boolean;
}) {
  const [filesByFolder, setFilesByFolder] = useState(() => {
    const grouped: Record<string, any[]> = {};
    initialFiles.forEach((file: any) => {
      if (!grouped[file.folder_name]) {
        grouped[file.folder_name] = [];
      }
      grouped[file.folder_name].push(file);
    });
    return grouped;
  });

  const handleUploadSuccess = (newFiles: any[], folderName: string) => {
    setFilesByFolder(prev => ({
      ...prev,
      [folderName]: [...(prev[folderName] || []), ...newFiles],
    }));
  };

  const handleDeleteSuccess = (fileId: number, folderName: string) => {
    setFilesByFolder(prev => ({
        ...prev,
        [folderName]: prev[folderName].filter(file => file.id !== fileId),
    }));
  };

  const allFolders = [...predefinedFolders, ...customFolders];

  return (
    <div id="documents-section" className={isAdminView ? '' : 'p-6'}>
      <div className={isAdminView ? '' : 'max-w-6xl mx-auto'}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{isAdminView ? 'Client Documents' : 'My Documents'}</h3>
            <p className="text-gray-500">{isAdminView ? 'Manage this client’s documents' : 'Upload and manage your case documents'}</p>
          </div>
          {!isAdminView && (
            <button className="px-4 py-2 bg-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300">
              <i className="fa-solid fa-folder-plus mr-2"></i>Create Custom Folder
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {allFolders.map((folder: any) => (
            <FolderCard
              key={folder.id || folder.name}
              folder={folder}
              files={filesByFolder[folder.name] || []}
              clientRootPath={clientRootPath}
              userId={userId} // অ্যাডমিন ভিউয়ের জন্য এটি এখনও প্রয়োজন হতে পারে
              onUploadSuccess={handleUploadSuccess}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ))}
           {allFolders.length === 0 && (
                <p className="text-center text-gray-500 py-10 col-span-full">
                    Folders for this client have not been generated yet. Please convert the user to a 'client' from the admin panel.
                </p>
            )}
        </div>
      </div>
    </div>
  );
}