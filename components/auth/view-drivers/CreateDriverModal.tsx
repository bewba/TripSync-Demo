import React, { useState } from 'react';
import { useToast } from '@/components/ui/Toast/Toast';
import { useCreateDriverMutation } from '@/hooks/mutations';

interface CreateDriverModalProps {
    onClose: () => void;
    onSuccess: () => void;
}


const CreateDriverModal = ({ onClose, onSuccess }: CreateDriverModalProps) => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', password: '' });
    const [loading, setLoading] = useState(false);

    // Destructure the toast hook
    const { showToast, ToastComponent } = useToast();
    const createDriverMutation = useCreateDriverMutation();

    const generatePassword = () => {
        const randomPass = Math.floor(10000000 + Math.random() * 90000000).toString();
        setFormData({ ...formData, password: randomPass });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createDriverMutation.mutateAsync(formData);
            showToast('Driver registered successfully!', 'success');

            onSuccess();
            // Small delay before closing so user sees the success message
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            showToast((error as Error)?.message || 'A network error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {ToastComponent}

            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl mx-4 animate-in fade-in zoom-in duration-200">
                    <h2 className="text-xl font-bold mb-4">Register New Driver</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                required
                                className="w-full border p-2 rounded mt-1 outline-blue-500"
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                required
                                className="w-full border p-2 rounded mt-1 outline-blue-500"
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    readOnly
                                    value={formData.password}
                                    placeholder="Click to generate password"
                                    className="w-full border p-2 rounded bg-gray-50 text-gray-600 font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="bg-gray-800 cursor-pointer text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 cursor-pointer px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.password}
                                className="flex-1 px-4 cursor-pointer py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Creating...' : 'Create Driver'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateDriverModal;