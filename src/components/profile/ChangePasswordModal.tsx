'use client';
export default function ChangePasswordModal({ setIsPasswordModalOpen }: any) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* ... আপনার Change Password মডালের ফর্ম এবং বাটন ... */}
                <button onClick={() => setIsPasswordModalOpen(false)}>Close</button>
            </div>
        </div>
    );
}