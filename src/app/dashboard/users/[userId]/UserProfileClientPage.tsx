'use client'

import { useState, useEffect,useRef ,type FC, type Dispatch, type SetStateAction, useTransition } from 'react'
import type { UserProfile } from '@/types/user'
import { updateUserProfileByAdmin } from '@/app/dashboard/users/actions'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { uploadClientFile, deleteClientFile, createSignedUrl } from '@/app/actions/documentActions'

// Props-এর জন্য টাইপ সংজ্ঞা
interface ClientPageProps {
    initialProfile: UserProfile & { email?: string };
}

interface ProfileDetailsTabProps {
    profile: UserProfile & { email?: string };
    setProfile: Dispatch<SetStateAction<UserProfile & { email?: string }>>;
    isEditing: boolean;
}

// ============== Helper Components (Tabs) ==============

// এটি Profile Details ট্যাবের জন্য একটি আলাদা কম্পোনেন্ট
const ProfileDetailsTab: FC<ProfileDetailsTabProps> = ({ profile, setProfile, isEditing }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    }
    
    return (
        <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                {/* Personal Information */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input id="full_name" type="text" value={`${profile.first_name || ''} ${profile.last_name || ''}`} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input id="email" type="email" value={profile.email || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input id="phone_number" type="tel" value={profile.phone_number || ''} onChange={handleInputChange} disabled={!isEditing} className={`w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Internal Notes Section */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h4>
                        <textarea id="internal_notes" rows={5} value={profile.internal_notes || ''} onChange={handleInputChange} disabled={!isEditing} className={`w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} placeholder="Add internal notes about this client/lead..."></textarea>
                    </div>
                </div>
                {/* Admin Editable Fields */}
                <div className="lg:col-span-2 space-y-6">
                     <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Admin Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                                <select id="role" value={profile.role || ''} onChange={handleInputChange} disabled={!isEditing} className={`w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${!isEditing ? 'bg-gray-100 appearance-none cursor-not-allowed' : 'bg-white'}`}>
                                    <option value="lead">Lead</option>
                                    <option value="client">Client</option>
                                    <option value="attorney">Attorney</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Case Status</label>
                                <select id="status" value={profile.status || ''} onChange={handleInputChange} disabled={!isEditing} className={`w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${!isEditing ? 'bg-gray-100 appearance-none cursor-not-allowed' : 'bg-white'}`}>
                                    <option value="not_applied">Not Applied</option>
                                    <option value="application_in_progress">In Progress</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                                <select id="case_type" value={profile.case_type || ''} onChange={handleInputChange} disabled={!isEditing} className={`w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${!isEditing ? 'bg-gray-100 appearance-none cursor-not-allowed' : 'bg-white'}`}>
                                    <option value="">Not Set</option>
                                    <option value="chapter-7">Chapter 7</option>
                                    <option value="chapter-13">Chapter 13</option>
                                    <option value="consultation">Consultation</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DocumentsTab: FC<{ userId: string }> = ({ userId }) => {
    const supabase = createClientComponentClient();
    const [loading, setLoading] = useState(true);
    const [folders, setFolders] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        async function loadDocumentsData() {
            setLoading(true);
            const [profileRes, templateRes, filesRes] = await Promise.all([
                supabase.from('profiles').select('first_name, last_name, role, id').eq('id', userId).single(),
                supabase.from('folder_templates').select('structure').eq('id', 1).single(),
                supabase.from('client_files').select('*').eq('owner_id', userId)
            ]);
            
            if (profileRes.data) setProfile(profileRes.data);
            if (templateRes.data) setFolders(templateRes.data.structure);
            if (filesRes.data) setFiles(filesRes.data);
            setLoading(false);
        }
        loadDocumentsData();
    }, [userId, supabase]);
    
    if (loading) { return <div className="p-6 text-center">Loading documents...</div>; }
    if (profile && profile.role !== 'client') { return <div className="p-6 text-center">Document management is for 'client' roles only.</div>; }

    const handleUploadSuccess = (newFile: any) => {
        // নতুন ফাইলটি files state-এ যোগ করা হচ্ছে
        setFiles(prev => [...prev, newFile]);
    };
    
    const handleDeleteSuccess = (fileId: number) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Client Documents</h4>
                <p className="text-gray-500">View and manage client's bankruptcy case documents</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {folders.map((folder) => (
                    <AdminFolderCard
                        key={folder.id}
                        folder={folder}
                        files={files.filter(f => f.folder_name === folder.name)}
                        profile={profile}
                        onUploadSuccess={handleUploadSuccess}
                        onDeleteSuccess={handleDeleteSuccess}
                    />
                ))}
            </div>
        </div>
    );
};


// AdminFolderCard (নতুন এবং ফিক্সড Helper কম্পוננט)
const AdminFolderCard = ({ folder, files, profile, onUploadSuccess, onDeleteSuccess }: {
    folder: any;
    files: any[];
    profile: any;
    onUploadSuccess: (newFile: any) => void;
    onDeleteSuccess: (fileId: number) => void;
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(e.target.files?.[0] || null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }
        setIsUploading(true);
        const clientFolderName = `${profile.last_name}_${profile.first_name}_${profile.id}`.toLowerCase().replace(/\s+/g, '_');
        const rootPath = `client-documents/${clientFolderName}`;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folderName', folder.name);
        formData.append('clientRootPath', rootPath);
        formData.append('ownerId', profile.id);

        const result = await uploadClientFile(formData);
        setIsUploading(false);

        if (result.error) {
            alert(`Upload failed: ${result.error}`);
        } else {
            alert('File uploaded successfully!');
            onUploadSuccess(result.data);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    const handleDelete = async (fileId: number, storagePath: string) => {
        if (confirm('Are you sure you want to delete this file?')) {
            const result = await deleteClientFile(fileId, storagePath);
            if (result.error) {
                alert(`Delete failed: ${result.error}`);
            } else {
                alert('File deleted successfully!');
                onDeleteSuccess(fileId);
            }
        }
    };
    
    const handleView = async (storagePath: string) => {
        const result = await createSignedUrl(storagePath);
        if (result.success && result.url) {
            window.open(result.url, '_blank');
        } else {
            alert('Could not view file: ' + result.error);
        }
    };
    
    const handleDownload = async (storagePath: string) => {
        const result = await createSignedUrl(storagePath, { download: true });
        if (result.success && result.url) {
            const a = document.createElement('a');
            a.href = result.url;
            a.download = storagePath.split('/').pop() || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert('Could not download file: ' + result.error);
        }
    };
    
    const iconMap: { [key: string]: { icon: string; bg: string; text: string } } = {
        'Financial': { icon: 'fa-chart-line', bg: 'bg-green-100', text: 'text-green-600' },
        'Property': { icon: 'fa-home', bg: 'bg-blue-100', text: 'text-blue-600' },
        'Debt': { icon: 'fa-receipt', bg: 'bg-red-100', text: 'text-red-600' },
        'Income': { icon: 'fa-dollar-sign', bg: 'bg-purple-100', text: 'text-purple-600' },
        'Legal': { icon: 'fa-gavel', bg: 'bg-indigo-100', text: 'text-indigo-600' },
        'Other': { icon: 'fa-file', bg: 'bg-gray-100', text: 'text-gray-600' },
        'Personal': { icon: 'fa-user', bg: 'bg-pink-100', text: 'text-pink-600' },
    };
    const folderStyle = iconMap[folder.name.split(' ')[0]] || iconMap['Other'];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
                <div className={`flex items-center justify-center h-12 w-12 rounded-lg ${folderStyle.bg} mr-4`}>
                    <i className={`fa-solid ${folder.icon} ${folderStyle.text} text-xl`}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">{folder.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${folder.isRequired ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {folder.isRequired ? 'Required' : 'Optional'}
                        </span>
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">{folder.description}</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                 <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                 <i className="fa-solid fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
                 <p className="text-sm text-gray-600 mb-2">Upload document for client</p>
                 <button 
                     onClick={selectedFile ? handleUpload : () => fileInputRef.current?.click()} 
                     disabled={isUploading} 
                     className="px-4 py-2 bg-law-blue text-white rounded-lg text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                 >
                     {isUploading ? 'Uploading...' : (selectedFile ? 'Upload Selected File' : 'Choose File')}
                 </button>
                 {selectedFile && <p className="text-xs text-gray-500 mt-2 truncate" title={selectedFile.name}>Selected: {selectedFile.name}</p>}
            </div>
            <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Client uploaded files:</p>
                <div className="space-y-1">
                    {files.length > 0 ? files.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between text-xs group">
                           <div className="flex items-center min-w-0 flex-1">
                                <i className="fa-solid fa-file-pdf text-red-500 mr-2"></i>
                                <span className="text-gray-700 truncate" title={file.file_name}>{file.file_name}</span>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                <button onClick={() => handleView(file.storage_path)} className="text-gray-500 hover:text-blue-600 opacity-50 group-hover:opacity-100" title="View"><i className="fa-solid fa-eye"></i></button>
                                <button onClick={() => handleDownload(file.storage_path)} className="text-gray-500 hover:text-green-600 opacity-50 group-hover:opacity-100" title="Download"><i className="fa-solid fa-download"></i></button>
                                <button onClick={() => handleDelete(file.id, file.storage_path)} className="text-gray-500 hover:text-red-600 opacity-50 group-hover:opacity-100" title="Delete"><i className="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    )) : ( <p className="text-xs text-gray-400 italic">No files uploaded yet</p> )}
                </div>
            </div>
        </div>
    );
};


const ApplicationDataTab: FC<{ userId: string }> = ({ userId }) => {
    return <div className="p-6">Content for application data will go here. User ID: {userId}</div>
}

const FinancialQuestionnaireTab: FC<{ userId:string }> = ({ userId }) => {
    return <div className="p-6">Content for financial questionnaire will go here. User ID: {userId}</div>
}


// ============== মূল ডিফল্ট এক্সপোর্ট কম্পোনেন্ট ==============
export default function UserProfileClientPage({ initialProfile }: ClientPageProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(initialProfile);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const avatarSrc = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff`;

    const handleSave = () => {
        setMessage(null);
        startTransition(async () => {
            const updates: Partial<UserProfile> = {
                role: profile.role,
                status: profile.status,
                case_type: profile.case_type,
                phone_number: profile.phone_number,
                internal_notes: profile.internal_notes,
            };

            const result = await updateUserProfileByAdmin(profile.id, updates);
            
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setIsEditing(false);
                router.refresh();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        });
    }
    
    const handleCancel = () => {
        setIsEditing(false);
        setProfile(initialProfile);
        setMessage(null);
    }
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header Section */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                    <Link href="/dashboard/users" className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <i className="fa-solid fa-arrow-left"></i>
                    </Link>
                    <div className="flex items-center">
                        <Image src={avatarSrc} alt={fullName} width={48} height={48} className="w-12 h-12 rounded-full mr-4 object-cover" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
                            <p className="text-sm text-gray-500">User ID: #{profile.id.substring(0, 8)}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isPending} className="px-4 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-700 text-sm">
                            <i className="fa-solid fa-edit mr-2"></i>
                            Edit User
                        </button>
                    )}
                </div>
            </div>
            
            {message && (
                <div className={`m-4 p-4 text-sm rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'profile' ? 'border-law-blue text-law-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <i className="fa-solid fa-user mr-2"></i>
                        Profile Details
                    </button>
                    <button onClick={() => setActiveTab('documents')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'documents' ? 'border-law-blue text-law-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <i className="fa-solid fa-folder mr-2"></i>
                        Documents
                    </button>
                    <button onClick={() => setActiveTab('application')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'application' ? 'border-law-blue text-law-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <i className="fa-solid fa-file-alt mr-2"></i>
                        Application Data
                    </button>
                    <button onClick={() => setActiveTab('financial')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'financial' ? 'border-law-blue text-law-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <i className="fa-solid fa-calculator mr-2"></i>
                        Financial Questionnaire
                    </button>
                </nav>
            </div>
            
            {/* Conditional Tab Content */}
            <div>
                {activeTab === 'profile' && <ProfileDetailsTab profile={profile} setProfile={setProfile} isEditing={isEditing} />}
                {activeTab === 'documents' && <DocumentsTab userId={initialProfile.id} />}
                {activeTab === 'application' && <ApplicationDataTab userId={initialProfile.id} />}
                {activeTab === 'financial' && <FinancialQuestionnaireTab userId={initialProfile.id} />}
            </div>
        </div>
    )
}