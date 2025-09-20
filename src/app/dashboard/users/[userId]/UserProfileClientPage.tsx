'use client'

import { useState, useEffect,useRef ,useMemo,type FC, type Dispatch, type SetStateAction, useTransition } from 'react'
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

const FinancialQuestionnaireTab: FC<{ userId: string }> = ({ userId }) => {
    const supabase = createClientComponentClient();
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState<any | null>(null);
    const [clientProfile, setClientProfile] = useState<any | null>(null);
    const [activeSection, setActiveSection] = useState(1);

    useEffect(() => {
        async function loadFinancialData() {
            setLoading(true);
            
            // একই সাথে ক্লায়েন্টের প্রোফাইল এবং আর্থিক প্রশ্নপত্রের ডেটা আনা হচ্ছে
            const [profileRes, submissionRes] = await Promise.all([
                supabase.from('profiles').select('first_name, last_name').eq('id', userId).single(),
                supabase.from('form_submissions').select('*').eq('user_id', userId).eq('form_id', 2).maybeSingle()
            ]);
            
            if (profileRes.data) setClientProfile(profileRes.data);
            if (submissionRes.data) {
                setSubmission(submissionRes.data);
                console.log("SECTION 3 DATA:", submissionRes.data.submission_data);
            }
            
            setLoading(false);
        }
        loadFinancialData();
    }, [userId, supabase]);

    // আর্থিক সারাংশ গণনা করার জন্য useMemo ব্যবহার করা হয়েছে
    const financialSummary = useMemo(() => {
        const data = submission?.submission_data || {};
        
        // مثال: এখানে আপনার submission_data-এর ফিল্ড অনুযায়ী অ্যাসেট এবং ডেট গণনা করতে হবে
        // আমি কিছু কাল্পনিক ফিল্ড ব্যবহার করছি
        const totalAssets = (parseFloat(data.primaryResidenceValue || 0) + parseFloat(data.vehicle1Value || 0) + parseFloat(data.bankAccountBalance || 0));
        const totalDebts = (parseFloat(data.mortgageBalance || 0) + parseFloat(data.creditCard1Balance || 0) + parseFloat(data.studentLoanBalance || 0));
        const netWorth = totalAssets - totalDebts;

        return {
            totalAssets,
            totalDebts,
            netWorth,
            // স্ট্যাটাসও ডাইনামিকভাবে নির্ধারণ করা যেতে পারে
            status: submission?.status || 'In Progress'
        };
    }, [submission]);

    if (loading) {
        return <div className="p-6 text-center">Loading financial questionnaire data...</div>;
    }

    if (!submission) {
        return <div className="p-6 text-center">No financial questionnaire submission found for this user.</div>;
    }

    const submissionData = submission.submission_data || {};
    
    // সেকশনগুলোর জন্য একটি কনফিগারেশন অবজেক্ট
    const sections = [
        { num: 1, title: 'Basic Information', icon: 'fa-user' },
        { num: 2, title: 'Assets & Property', icon: 'fa-home' },
        { num: 3, title: 'Debts & Liabilities', icon: 'fa-credit-card' },
        { num: 4, title: 'Leases & Contracts', icon: 'fa-file-contract' },
        { num: 5, title: 'Current Income', icon: 'fa-dollar-sign' },
        { num: 6, title: 'Current Expenses', icon: 'fa-shopping-cart' }
    ];

    // Helper কম্পোনেন্ট: প্রতিটি সেকশনের ডেটা প্রদর্শনের জন্য
    const SectionContent = ({ sectionNumber }: { sectionNumber: number }) => {
        // এখানে প্রতিটি সেকশনের জন্য বিস্তারিত UI তৈরি হবে
        // আপাতত আপনার দেওয়া HTML অনুযায়ী UI তৈরি করা হলো
        switch(sectionNumber) {
            case 1: { // Added curly braces for block scope
            // একটি ছোট Helper কম্পোনেন্ট যা প্রতিটি ডেটা ফিল্ডকে সুন্দরভাবে রেন্ডার করে
            const DataRow = ({ label, value, fullWidth = false }: { label: string; value: React.ReactNode; fullWidth?: boolean }) => (
                <div className={fullWidth ? 'md:col-span-2' : ''}>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                    <div className="text-sm font-medium text-gray-800 mt-1 break-words">
                        {value !== undefined && value !== null && value !== '' ? value : <span className="italic text-gray-400">Not Provided</span>}
                    </div>
                </div>
            );
            
            // Marital Status ফরম্যাট করার জন্য একটি Helper ফাংশন
            const formatMaritalStatus = (status: string) => {
                const map: { [key: string]: string } = {
                    'never_married': 'Never Married',
                    'married_together': 'Married and living together',
                    'widowed': 'Widowed',
                    'married_apart': 'Married and living apart',
                    'divorced': 'Divorced'
                };
                return map[status] || status;
            };

            // কন্ডিশনাল UI-এর জন্য ভ্যারিয়েবল
            const showPreviousAddress = submissionData.lived180Days === 'no' || submissionData.lived730Days === 'no';
            const isMarried = ['married_together', 'married_apart'].includes(submissionData.maritalStatus);
            const showSpousePreviousAddress = submissionData.spouseLived180Days === 'no' || submissionData.spouseLived730Days === 'no';

            return (
                <div className="p-6">
                    {/* সেকশনের হেডার */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Section 1: Personal & Financial History</h3>
                            <p className="text-sm text-gray-600 mt-1">Client's personal, residency, and bankruptcy history.</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {/* Part A: Name and Address */}
                        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-user mr-2 text-law-blue"></i>Part A. Name and Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <DataRow label="Full Name" value={submissionData.fullName} fullWidth={true} />
                                <DataRow label="Used other names in past 8 years?" value={submissionData.otherNames} />
                                {submissionData.otherNames === 'yes' && <DataRow label="Other Names Details" value={<p className="whitespace-pre-wrap">{submissionData.otherNamesDetail}</p>} fullWidth={true}/>}
                                <DataRow label="Used business names/EIN in past 8 years?" value={submissionData.businessNames} />
                                {submissionData.businessNames === 'yes' && <DataRow label="Business Names Details" value={<p className="whitespace-pre-wrap">{submissionData.businessNamesDetail}</p>} fullWidth={true}/>}
                                <DataRow label="Home Phone" value={submissionData.homePhone} />
                                <DataRow label="Work Phone" value={submissionData.workPhone} />
                                <DataRow label="Cell Phone" value={submissionData.cellPhone} />
                                <DataRow label="Email Address" value={submissionData.email} />
                                <DataRow label="Social Security Number" value={`***-**-${submissionData.ssn3 || 'XXXX'}`} />
                                <DataRow label="Date of Birth" value={submissionData.dateOfBirth} />
                                <DataRow label="Driver's License Number" value={submissionData.licenseNumber} />
                                <DataRow label="License Expiration Date" value={submissionData.licenseExpiration} />
                                <DataRow label="License State" value={submissionData.licenseState} />
                                <DataRow label="Current Address" value={submissionData.currentAddress} fullWidth={true} />
                                <DataRow label="City" value={submissionData.city} />
                                <DataRow label="State" value={submissionData.state} />
                                <DataRow label="ZIP Code" value={submissionData.zipCode} />
                                <DataRow label="County" value={submissionData.county} />
                                <DataRow label="Lived at this address for at least 180 days?" value={submissionData.lived180Days} />
                                <DataRow label="Lived at this address for at least 2 years?" value={submissionData.lived730Days} />
                                {showPreviousAddress && (
                                    <div className="md:col-span-2 mt-4 p-4 border-t border-blue-200">
                                        <h4 className="text-md font-medium text-gray-800 mb-4">Previous Address</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            <DataRow label="Address" value={submissionData.previousAddress} fullWidth={true} />
                                            <DataRow label="City" value={submissionData.previousCity} />
                                            <DataRow label="State" value={submissionData.previousState} />
                                            <DataRow label="ZIP Code" value={submissionData.previousZip} />
                                            <DataRow label="County" value={submissionData.previousCounty} />
                                        </div>
                                    </div>
                                )}
                                <div className="md:col-span-2 mt-4 p-4 border-t border-blue-200">
                                        <h4 className="text-md font-medium text-gray-800 mb-4">Mailing Address (if different)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            <DataRow label="Address" value={submissionData.mailingAddress} fullWidth={true} />
                                            <DataRow label="City" value={submissionData.mailingCity} />
                                            <DataRow label="State" value={submissionData.mailingState} />
                                            <DataRow label="ZIP Code" value={submissionData.mailingZip} />
                                            <DataRow label="County" value={submissionData.mailingCounty} />
                                        </div>
                                </div>
                                <DataRow label="Marital Status" value={formatMaritalStatus(submissionData.maritalStatus)} fullWidth={true} />
                            </div>
                        </div>

                        {/* Part B: Spouse Information (Conditional) */}
                        {isMarried && (
                            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-heart mr-2 text-law-blue"></i>Part B. Name and Address of Spouse</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <DataRow label="Spouse's Full Name" value={submissionData.spouseFullName} fullWidth={true} />
                                    <DataRow label="Spouse used other names?" value={submissionData.spouseOtherNames} />
                                    {submissionData.spouseOtherNames === 'yes' && <DataRow label="Details" value={<p className="whitespace-pre-wrap">{submissionData.spouseOtherNamesDetail}</p>} fullWidth={true} />}
                                    <DataRow label="Spouse used business names?" value={submissionData.spouseBusinessNames} />
                                    {submissionData.spouseBusinessNames === 'yes' && <DataRow label="Details" value={<p className="whitespace-pre-wrap">{submissionData.spouseBusinessNamesDetail}</p>} fullWidth={true} />}
                                    <DataRow label="Spouse Home Phone" value={submissionData.spouseHomePhone} />
                                    <DataRow label="Spouse Work Phone" value={submissionData.spouseWorkPhone} />
                                    <DataRow label="Spouse Cell Phone" value={submissionData.spouseCellPhone} />
                                    <DataRow label="Spouse Email" value={submissionData.spouseEmail} />
                                    <DataRow label="Spouse SSN" value={`***-**-${submissionData.spouseSsn3 || 'XXXX'}`} />
                                    <DataRow label="Spouse DOB" value={submissionData.spouseDateOfBirth} />
                                    <DataRow label="Spouse Lives at Different Address" value={submissionData.spouseDifferentAddress} fullWidth={true} />
                                    {showSpousePreviousAddress && (
                                        <div className="md:col-span-2 mt-4 p-4 border-t border-green-200">
                                            <h4 className="text-md font-medium text-gray-800 mb-4">Spouse's Previous Address</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                <DataRow label="Address" value={submissionData.spousePreviousAddress} fullWidth={true}/>
                                                <DataRow label="City" value={submissionData.spousePreviousCity}/>
                                                <DataRow label="State" value={submissionData.spousePreviousState}/>
                                                <DataRow label="ZIP" value={submissionData.spousePreviousZip}/>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Part C: Prior Bankruptcy Cases */}
                        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                             <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-gavel mr-2 text-law-blue"></i>Part C. Prior and/or Pending Bankruptcy Cases</h2>
                            <div className="space-y-4">
                                <DataRow label="Filed bankruptcy in last 8 years?" value={submissionData.bankruptcyLast8Years} />
                                {submissionData.bankruptcyLast8Years === 'yes' && (
                                    <div className="mt-4 p-4 border-t border-yellow-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            <DataRow label="District & State" value={submissionData.bankruptcyDistrict} />
                                            <DataRow label="Case Number" value={submissionData.bankruptcyCaseNumber} />
                                            <DataRow label="Date Filed" value={submissionData.bankruptcyDateFiled} />
                                            <DataRow label="Date Discharged" value={submissionData.bankruptcyDateDischarged} />
                                            <DataRow label="Case Dismissed?" value={submissionData.bankruptcyDismissed} />
                                            {submissionData.bankruptcyDismissed === 'yes' && <DataRow label="Dismissal Date" value={submissionData.bankruptcyDismissalDate} />}
                                        </div>
                                    </div>
                                )}
                                <DataRow label="Related bankruptcy cases pending?" value={submissionData.relatedBankruptcyCases} />
                                {submissionData.relatedBankruptcyCases === 'yes' && (
                                    <div className="mt-4 p-4 border-t border-yellow-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            <DataRow label="Debtor Name" value={submissionData.relatedDebtorName} />
                                            <DataRow label="Relationship" value={submissionData.relatedDebtorRelationship} />
                                            <DataRow label="Case Number" value={submissionData.relatedCaseNumber} />
                                            <DataRow label="Date Filed" value={submissionData.relatedDateFiled} />
                                            <DataRow label="District" value={submissionData.relatedDistrict} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Other Parts (D, E, F) */}
                         <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-home mr-2 text-law-blue"></i>Part D. Tenants of Residential Property</h2>
                            <DataRow label="Eviction pending?" value={submissionData.evictionPending} />
                            {submissionData.evictionPending === 'yes' && (
                                <div className="mt-4 p-4 border-t border-red-200">
                                    <h4 className="text-md font-medium text-gray-800 mb-4">Landlord's Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <DataRow label="Landlord Name" value={submissionData.landlordName} />
                                        <DataRow label="Address" value={submissionData.landlordAddress} fullWidth={true} />
                                        <DataRow label="City" value={submissionData.landlordCity} />
                                        <DataRow label="State" value={submissionData.landlordState} />
                                        <DataRow label="ZIP" value={submissionData.landlordZip} />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                             <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-briefcase mr-2 text-law-blue"></i>Part E. Sole Proprietor of Business</h2>
                            <DataRow label="Are you a sole proprietor?" value={submissionData.soleProprietor} />
                             {submissionData.soleProprietor === 'yes' && (
                                <div className="mt-4 p-4 border-t border-purple-200">
                                    <h4 className="text-md font-medium text-gray-800 mb-4">Business Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <DataRow label="Business Name" value={submissionData.businessName} />
                                        <DataRow label="Address" value={submissionData.businessAddress} fullWidth={true} />
                                        <DataRow label="Description" value={<p className="whitespace-pre-wrap">{submissionData.businessDescription}</p>} fullWidth={true} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-exclamation-triangle mr-2 text-law-blue"></i>Part F. Hazardous Property</h2>
                            <DataRow label="Own hazardous property?" value={submissionData.hazardousProperty} fullWidth={true} />
                             {submissionData.hazardousProperty === 'yes' && (
                                <div className="mt-4 p-4 border-t border-orange-200">
                                    <div className="space-y-4">
                                        <DataRow label="Hazard Description" value={<p className="whitespace-pre-wrap">{submissionData.hazardDescription}</p>} />
                                        <DataRow label="Reason for Immediate Attention" value={<p className="whitespace-pre-wrap">{submissionData.immediateAttentionReason}</p>} />
                                        <DataRow label="Property Address" value={submissionData.hazardousPropertyAddress} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Prior Filings */}
                        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-file-alt mr-2 text-law-blue"></i>Prior Bankruptcy Filings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <DataRow label="Case No. 1" value={submissionData.priorCaseNo1} />
                                <DataRow label="Date 1" value={submissionData.priorCaseDate1} />
                                <DataRow label="Case No. 2" value={submissionData.priorCaseNo2} />
                                <DataRow label="Date 2" value={submissionData.priorCaseDate2} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        } 
        
              case 2: { // Added block scope
            const submissionData = submission?.submission_data || {};

            // Helper to format numbers as currency
            const formatCurrency = (value: any) => {
                const num = parseFloat(value);
                return isNaN(num) ? 'N/A' : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            };
            
            // Helper to display owner info
            const formatOwner = (owner: string, otherDetails?: string) => {
                if (owner === 'other' && otherDetails) {
                    return `Other: ${otherDetails}`;
                }
                return owner ? owner.charAt(0).toUpperCase() + owner.slice(1) : 'N/A';
            };

            // Reusable component to display a single data point
            const DataField = ({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) => (
                <div className={className}>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                    <div className="text-sm font-medium text-gray-800 mt-1 break-words">
                        {(value !== undefined && value !== null && value !== '') ? value : <span className="italic text-gray-400">Not Provided</span>}
                    </div>
                </div>
            );

            // Reusable component for single asset categories (Part C, E, F, etc.)
            const PropertyItemDisplay = ({ title, name, children, borderColorClass = 'border-gray-200' }: {
                title: string; name: string; children?: React.ReactNode; borderColorClass?: string;
            }) => {
                const hasPropertyKey = `has_${name}`;
                const hasProperty = submissionData[hasPropertyKey] === 'yes';

                return (
                    <div className={`p-4 bg-white rounded-lg border ${borderColorClass}`}>
                        <h3 className="text-md font-medium text-gray-800">{title}</h3>
                        {children && <p className="text-xs text-gray-500 mb-3">{children}</p>}
                        
                        {!hasProperty ? (
                            <p className="text-sm text-gray-500 italic mt-2">Client has indicated they do not own this type of property.</p>
                        ) : (
                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DataField label="Description" value={<p className="whitespace-pre-wrap">{submissionData[`${name}_description`]}</p>} />
                                <DataField label="Value" value={formatCurrency(submissionData[`${name}_value`])} />
                                <DataField label="Owned by" value={formatOwner(submissionData[`${name}_owner`], submissionData[`${name}_owner_other`])} />
                            </div>
                        )}
                    </div>
                );
            };

            const personalProperties = [ { name: 'householdGoods', title: 'Household Goods and Furnishings' }, /* ... অন্যান্য আইটেম */ ];
            // ... (অন্যান্য property array গুলো আপনার ফর্ম কম্পোনেন্ট থেকে কপি করতে পারেন) ...
            
            return (
                <div className="p-6">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                        <div><h3 className="text-xl font-semibold text-gray-900">Section 2: Assets & Property</h3><p className="text-sm text-gray-600 mt-1">A detailed list of the client's assets.</p></div>
                    </div>

                    <div className="space-y-12">
                        {/* Part A: Real Estate */}
                        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-home mr-2 text-law-blue"></i>Part A. Real Estate</h2>
                            {submissionData.noRealEstate ? (<p className="italic text-gray-600">Client has indicated they do not own any real estate property.</p>) : (
                                <div className="space-y-6">
                                    {(submissionData.realEstate || []).map((property: any, index: number) => (
                                        <div key={property.id || index} className="p-6 bg-white rounded-lg border border-green-300">
                                            <h3 className="text-lg font-medium text-gray-800 mb-4">Property #{index + 1}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <DataField label="Address & Description" value={<p className="whitespace-pre-wrap">{property.address}</p>} className="md:col-span-2" />
                                                <DataField label="Property Types" value={(property.propertyType || []).join(', ')} />
                                                <DataField label="Estimated Value" value={formatCurrency(property.value)} />
                                                <DataField label="Owned by" value={formatOwner(property.owner, property.ownerOther)} />
                                                <DataField label="Ownership %" value={property.ownershipPercentage ? `${property.ownershipPercentage}%` : 'N/A'} />
                                                
                                                <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                                                    <h4 className="text-md font-medium text-gray-800 mb-4">Mortgage/Lien Details</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <DataField label="Issuer" value={<p className="whitespace-pre-wrap">{property.mortgageIssuer}</p>} className="md:col-span-2" />
                                                        <DataField label="Amount" value={formatCurrency(property.mortgageAmount)} />
                                                        <DataField label="Interest Rate" value={property.mortgageRate ? `${property.mortgageRate}%` : 'N/A'} />
                                                        <DataField label="Monthly Payment" value={formatCurrency(property.mortgagePayment)} />
                                                        <DataField label="Payments Left" value={property.mortgagePaymentLeft} />
                                                        <DataField label="Payment Includes Taxes/Insurance?" value={property.paymentIncludes} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(submissionData.realEstate || []).length === 0 && <p className="italic text-gray-600">No real estate properties listed.</p>}
                                </div>
                            )}
                        </div>

                        {/* Part B: Vehicles */}
                        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-car mr-2 text-law-blue"></i>Part B. Vehicles</h2>
                            {submissionData.noVehicles ? (<p className="italic text-gray-600">Client has indicated they do not own any vehicles.</p>) : (
                                <div className="space-y-6">
                                    {(submissionData.vehicles || []).map((vehicle: any, index: number) => (
                                        <div key={vehicle.id || index} className="p-4 bg-white rounded-lg border border-blue-300">
                                            <h3 className="text-lg font-medium text-gray-800 mb-4">Vehicle #{index + 1}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <DataField label="Type" value={vehicle.type} />
                                                <DataField label="Year" value={vehicle.year} />
                                                <DataField label="Make" value={vehicle.make} />
                                                <DataField label="Model" value={vehicle.model} />
                                                <DataField label="Mileage" value={vehicle.mileage ? `${parseInt(vehicle.mileage).toLocaleString()} miles` : 'N/A'} />
                                                <DataField label="Value" value={formatCurrency(vehicle.value)} />
                                                <DataField label="Owned by" value={formatOwner(vehicle.owner, vehicle.ownerOther)} />
                                                <DataField label="Other Info" value={<p className="whitespace-pre-wrap">{vehicle.otherInfo}</p>} className="md:col-span-2 lg:col-span-3"/>
                                            </div>
                                        </div>
                                    ))}
                                    {(submissionData.vehicles || []).length === 0 && <p className="italic text-gray-600">No vehicles listed.</p>}
                                </div>
                            )}
                        </div>
                        
                        {/* Part C: Personal and Household Items */}
                        <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-box mr-2 text-law-blue"></i>Part C. Personal and Household Items</h2>
                            <div className="space-y-4">
                                {['householdGoods', 'electronics', 'collectibles', 'sportsEquipment', 'firearms', 'clothing', 'jewelry', 'pets', 'healthAids'].map(name => (
                                    <PropertyItemDisplay key={name} title={name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} name={name} borderColorClass="border-purple-300"/>
                                ))}
                            </div>
                        </div>

                        {/* Part D: Financial Assets */}
                        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-money-bill mr-2 text-law-blue"></i>Part D. Financial Assets</h2>
                            <div className="space-y-6">
                                {/* Repeatable Account Sections */}
                                {['checkingAccounts', 'savingsAccounts', 'otherFinancialAccounts'].map(accountType => (
                                    <div key={accountType}>
                                        <h3 className="text-lg font-medium text-gray-800 my-4">{accountType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                                        {(submissionData[accountType] || []).length === 0 ? (<p className="italic text-gray-600 px-4">No {accountType.replace('Accounts', '').toLowerCase()} accounts listed.</p>) :
                                        (submissionData[accountType].map((account: any, index: number) => (
                                            <div key={account.id || index} className="p-4 bg-white rounded-lg border border-yellow-300 mb-4">
                                                <h4 className="text-md font-medium text-gray-800 mb-2">Account #{index + 1}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <DataField label="Description" value={<p className="whitespace-pre-wrap">{account.description}</p>} />
                                                    <DataField label="Value" value={formatCurrency(account.value)} />
                                                    <DataField label="Owned By" value={formatOwner(account.owner, account.ownerOther)} />
                                                </div>
                                            </div>
                                        )))}
                                    </div>
                                ))}
                                {/* Single Entry Financial Assets */}
                                <div className="space-y-4 pt-6 border-t border-yellow-200">
                                    {['cash', 'bonds', 'nonPublicStocks', 'governmentBonds', 'retirement1', 'retirement2', 'retirement3', 'securityDeposits', 'prepayments', 'annuities', 'educationAccounts', 'trusts', 'intellectualProperty', 'licenses', 'taxRefunds', 'alimony', 'otherAmountsOwed', 'insuranceCashValue', 'inheritances', 'personalInjury', 'lawsuits', 'otherClaims'].map(name => (
                                        <PropertyItemDisplay key={name} title={name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} name={name} borderColorClass="border-yellow-300"/>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Part E: Business-Related Assets */}
                        <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-briefcase mr-2 text-law-blue"></i>Part E. Business-Related Assets</h2>
                            <div className="space-y-4">
                                {['accountsReceivable', 'officeEquipment', 'machineryEquipment', 'businessInventory', 'partnershipInterests', 'customerLists', 'otherBusinessProperty'].map(name => (
                                     <PropertyItemDisplay key={name} title={name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} name={name} borderColorClass="border-orange-300"/>
                                ))}
                            </div>
                        </div>

                        {/* Part F: Farm & Fishing Assets */}
                        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-tractor mr-2 text-law-blue"></i>Part F. Farm and Commercial Fishing Property</h2>
                            <div className="space-y-4">
                                {['farmAnimals', 'crops', 'farmEquipment', 'farmSupplies'].map(name => (
                                    <PropertyItemDisplay key={name} title={name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} name={name} borderColorClass="border-green-300"/>
                                ))}
                            </div>
                        </div>

                        {/* Part G: Miscellaneous */}
                        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-ellipsis-h mr-2 text-law-blue"></i>Part G. Miscellaneous</h2>
                            <div className="space-y-4">
                                {(submissionData.otherMiscellaneousProperty || []).length === 0 ? (<p className="italic text-gray-600 px-4">No miscellaneous properties listed.</p>) :
                                (submissionData.otherMiscellaneousProperty.map((asset: any, index: number) => (
                                    <div key={asset.id || index} className="p-4 bg-white rounded-lg border border-gray-300 mb-4">
                                        <h4 className="text-md font-medium text-gray-800 mb-2">Other Property #{index + 1}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <DataField label="Description" value={<p className="whitespace-pre-wrap">{asset.description}</p>} />
                                            <DataField label="Value" value={formatCurrency(asset.value)} />
                                            <DataField label="Owned By" value={formatOwner(asset.owner, asset.ownerOther)} />
                                        </div>
                                    </div>
                                )))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

         case 3: { // Added block scope
            const submissionData = submission?.submission_data || {};

            // Helper functions (অপরিবর্তিত)
            const formatCurrency = (value: any) => {
                const num = parseFloat(value);
                return isNaN(num) ? 'N/A' : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            };
            const formatOwner = (owner: string, otherDetails?: string) => {
                if (owner === 'other' && otherDetails) { return `Other: ${otherDetails}`; }
                return owner ? owner.charAt(0).toUpperCase() + owner.slice(1) : 'N/A';
            };
            const DataField = ({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) => (
                <div className={className}>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                    <div className="text-sm font-medium text-gray-800 mt-1 break-words">
                        {(value !== undefined && value !== null && value !== '') ? value : <span className="italic text-gray-400">Not Provided</span>}
                    </div>
                </div>
            );

            // Helper component to display a single debt entry (FIXED & MORE ROBUST)
            const DebtEntryDisplay = ({ entry, theme, isSecured = false }: { entry: any; theme: string; isSecured?: boolean; }) => {
                // যদি entry অবজেক্টটি খালি বা invalid হয়, তাহলে একটি বার্তা দেখাবে
                if (!entry || typeof entry !== 'object') {
                    return <div className="p-4 text-center text-sm text-red-600">Invalid debt entry data.</div>;
                }
                
                return (
                    <div className={`bg-white border border-${theme}-300 rounded-lg p-6`}>
                        {entry.loanType && <DataField label="Type of Loan/Property" value={entry.loanType} className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200" />}
                        {entry.debtTypeDescription && <DataField label="Type of Debt" value={entry.debtTypeDescription} className="mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200" />}

                        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
                            {/* Column 1: Creditor Information */}
                            <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg space-y-3">
                                <h4 className="font-semibold text-gray-800 text-sm">Creditor Information</h4>
                                <DataField label="Amount Owed" value={formatCurrency(entry.amount)} />
                                <DataField label="Creditor Name & Address" value={<p className="whitespace-pre-wrap">{entry.creditor}</p>} />
                                <DataField label="Account Number" value={entry.account} />
                                <DataField label="Date Debt Incurred" value={entry.date} />
                                <DataField label="Contact Person" value={<p className="whitespace-pre-wrap">{entry.contact}</p>} />
                            </div>

                            {/* Column 2: Property or Additional Info */}
                            {isSecured ? (
                                <div className="lg:col-span-1 bg-green-50 p-4 rounded-lg space-y-3 mt-6 lg:mt-0">
                                    <h4 className="font-semibold text-gray-800 text-sm">Property Information</h4>
                                    <DataField label="Description of Property" value={<p className="whitespace-pre-wrap">{entry.property}</p>} />
                                    <DataField label="Monthly Payment" value={formatCurrency(entry.monthlyPayment)} />
                                    <DataField label="Payments Remaining" value={entry.paymentsLeft} />
                                </div>
                            ) : (
                                <div className="lg:col-span-1 bg-blue-50 p-4 rounded-lg space-y-3 mt-6 lg:mt-0">
                                    <h4 className="font-semibold text-gray-800 text-sm">Additional Information</h4>
                                    <DataField label="Details" value={<p className="whitespace-pre-wrap">{entry.additionalInfo}</p>} />
                                </div>
                            )}

                            {/* Column 3: Responsibility */}
                            <div className="lg:col-span-1 bg-orange-50 p-4 rounded-lg space-y-3 mt-6 lg:mt-0">
                                <h4 className="font-semibold text-gray-800 text-sm">Responsibility</h4>
                                <DataField label="Who Owes The Debt?" value={(entry.responsible || []).map((r: string) => formatOwner(r, entry.responsibleOther)).join(', ')} />
                                <DataField label="Is there a Codebtor?" value={entry.hasCodebtor} />
                                {entry.hasCodebtor === 'yes' && <DataField label="Codebtor Details" value={<p className="whitespace-pre-wrap">{entry.codebtorDetails}</p>} />}
                                <DataField label="Is The Debt Disputed?" value={entry.dispute} />
                            </div>
                        </div>
                    </div>
                );
            };

            // Helper component for a whole debt category (FIXED & MORE ROBUST)
            const DebtCategoryDisplay = ({ title, icon, debtType, theme, isSecured, showLoanTypeField, showDebtTypeField }: any) => {
                const noDebtFlag = `no_${debtType}`;
                const entries = submissionData[debtType] || [];
                
                return (
                    <div className={`bg-${theme}-50 border border-${theme}-200 rounded-lg p-6 mb-8`}>
                        <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center`}>
                            <i className={`fa-solid ${icon} mr-2 text-${theme}-600`}></i> {title}
                        </h3>
                        {submissionData[noDebtFlag] === true ? (
                            <p className="italic text-gray-600">Client has indicated they do not have any debts in this category.</p>
                        ) : (
                            <div className="space-y-6">
                                {Array.isArray(entries) && entries.length > 0 ? entries.map((entry: any, index: number) => (
                                    <DebtEntryDisplay 
                                        key={entry.id || index} 
                                        entry={entry} 
                                        theme={theme} 
                                        isSecured={isSecured} 
                                    />
                                )) : <p className="italic text-gray-600">No debts listed in this category.</p>}
                            </div>
                        )}
                    </div>
                );
            };
            
            // MAIN RETURN FOR CASE 3
            return (
                <div className="p-6">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                        <div><h3 className="text-xl font-semibold text-gray-900">Section 3: Debts & Liabilities</h3><p className="text-sm text-gray-600 mt-1">A list of the client's secured and unsecured debts.</p></div>
                    </div>
                    
                    {/* Part A: Secured Debts */}
                    <div className="mb-12">
                         <div className="bg-blue-100 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg">
                            <h2 className="text-2xl font-bold text-gray-900"><i className="fa-solid fa-shield-alt mr-2 text-blue-600"></i>Part A. Debts Secured by Property</h2>
                         </div>
                        <DebtCategoryDisplay title="Home Loans and/or Mortgages" icon="fa-home" debtType="homeLoans" theme="blue" isSecured={true} />
                        <DebtCategoryDisplay title="Car Loans" icon="fa-car" debtType="carLoans" theme="purple" isSecured={true} />
                        <DebtCategoryDisplay title="Other Secured Property Loans" icon="fa-building" debtType="otherSecuredLoans" theme="indigo" isSecured={true} showLoanTypeField={true} />
                    </div>

                    {/* Part B: Credit Card Debts */}
                    <div className="mb-12">
                        <div className="bg-red-100 border-l-4 border-red-500 p-6 mb-6 rounded-r-lg">
                           <h2 className="text-2xl font-bold text-gray-900"><i className="fa-solid fa-credit-card mr-2 text-red-600"></i>Part B. Credit Card Debts</h2>
                        </div>
                        <DebtCategoryDisplay title="Major Credit Card Debts" icon="fa-credit-card" debtType="majorCreditCards" theme="red" />
                        <DebtCategoryDisplay title="Department Store Cards" icon="fa-store" debtType="departmentStoreCards" theme="red" />
                        <DebtCategoryDisplay title="Other Credit Cards" icon="fa-gas-pump" debtType="otherCreditCards" theme="red" />
                        <DebtCategoryDisplay title="Cash Advances" icon="fa-money-bill-wave" debtType="cashAdvances" theme="red" />
                    </div>

                    {/* Part C, D, E, F */}
                    <div className="mb-12">
                        <div className="bg-cyan-100 border-l-4 border-cyan-500 p-6 mb-6 rounded-r-lg">
                           <h2 className="text-2xl font-bold text-gray-900">Part C, D, E & F. Other Unsecured Debts</h2>
                        </div>
                        <DebtCategoryDisplay title="Medical Debts" icon="fa-stethoscope" debtType="medicalDebts" theme="blue" />
                        <DebtCategoryDisplay title="Tax Debts" icon="fa-calculator" debtType="taxDebts" theme="green" />
                        <DebtCategoryDisplay title="Student Loan Debts" icon="fa-school" debtType="studentLoanDebts" theme="purple" />
                        <DebtCategoryDisplay title="Other Debts" icon="fa-clipboard-list" debtType="otherDebts" theme="amber" showDebtTypeField={true} />
                    </div>
                </div>
            );
        } // End of case 3

        // ... switch(sectionNumber) ...
        case 4: { // Added block scope
            const submissionData = submission?.submission_data || {};
            const leases = submissionData.leases || [];
            const hasLeases = submissionData.hasLeases === 'yes';
            
            // Helper component to display a single data point
            const DataField = ({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) => (
                <div className={className}>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                    <div className="text-sm font-medium text-gray-800 mt-1 break-words">
                        {(value !== undefined && value !== null && value !== '') ? value : <span className="italic text-gray-400">Not Provided</span>}
                    </div>
                </div>
            );

            return (
                <div className="p-6">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Section 4: Unexpired Leases and Contracts</h3>
                            <p className="text-sm text-gray-600 mt-1">A list of the client's current leases and contracts.</p>
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            <i className="fa-solid fa-file-contract mr-2 text-law-blue"></i>
                            Leases and Contracts Details
                        </h2>
                        
                        {!hasLeases ? (
                            <p className="italic text-gray-600">Client has indicated they do not have any unexpired leases or contracts.</p>
                        ) : (
                            <div className="space-y-6">
                                {leases.length > 0 ? (
                                    leases.map((lease: any, index: number) => (
                                        <div key={lease.id || index} className="bg-white border border-indigo-200 rounded-lg shadow-sm">
                                            <div className="p-4 border-b border-indigo-100 flex justify-between items-center">
                                                <h4 className="text-md font-semibold text-gray-800">
                                                    Lease/Contract #{index + 1}
                                                </h4>
                                            </div>
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <DataField 
                                                    label="Description of Lease or Contract" 
                                                    value={<p className="whitespace-pre-wrap">{lease.description}</p>} 
                                                    className="md:col-span-1"
                                                />
                                                <DataField 
                                                    label="Name and Address of Other Party" 
                                                    value={<p className="whitespace-pre-wrap">{lease.party}</p>} 
                                                    className="md:col-span-1"
                                                />
                                                <DataField 
                                                    label="Date Contract Expires" 
                                                    value={lease.expires} 
                                                    className="md:col-span-1"
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="italic text-gray-600">No leases or contracts have been listed.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        } // End of case 4

        // ... switch(sectionNumber) ...
        case 5: { // Added block scope
            const submissionData = submission?.submission_data || {};
            
            // Debugging line to see the actual data structure
            // console.log("Section 5 Submission Data:", submissionData);

            // Robust check for employment status for both Debtor and Spouse
            const isDebtorEmployed = !!submissionData.currentlyEmployed;
            const isSpouseEmployed = !!submissionData.spouseEmployed;

            // Helper functions (add these if they are not already globally available in the component)
            const formatCurrency = (value: any) => {
                const num = parseFloat(value);
                return isNaN(num) ? 'N/A' : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            };
            const DataField = ({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) => (
                <div className={className}>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                    <div className="text-sm font-medium text-gray-800 mt-1 break-words">
                        {(value !== undefined && value !== null && value !== '') ? value : <span className="italic text-gray-400">Not Provided</span>}
                    </div>
                </div>
            );
            const formatPayFrequency = (freq: string, other?: string) => {
                const map: { [key: string]: string } = {
                    'weekly': 'Once a week', 'biweekly': 'Every two weeks',
                    'semimonthly': 'Twice a month', 'monthly': 'Once a month'
                };
                return freq === 'other' && other ? `Other: ${other}` : map[freq] || freq;
            };
            const IncomeSourceDisplay = ({ title, namePrefix, data }: { title: string; namePrefix: string; data: any }) => {
                const hasIncome = data[namePrefix] === 'yes';
                if (!hasIncome) return null;
                return (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-xs font-medium text-gray-700">{title}</p>
                        <div className="text-sm text-gray-900 mt-1">
                            Amount: <span className="font-semibold">{formatCurrency(data[`${namePrefix}Amount`])}</span> / month
                        </div>
                        {data[`${namePrefix}Desc`] && <p className="text-xs text-gray-600 mt-1">Desc: {data[`${namePrefix}Desc`]}</p>}
                    </div>
                );
            };

            return (
                <div className="p-6">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Section 5: Employment & Income</h3>
                            <p className="text-sm text-gray-600 mt-1">Client's and spouse's current employment and income details.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* ======================================= */}
                        {/* === Column for Debtor's Information === */}
                        {/* ======================================= */}
                        {isDebtorEmployed ? (
                            <div className="space-y-6">
                                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-user-tie mr-2 text-law-blue"></i>Debtor's Employment & Income</h2>
                                    
                                    <div className="space-y-6">
                                        {/* Part A: Employer Information */}
                                        <div className="p-4 bg-white rounded-lg border border-blue-300 space-y-3">
                                            <h3 className="text-md font-medium text-gray-800">Primary Employer</h3>
                                            <DataField label="Name and Address" value={<p className="whitespace-pre-wrap">{submissionData.primaryEmployerAddress}</p>} />
                                            <DataField label="Employment Duration" value={submissionData.primaryEmploymentDuration} />
                                            <DataField label="Occupation" value={submissionData.primaryOccupation} />
                                        </div>
                                        {submissionData.hasSecondJob && (
                                            <div className="p-4 bg-white rounded-lg border border-blue-300 space-y-3">
                                                <h3 className="text-md font-medium text-gray-800">Second Employer</h3>
                                                <DataField label="Name and Address" value={<p className="whitespace-pre-wrap">{submissionData.secondEmployerAddress}</p>} />
                                                <DataField label="Employment Duration" value={submissionData.secondEmploymentDuration} />
                                                <DataField label="Occupation" value={submissionData.secondOccupation} />
                                            </div>
                                        )}

                                        {/* Part C: Wage Information */}
                                        <div className="p-4 bg-white rounded-lg border border-blue-300">
                                            <h3 className="text-md font-medium text-gray-800 mb-4">Wage Information</h3>
                                            <div className="space-y-3">
                                                <DataField label="Gross Paycheck" value={formatCurrency(submissionData.grossPaycheck)} />
                                                <DataField label="Pay Frequency" value={formatPayFrequency(submissionData.payFrequency, submissionData.payFrequencyOther)} />
                                                <DataField label="Overtime (monthly)" value={formatCurrency(submissionData.overtimePay)} />
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white rounded-lg border border-blue-300">
                                            <h3 className="text-md font-medium text-gray-800 mb-4">Paycheck Deductions</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <DataField label="Taxes" value={formatCurrency(submissionData.taxDeductions)} />
                                                <DataField label="Mandatory Retirement" value={formatCurrency(submissionData.mandatoryRetirement)} />
                                                <DataField label="Voluntary Retirement" value={formatCurrency(submissionData.voluntaryRetirement)} />
                                                <DataField label="Retirement Loans" value={formatCurrency(submissionData.retirementLoans)} />
                                                <DataField label="Insurance" value={formatCurrency(submissionData.insuranceDeductions)} />
                                                <DataField label="Domestic Support" value={formatCurrency(submissionData.domesticSupport)} />
                                                <DataField label="Union Dues" value={formatCurrency(submissionData.unionDues)} />
                                            </div>
                                            {(submissionData.otherDeductions || []).length > 0 && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Other Deductions:</h4>
                                                    {(submissionData.otherDeductions).map((d: any, i: number) => <p key={i} className="text-sm text-gray-800 ml-4">{d.desc}: {formatCurrency(d.amount)}</p>)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-white rounded-lg border border-blue-300">
                                            <h3 className="text-md font-medium text-gray-800 mb-4">Additional Income Sources</h3>
                                            <div className="space-y-3">
                                               <IncomeSourceDisplay title="Business Income" namePrefix="businessIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Interest/Dividends" namePrefix="interestIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Alimony/Support" namePrefix="alimonyIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Unemployment" namePrefix="unemploymentIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Social Security" namePrefix="socialSecurityIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Govt. Assistance" namePrefix="governmentAssistance" data={submissionData} />
                                               <IncomeSourceDisplay title="Retirement/Pension" namePrefix="retirementIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Other Income" namePrefix="otherIncome" data={submissionData} />
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 bg-white rounded-lg border border-blue-300">
                                            <h3 className="text-md font-medium text-gray-800 mb-4">Expected Income Changes</h3>
                                            <DataField label="Expecting Salary Change?" value={submissionData.salaryChange} />
                                            {submissionData.salaryChange === 'yes' && <DataField label="Description" value={<p className="whitespace-pre-wrap">{submissionData.salaryChangeDescription}</p>} />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-gray-100 rounded-lg text-center flex items-center justify-center">
                                <p className="text-gray-600 font-medium">Debtor is not currently employed.</p>
                            </div>
                        )}

                        {/* ======================================== */}
                        {/* === Column for Spouse's Information === */}
                        {/* ======================================== */}
                        {isSpouseEmployed ? (
                             <div className="space-y-6">
                                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6"><i className="fa-solid fa-user-friends mr-2 text-green-700"></i>Spouse's Employment & Income</h2>

                                    <div className="space-y-6">
                                        {/* Part B: Spouse's Employer Information */}
                                        <div className="p-4 bg-white rounded-lg border border-green-300 space-y-3">
                                            <h3 className="text-md font-medium text-gray-800">Spouse's Primary Employer</h3>
                                            <DataField label="Name and Address" value={<p className="whitespace-pre-wrap">{submissionData.spousePrimaryEmployerAddress}</p>} />
                                            <DataField label="Employment Duration" value={submissionData.spousePrimaryEmploymentDuration} />
                                            <DataField label="Occupation" value={submissionData.spousePrimaryOccupation} />
                                        </div>
                                        {submissionData.spouseHasSecondJob && (
                                            <div className="p-4 bg-white rounded-lg border border-green-300 space-y-3">
                                                <h3 className="text-md font-medium text-gray-800">Spouse's Second Employer</h3>
                                                <DataField label="Name and Address" value={<p className="whitespace-pre-wrap">{submissionData.spouseSecondEmployerAddress}</p>} />
                                                <DataField label="Employment Duration" value={submissionData.spouseSecondEmploymentDuration} />
                                                <DataField label="Occupation" value={submissionData.spouseSecondOccupation} />
                                            </div>
                                        )}

                                        {/* Part D: Spouse's Wage Information */}
                                        <div className="p-4 bg-white rounded-lg border border-green-300">
                                            <h3 className="text-md font-medium text-gray-800 mb-4">Spouse's Wage Information</h3>
                                            <div className="space-y-3">
                                                <DataField label="Gross Paycheck" value={formatCurrency(submissionData.spouseGrossPaycheck)} />
                                                <DataField label="Pay Frequency" value={formatPayFrequency(submissionData.spousePayFrequency, submissionData.spousePayFrequencyOther)} />
                                                <DataField label="Overtime (monthly)" value={formatCurrency(submissionData.spouseOvertimePay)} />
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white rounded-lg border border-green-300">
                                            <h3 className="text-md font-medium text-gray-800 mb-4">Spouse's Paycheck Deductions</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <DataField label="Taxes" value={formatCurrency(submissionData.spouseTaxDeductions)} />
                                                <DataField label="Mandatory Retirement" value={formatCurrency(submissionData.spouseMandatoryRetirement)} />
                                                <DataField label="Voluntary Retirement" value={formatCurrency(submissionData.spouseVoluntaryRetirement)} />
                                                <DataField label="Retirement Loans" value={formatCurrency(submissionData.spouseRetirementLoans)} />
                                                <DataField label="Insurance" value={formatCurrency(submissionData.spouseInsuranceDeductions)} />
                                                <DataField label="Family Support" value={formatCurrency(submissionData.spouseFamilySupport)} />
                                                <DataField label="Union Dues" value={formatCurrency(submissionData.spouseUnionDues)} />
                                            </div>
                                            {(submissionData.spouseOtherDeductions || []).length > 0 && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Other Deductions:</h4>
                                                    {(submissionData.spouseOtherDeductions).map((d: any, i: number) => <p key={i} className="text-sm text-gray-800 ml-4">{d.desc}: {formatCurrency(d.amount)}</p>)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-white rounded-lg border border-green-300">
                                            <h3 className="text-md font-medium text-gray-800 mb-4">Spouse's Additional Income Sources</h3>
                                            <div className="space-y-3">
                                               <IncomeSourceDisplay title="Business Income" namePrefix="spouseBusinessIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Interest/Dividends" namePrefix="spouseInterestIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Alimony/Support" namePrefix="spouseAlimonyIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Unemployment" namePrefix="spouseUnemploymentIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Social Security" namePrefix="spouseSocialSecurityIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Govt. Assistance" namePrefix="spouseGovernmentAssistance" data={submissionData} />
                                               <IncomeSourceDisplay title="Retirement/Pension" namePrefix="spouseRetirementIncome" data={submissionData} />
                                               <IncomeSourceDisplay title="Other Income" namePrefix="spouseOtherIncome" data={submissionData} />
                                            </div>
                                        </div>
                                        
                                         <div className="p-4 bg-white rounded-lg border border-green-300">
                                            <h3 className="text-md font-medium text-gray-800 mb-4">Spouse's Expected Income Changes</h3>
                                            <DataField label="Expecting Salary Change?" value={submissionData.spouseSalaryChange} />
                                            {submissionData.spouseSalaryChange === 'yes' && <DataField label="Description" value={<p className="whitespace-pre-wrap">{submissionData.spouseSalaryChangeDescription}</p>} />}
                                        </div>
                                    </div>
                                </div>
                             </div>
                        ) : (
                             <div className="p-6 bg-gray-100 rounded-lg text-center flex items-center justify-center">
                                <p className="text-gray-600 font-medium">Spouse is not currently employed.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        } // End of case 5
       
            default:
                return (
                    <div className="p-6">
                        <div className="text-center py-8">
                            <i className={`fa-solid ${sections.find(s=>s.num === sectionNumber)?.icon} text-gray-400 text-4xl mb-4`}></i>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Section {sectionNumber}: {sections.find(s=>s.num === sectionNumber)?.title}</h3>
                            <p className="text-gray-600">Detailed information is available in the full questionnaire viewer.</p>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="p-6" id="financial-questionnaire-container">
            <div className="space-y-6">
                {/* Header Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Financial Questionnaire</h3>
                            <p className="text-sm text-gray-600 mt-1">{clientProfile?.first_name} {clientProfile?.last_name} - Submitted {new Date(submission.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize ${financialSummary.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            <i className={`fa-solid ${financialSummary.status === 'Completed' ? 'fa-check-circle' : 'fa-clock'} mr-1`}></i>
                            {financialSummary.status}
                        </span>
                    </div>
                    {/* Financial Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"><p className="text-sm font-medium text-green-800">Total Assets</p><p className="text-2xl font-bold text-green-600">${financialSummary.totalAssets.toLocaleString()}</p></div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center"><p className="text-sm font-medium text-red-800">Total Debts</p><p className="text-2xl font-bold text-red-600">${financialSummary.totalDebts.toLocaleString()}</p></div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"><p className="text-sm font-medium text-blue-800">Net Worth</p><p className="text-2xl font-bold text-blue-600">${financialSummary.netWorth.toLocaleString()}</p></div>
                    </div>
                </div>

                {/* Section Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Questionnaire Sections</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sections.map(section => (
                            <button key={section.num} onClick={() => setActiveSection(section.num)} className={`p-3 rounded-lg border transition-colors duration-200 flex items-center justify-between text-left ${activeSection === section.num ? 'bg-blue-50 border-law-blue' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <div className="flex items-center">
                                    <i className={`fa-solid ${section.icon} mr-3 text-gray-600 w-4 text-center`}></i>
                                    <div><div className="font-semibold text-sm">Section {section.num}</div><div className="text-xs text-gray-500">{section.title}</div></div>
                                </div>
                                {/* স্ট্যাটাস ডট (সবুজ মানে সম্পন্ন) */}
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div> 
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <SectionContent sectionNumber={activeSection} />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-law-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><i className="fa-solid fa-external-link-alt mr-2"></i>View Full Questionnaire</button>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-law-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><i className="fa-solid fa-download mr-2"></i>Export PDF</button>
                </div>
            </div>
        </div>
    );
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