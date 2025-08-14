import { OllamaAPI } from '@/helpers/ollama';
import { useState, useEffect } from 'react';
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
    const [suggestion, setSuggestion] = useState('');
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [quillRef, setQuillRef] = useState<any>(null);
    const [ollama] = useState(() => new OllamaAPI());
    const [isLoading, setIsLoading] = useState(false);

    // Function to get the current sentence being typed
    const getCurrentSentence = (text: string): string => {
        const plainText = text.replace(/<[^>]*>/g, '');
        const sentences = plainText.split(/[.!?]\s+/);
        return sentences[sentences.length - 1].trim();
    };

    // Generate suggestion using Ollama
    const generateSuggestion = async (text: string) => {
        const currentSentence = getCurrentSentence(text);

        // Only get suggestions for sentences with 3 or more words
        if (currentSentence.split(' ').length >= 3) {
            setIsLoading(true);
            try {
                const suggestion = await ollama.getSuggestion(currentSentence);

                setSuggestion(suggestion.trim());
                setShowSuggestion(!!suggestion.trim());
            } catch (error) {
                console.error('Error getting suggestion:', error);
                setSuggestion('');
                setShowSuggestion(false);
            } finally {
                setIsLoading(false);
            }
        } else {
            setSuggestion('');
            setShowSuggestion(false);
        }
    };

    const handleChange = (value: string) => {
        setContent(value);
        if (onChange) {
            onChange(value);
        }

        // Debounce suggestion generation
        const timeoutId = setTimeout(() => {
            generateSuggestion(value);
        }, 500);

        return () => clearTimeout(timeoutId);
    };

    // Handle tab key to accept suggestion
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Tab' && showSuggestion) {
            event.preventDefault();
            if (quillRef) {
                const editor = quillRef.getEditor();
                const selection = editor.getSelection();
                if (selection) {
                    // Insert the suggestion at the current cursor position
                    editor.insertText(selection.index, suggestion);
                    editor.setSelection(selection.index + suggestion.length);
                }
            }
            setSuggestion('');
            setShowSuggestion(false);
        }
    };

    // Set up keyboard listener
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [suggestion, showSuggestion, content]);

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
                ref={(el) => setQuillRef(el)}
                theme="snow"
                value={content}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ height }}
            />

            {(showSuggestion || isLoading) && (
                <div className="absolute left-0 right-0 bottom-0 bg-gray-100 p-2 rounded-md text-sm text-gray-600 border border-gray-200">
                    {isLoading ? (
                        <span>Thinking...</span>
                    ) : (
                        <span>Suggestion (press Tab): {suggestion}</span>
                    )}
                </div>
            )}

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

// Define rejection reasons with their associated prompts
const rejectionReasons = [
    {
        id: 'certificate_of_incorporation',
        label: 'Certificate of Incorporation',
        prompt: 'Generate a professional rejection email explaining that the submitted Certificate of Incorporation is incomplete, invalid, or does not meet our compliance requirements. Specify what additional documentation or corrections are needed.'
    },
    {
        id: 'status_report',
        label: 'Status Report',
        prompt: 'Generate a professional rejection email detailing why the submitted Status Report fails to meet our compliance standards. Highlight specific areas of concern and what additional information is required.'
    },
    {
        id: 'aml_policy',
        label: 'Anti-Money Laundering Policy',
        prompt: 'Generate a professional rejection email explaining how the submitted documents do not comply with our Anti-Money Laundering Policy. Provide clear guidance on the specific compliance gaps that need to be addressed.'
    },
    {
        id: 'memorandum_articles',
        label: 'Memorandum and Articles of Association',
        prompt: 'Generate a professional rejection email highlighting deficiencies in the Memorandum and Articles of Association. Specify the exact compliance requirements that have not been met and what corrections are necessary.'
    },
    {
        id: 'aml_cft_questionnaire',
        label: 'Completed AML/CFT Questionnaire',
        prompt: 'Generate a professional rejection email explaining the discrepancies or incomplete sections in the Completed AML/CFT Questionnaire. Provide specific guidance on what additional information is required to meet compliance standards.'
    },
    {
        id: 'kyc_policy',
        label: 'KYC Policy',
        prompt: 'Generate a professional rejection email detailing how the submitted documents fail to meet our Know Your Customer (KYC) Policy requirements. Specify the exact documentation or verification steps needed to proceed.'
    }
];
interface RejectionComposerProps {
    userData: {
        name: string;
        applicationId: string;
        submissionDate: string;
        merchantId: string;
    };
    onSend: (content: string) => void;
    onCancel: () => void;
    fullScreen: boolean
}

export const RejectionComposer: React.FC<RejectionComposerProps> = ({
    userData,
    onSend,
    onCancel,
    fullScreen,
}) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const url = process.env.NEXT_PUBLIC_AI_BASE_URL
    console.log("url", url)

    // Initialize Ollama API handler
    const ollama = {
        async generateResponse(prompt: string): Promise<string> {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_AI_BASE_URL}/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama3.2',
                        prompt: `You are a compliance officer writing a rejection letter body sent from Cashonrails. 
                    The applicant's name is ${userData.name}.
                    Their application ID is ${userData.applicationId}.
                    The submission date was ${userData.submissionDate}.
                    ${prompt}
                    Keep the tone professional, clear, and provide next steps if applicable. And do not include any pre-response, I just need a precise response and no end greetings, Yours sincerely Scott Lexium`,
                        stream: false,
                        options: {
                            temperature: 0.7
                        }
                    })
                });

                const data = await response.json();
                return data.response;
            } catch (error) {
                console.error('Error generating response:', error);
                throw error;
            }
        }
    };

    const handleReasonClick = async (reason: typeof rejectionReasons[0]) => {
        setIsLoading(true);
        setSelectedReason(reason.id);

        try {
            const generatedContent = await ollama.generateResponse(reason.prompt);
            setContent(generatedContent);
        } catch (error) {
            console.error('Error:', error);
            setContent('Error generating content. Please try again or compose manually.');
        } finally {
            setIsLoading(false);
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

    const { flaggedDocuments, clearFlaggedDocuments, removeFlaggedDocument } = useUI()
    const merchantDocs = flaggedDocuments[userData.merchantId] || [];
    console.log("merchantDocs", merchantDocs)

    return (
        <div className={`${fullScreen ? 'p-6 w-full h-full mx-auto' : 'p-6 max-w-3xl mx-auto'} relative`}>
            <div className="space-y-6 h-full">
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

                {selectedReason && (
                    <Alert variant='warning' description={" Editing this message before sending is recommended to ensure it accurately reflects the specific situation."} />
                )}

                <div className="min-h-[300px] h-[80%]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-500">Generating content...</div>
                        </div>
                    ) : (
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            scrollingContainer={"scroll"}
                            style={{ height: "fit-content" }}
                            placeholder="Select a reason above or start composing your message..."
                        />
                    )}
                </div>
            </div>
            <div className="flex justify-end space-x-4">
                <button
                    // onClick={() => handleReasonClick(flagged.name)}
                    className="flex-grow md:flex-grow-1 bg-[#F1FDF6] text-[#01AB79] border-[#01AB79] border p-1 rounded-md"
                    // disabled={isLoading}
                    disabled={true}
                >
                    Compose with Ai (disabled)
                </button>
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    className={`${content ? 'flex-grow md:flex-grow-0 bg-[#F1FDF6] text-[#01AB79] border-[#01AB79] border p-1 rounded-md': 'opacity-5'}`}
                    onClick={() => onSend(content)}
                    disabled={isLoading || !content}
                >
                    {!content ? <Tooltip text={'No content'}>
                        Send Rejection
                    </Tooltip> : <>
                        Send Rejection</>}
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
