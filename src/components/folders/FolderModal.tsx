'use client';
import { useState } from 'react';

// Folder টাইপটি এখানেও প্রয়োজন হবে
type Folder = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isRequired: boolean;
  isActive: boolean;
  children: Folder[];
};

type FolderModalProps = {
  folder?: Folder | null; // এডিটের জন্য বিদ্যমান ফোল্ডারের ডেটা
  onClose: () => void;
  onSave: (folderData: Folder) => void;
};

export default function FolderModal({ folder, onClose, onSave }: FolderModalProps) {
  const isEditing = !!folder;

  // ফর্মের ডেটা state-এ রাখা হচ্ছে
  const [formData, setFormData] = useState({
    name: folder?.name || '',
    description: folder?.description || '',
    icon: folder?.icon || 'fa-folder',
    isRequired: folder?.isRequired || false,
    isActive: folder?.isActive ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'isRequired') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newFolderData: Folder = {
      id: folder?.id || `new-${Date.now()}`, // নতুন ফোল্ডারের জন্য একটি অস্থায়ী আইডি
      ...formData,
      children: folder?.children || [],
    };
    onSave(newFolderData);
  };
  
  const iconOptions = [
    { value: 'fa-user', label: 'User' },
    { value: 'fa-chart-line', label: 'Financial' },
    { value: 'fa-credit-card', label: 'Credit/Debt' },
    { value: 'fa-home', label: 'Property' },
    { value: 'fa-dollar-sign', label: 'Income' },
    { value: 'fa-gavel', label: 'Legal' },
    { value: 'fa-folder', label: 'General' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit Folder' : 'Add New Folder'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="Enter folder name" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Brief description..."></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <select name="icon" value={formData.icon} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirement</label>
              <select name="isRequired" value={String(formData.isRequired)} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="true">Required</option>
                <option value="false">Optional</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="folder-active" name="isActive" checked={formData.isActive} onChange={handleChange} className="rounded border-gray-300 text-law-blue" />
            <label htmlFor="folder-active" className="text-sm text-gray-700">Active (visible to clients)</label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-law-blue rounded-lg">
              {isEditing ? 'Save Changes' : 'Add Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}