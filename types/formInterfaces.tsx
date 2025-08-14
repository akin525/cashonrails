export interface FormInputsProps {
    label: string;
    name: string;
    type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'date'; // Restrict to valid HTML input types
    defaultValue?: string | number;
    clearValue?: string | null;
    staticValue?: string | number;
    placeholder?: string;
    getValue?: (value: string | number) => void;
    min?: number;
    max?: number;
    loading?: boolean;
    autoComplete?: string;
    tooltip?: string;
    disabled?: boolean;
    payloadValues?: any;
    setPayloadValues?: React.Dispatch<React.SetStateAction<any>>;
    validationFunc?: (inputValue: string) => string | boolean;
    onBlurEventCallback?: (inputValue: string) => void;
    leadingItem?: React.ReactNode;
    trailingItem?: React.ReactNode;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

// interface FormInputsProps {
//     label: string;
//     name: string;
//     type?: string;
//     defaultValue?: string;
//     clearValue?: boolean;
//     leadingItem?: React.ReactNode;
//     trailingItem?: React.ReactNode;
//     getValue?: (value: string) => void;
//     placeholder?: string;
//     min?: number;
//     max?: number;
//     loading?: boolean;
//     autoComplete?: string;
//     tooltip?: string;
//     disabled?: boolean;
//     validationFunc?: (value: string) => { error: string | boolean };
//     payloadValues?: Record<string, any>;
//     setPayloadValues?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
//     onBlurEventCallback?: (value: string) => void;
//     onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
// }

export interface FormInputsWithTextButtonProps extends FormInputsProps {
    textButtonProps: {
        text: string;
        loading: string | boolean;
        isInputValid: boolean;
        isActive: boolean;
        onClick: () => void;
    };
}

export interface FormPasswordProps {
    label: string;
    type?: 'text' | 'number';
    name: string;
    placeholder?: string;
    tooltip?: string;
    defaultValue?: string | number;
    setPayloadValues?: React.Dispatch<React.SetStateAction<any>>;
    validationFunc?: (inputValue: string) => string | boolean;
    onBlurEventCallback?: (inputValue: string) => void;
}

export interface PasswordValidationDataManual {
    upperCase: boolean; lowerCase: boolean; number: boolean; specialCharacter: boolean; length: boolean;
}

export interface FormSelectProps {
    label?: string;
    name: string;
    placeholder?: { label: string, value: string | number };
    options: { value: string | number; label: string; }[];
    tooltip?: string;
    loading?: boolean;
    defaultValue?: string | number;
    getValue?: (value: string | number) => void;
    disabled?: boolean;
    payloadValues?: any;
    setPayloadValues?: React.Dispatch<React.SetStateAction<any>>;
    validationFunc?: (inputValue: string) => string | boolean;
    onBlurEventCallback?: (inputValue: string) => void;
    className?: string;
    getValueOnChange?: ({ name, value }: { name: string; value: any }) => void;

}

export interface FormInputSelectDropdownProps {
    type: string;
    name: string;
    defaultValue?: string | number;
    placeholder?: string;
    label: string;
    tooltip?: string;
    autoComplete?: string;
    disabled?: boolean;
    options: { value: string | number; label: string; }[];
    onKeyUpValue?: (value: string | number) => void;
    getValue?: (value: string | number) => void;
    setPayloadValues?: React.Dispatch<React.SetStateAction<any>>;
    validationFunc?: (inputValue: string) => string | boolean;
    onBlurEventCallback?: (inputValue: string) => void;
}

export interface FormInputAndSelectProps {
    label: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    selectProps: {
        name: string;
        placeholder?: string;
        options: { value: string | number; label: string; }[];
        defaultValue?: string | number;
        disabled?: boolean;
        prependFlag?: boolean;
        getValue?: (value: string | number) => void;
        validationFunc?: (inputValue: string) => string | boolean;
        setPayloadValues?: React.Dispatch<React.SetStateAction<any>>;
        onBlurEventCallback?: (inputValue: string) => void;
    },
    inputProps: {
        name: string;
        type: string;
        placeholder?: string;
        defaultValue?: string | number;
        disabled?: boolean;
        getValue?: (value: string | number) => void;
        validationFunc?: (inputValue: string) => string | boolean;
        setPayloadValues?: React.Dispatch<React.SetStateAction<any>>;
        onBlurEventCallback?: (inputValue: string) => void;
    }
} 

export interface FormCheckboxProps {
    label: string;
    initialValue: boolean;
    name: string;
    getValue?: ({ name, value }: { name: string; value: boolean }) => void;
    getValueOnChange?: ({ name, value }: { name: string; value: boolean }) => void;
    triggerCheckbox?: boolean;
    setPayloadValues?: React.Dispatch<React.SetStateAction<unknown>>;
    onBlurEventCallback?: (inputValue: string) => void;
}

export interface FormMultipleInputsProps {
    length: number;
    type?: 'text' | 'password';
    getValueCallback: (value: string) => void;
    onCompleteValuesCallback?: (inputValue: string) => void;
}

export interface FormToggleSwitchProps {
    defaultChecked: boolean;
    getValueCallback: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean
}

export interface FormRadioProps {
    name: string;
    options: {
        value: string | number;
        label: string;
        title?: string;
    }[];
    initialValue: string | number;
    getValueCallback: (value: string | number) => void;
}

export interface FormInCreDecrementNumberProps {
    label?: string;
    handleOnClick: (value: number) => void;
}

export interface FormMultipleInputAddRemoveProps {
    label: string;
    addNewText: string;
    handleCallback: (value: (string | number)[]) => void;
}