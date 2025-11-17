'use client';

import { useState, useMemo, useRef, useTransition } from 'react';
import { createFaq, updateFaq, deleteFaq } from '@/app/actions/faqActions';
import { useRouter } from 'next/navigation'; // <-- useRouter ইম্পোর্ট করুন

// Single FAQ Item Component (Accordion)
const FaqItem = ({ faq, onEdit, onDelete }: { faq: any, onEdit: (faq: any) => void, onDelete: (id: number) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg">
            <div className="flex items-center">
                <button
                    className="flex-1 px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <i className={`fa-solid fa-chevron-down text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                </button>
                <div className="flex items-center space-x-1 px-3 border-l border-gray-200">
                    <button onClick={() => onEdit(faq)} className="p-2 text-gray-400 hover:text-law-blue transition-colors rounded-md hover:bg-blue-50" title="Edit FAQ">
                        <i className="fa-solid fa-edit text-sm"></i>
                    </button>
                    <button onClick={() => onDelete(faq.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50" title="Delete FAQ">
                        <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="px-4 pb-3 border-t border-gray-100">
                    <p className="text-law-gray pt-3 whitespace-pre-wrap">{faq.answer}</p>
                </div>
            )}
        </div>
    );
};

// Main Client Component
export default function FaqClient({ initialFaqs }: { initialFaqs: any[] }) {
    const router = useRouter(); // <-- useRouter ইনিশিয়ালাইজ করুন
    const [activeType, setActiveType] = useState<'client' | 'lead'>('client');
    const [editingFaq, setEditingFaq] = useState<any | null>(null);
    const [isPending, startTransition] = useTransition();

    const formRef = useRef<HTMLFormElement>(null);
    const formSectionRef = useRef<HTMLDivElement>(null);

    // initialFaqs prop পরিবর্তন হলে faqs স্টেট আপডেট করার জন্য একটি useEffect ব্যবহার করা যেতে পারে
    // তবে router.refresh() এই কাজটি আরও ভালোভাবে করে।
    const faqs = initialFaqs;

    const filteredFaqs = useMemo(() =>
        faqs.filter(faq => faq.type === activeType),
        [faqs, activeType]);

    const groupedFaqs = useMemo(() => {
        return filteredFaqs.reduce((acc, faq) => {
            (acc[faq.category] = acc[faq.category] || []).push(faq);
            return acc;
        }, {});
    }, [filteredFaqs]);

    const handleEdit = (faq: any) => {
        setEditingFaq(faq);
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleCancelEdit = () => {
        setEditingFaq(null);
        formRef.current?.reset();
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
            startTransition(async () => {
                const result = await deleteFaq(id);
                if (result.error) {
                    alert(`Error deleting FAQ: ${result.error}`);
                } else {
                    router.refresh(); // <-- সফলভাবে ডিলিট হলে UI রিফ্রেশ করুন
                }
            });
        }
    };

    const categoryConfig = {
        'general': { title: 'General Questions', icon: 'fa-question-circle', color: 'text-law-blue' },
        'documents': { title: 'Documents & Forms', icon: 'fa-folder', color: 'text-green-500' },
        'account': { title: 'Account & Settings', icon: 'fa-user-cog', color: 'text-orange-500' },
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">FAQ Management</h3>
                <p className="text-law-gray">Create and manage frequently asked questions for clients and leads</p>
            </div>

            <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        onClick={() => setActiveType('client')}
                        className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer ${activeType === 'client' ? 'border-law-blue ring-2 ring-law-blue' : 'border-gray-200'}`}>
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-law-blue rounded-lg flex items-center justify-center mr-3">
                                <i className="fa-solid fa-users text-white"></i>
                            </div>
                            <h4 className="font-semibold text-gray-900">Client FAQs</h4>
                        </div>
                        <p className="text-sm text-law-gray">Manage questions for existing clients</p>
                    </div>

                    <div
                        onClick={() => setActiveType('lead')}
                        className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer ${activeType === 'lead' ? 'border-green-500 ring-2 ring-green-500' : 'border-gray-200'}`}>
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                <i className="fa-solid fa-user-plus text-white"></i>
                            </div>
                            <h4 className="font-semibold text-gray-900">Lead FAQs</h4>
                        </div>
                        <p className="text-sm text-law-gray">Manage questions for potential clients</p>
                    </div>
                </div>
            </div>

            <div ref={formSectionRef} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 scroll-mt-4">
                <h4 className="text-lg font-semibold text-gray-900">{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h4>
                <form
                    ref={formRef}
                    action={(formData) => {
                        startTransition(async () => {
                            const action = editingFaq ? updateFaq : createFaq;
                            const result = await action(formData);
                            if (result.error) {
                                alert(result.error);
                            } else {
                                handleCancelEdit();
                                router.refresh(); // <-- সফলভাবে যোগ বা আপডেট হলে UI রিফ্রেশ করুন
                            }
                        });
                    }}
                    className="space-y-6 mt-4"
                >
                    <input type="hidden" name="id" value={editingFaq?.id || ''} />
                    <input type="hidden" name="type" value={activeType} />
                    <div>
                        <label htmlFor="faq-category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select id="faq-category" name="category" key={editingFaq?.id || 'new'} defaultValue={editingFaq?.category || ''} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue">
                            <option value="">Select a category</option>
                            <option value="general">General Questions</option>
                            <option value="documents">Documents & Forms</option>
                            <option value="account">Account & Settings</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="faq-question" className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                        <input type="text" id="faq-question" name="question" key={editingFaq?.id || 'new-q'} defaultValue={editingFaq?.question || ''} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue" />
                    </div>
                    <div>
                        <label htmlFor="faq-answer" className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                        <textarea id="faq-answer" name="answer" key={editingFaq?.id || 'new-a'} defaultValue={editingFaq?.answer || ''} rows={4} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-law-blue"></textarea>
                    </div>
                    <div className="flex space-x-4">
                        <button type="submit" disabled={isPending} className="px-6 py-3 bg-law-blue text-white font-medium rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-law-blue focus:ring-offset-2 disabled:opacity-50">
                            {isPending ? (editingFaq ? 'Updating...' : 'Adding...') : (editingFaq ? 'Update FAQ' : 'Add FAQ')}
                        </button>
                        {editingFaq && (
                            <button type="button" onClick={handleCancelEdit} className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div>
                {Object.keys(groupedFaqs).length === 0 && !isPending && (
                    <div className="text-center py-10 bg-white rounded-lg border">
                        <p className="text-gray-500">No FAQs found for the '{activeType}' section.</p>
                        <p className="text-sm text-gray-400 mt-2">Use the form above to add the first one!</p>
                    </div>
                )}
                {Object.keys(groupedFaqs).map(category => (
                    <section key={category} className="mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <i className={`fa-solid ${categoryConfig[category]?.icon || 'fa-question-circle'} mr-3 ${categoryConfig[category]?.color || 'text-gray-500'}`}></i>
                                    {categoryConfig[category]?.title || category}
                                </h4>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {groupedFaqs[category].map((faq: any) => (
                                        <FaqItem key={faq.id} faq={faq} onEdit={handleEdit} onDelete={handleDelete} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}