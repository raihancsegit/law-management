'use client'

import { useState, useEffect,useRef ,type FC, type Dispatch, type SetStateAction, useTransition } from 'react'
import type { UserProfile } from '@/types/user'
import { updateUserProfileByAdmin } from '@/app/dashboard/users/actions'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { uploadClientFile, deleteClientFile, createSignedUrl,deleteCustomFolder  } from '@/app/actions/documentActions'
import ExpandableText from '@/components/ui/ExpandableText';
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
    const [predefinedFolders, setPredefinedFolders] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [customFolders, setCustomFolders] = useState<any[]>([]);

    useEffect(() => {
        async function loadDocumentsData() {
            setLoading(true);
            
            // const [profileRes, templateRes, filesRes] = await Promise.all([
            //     supabase.from('profiles').select('first_name, last_name, role, id').eq('id', userId).single(),
            //     supabase.from('folder_templates').select('structure').eq('id', 1).single(),
            //     supabase.from('client_files').select('*').eq('owner_id', userId)
            // ]);

            const [profileRes, templateRes, customFoldersRes, filesRes] = await Promise.all([
                supabase.from('profiles').select('first_name, last_name, role, id').eq('id', userId).single(),
                supabase.from('folder_templates').select('structure').eq('id', 1).single(),
                supabase.from('client_custom_folders').select('*').eq('owner_id', userId), // নতুন কোয়েরি
                supabase.from('client_files').select('*').eq('owner_id', userId)
            ]);
            
             if (profileRes.data) setProfile(profileRes.data);
            if (templateRes.data) setPredefinedFolders(templateRes.data.structure); // setPredefinedFolders ব্যবহার
            if (customFoldersRes.data) setCustomFolders(customFoldersRes.data); // নতুন state সেট করা
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

    const handleCustomFolderDeleteSuccess = (folderId: number) => {
        // customFolders state থেকে ডিলিট করা ফোল্ডারটি সরিয়ে দেওয়া হচ্ছে
        setCustomFolders(prev => prev.filter(f => f.id !== folderId));
    };

    const formattedCustomFolders = customFolders.map(f => ({
        id: `custom-${f.id}`,
        name: f.folder_name,
        description: f.description,
        icon: f.icon,
        isRequired: f.is_required,
        isCustom: true // কাস্টম ফোল্ডার চিহ্নিত করা
    }));

     const allFolders = [...predefinedFolders, ...formattedCustomFolders];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Client Documents</h4>
                <p className="text-gray-500">View and manage client's bankruptcy case documents</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {allFolders.map((folder) => (
                    <AdminFolderCard
                        key={folder.id}
                        folder={folder}
                        files={files.filter(f => f.folder_name === folder.name)}
                        profile={profile}
                        onUploadSuccess={handleUploadSuccess}
                        onDeleteSuccess={handleDeleteSuccess}
                        onCustomFolderDelete={handleCustomFolderDeleteSuccess} // নতুন প্রপ পাস করা
                    />
                ))}
            </div>
        </div>
    );
};


// AdminFolderCard (নতুন এবং ফিক্সড Helper কম্পוננט)
const AdminFolderCard = ({ folder, files, profile, onUploadSuccess, onDeleteSuccess,onCustomFolderDelete  }: {
    folder: any;
    files: any[];
    profile: any;
    onUploadSuccess: (newFile: any) => void;
    onDeleteSuccess: (fileId: number) => void;
    onCustomFolderDelete?: (folderId: number) => void;
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(e.target.files?.[0] || null);
    };

    const handleDeleteFolder = async () => {
        if (folder.isCustom && onCustomFolderDelete) {
            // folder.id থেকে 'custom-' অংশটি বাদ দিয়ে আসল ডেটাবেস আইডি নেওয়া হচ্ছে
            const folderId = parseInt(folder.id.replace('custom-', ''), 10);
            
            if (confirm(`Are you sure you want to delete the folder "${folder.name}"? This action cannot be undone and will delete all files inside.`)) {
                // সার্ভার অ্যাকশন কল করা হচ্ছে
                const result = await deleteCustomFolder(folderId);

                if (result.error) {
                    alert(`Failed to delete folder: ${result.error}`);
                } else {
                    alert('Folder deleted successfully!');
                    onCustomFolderDelete(folderId); // UI আপডেট করার জন্য প্যারেন্টকে জানানো
                }
            }
        }
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
        <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
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

                {folder.isCustom && onCustomFolderDelete && (
                    <button 
                        onClick={handleDeleteFolder} 
                        className="bg-black h-6 w-6 absolute top-2 right-2 text-white hover:text-red-600 p-1 rounded-full text-xs"
                        title="Delete custom folder"
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                )}
            </div>
           <div className="mb-4 flex-grow min-h-[48px]">
              <ExpandableText text={folder.description || ''} maxLength={80} />
            </div>
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


// ============== ApplicationDataTab (নতুন এবং পূর্ণাঙ্গ সংস্করণ) ==============
const ApplicationDataTab: FC<{ userId: string }> = ({ userId }) => {
    const supabase = createClientComponentClient();
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState<any | null>(null);

    useEffect(() => {
        async function loadApplicationData() {
            setLoading(true);
            const { data } = await supabase
                .from('form_submissions')
                .select('*')
                .eq('user_id', userId)
                // form_id=1 শুধুমাত্র Bankruptcy Application-এর জন্য
                .eq('form_id', 1) 
                .single();
            
            setSubmission(data);
            setLoading(false);
        }
        loadApplicationData();
    }, [userId, supabase]);
    
    if (loading) {
        return <div className="p-6 text-center">Loading application data...</div>;
    }
    
    if (!submission) {
        return <div className="p-6 text-center">No application submission found for this user.</div>;
    }
    
    // submission_data অবজেক্টটি বের করে আনা হচ্ছে
    const data = submission.submission_data || {};

    // Helper ফাংশন: ডেটা রেন্ডার করার জন্য
    const DataField = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <div>
            <span className="text-gray-500">{label}:</span>
            <div className="font-medium text-gray-900">{value || <span className="text-gray-400">N/A</span>}</div>
        </div>
    );
    
    const renderData = (key: string) => data[key] || <span className="text-gray-400">N/A</span>;
    const renderSignature = (key: string) => {
        return data[key] ? (
            <img src={data[key]} alt="Signature Preview" className="h-16 w-full object-contain bg-white rounded border" />
        ) : (
            <div className="flex items-center justify-center h-16 bg-white rounded border border-dashed">
                <span className="text-xs text-gray-500">No Signature</span>
            </div>
        );
    };

    return (
        <div className="p-4 max-h-[80vh] overflow-y-auto">
            <div className="mb-4">
                <h4 className="text-lg font-bold text-gray-900">Application Data</h4>
                <p className="text-sm text-gray-500 mt-1">Complete bankruptcy application information provided by the client.</p>
            </div>
            
            <div className="space-y-4">
                {/* Basic Information Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center mb-3"><div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 mr-2"><i className="fa-solid fa-user text-law-blue text-sm"></i></div><h5 className="text-sm font-medium text-gray-900">Basic Information</h5></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-3"><h6 className="text-xs font-medium uppercase">Primary Client</h6><div className="grid grid-cols-3 gap-2 text-xs">
                            <DataField label="Last Name" value={data['last_name_primary']} />
                            <DataField label="First Name" value={data['first_name_primary']} />
                            <DataField label="MI" value={data['mi_primary']} />
                        </div></div>
                        <div className="space-y-3"><h6 className="text-xs font-medium uppercase">Second Client</h6><div className="grid grid-cols-3 gap-2 text-xs">
                            <DataField label="Last Name" value={data['last_name_second']} />
                            <DataField label="First Name" value={data['first_name_second']} />
                            <DataField label="MI" value={data['mi_second']} />
                        </div></div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100"><h6 className="text-xs font-medium uppercase mb-2">Address Info</h6><div className="grid grid-cols-3 gap-3 text-xs">
                        <DataField label="City" value={data.city} />
                        <DataField label="State" value={data.state} />
                        <DataField label="ZIP Code" value={data.zip_code} />
                    </div></div>
                    <div className="mt-4 pt-3 border-t border-gray-100"><h6 className="text-xs font-medium uppercase mb-2">Contact Info</h6><div className="grid grid-cols-2 gap-3 text-xs">
                        <DataField label="Cell Phone" value={data.cell_phone} />
                        <DataField label="Home Phone" value={data.home_phone} />
                        <DataField label="Work Phone" value={data.work_phone} />
                        <DataField label="Best Phone" value={data.best_phone_to_reach_you} />
                        <DataField label="FAX" value={data.fax} />
                        <DataField label="Email" value={data.email} />
                    </div></div>
                </div>
                
                {/* Referral, Legal Problem, Notices */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center mb-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 mr-2">
                            <i className="fa-solid fa-share-nodes text-green-600 text-sm"></i>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900">Referral Information</h5>
                    </div>
                     <div className="text-xs space-y-3">
                         <DataField label="Referred by" value={data.how_were_you_referred_to_our_office} />
                         <DataField label="Legal Problem Description" value={<p className="leading-relaxed">{data['please_provide_a_brief_description_of_your_legal_problem']}</p>} />
                     </div>
                </div>

                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                     <div className="flex items-center mb-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 mr-2">
                            <i className="fa-solid fa-scale-balanced text-red-600 text-sm"></i>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900">Legal Problem Description</h5>
                    </div>
                     <div className="flex items-center text-xs">
                        {data['i_have_read_and_understand_the_legal_notices_above...'] === 'on' 
                          ? <><i className="fa-solid fa-check-circle text-green-500 mr-2"></i><span>Acknowledged</span></>
                          : <><i className="fa-solid fa-times-circle text-red-500 mr-2"></i><span>Not Acknowledged</span></>
                        }
                     </div>
                 </div>

                {/* Digital Signatures */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center mb-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 mr-2">
                            <i className="fa-solid fa-signature text-purple-600 text-sm"></i>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900">Digital Signatures</h5>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Primary Client Signature Section */}
                        <div className="space-y-2">
                            <h6 className="text-xs font-medium text-gray-700">Primary Client</h6>
                            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                {/* renderSignature ফাংশনটি এখন স্বাক্ষর প্রদর্শন করবে */}
                                {renderSignature('signature_primary')}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <DataField label="Date" value={data['date_primary']} />
                                <DataField label="Printed Name" value={data['printed_name_primary']} />
                            </div>
                        </div>
                        
                        {/* Second Client Signature Section */}
                        <div className="space-y-2">
                            <h6 className="text-xs font-medium text-gray-700">Second Client</h6>
                            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                {renderSignature('signature_second')}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <DataField label="Date" value={data['date_second']} />
                                <DataField label="Printed Name" value={data['printed_name_second']} />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Detailed Questions */}
               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center mb-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 mr-2">
                            <i className="fa-solid fa-clipboard-question text-indigo-600 text-sm"></i>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900">Detailed Questions</h5>
                    </div>
    
                    <div className="space-y-4 text-xs">
                        {/* প্রশ্ন ১: Prompt for bankruptcy */}
                        <div>
                            <span className="text-gray-500">What prompted you to look into bankruptcy:</span>
                            <p className="font-medium text-gray-900 mt-1 leading-relaxed">
                                {renderData('what_prompted_you_to_look_into_bankruptcy')}
                            </p>
                        </div>
                        
                        {/* প্রশ্ন ২: Residence History */}
                        <div className="pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-gray-500">Lived outside Colorado in past 2 years:</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    data.have_you_lived_anywhere_other_than_colorado_for_the_past_2_years === 'Yes' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {renderData('have_you_lived_anywhere_other_than_colorado_for_the_past_2_years')}
                                </span>
                            </div>
                            {/* কন্ডিশনাল ডিটেইলস */}
                            {data.have_you_lived_anywhere_other_than_colorado_for_the_past_2_years === 'Yes' && (
                                <div className="ml-4 grid grid-cols-2 gap-2">
                                    <DataField label="Where" value={data.where_did_you_live} />
                                    <DataField label="When" value={data.when_did_you_live_there} />
                                </div>
                            )}
                        </div>
                        
                        {/* প্রশ্ন ৩: Creditor Payments */}
                        <div className="pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-gray-500">Paid creditors $600 in last 90 days:</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    data.have_you_paid_any_creditors_more_than_$600_in_the_last_90_days === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {renderData('have_you_paid_any_creditors_more_than_$600_in_the_last_90_days')}
                                </span>
                            </div>
                            {/* কন্ডিশনাল ডিটেইলস */}
                            {data.have_you_paid_any_creditors_more_than_$600_in_the_last_90_days === 'Yes' && (
                                <div className="ml-4">
                                    <DataField label="Details" value={data['please_provide_details_about_these_payments']} />
                                </div>
                            )}
                        </div>
                        
                        {/* প্রশ্ন ৪: Housing Payments */}
                        <div className="pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-xs text-gray-500">Behind on mortgage/rent payments:</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    data.are_you_behind_on_mortgage_or_rent_payments === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {renderData('are_you_behind_on_mortgage_or_rent_payments')}
                                </span>
                            </div>
                            {/* কন্ডিশনাল ডিটেইলস */}
                            {data.are_you_behind_on_mortgage_or_rent_payments === 'Yes' && (
                                <div className="ml-4 space-y-2">
                                    <DataField label="Details" value={data['please_provide_details_about_missed_payments']} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center space-x-2">
                                            {data['in_foreclosure'] === 'on' 
                                            ? <i className="fa-solid fa-check-circle text-green-500"></i>
                                            : <i className="fa-solid fa-times-circle text-red-500"></i>
                                            }
                                            <span>In foreclosure</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {data['eviction'] === 'on'
                                            ? <i className="fa-solid fa-check-circle text-green-500"></i>
                                            : <i className="fa-solid fa-times-circle text-red-500"></i>
                                            }
                                            <span>Eviction proceedings</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* প্রশ্ন ৫: Assets Owned */}
                        <div className="pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500 block mb-2">Assets owned:</span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {/* প্রতিটির জন্য চেক করে আইকন দেখানো হবে */}
                                <div className="flex items-center space-x-2">
                                    {data.do_you_own_any_of_the_following_real_estate_property ? <i className="fa-solid fa-check-circle text-green-500"></i> : <i className="fa-solid fa-times-circle text-red-500"></i>}
                                    <span>Real estate property</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {data.do_you_own_any_of_the_following_vehicles ? <i className="fa-solid fa-check-circle text-green-500"></i> : <i className="fa-solid fa-times-circle text-red-500"></i>}
                                    <span>Vehicle(s)</span>
                                </div>
                                {/* ... বাকি asset গুলোর জন্য একইভাবে ... */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application Status Card (নতুন এবং পূর্ণাঙ্গ সংস্করণ) */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center mb-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 mr-2">
                            <i className="fa-solid fa-info-circle text-law-blue text-sm"></i>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900">Application Status</h5>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        {/* Submitted Date */}
                        <div>
                            <span className="text-gray-500">Submitted:</span>
                            <p className="font-medium text-gray-900">
                                {submission.created_at ? new Date(submission.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        
                        {/* Status */}
                        <div>
                            <span className="text-gray-500">Status:</span>
                            {/* স্ট্যাটাস অনুযায়ী ডাইনামিক ব্যাজ */}
                            {submission.status ? (
                                <span className={`px-2 py-1 rounded-full font-medium capitalize ${
                                    submission.status === 'submitted' ? 'bg-amber-100 text-amber-800' :
                                    submission.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {submission.status.replace(/_/g, ' ')}
                                </span>
                            ) : (
                                <p className="font-medium text-gray-400">N/A</p>
                            )}
                        </div>
                        
                        {/* Last Updated Date */}
                        <div>
                            <span className="text-gray-500">Last Updated:</span>
                            <p className="font-medium text-gray-900">
                                {submission.updated_at ? new Date(submission.updated_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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