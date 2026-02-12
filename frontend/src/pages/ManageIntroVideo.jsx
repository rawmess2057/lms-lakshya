import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiVideo, FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import IntroVideoPlayer from '../components/IntroVideoPlayer';

const ManageIntroVideo = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [videoData, setVideoData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        bunnyVideoId: '',
        type: 'global',
        isActive: true,
    });
    const [existingId, setExistingId] = useState(null);
    const [sourceType, setSourceType] = useState('url'); // 'url' or 'bunny'

    useEffect(() => {
        fetchGlobalVideo();
    }, []);

    const fetchGlobalVideo = async () => {
        try {
            const response = await axiosInstance.get('/intro-videos/global');
            const data = response.data.data;

            if (data) {
                setExistingId(data._id);
                setVideoData({
                    title: data.title || '',
                    description: data.description || '',
                    videoUrl: data.videoUrl || '',
                    bunnyVideoId: data.bunnyVideoId || '',
                    type: 'global',
                    isActive: data.isActive !== undefined ? data.isActive : true,
                });

                if (data.bunnyVideoId) {
                    setSourceType('bunny');
                } else {
                    setSourceType('url');
                }
            } else {
                // Default values if no video exists
                setVideoData({
                    title: 'Welcome to Multan Academy',
                    description: 'Platform Introduction',
                    videoUrl: '',
                    bunnyVideoId: '',
                    type: 'global',
                    isActive: true,
                });
            }
        } catch (error) {
            toast.error('Failed to load intro video data');
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        // Basic check, could be more sophisticated
        return true;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Prepare payload based on selected source type
            const payload = {
                ...videoData,
                videoUrl: sourceType === 'url' ? videoData.videoUrl : '',
                bunnyVideoId: sourceType === 'bunny' ? videoData.bunnyVideoId : null,
            };

            if (existingId) {
                await axiosInstance.put(`/intro-videos/${existingId}`, payload);
                toast.success('Intro video updated successfully');
            } else {
                const response = await axiosInstance.post('/intro-videos', payload);
                setExistingId(response.data.data._id);
                toast.success('Intro video created successfully');
            }

            // Refresh to ensure we have latest state
            fetchGlobalVideo();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save intro video');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Intro Video</h1>
                <Link to="/admin/dashboard" className="btn-outline">
                    Back to Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="card">
                    <div className="flex items-center space-x-2 mb-6 text-primary-600">
                        <FiVideo className="w-6 h-6" />
                        <h2 className="text-xl font-semibold">Landing Page Video</h2>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Video Title *
                            </label>
                            <input
                                type="text"
                                required
                                className="input-field w-full"
                                value={videoData.title}
                                onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                                placeholder="e.g. Welcome to Our Platform"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                className="input-field w-full"
                                rows="3"
                                value={videoData.description}
                                onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                                placeholder="Brief description of the video content..."
                            />
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                Video Source Type
                            </label>
                            <div className="flex space-x-6 mb-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-primary-600"
                                        name="sourceType"
                                        checked={sourceType === 'url'}
                                        onChange={() => setSourceType('url')}
                                    />
                                    <span className="ml-2 text-gray-900 dark:text-white">External URL</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-primary-600"
                                        name="sourceType"
                                        checked={sourceType === 'bunny'}
                                        onChange={() => setSourceType('bunny')}
                                    />
                                    <span className="ml-2 text-gray-900 dark:text-white">Bunny Stream ID</span>
                                </label>
                            </div>

                            {sourceType === 'url' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Video URL (YouTube, Google Drive, etc.) *
                                    </label>
                                    <input
                                        type="url"
                                        required={sourceType === 'url'}
                                        className="input-field w-full"
                                        value={videoData.videoUrl}
                                        onChange={(e) => setVideoData({ ...videoData, videoUrl: e.target.value })}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supports YouTube, Vimeo, and direct video links. Google Drive public links are also supported.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bunny Stream Video ID *
                                    </label>
                                    <input
                                        type="text"
                                        required={sourceType === 'bunny'}
                                        className="input-field w-full"
                                        value={videoData.bunnyVideoId}
                                        onChange={(e) => setVideoData({ ...videoData, bunnyVideoId: e.target.value })}
                                        placeholder="e.g. 9acac51d-..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter the Video ID (GUID) from your Bunny Stream dashboard.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={videoData.isActive}
                                onChange={(e) => setVideoData({ ...videoData, isActive: e.target.checked })}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Show on Landing Page
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving || loading}
                                className="btn-primary w-full flex justify-center items-center space-x-2"
                            >
                                {saving ? (
                                    <span>Saving...</span>
                                ) : (
                                    <>
                                        <FiSave />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <div>
                    <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Preview</h2>
                    <div className="card bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-semibold text-lg mb-2 text-center text-gray-900 dark:text-white">
                            {videoData.title || 'Video Title'}
                        </h3>
                        {videoData.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-4">
                                {videoData.description}
                            </p>
                        )}

                        <div className="rounded-lg overflow-hidden shadow-sm bg-black aspect-video flex items-center justify-center">
                            {(sourceType === 'url' && videoData.videoUrl) || (sourceType === 'bunny' && videoData.bunnyVideoId) ? (
                                <IntroVideoPlayer
                                    videoUrl={sourceType === 'url' ? videoData.videoUrl : undefined}
                                    bunnyVideoId={sourceType === 'bunny' ? videoData.bunnyVideoId : undefined}
                                    title={videoData.title}
                                    description={videoData.description}
                                    showInfo={false}
                                    autoPlay={false}
                                />
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <FiAlertCircle className="w-8 h-8 mb-2" />
                                    <span>Enter a valid URL or ID to preview</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${videoData.isActive
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                Status: {videoData.isActive ? 'Active' : 'Hidden'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-900">
                        <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2 flex items-center">
                            <FiAlertCircle className="mr-2" />
                            Note
                        </h4>
                        <p className="text-sm text-primary-700 dark:text-primary-300">
                            Changes made here will strictly reflect on the public Landing Page.
                            Ensure the video content is suitable for all visitors.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageIntroVideo;
