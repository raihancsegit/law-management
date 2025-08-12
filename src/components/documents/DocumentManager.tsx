'use client';
import { useState, useRef, ChangeEvent ,useEffect} from 'react';
import { uploadClientFile, deleteClientFile, createCustomFolder,deleteUserCustomFolderByAdmin  } from '@/app/actions/documentActions';

// Create Folder Modal Component (এই ফাইলের ভেতরেই)
const CreateFolderModal = ({ onClose, onSave }: { 
    onClose: () => void, 
    onSave: (data: any) => Promise<{ error?: string | null }> 
}) => {
    const [formData, setFormData] = useState({
        folderName: '', description: '', icon: 'fa-folder', isRequired: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
          const { checked } = e.target as HTMLInputElement;
          setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await onSave(formData);
        setIsLoading(false);
        if (!result.error) {
            onClose();
        } else {
            alert(result.error);
        }
    };
    
    const iconOptions = [
      { value: 'fa-user', label: 'User' },
      { value: 'fa-chart-line', label: 'Financial' },
      { value: 'fa-credit-card', label: 'Credit/Debt' },
      { value: 'fa-home', label: 'Property' },
      { value: 'fa-dollar-sign', label: 'Income' },
      { value: 'fa-gavel', label: 'Legal' },
      { value: 'fa-folder', label: 'General (Default)' },
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
              <h3 className="text-lg font-bold mb-4">Create New Folder</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Folder Name *</label>
                    <input name="folderName" value={formData.folderName} onChange={handleChange} required className="w-full p-2 border rounded-lg"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg"/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Icon</label>
                        <select name="icon" value={formData.icon} onChange={handleChange} className="w-full p-2 border rounded-lg">
                           {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Requirement</label>
                        <select name="isRequired" value={String(formData.isRequired)} onChange={(e) => setFormData(prev => ({...prev, isRequired: e.target.value === 'true'}))} className="w-full p-2 border rounded-lg">
                           <option value="false">Optional</option>
                           <option value="true">Required</option>
                        </select>
                      </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
                      <button type="submit" disabled={isLoading} className="px-4 py-2 bg-law-blue text-white rounded-lg text-sm disabled:bg-gray-400">
                          {isLoading ? 'Creating...' : 'Create Folder'}
                      </button>
                  </div>
              </form>
          </div>
      </div>
    );
};

// একটি একক ফোল্ডার কার্ডের জন্য কম্পোনেন্ট
const FolderCard = ({ folder, files, clientRootPath, userId, onUploadSuccess, onDeleteSuccess, isAdminView = false }: {
  folder: any;
  files: any[];
  clientRootPath: string;
  userId: string;
  onUploadSuccess: (newFiles: any[], folderName: string) => void;
  onDeleteSuccess: (fileId: number, folderName: string) => void;
  isAdminView?: boolean;
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
      
      // ফিক্স: শুধুমাত্র অ্যাডমিন ভিউতেই ownerId পাঠানো হবে।
      // ক্লায়েন্ট ভিউতে, সার্ভার অ্যাকশন নিজে থেকেই সেশন থেকে আইডি নেবে।
      if (isAdminView) {
        formData.append('ownerId', userId);
      }

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
    if (confirm(`Are you sure you want to delete this file? This action cannot be undone.`)) {
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

// মূল DocumentManager কম্পোনेंट (আপডেট করা)
export default function DocumentManager({
  predefinedFolders, 
  customFolders: initialCustomFolders, 
  initialFiles, 
  clientRootPath, 
  userId, 
  isAdminView = false
}: {
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
      if (!grouped[file.folder_name]) grouped[file.folder_name] = [];
      grouped[file.folder_name].push(file);
    });
    return grouped;
  });

  const [customFolders, setCustomFolders] = useState(initialCustomFolders);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [allFolders, setAllFolders] = useState(() => {
    const formattedCustomFolders = initialCustomFolders.map(f => ({
      id: `custom-${f.id}`,
      name: f.folder_name,
      description: f.description,
      icon: f.icon,
      isRequired: f.is_required,
      isCustom: true // কাস্টম ফোল্ডার চিহ্নিত করার জন্য
    }));
    return [...predefinedFolders, ...formattedCustomFolders];
  });

  useEffect(() => {
    const formattedCustomFolders = initialCustomFolders.map(f => ({
      id: `custom-${f.id}`,
      name: f.folder_name,
      description: f.description,
      icon: f.icon,
      isRequired: f.is_required,
      isCustom: true,
    }));
    setAllFolders([...predefinedFolders, ...formattedCustomFolders]);
  }, [initialCustomFolders, predefinedFolders]);

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
  
 const handleCreateFolder = async (folderData: any) => {
    const result = await createCustomFolder(folderData);
    if (result.success && result.data) {
      const newFolder = {
        id: `custom-${result.data.id}`,
        name: result.data.folder_name,
        description: result.data.description,
        icon: result.data.icon,
        isRequired: result.data.is_required,
        isCustom: true,
      };
      // এখন একটি মাত্র state, `allFolders`-কে আপডেট করা হচ্ছে
      setAllFolders(prev => [...prev, newFolder]);
    }
    return { error: result.error || null };
  };

 

  return (
    <div id="documents-section" className={isAdminView ? '' : 'p-6'}>
      <div className={isAdminView ? '' : 'max-w-6xl mx-auto'}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{isAdminView ? 'Client Documents' : 'My Documents'}</h3>
            <p className="text-gray-500">{isAdminView ? 'Manage this client’s documents' : 'Upload and manage your case documents'}</p>
          </div>
          {!isAdminView && (
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300">
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
              userId={userId}
              onUploadSuccess={handleUploadSuccess}
              onDeleteSuccess={handleDeleteSuccess}
              isAdminView={isAdminView}
            />
          ))}
           {allFolders.length === 0 && (
                <p className="text-center text-gray-500 py-10 col-span-full">
                    Folders for this client have not been generated yet.
                </p>
            )}
        </div>
      </div>
      
      {isModalOpen && <CreateFolderModal onClose={() => setIsModalOpen(false)} onSave={handleCreateFolder} />}
    </div>
  );
}



