import { useState } from 'react'
import exportFromJSON from 'export-from-json'

type FileFormatType = 'csv' | 'xls';
type ExportType = (FileFormatType | {
    type: FileFormatType;
    callback?: () => void;
})
type ExportTypeArr = ExportType[];

export default function DownloadButton({ fileName, header, data, exportType, disabled, onClick, onSelect, onDownload, buttonChild }: { fileName: string, header: string[], data: any, exportType: ExportTypeArr, disabled?: boolean, onClick?: () => void, onSelect?: (type: ExportType) => void, onDownload?: () => void , buttonChild?: React.ReactNode}) {
    const [openDownloadOptions, setOpenDownloadOptions] = useState(false)

    const handleClickDownloadOptions = () => {
        try {
            if (disabled) return;

            onClick && onClick();

            if (exportType.length === 0) {
                convertJsonToCSV('csv');
                return;
            }

            if (exportType.length === 1) {
                // If exportType is an object, it means it's a link, so redirect to that link
                if (typeof exportType[0] === 'object') {
                    exportType[0]?.callback && exportType[0].callback();
                    return;
                }

                convertJsonToCSV(exportType[0]);
                return;
            }

            setOpenDownloadOptions(val => !val);
        } catch (err) {
            console.error(err);
        }
    }


    const convertJsonToCSV = async (exportType: ExportType) => { // Convert json to csv, xls, then download
        try {
            // If exportType is an object, it means it's a link, so redirect to that link
            if (typeof exportType === 'object') {
                exportType?.callback && exportType.callback();
                return;
            }

            let exportFromJSONVar: any = null;

            if (exportType === 'csv') {
                exportFromJSONVar = exportFromJSON.types.csv
            } else if (exportType === 'xls') {
                exportFromJSONVar = exportFromJSON.types.xls
            } else {
                exportFromJSONVar = exportFromJSON.types.csv
            }

            data = [header, ...data];

            exportFromJSON({ data, fileName, exportType: exportFromJSONVar });

            onDownload && onDownload();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className='inline-block relative'>
            <button onClick={handleClickDownloadOptions} className={`${disabled ? ' opacity-30 ' : ' opacity-100 '} md:w-auto flex justify-between items-center gap-x-2 border border-[#E0E0E9] rounded-sm px-4 py-2.5`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.0001 12.0833V3.75M10.0001 12.0833C9.41658 12.0833 8.32636 10.4214 7.91675 10M10.0001 12.0833C10.5836 12.0833 11.6738 10.4214 12.0834 10" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.6666 13.75C16.6666 15.8183 16.2349 16.25 14.1666 16.25H5.83325C3.76492 16.25 3.33325 15.8183 3.33325 13.75" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <p className='text-sm font-medium'>Download</p>
            </button>
            {
                buttonChild && buttonChild
            }

            {
                openDownloadOptions && (
                    <div data-target='downloadOptionsTarget' className={`w-[170px] absolute top-10 left-0 bg-white rounded-md shadow-md p-1`}>
                        <ul className='w-full flex flex-col text-sm'>
                            {
                                exportType.map((type: ExportType, index: number) => (
                                    <li key={index} onClick={() => {
                                        convertJsonToCSV(type);
                                        onSelect && onSelect(type);
                                    }} className='hover:bg-gray-100 cursor-pointer duration-300 px-3 py-2'>Download as <span className='uppercase'>{
                                        typeof type === 'object' ? type.type : type
                                    }</span></li>
                                ))
                            }
                        </ul>
                    </div>
                )
            }
        </div>
    )
}


export const useDownloadButton = ({ fileName, header, data, exportType, onDownload }: { fileName: string, header: string[], data: any, exportType?: 'csv' | 'xls', onDownload?: () => void }) => {

    const convertJsonToCSV = async () => { // Convert json to csv, xls, then download
        try {
            if (exportType === 'csv') {
                exportType = exportFromJSON.types.csv
            } else if (exportType === 'xls') {
                exportType = exportFromJSON.types.xls
            } else {
                exportType = exportFromJSON.types.csv
            }

            data = [header, ...data];

            exportFromJSON({ data, fileName, exportType })

            onDownload && onDownload();
        } catch (err) {
            console.error(err);
        }
    }

    return {
        convertJsonToCSV
    }
}