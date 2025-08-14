import { AxiosProgressEvent } from 'axios';
import { useState, useEffect, useRef } from 'react'
import axiosInstance from '@/helpers/axiosInstance';
import { convertFileSize, encryptData } from '@/helpers/extras'
import { useAuth } from '@/contexts/authContext';
type FileUploadProps = {
    label?: string,
    maxSize?: number,
    maxFiles?: number,
    initiateUpload: boolean,
    allowedFileTypes?: string[],
    type: 'kyc' | 'evidence',
    exportType?: 'id' | 'url',
    getValueCallback?: (data: {
        fileName: string,
        fileUploadedID: string | number,
        fileUploaded: any
    }) => void
}

/**
 * FileUpload component allows users to upload files with drag-and-drop support.
 * It handles file selection, validation, and upload progress.
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Label for the file upload input
 * @param {number} props.maxSize - Maximum file size allowed for upload
 * @param {number} props.maxFiles - Maximum number of files allowed for upload
 * @param {boolean} props.initiateUpload - Flag to initiate the upload process
 * @param {string[]} props.allowedFileTypes - Array of allowed file types for upload
 * @param {string} props.type - Type of file upload
 * @param {function} props.getValueCallback - Callback function to return uploaded file information
 */
export function FileUpload({ label, maxSize, maxFiles, initiateUpload, allowedFileTypes, type, getValueCallback }: FileUploadProps) {
    const { authState, dispatch } = useAuth();
    const filePickerRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<{
        status: 'pending' | 'success' | 'error',
        progress: number,
        file: any
    }[]>([]);
    const [fileToBeUploadedIndex, setFileToBeUploadedIndex] = useState<number[]>([]); // -1 means no file is being uploaded


    /**
     * Handles the drag enter event to indicate that files can be dropped.
     * @param {DragEvent} e - The drag event
     */
    const handleDragEnter = (e: any) => {
        e.preventDefault();
        setDragging(true);
        // console.log("dragging Enter");
    };

    /**
     * Handles the drag over event to keep the drag state active.
     * @param {DragEvent} e - The drag event
     */
    const handleDragOver = (e: any) => {
        e.preventDefault();
        setDragging(true);
        // console.log("dragging Over");
    };

    /**
     * Handles the drag leave event to indicate that files are no longer being dragged.
     * @param {DragEvent} e - The drag event
     */
    const handleDragLeave = (e: any) => {
        e.preventDefault();
        setDragging(false);
        // console.log("dragging Leave");
    };

    /**
     * Handles the drop event to process the files being dropped.
     * @param {DragEvent} e - The drop event
     */
    const handleDrop = async (e: any) => {
        e.preventDefault();
        setDragging(false);

        const files: any[] = e.dataTransfer.files;
        const newFiles: any[] = [...selectedFiles];
        const fileIndexesinNewFiles: number[] = [];

        for (let i = 0; i < files.length; i++) {
            newFiles.push({
                status: 'pending',
                progress: 0,
                file: files[i]
            });
            fileIndexesinNewFiles.push(newFiles.length - 1);
        }

        if (maxFiles) {
            if (newFiles.length > maxFiles) {
                // customToast.error(`You can only upload ${maxFiles} files`);
                return;
            }
        }

        // Check if file is in allowed file types
        if (allowedFileTypes) {
            if (allowedFileTypes.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    // Get the file extension from the file name
                    const fileExtension = files[i].name.split('.').pop().toLowerCase();

                    // Check if the file extension is in the allowed file types
                    if (!allowedFileTypes.includes(fileExtension)) {
                        // customToast.error(`Only ${allowedFileTypes.join()} File type are allowed`);
                        return;
                    }
                }
            }
        }

        // Get the file index of the new files added in array
        setFileToBeUploadedIndex(fileIndexesinNewFiles);

        // Upload File
        setSelectedFiles(newFiles);
    }

    /**
     * Handles file selection from the file input.
     * @param {Event} e - The change event from the file input
     */
    const handleFileChange = (e: any) => {
        const files = e.target.files;
        const newFiles: any[] = [...selectedFiles];
        const fileIndexesinNewFiles: number[] = [];

        for (let i = 0; i < files.length; i++) {
            newFiles.push({
                status: 'pending',
                progress: 0,
                file: files[i]
            });
            fileIndexesinNewFiles.push(newFiles.length - 1);
        }

        if (maxFiles) {
            if (newFiles.length > maxFiles) {
                // customToast.error(`You can only upload ${maxFiles} files`);
                return;
            }
        }

        // Get the file index of the new files added in array
        setFileToBeUploadedIndex(fileIndexesinNewFiles);
        setSelectedFiles(newFiles);
    }

    /**
     * Removes a selected file from the list.
     * @param {number} index - The index of the file to remove
     * @param {Event} event - The click event
     */
    const handleRemoveSelectedFiles = (index: number, event: any) => {
        event.stopPropagation();

        const newFiles: any[] = [...selectedFiles];
        newFiles.splice(index, 1);

        getValueCallback && getValueCallback({
            fileName: selectedFiles[index].file.name,
            fileUploadedID: '',
            fileUploaded: selectedFiles[index].file
        });

        setSelectedFiles(newFiles);
        setFileToBeUploadedIndex([]);
    }


    /**
     * Uploads a file to the server.
     * @param {number} fileIndex - The index of the file to upload
     * @returns {Promise} - A promise that resolves when the upload is complete
     */
    async function uploadFile(fileIndex: number) {
        // Set FormData
        const formData = new FormData();

        // Append SelectedFiles Index
        formData.append('file', selectedFiles[fileIndex].file);

        // Append type
        formData.append('type', type);

        // Set Loading
        setSelectedFiles((prev) => {
            return prev.map((file, index) => {
                if (index === fileIndex) {
                    return { ...file, status: 'pending', progress: 0 };
                }
                return file;
            });
        });

        axiosInstance.post(`/file-upload/${authState.businessID}`, formData, {
            headers: {
                Authorization: `Bearer ${authState.token}`
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                const progress = Math.round(
                    (progressEvent.loaded * 100) / (progressEvent?.total || 0)
                );

                // Update progress of the file being uploaded, using the file index
                setSelectedFiles((prev) => {
                    return prev.map((file, index) => {
                        if (index === fileIndex) {
                            return { ...file, progress };
                        }
                        return file;
                    });
                });
                console.warn('progress', progress);
            },
        }).then((response: any) => { // NOTE: Rememeber to remove any
            getValueCallback && getValueCallback({
                fileName: selectedFiles[fileIndex].file.name,
                fileUploadedID: response.data?.id,
                fileUploaded: selectedFiles[fileIndex].file
            });

            setSelectedFiles((prev) => {
                return prev.map((file, index) => {
                    if (index === fileIndex) {
                        return { ...file, status: 'success', progress: 100 };
                    }
                    return file;
                });
            });
        }).catch((error) => {
            console.log(error);
            setSelectedFiles((prev) => {
                return prev.map((file, index) => {
                    if (index === fileIndex) {
                        return { ...file, status: 'error', progress: 100 };
                    }
                    return file;
                });
            });
        });

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(`Data from ${fileIndex}`);
            }, Math.random() * 2000); // Simulated delay up to 2 seconds
        });
    }


    /**
     * Handles the upload of all selected files.
     */
    const handleUpload = async () => {
        try {
            if (!initiateUpload) return;
            if (selectedFiles.length === 0) return;
            if (fileToBeUploadedIndex.length === 0) return;

            const promises = fileToBeUploadedIndex.map(fileIndex => uploadFile(fileIndex));
            const results = await Promise.all(promises);
            // console.log(results);
        } catch (error) {
            console.error(`Error fetching data: ${error}`);
        }
    }


    /**
     * Handles retrying the upload of a file.
     * @param {Event} event - The click event
     * @param {number} index - The index of the file to retry
     */
    const handleRetryUpload = async (event: any, index: number) => {
        event.stopPropagation();
        setFileToBeUploadedIndex([index]);
    }

    useEffect(() => {
        handleUpload();
    }, [initiateUpload, fileToBeUploadedIndex])


    return (
        <>
            <input ref={filePickerRef} onChange={handleFileChange} style={{ display: 'none' }} type="file" multiple />

            <div className="">
                {label && <label className='text-sm text-[#344054] font-medium'>{label}</label>}

                <div
                    onClick={() => { filePickerRef?.current && filePickerRef?.current.click() }}
                    onDrop={handleDrop} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver}
                    className="relative cursor-pointer"
                >
                    {
                        dragging &&
                        <div className="absolute top-0 left-0 z-30 w-full h-full border border-[#E0E0E9] border-dashed bg-[#f9f8fa] flex justify-center items-center rounded-lg">
                            <h4 className="gradientText3 text-3xl font-bold tracking-tight">Drop Files Here</h4>
                        </div>
                    }
                    {
                        selectedFiles.length === 0 && (
                            <div className='flex flex-col justify-center items-center border border-[#E0E0E9] border-dashed mt-2 bg-white p-6 rounded-lg'>
                                <svg width="60" height="60" viewBox="0 0 47 46" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="3" width="40" height="40" rx="20" fill="#D1FADF"/><rect x="3.5" y="3" width="40" height="40" rx="20" stroke="#ECFDF3" strokeWidth="6"/><g clipPath="url(#clip0_794_9149)"><path d="M26.8333 26.3334L23.5 23M23.5 23L20.1666 26.3334M23.5 23V30.5M30.4916 28.325C31.3044 27.8819 31.9465 27.1808 32.3165 26.3322C32.6866 25.4837 32.7635 24.5361 32.5351 23.6389C32.3068 22.7418 31.7862 21.9463 31.0555 21.3779C30.3248 20.8095 29.4257 20.5006 28.5 20.5H27.45C27.1977 19.5244 26.7276 18.6186 26.0749 17.8509C25.4222 17.0831 24.604 16.4732 23.6817 16.0672C22.7594 15.6612 21.7571 15.4695 20.7501 15.5066C19.743 15.5437 18.7575 15.8086 17.8676 16.2814C16.9777 16.7542 16.2066 17.4226 15.6122 18.2363C15.0177 19.0501 14.6155 19.988 14.4358 20.9795C14.256 21.9711 14.3034 22.9905 14.5743 23.9611C14.8452 24.9317 15.3327 25.8282 16 26.5834" stroke="#01AB79" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_794_9149"><rect width="20" height="20" fill="white" transform="translate(13.5 13)"/></clipPath></defs></svg>
                                <p className="text-sm py-2"><span className="font-medium cursor-pointer hover:opacity-70">Click to upload</span> or Drag and drop file</p>

                                {maxFiles && (<p className="text-xs">Max of {maxFiles} file uploads</p>)}
                                {maxSize && (<p className="text-xs">Max size of {maxSize}MB</p>)}
                            </div>
                        )
                    }
                    {
                        selectedFiles.length > 0 && (
                            <div className='relative z-20 border border-[#E0E0E9] border-dashed mt-2 bg-white p-4 '>

                                <div className='flex flex-col gap-y-8 mb-8'>
                                    {
                                        selectedFiles.map((selectedFile, index) => (
                                            <div key={index} className="flex gap-x-4 ">
                                                <div className="w-[7%]">
                                                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="32" height="32" rx="16" fill="#F1FDF6"/><rect x="2" y="2" width="32" height="32" rx="16" stroke="#F1FDF6" strokeWidth="4"/><g clipPath="url(#clip0_794_9296)"><path d="M14.6667 11.3333V24.6666M21.3334 11.3333V24.6666M11.3334 18H24.6667M11.3334 14.6666H14.6667M11.3334 21.3333H14.6667M21.3334 21.3333H24.6667M21.3334 14.6666H24.6667M12.7867 11.3333H23.2134C24.016 11.3333 24.6667 11.984 24.6667 12.7866V23.2133C24.6667 24.016 24.016 24.6666 23.2134 24.6666H12.7867C11.9841 24.6666 11.3334 24.016 11.3334 23.2133V12.7866C11.3334 11.984 11.9841 11.3333 12.7867 11.3333Z" stroke="#01AB79" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_794_9296"><rect width="16" height="16" fill="white" transform="translate(10 10)"/></clipPath></defs></svg>
                                                </div>
                                                <div className="w-[86%]">
                                                    <div className='flex justify-between items-center'>
                                                        <p className="text-sm font-medium">{selectedFile?.file?.name.slice(0, 50) + `${selectedFile?.file?.name.length > 50 ? '...' : ''}`}</p>
                                                        {
                                                            selectedFile?.status === 'error' ? (
                                                                <p onClick={(event) => handleRetryUpload(event, index)} className="text-sm font-medium text-red-700">Retry</p>
                                                            ) : selectedFile?.status === 'success' ? (
                                                                <p className="text-xs text-[#2DD4BF]">Uploaded</p>
                                                            ) : (
                                                                <p className="text-xs text-[#2e2e2e]">Uploading...</p>
                                                            )
                                                        }
                                                    </div>

                                                    <p className="text-xs">{convertFileSize(selectedFile?.file?.size)}</p>
                                                    <div className="w-full bg-[#e1f7e7] h-1 rounded-full mt-4"><div style={{
                                                        width: `${selectedFile?.progress}%`,
                                                        backgroundColor: `${selectedFile?.status === 'pending' ? '#2DD4BF' :
                                                            selectedFile?.status === 'success' ? '#2DD4BF' :
                                                                selectedFile?.status === 'error' ? '#E11D48' : '#4029B6'
                                                            }`
                                                    }} className={`bg-[#2DD4BF] h-1 rounded-full`}></div></div>
                                                </div>
                                                
                                                <div onClick={(event) => handleRemoveSelectedFiles(index, event)} className="w-[7%] flex justify-end cursor-pointer hover:opacity-60">
                                                <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 13H12.1667M12.1667 13H25.5M12.1667 13V24.6667C12.1667 25.1087 12.3423 25.5326 12.6548 25.8452C12.9674 26.1578 13.3913 26.3334 13.8333 26.3334H22.1667C22.6087 26.3334 23.0326 26.1578 23.3452 25.8452C23.6577 25.5326 23.8333 25.1087 23.8333 24.6667V13H12.1667ZM14.6667 13V11.3334C14.6667 10.8913 14.8423 10.4674 15.1548 10.1548C15.4674 9.84228 15.8913 9.66669 16.3333 9.66669H19.6667C20.1087 9.66669 20.5326 9.84228 20.8452 10.1548C21.1577 10.4674 21.3333 10.8913 21.3333 11.3334V13M16.3333 17.1667V22.1667M19.6667 17.1667V22.1667" stroke="black" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>

                                <p className="text-sm text-center"><span className="font-medium cursor-pointer hover:opacity-70 underline">Click to upload </span> another or Drag and drop file</p>
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    )
}



/**
 * FileUploadDefault component is a non-functional placeholder for file uploads.
 * It displays a message indicating that a file has been uploaded.
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Label for the file upload display
 * @param {string} props.name - Name of the uploaded file
 * @param {function} props.onClear - Callback function to clear the uploaded file
 */
export function FileUploadDefault({ label, name, onClear }: {
    label: string,
    name: string,
    onClear: () => void
}) {
    // This is a faux file upload component, it is not functional, it is just for display purposes for default file upload
    return (
        <>
            <div className="">
                {label && <label className='text-sm text-[#344054] font-medium'>{label}</label>}

                <div className="relative cursor-pointer">
                    <div className='relative z-20 border border-[#E0E0E9] border-dashed mt-2 bg-white p-6 '>
                        <div className='flex flex-col gap-y-8 mb-8'>
                            <div className="flex gap-x-4 ">
                                <div className="w-[7%]">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M4.7998 4.7999C4.7998 3.47442 5.87432 2.3999 7.1998 2.3999H12.7027C13.3393 2.3999 13.9497 2.65276 14.3998 3.10285L18.4969 7.1999C18.9469 7.64999 19.1998 8.26044 19.1998 8.89696V19.1999C19.1998 20.5254 18.1253 21.5999 16.7998 21.5999H7.1998C5.87432 21.5999 4.7998 20.5254 4.7998 19.1999V4.7999Z" fill="#272363" /></svg>
                                </div>
                                <div className="w-[88%]">
                                    <div className='flex justify-between items-center'>
                                        <p className="text-sm font-medium">{name} File Uploaded</p>
                                        <p className="text-sm font-medium text-[#2DD4BF]">Uploaded</p>
                                    </div>

                                    <div className="w-full bg-[#E5E1F7] h-1 rounded-full mt-4"><div style={{
                                        width: `100%`,
                                        backgroundColor: `#2DD4BF`
                                    }} className={`bg-[#4029B6] h-1 rounded-full`}></div></div>
                                </div>
                                <div onClick={onClear} className="w-[5%] flex justify-end cursor-pointer hover:opacity-60">
                                    <svg width="12" height="12" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 1.5L23.8627 22.5627" stroke="#52536D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M23.8623 1.5L2.49961 22.5627" stroke="#52536D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-center"><span onClick={onClear} className="font-medium cursor-pointer hover:opacity-70 underline">Upload another file</span></p>
                    </div>
                </div>
            </div>
        </>
    )
}