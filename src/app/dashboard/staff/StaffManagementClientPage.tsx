'use client';
import { useState, useTransition, ChangeEvent } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { deleteStaffUser, toggleStaffStatus, toggleUserStatus } from '@/app/actions/staffActions';
import { convertLeadToClient, convertClientToLead, deleteUser } from '@/app/actions/userActions';

// Role স্টাইলের জন্য Helper অবজেক্ট
const roleStyles: { [key: string]: string } = {
  admin: 'bg-blue-100 text-blue-800',
  attorney: 'bg-purple-100 text-purple-800',
  client: 'bg-green-100 text-green-800',
  lead: 'bg-yellow-100 text-yellow-800',
};

// ইউজার ডেটার জন্য টাইপ সংজ্ঞা
type User = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: 'admin' | 'attorney' | 'client' | 'lead';
    is_approved?: boolean;
    avatar_url: string | null;
    email: string | null;
};

// Client & Lead টেবিলের জন্য একটি Row কম্পোনেন্ট
const ClientLeadRow = ({ user, onUpdate }: { 
    user: any; // ডেটাবেস থেকে আসা ডেটার জন্য any ব্যবহার করা হচ্ছে
    onUpdate: (userId: string, updates: Partial<User>) => void;
}) => {
    const [isUpdating, startTransition] = useTransition();
    const router = useRouter();

    const handleRoleChange = (userId: string, newRole: string) => {
        const selectElement = document.getElementById(`role-select-${user.id}`) as HTMLSelectElement;
        if (newRole === user.role) return;

        if (newRole === 'client') {
            if (confirm(`Convert lead to client? This will create their folders.`)) {
                startTransition(async () => {
                    const result = await convertLeadToClient(userId);
                    if (result.error) {
                        alert(result.error);
                        if(selectElement) selectElement.value = user.role;
                    } else {
                        alert(result.message || 'Success!');
                        router.refresh();
                    }
                });
            } else { if(selectElement) selectElement.value = user.role; }
        }
        
        if (newRole === 'lead') {
            if (confirm(`Revert client to lead? This will delete their folder and all files.`)) {
                startTransition(async () => {
                    const result = await convertClientToLead(userId);
                    if (result.error) {
                        alert(result.error);
                        if(selectElement) selectElement.value = user.role;
                    } else {
                        alert(result.message || 'Success!');
                        router.refresh();
                    }
                });
            } else { if(selectElement) selectElement.value = user.role; }
        }
    };

     const handleToggleStatus = () => {
        const isActive = user.is_approved ?? true;
        if (confirm(`Are you sure you want to ${isActive ? 'Deactivate' : 'Activate'} this user?`)) {
            startTransition(async () => {
                const result = await toggleUserStatus(user.id, isActive); // staffActions থেকে
                if (result.error) alert(result.error);
                else {
                    alert(`User status updated.`);
                    onUpdate(user.id, { is_approved: result.newStatus });
                }
            });
        }
    };
    
    const handleDelete = () => {
        if(confirm('Are you sure you want to permanently delete this user?')) {
            startTransition(async () => {
                const result = await deleteUser(user.id); // staffActions থেকে
                if (result.error) alert(result.error);
                else {
                    alert('User deleted successfully.');
                    onUpdate(user.id, { role: 'deleted' } as any);
                }
            });
        }
    };

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const avatarSrc = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff`;
    const isActive = user.is_approved ?? true;
    return (
        <tr className="hover:bg-gray-50 transition-colors border-gray-200">
            <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/dashboard/users/${user.id}`} className="hover:underline">
                    <div className="flex items-center">
                        <Image src={avatarSrc} alt={fullName} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{fullName}</div>
                            <div className="text-sm text-gray-500">ID: #{user.id.substring(0, 8)}</div>
                        </div>
                    </div>
                </Link>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${roleStyles[user.role]}`}>
                    {user.role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select 
                    id={`role-select-${user.id}`}
                    defaultValue={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={isUpdating}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="lead">Lead</option>
                    <option value="client">Client</option>
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
               <button
                    onClick={handleToggleStatus}
                    disabled={isUpdating}
                    className={`w-20 py-1 text-xs text-white rounded ${isActive ? 'bg-gray-500' : 'bg-green-600'}`}
                >
                    {isUpdating ? '...' : (isActive ? 'Deactivate' : 'Activate')}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isUpdating}
                    className="w-16 py-1 text-xs text-white bg-red-600 rounded"
                >
                    {isUpdating ? '...' : 'Delete'}
                </button>
            </td>
        </tr>
    );
};

// মূল ক্লায়েন্ট পেজ
export default function StaffManagementClientPage({ initialStaff, initialClientsLeads, totalCount, searchParams }: {
  initialStaff: User[];
  initialClientsLeads: User[];
  totalCount: number;
  searchParams: { page?: string; q?: string; role?: string; };
}) {
  const [staff, setStaff] = useState(initialStaff);
  const [clientsLeads, setClientsLeads] = useState(initialClientsLeads);
  const router = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleDeleteStaff = async (userId: string) => {
    if (confirm('Are you sure? This will permanently delete the staff member.')) {
      setLoadingAction(userId);
      const result = await deleteStaffUser(userId);
      setLoadingAction(null);
      if (result.error) alert(result.error);
      else {
        alert('Staff member deleted.');
        setStaff(prev => prev.filter(s => s.id !== userId));
      }
    }
  };

  const handleClientLeadUpdate = (userId: string, updates: Partial<User>) => {
      if ((updates as any).role === 'deleted') {
          // যদি ডিলিট করা হয়, তালিকা থেকে সরিয়ে দেওয়া
          setClientsLeads((prev) => prev.filter(u => u.id !== userId));
      } else {
          // যদি স্ট্যাটাস পরিবর্তন হয়, তালিকা আপডেট করা
          setClientsLeads((prev) => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      }
  };

  const handleToggleStaffStatus = async (userId: string, currentStatus: boolean | undefined) => {
     const isActive = currentStatus ?? true; 
    const actionText = isActive ? 'Deactivate' : 'Activate';
    if (confirm(`Are you sure you want to ${actionText.toLowerCase()} this user?`)) {
      setLoadingAction(userId);
      const result = await toggleStaffStatus(userId, isActive);
      setLoadingAction(null);
      if (result.error) alert(result.error);
      else {
        alert(`User status updated.`);
        setStaff(prev => prev.map(s => s.id === userId ? { ...s, is_approved: result.newStatus } : s));
      }
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      const params = new URLSearchParams(currentParams.toString());
      if (term) params.set('q', term); else params.delete('q');
      router.replace(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
      const role = e.target.value;
      const params = new URLSearchParams(currentParams.toString());
      if (role !== 'all') params.set('role', role); else params.delete('role');
      router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <section className="p-6 space-y-8">
      {/* --- টেবিল ১: System Staff Management --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">System Staff Management</h3>
          <p className="text-sm text-gray-500 mt-1">Manage administrators, attorneys, and other staff accounts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((member) => {
                const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
                const avatarSrc = member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff`;
                const isActive = member.is_approved ?? true;
                return (
                  <tr key={member.id} className={`${!isActive ? 'bg-orange-50 opacity-70' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Image src={avatarSrc} alt={fullName} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${roleStyles[member.role]}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button onClick={() => handleToggleStaffStatus(member.id, isActive)} disabled={loadingAction === member.id} className={`w-20 py-1 text-xs text-white rounded ${isActive ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {loadingAction === member.id ? '...' : (isActive ? 'Deactivate' : 'Activate')}
                      </button>
                      <button onClick={() => handleDeleteStaff(member.id)} disabled={loadingAction === member.id} className="w-16 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700">
                        {loadingAction === member.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- টেবিল ২: Client & Lead Account Management --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Client & Lead Account Management</h3>
        </div>
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input type="text" placeholder="Search by name or email..." 
                          onChange={handleSearch}
                          defaultValue={searchParams.q || ''}
                          className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-law-blue"/>
                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <select onChange={handleFilterChange} defaultValue={searchParams.role || 'all'} className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue focus:border-transparent">
                        <option value="all">All Types</option>
                        <option value="client">Client</option>
                        <option value="lead">Lead</option>
                    </select>
                </div>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full border-gray-200">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left ...">Name</th>
                        <th className="px-6 py-3 text-left ...">Email</th>
                        <th className="px-6 py-3 text-left ...">User Type</th>
                        <th className="px-6 py-3 text-left ...">Change Type</th>
                        <th className="px-6 py-3 text-left ...">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {initialClientsLeads.length > 0 ? (
                        initialClientsLeads.map(user => <ClientLeadRow key={user.id} user={user} onUpdate={handleClientLeadUpdate} />)
                    ) : (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-500">No clients or leads found matching your criteria.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
        <div className="px-6 py-4 border-t">
           {/* Pagination UI এখানে যোগ হবে */}
        </div>
      </div>
    </section>
  );
}