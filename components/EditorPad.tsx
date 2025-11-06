import { useState } from 'react';
import ReactQuill, { QuillOptions } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Alert, { AlertDescription } from './alert';
import { StringUtils } from '@/helpers/extras';
import { useUI } from '@/contexts/uiContext';
import { CloseIcon } from '@/assets/icons';
import { Tooltip } from './utils';

interface DraftPadProps {
    initialContent?: string;
    placeholder?: string;
    height?: string;
    onChange?: (content: string) => void;
    uniqueId: string
}


export const DraftPad: React.FC<DraftPadProps> = ({
    initialContent = '',
    placeholder = 'Compose your email...',
    height = '100%',
    onChange,
}) => {
    const [content, setContent] = useState(initialContent);

    const handleChange = (value: string) => {
        setContent(value);
        if (onChange) {
            onChange(value);
        }
    };

    const modules: QuillOptions["modules"] = {
        toolbar: {
            container: [
                [{ 'font': [] }],
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
        },
        clipboard: {
            matchVisual: false,
        }
    };

    const formats = [
        'font', 'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet',
        'align',
        'link', 'image'
    ];

    return (
        <div className="email-editor relative">
            <ReactQuill
                theme="snow"
                value={content}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ height }}
            />

            <style jsx global>{`
        .ql-editor {
          min-height: 200px;
          font-family: Arial, sans-serif;
          font-size: 14px;
        }
        .ql-toolbar {
          border-radius: 4px 4px 0 0;
        }
        .ql-container {
          border-radius: 0 0 4px 4px;
        }
      `}</style>
        </div>
    );
};


interface RejectionComposerProps {
    userData: {
        name: string;
        applicationId: string;
        submissionDate: string;
        merchantId: string;
    };
    availableDocuments?: any[];
    onSend: (content: string) => void;
    onCancel: () => void;
    fullScreen: boolean
}

export const RejectionComposer: React.FC<RejectionComposerProps> = ({
    userData,
    availableDocuments = [],
    onSend,
    onCancel,
    fullScreen,
}) => {
    const [content, setContent] = useState('');
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const { addFlaggedDocument, removeFlaggedDocument, flaggedDocuments, clearFlaggedDocuments } = useUI();

    const modules: QuillOptions["modules"] = {
        toolbar: {
            container: [
                [{ 'font': [] }],
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
        },
        clipboard: {
            matchVisual: false,
        }
    };

    const merchantDocs = flaggedDocuments[userData.merchantId] || [];
    console.log("merchantDocs", merchantDocs);

    const handleDocumentSelect = (doc: any) => {
        const isAlreadyFlagged = merchantDocs.some(flagged => flagged.id === doc.info);
        if (isAlreadyFlagged) {
            removeFlaggedDocument(doc.info, userData.merchantId);
        } else {
            addFlaggedDocument(
                { id: doc.info, name: doc.info },
                userData.merchantId
            );
        }
    };

    return (
        <div className={`${fullScreen ? 'p-6 w-full h-full mx-auto' : 'p-6 max-w-3xl mx-auto'} relative`}>
            <div className="space-y-6 h-full">
                {/* Available Documents Selection */}
                {availableDocuments.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select documents that need correction:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {availableDocuments.map((doc) => {
                                const isSelected = merchantDocs.some(flagged => flagged.id === doc.info);
                                return (
                                    <button
                                        key={doc.id}
                                        onClick={() => handleDocumentSelect(doc)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                            isSelected
                                                ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                                                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {StringUtils.capitalizeWords(doc.info)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Selected/Flagged Documents Display */}
                <div className="flex flex-wrap gap-2">
                    {merchantDocs.map((flagged) => (
                        <div
                            key={flagged.id}
                            // onClick={() => handleReasonClick(flagged.name)}
                            className="flex-grow md:flex-grow-0 bg-[#F1FDF6] text-[#01AB79] border-[#01AB79] border p-1 rounded-md relative flex items-center gap-2"
                            // disabled={isLoading}
                        >
                            {StringUtils.capitalizeWords(flagged.name)}
                            <button
                                onClick={() => removeFlaggedDocument(flagged.id, userData.merchantId)}
                                className='text-gray-300'
                            ><CloseIcon /></button>
                        </div>
                    ))}
                    {merchantDocs.length > 0 && <button onClick={()=> clearFlaggedDocuments(userData.merchantId)}>
                        Clear
                    </button>}
                </div>

                <div className="min-h-[300px] h-[80%]">
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        scrollingContainer={"scroll"}
                        style={{ height: "fit-content" }}
                        placeholder="Start composing your rejection message..."
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-4">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${
                        content 
                            ? 'bg-[#01AB79] text-white hover:bg-[#019A6B]' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={() => onSend(content)}
                    disabled={!content}
                >
                    {!content ? (
                        <Tooltip text={'No content'}>
                            Send Rejection
                        </Tooltip>
                    ) : (
                        'Send Rejection'
                    )}
                </button>
            </div>
            <style jsx global>{`
        .ql-editor {
          min-height: 200px;
          font-family: Arial, sans-serif;
          font-size: 14px;
        }
        .ql-toolbar {
          border-radius: 4px 4px 0 0;
        }
        .ql-container {
          border-radius: 0 0 4px 4px;
        }
      `}</style>
        </div>
    );
};
