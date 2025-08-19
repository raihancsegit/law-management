'use client';

import { useState } from 'react';
import { DragDropContext, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { StrictModeDroppable } from '@/components/dnd/StrictModeDroppable';
import { updateFolderTemplate } from '@/app/actions/folderActions';
import FolderModal from './FolderModal';


//ফোল্ডারের টাইপ সংজ্ঞা
type Folder = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isRequired: boolean;
  isActive: boolean;
  children: Folder[];
};

// স্ট্যাটাস কার্ডের জন্য Helper Component
const StatCard = ({ title, count, icon, color }: { title: string, count: number, icon: string, color: string }) => (
  <div className={`bg-${color}-50 rounded-lg p-4 border border-${color}-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium text-${color}-900`}>{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
      </div>
      <i className={`fa-solid ${icon} text-${color}-400 text-xl`}></i>
    </div>
  </div>
);

export default function FolderEditor({ initialTemplate }: { initialTemplate: any }) {
  const [folders, setFolders] = useState<Folder[]>(initialTemplate.structure);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // স্ট্যাটাস গণনা
  const totalFolders = folders.length;
  const requiredFolders = folders.filter(f => f.isRequired).length;
  const activeFolders = folders.filter(f => f.isActive).length;

  // ড্র্যাগ-এন্ড-ড্রপ শেষ হলে
  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) return;
    const items = Array.from(folders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFolders(items);
  };

  // টেমপ্লেট সেভ করার ফাংশন
  const handleSaveTemplate = async () => {
    setIsSaving(true);
    const result = await updateFolderTemplate(initialTemplate.id, folders);
    if (result.error) {
      alert('Error saving: ' + result.error);
    } else {
      alert('Template changes saved successfully!');
      // সফলভাবে সেভ হলে initialTemplate-কেও আপডেট করা যেতে পারে, যাতে Reset Order নতুন অর্ডারে কাজ করে
      initialTemplate.structure = folders;
    }
    setIsSaving(false);
  };
  
  // অর্ডার রিসেট করার ফাংশন
  const handleResetOrder = () => {
    if (confirm('Are you sure you want to reset the folder order to the last saved state?')) {
      setFolders(initialTemplate.structure);
    }
  };

  // মডাল খোলা/বন্ধ করার ফাংশন
  const handleOpenModal = (folder: Folder | null) => {
    setEditingFolder(folder);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFolder(null);
  };

  // মডাল থেকে ফোল্ডার ডেটা সেভ করার ফাংশন
  const handleSaveFolder = (folderData: Folder) => {
    if (editingFolder) {
      // ফোল্ডার এডিট করা হচ্ছে
      setFolders(folders.map(f => f.id === folderData.id ? folderData : f));
    } else {
      // নতুন ফোল্ডার যোগ করা হচ্ছে
      setFolders([...folders, folderData]);
    }
    handleCloseModal();
  };

  // ফোল্ডার ডিলিট করার ফাংশন
  const handleDeleteFolder = (folderId: string) => {
    if (confirm(`Are you sure you want to delete this folder? This action cannot be undone.`)) {
      setFolders(folders.filter(f => f.id !== folderId));
    }
  };

  return (
    <section className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Predefined Folders Management</h3>
            <p className="text-sm text-gray-500 mt-1">Configure document folders that clients see. Drag to reorder, edit properties, or delete folders.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handleResetOrder} className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              <i className="fa-solid fa-rotate-left mr-2"></i>
              Reset Order
            </button>
            <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-800">
              <i className="fa-solid fa-folder-plus mr-2"></i>
              Add Folder
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Folder Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Folders" count={totalFolders} icon="fa-folder" color="blue" />
            <StatCard title="Required" count={requiredFolders} icon="fa-asterisk" color="red" />
            <StatCard title="Optional" count={totalFolders - requiredFolders} icon="fa-circle-question" color="yellow" />
            <StatCard title="Active" count={activeFolders} icon="fa-check-circle" color="green" />
          </div>

          {/* Folders List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Document Categories</h4>
              <div className="text-sm text-gray-500 flex items-center">
                <i className="fa-solid fa-arrows-up-down mr-2"></i>
                Drag to reorder folders
              </div>
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <StrictModeDroppable droppableId="folders">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {folders.map((folder, index) => (
                      <Draggable key={folder.id} draggableId={folder.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab">
                                  <i className="fa-solid fa-grip-vertical"></i>
                                </div>
                                <div className="text-law-blue">
                                  <i className={`fa-solid ${folder.icon} text-xl w-6 text-center`}></i>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">{folder.name}</h5>
                                  <p className="text-sm text-gray-500">{folder.description}</p>
                                  <div className="flex items-center mt-1 space-x-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${folder.isRequired ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                      <i className={`fa-solid ${folder.isRequired ? 'fa-asterisk' : 'fa-circle-question'} mr-1 text-xs`}></i>
                                      {folder.isRequired ? 'Required' : 'Optional'}
                                    </span>
                                    <span className="text-xs text-gray-400">Order: {index + 1}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <button onClick={() => handleOpenModal(folder)} className="p-2 text-gray-600 hover:text-law-blue rounded-lg"><i className="fa-solid fa-edit"></i></button>
                                <button onClick={() => handleDeleteFolder(folder.id)} className="p-2 text-gray-600 hover:text-red-600 rounded-lg"><i className="fa-solid fa-trash"></i></button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </DragDropContext>
          </div>
          <div className="flex justify-end">
             <button 
                onClick={handleSaveTemplate} 
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 font-medium"
            >
              {isSaving ? (
                  <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving...</>
              ) : (
                  <><i className="fa-solid fa-save mr-2"></i>Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* মডালটি এখানে কন্ডিশনালি রেন্ডার করা হচ্ছে */}
      {isModalOpen && (
        <FolderModal 
          folder={editingFolder} 
          onClose={handleCloseModal} 
          onSave={handleSaveFolder} 
        />
      )}
    </section>
  );
}