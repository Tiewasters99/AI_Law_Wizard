'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface UploadProgress {
    batchId?: string;
    totalFiles: number;
    processedFiles: number;
    failedFiles: number;
    progress: number;
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
    message: string;
    failedFileList: Array<{ fileName: string; error: string }>;
}

interface LargeFileUploadHandlerProps {
    onUploadComplete?: (results: any) => void;
    onUploadError?: (error: string) => void;
    maxFiles?: number;
    maxTotalSize?: number;
    maxFileSize?: number;
}

export const LargeFileUploadHandler: React.FC<LargeFileUploadHandlerProps> = ({
    onUploadComplete,
    onUploadError,
    maxFiles = 20,
    maxTotalSize = 200 * 1024 * 1024, // 200MB
  maxFileSize = 50 * 1024 * 1024 // 50MB
}) => {
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        totalFiles: 0,
        processedFiles: 0,
        failedFiles: 0,
        progress: 0,
        status: 'idle',
        message: '',
        failedFileList: []
    });

    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const validateFiles = useCallback((files: FileList): string | null => {
        if (files.length === 0) {
            return 'No files selected';
        }

        if (files.length > maxFiles) {
            return `Too many files. Maximum allowed is ${maxFiles}`;
        }

        const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
        if (totalSize > maxTotalSize) {
            return `Total file size too large. Maximum allowed is ${Math.round(maxTotalSize / (1024 * 1024))}MB`;
        }

        for (const file of files) {
            if (file.size > maxFileSize) {
                return `File "${file.name}" is too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB`;
            }
        }

        return null;
    }, [maxFiles, maxTotalSize, maxFileSize]);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const validationError = validateFiles(files);
        if (validationError) {
            onUploadError?.(validationError);
            return;
        }

        setSelectedFiles(files);
        setUploadProgress(prev => ({
            ...prev,
            totalFiles: files.length,
            status: 'idle',
            message: `${files.length} files selected (${Math.round(Array.from(files).reduce((sum, file) => sum + file.size, 0) / (1024 * 1024))}MB total)`
        }));
    }, [validateFiles, onUploadError]);

    const startProgressTracking = useCallback((batchId: string) => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = setInterval(async () => {
            try {
                const response = await fetch(`/api/embedding/jobs/${batchId}`);
                if (response.ok) {
                    const jobData = await response.json();
                    setUploadProgress(prev => ({
                        ...prev,
                        progress: jobData.progress,
                        processedFiles: jobData.completedChunks,
                        failedFiles: jobData.failedChunks,
                        status: jobData.status === 'COMPLETED' ? 'completed' : 
                               jobData.status === 'FAILED' ? 'error' : 'processing',
                        message: `Processing: ${jobData.completedChunks}/${jobData.totalChunks} chunks completed`
                    }));

                    if (jobData.status === 'COMPLETED' || jobData.status === 'FAILED') {
                        if (progressIntervalRef.current) {
                            clearInterval(progressIntervalRef.current);
                            progressIntervalRef.current = null;
                        }
                        
                        if (jobData.status === 'COMPLETED') {
                            onUploadComplete?.(jobData);
                        }
                    }
                }
            } catch (error) {
                console.error('Error tracking progress:', error);
            }
        }, 2000); // Check every 2 seconds
    }, [onUploadComplete]);

    const handleUpload = useCallback(async () => {
        if (!selectedFiles) return;

        setUploadProgress(prev => ({
            ...prev,
            status: 'uploading',
            message: 'Uploading files...'
        }));

        try {
            const formData = new FormData();
            Array.from(selectedFiles).forEach(file => {
                formData.append('files', file);
            });

            const response = await fetch('/api/embedding', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            if (result.batchId) {
                // Large batch - start progress tracking
                setUploadProgress(prev => ({
                    ...prev,
                    batchId: result.batchId,
                    status: 'processing',
                    message: 'Processing files in background...'
                }));
                startProgressTracking(result.batchId);
            } else {
                // Small batch - immediate results
                setUploadProgress(prev => ({
                    ...prev,
                    processedFiles: result.files?.length || 0,
                    failedFiles: result.failedFiles?.length || 0,
                    progress: 100,
                    status: 'completed',
                    message: result.message,
                    failedFileList: result.failedFiles || []
                }));
                onUploadComplete?.(result);
            }

        } catch (error) {
            console.error('Upload error:', error);
            setUploadProgress(prev => ({
                ...prev,
                status: 'error',
                message: error instanceof Error ? error.message : 'Upload failed'
            }));
            onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
        }
    }, [selectedFiles, startProgressTracking, onUploadComplete, onUploadError]);

    const resetUpload = useCallback(() => {
        setSelectedFiles(null);
        setUploadProgress({
            totalFiles: 0,
            processedFiles: 0,
            failedFiles: 0,
            progress: 0,
            status: 'idle',
            message: '',
            failedFileList: []
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const getStatusIcon = () => {
        switch (uploadProgress.status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'processing':
            case 'uploading':
                return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
            default:
                return null;
        }
    };

    const getStatusColor = () => {
        switch (uploadProgress.status) {
            case 'completed':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            case 'processing':
            case 'uploading':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png,.gif,.webp,.json,.csv,.xls,.xlsx"
                />
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                    disabled={uploadProgress.status === 'uploading' || uploadProgress.status === 'processing'}
                >
                    Select Files
                </Button>
                <p className="text-sm text-gray-500 mt-2 text-center">
                    Max {maxFiles} files, {Math.round(maxTotalSize / (1024 * 1024))}MB total, {Math.round(maxFileSize / (1024 * 1024))}MB per file
                </p>
            </div>

            {selectedFiles && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            {Array.from(selectedFiles).length} files selected
                        </span>
                        <Button
                            onClick={handleUpload}
                            disabled={uploadProgress.status === 'uploading' || uploadProgress.status === 'processing'}
                            className="ml-2"
                        >
                            Upload & Process
                        </Button>
                    </div>
                </div>
            )}

            {uploadProgress.status !== 'idle' && (
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        {getStatusIcon()}
                        <span className={`text-sm font-medium ${getStatusColor()}`}>
                            {uploadProgress.message}
                        </span>
                    </div>

                    {uploadProgress.status === 'processing' || uploadProgress.status === 'uploading' ? (
                        <Progress value={uploadProgress.progress} className="w-full" />
                    ) : null}

                    {uploadProgress.status === 'completed' && (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                Successfully processed {uploadProgress.processedFiles} files
                                {uploadProgress.failedFiles > 0 && (
                                    <span className="text-orange-600">
                                        {' '}({uploadProgress.failedFiles} failed)
                                    </span>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {uploadProgress.status === 'error' && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {uploadProgress.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {uploadProgress.failedFileList.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-red-600">Failed Files:</h4>
                            <div className="space-y-1">
                                {uploadProgress.failedFileList.map((file, index) => (
                                    <div key={index} className="text-xs text-red-600">
                                        • {file.fileName}: {file.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(uploadProgress.status === 'completed' || uploadProgress.status === 'error') && (
                        <Button onClick={resetUpload} variant="outline" className="w-full">
                            Upload More Files
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
