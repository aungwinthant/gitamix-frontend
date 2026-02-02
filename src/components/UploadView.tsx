import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface UploadViewProps {
    onUpload: (file: File) => void;
    isUploading: boolean;
    error: Error | null;
    isAuthenticated: boolean;
    onLoginRequest: () => void;
}

export const UploadView = ({ onUpload, isUploading, error, isAuthenticated, onLoginRequest }: UploadViewProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (!isAuthenticated) {
            onLoginRequest();
            return;
        }
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0]);
        }
    }, [onUpload, isAuthenticated, onLoginRequest]);

    const { getRootProps, getInputProps, isDragActive, fileRejections, open } = useDropzone({
        onDrop,
        accept: {
            'audio/*': [],
            'video/*': [],
        },
        maxSize: 100 * 1024 * 1024, // 100MB
        multiple: false,
        disabled: isUploading,
        noClick: true, // We handle click manually
    });

    const handleClick = () => {
        if (!isAuthenticated) {
            onLoginRequest();
        } else {
            open();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
                        Gitamix
                    </h1>
                    <p className="text-xl text-gray-400">AI-Powered Audio Separation & Mixing</p>
                </div>

                <div
                    {...getRootProps()}
                    onClick={handleClick}
                    className={twMerge(
                        "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer overflow-hidden group",
                        isDragActive ? "border-cyan-500 bg-cyan-500/10" : "border-gray-700 hover:border-gray-600 bg-gray-900/50",
                        isUploading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center gap-4 relative z-10">
                        <div className={twMerge(
                            "p-4 rounded-full bg-gray-800 transition-transform duration-300 group-hover:scale-110",
                            isDragActive && "bg-cyan-500/20"
                        )}>
                            {isUploading ? (
                                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-cyan-400" />
                            )}
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold text-gray-200">
                                {isDragActive ? "Drop your track here" : "Upload a song"}
                            </h3>
                            <p className="text-sm text-gray-400">
                                Drag & drop or click to browse (Max 100MB)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Errors */}
                {(error || fileRejections.length > 0) && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-bottom-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">
                            {error?.message || fileRejections[0]?.errors[0]?.message || "Something went wrong"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
