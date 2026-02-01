'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { uploadApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
    Upload, X, Copy, Trash2, Image as ImageIcon,
    Search, Filter, Check
} from 'lucide-react';

interface MediaFile {
    url: string;
    filename: string;
    size: number;
    uploadedAt: string;
}

export default function MediaPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [copiedUrl, setCopiedUrl] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            router.push('/');
            return;
        }
        // In a real app, you'd fetch the media library from the backend
        // For now, we'll use localStorage to simulate persistence
        loadMediaFromStorage();
    }, [isAdmin]);

    const loadMediaFromStorage = () => {
        try {
            const stored = localStorage.getItem('mediaLibrary');
            if (stored) {
                setFiles(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading media:', error);
        }
    };

    const saveMediaToStorage = (newFiles: MediaFile[]) => {
        try {
            localStorage.setItem('mediaLibrary', JSON.stringify(newFiles));
        } catch (error) {
            console.error('Error saving media:', error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (!uploadedFiles || uploadedFiles.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(uploadedFiles).map(file => uploadApi.uploadImage(file));
            const responses = await Promise.all(uploadPromises);

            const newFiles: MediaFile[] = responses.map((res, index) => ({
                url: res.data.data.url,
                filename: uploadedFiles[index].name,
                size: uploadedFiles[index].size,
                uploadedAt: new Date().toISOString(),
            }));

            const updatedFiles = [...newFiles, ...files];
            setFiles(updatedFiles);
            saveMediaToStorage(updatedFiles);

            alert(`Successfully uploaded ${newFiles.length} file(s)`);
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(''), 2000);
    };

    const handleDelete = (fileToDelete: MediaFile) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        const updatedFiles = files.filter(f => f.url !== fileToDelete.url);
        setFiles(updatedFiles);
        saveMediaToStorage(updatedFiles);
        setSelectedFile(null);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const filteredFiles = files.filter(file =>
        file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-metallic-50">
            {/* Header */}
            <div className="bg-dark-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Media Library</h1>
                            <p className="text-metallic-400 mt-1">Manage your uploaded images</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-metallic-400">Storage Used</p>
                            <p className="text-lg font-semibold">{formatFileSize(totalSize)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Upload Area */}
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-metallic-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                        <div className="text-center">
                            <Upload className="mx-auto mb-4 text-metallic-400" size={48} />
                            <p className="text-lg font-medium text-dark-900 mb-1">
                                {uploading ? 'Uploading...' : 'Click to upload images'}
                            </p>
                            <p className="text-sm text-metallic-500">
                                or drag and drop files here
                            </p>
                            <p className="text-xs text-metallic-400 mt-2">
                                PNG, JPG, GIF up to 10MB
                            </p>
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-metallic-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-metallic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Total Files</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{files.length}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500/10">
                                <ImageIcon className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Total Size</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">{formatFileSize(totalSize)}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <Upload className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-metallic-500">Avg File Size</p>
                                <p className="text-2xl font-bold text-dark-900 mt-1">
                                    {files.length > 0 ? formatFileSize(totalSize / files.length) : '0 B'}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-500/10">
                                <Filter className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media Grid */}
                {filteredFiles.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredFiles.map((file, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm overflow-hidden group cursor-pointer"
                                onClick={() => setSelectedFile(file)}
                            >
                                <div className="aspect-square bg-metallic-100 relative overflow-hidden">
                                    <img
                                        src={file.url}
                                        alt={file.filename}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyUrl(file.url);
                                            }}
                                            className="p-2 bg-white rounded-lg hover:bg-metallic-100 transition-colors"
                                            title="Copy URL"
                                        >
                                            {copiedUrl === file.url ? (
                                                <Check size={20} className="text-green-500" />
                                            ) : (
                                                <Copy size={20} className="text-dark-900" />
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(file);
                                            }}
                                            className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} className="text-red-600" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-medium text-dark-900 truncate">{file.filename}</p>
                                    <p className="text-xs text-metallic-500 mt-1">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                        <ImageIcon className="mx-auto mb-4 text-metallic-300" size={64} />
                        <p className="text-lg font-medium text-dark-900 mb-1">No images found</p>
                        <p className="text-metallic-500">
                            {searchTerm ? 'Try a different search term' : 'Upload your first image to get started'}
                        </p>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {selectedFile && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedFile(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-dark-900">{selectedFile.filename}</h2>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="p-2 hover:bg-metallic-100 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <img
                                src={selectedFile.url}
                                alt={selectedFile.filename}
                                className="w-full rounded-lg mb-4"
                            />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-metallic-50 rounded-lg">
                                    <span className="text-sm text-metallic-600">File Size</span>
                                    <span className="text-sm font-medium text-dark-900">
                                        {formatFileSize(selectedFile.size)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-metallic-50 rounded-lg">
                                    <span className="text-sm text-metallic-600">Uploaded</span>
                                    <span className="text-sm font-medium text-dark-900">
                                        {new Date(selectedFile.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="p-3 bg-metallic-50 rounded-lg">
                                    <p className="text-sm text-metallic-600 mb-2">URL</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={selectedFile.url}
                                            readOnly
                                            className="flex-grow px-3 py-2 bg-white border border-metallic-200 rounded-lg text-sm"
                                        />
                                        <button
                                            onClick={() => handleCopyUrl(selectedFile.url)}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                                        >
                                            {copiedUrl === selectedFile.url ? (
                                                <>
                                                    <Check size={16} />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={16} />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => handleDelete(selectedFile)}
                                    className="flex-grow px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete File
                                </button>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="px-4 py-2 border border-metallic-300 text-dark-900 rounded-lg hover:bg-metallic-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
