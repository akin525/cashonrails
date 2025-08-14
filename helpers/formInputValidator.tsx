import { PasswordValidationDataManual } from "@/types/formInterfaces"

// experiemntal #
// helpers/formInputValidator.ts

export enum ValidationType {
    Alphanumeric = 'alphanumeric',
    Numeric = 'numeric',
    Email = 'email',
    Url = 'url',
    Alphabetic = 'alphabetic',
    HexColor = 'hexColor',
    Password = 'password',
    PhoneNumber = 'phoneNumber',
  }
  
  const patterns: Record<ValidationType, RegExp> = {
    [ValidationType.Alphanumeric]: /^[a-zA-Z0-9]*$/,
    [ValidationType.Numeric]: /^\d+$/,
    [ValidationType.Email]: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    [ValidationType.Url]: /^(https?:\/\/)?(www\.)?[\w\-]+\.[\w]{2,}(\/\S*)?$/,
    [ValidationType.Alphabetic]: /^[a-zA-Z]*$/,
    [ValidationType.HexColor]: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
    [ValidationType.Password]: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, // Min 8 chars, 1 letter & 1 number
    [ValidationType.PhoneNumber]: /^\+?[1-9]\d{1,14}$/, // E.164 format, e.g., +123456789
  };
  
  const errorMessages: Record<ValidationType, string> = {
    [ValidationType.Alphanumeric]: 'Only alphanumeric characters are allowed.',
    [ValidationType.Numeric]: 'Only numeric values are allowed.',
    [ValidationType.Email]: 'Please enter a valid email address.',
    [ValidationType.Url]: 'Please enter a valid URL.',
    [ValidationType.Alphabetic]: 'Only alphabetic characters are allowed.',
    [ValidationType.HexColor]: 'Please enter a valid hex color code (e.g., #FFF or #FFFFFF).',
    [ValidationType.Password]: 'Password must contain at least 8 characters, including a letter and a number.',
    [ValidationType.PhoneNumber]: 'Please enter a valid phone number.',
  };
  
  /**
   * A generic function to validate input based on predefined validation types.
   * @param {string} val - The input value to validate.
   * @param {keyof typeof ValidationType} type - The type of validation as a string.
   * @param {string} [customErrorText] - Optional custom error message if validation fails.
   * @returns {string | boolean} - Returns true if valid, otherwise returns the error message.
   */
  export const validateInput = (
    val: string,
    type: keyof typeof ValidationType,
    customErrorText?: string
  ): string | boolean => {
    const pattern = patterns[ValidationType[type]];
    if (!pattern) {
      throw new Error(`Validation type "${type}" is not supported.`);
    }
    return pattern.test(val) ? true : customErrorText || errorMessages[ValidationType[type]];
  };
  
  

  
// Check Input Validity 
export const checkInputLengthValidity = (
    inputValue: string,
    minLength: number,
    maxLength: number,
    customErrorText?: string,
    // allowNegative: boolean = true
  ): string | true => {
    if (inputValue === '') {
      return customErrorText || 'This field is required';
    }
  
    if (inputValue.length < minLength) {
      return customErrorText || `Please provide ${minLength} characters or more.`;
    }
  
    if (inputValue.length > maxLength) {
      return customErrorText || `Please, keep it under ${maxLength} characters.`;
    }
  
    // if (!allowNegative && /^-/.test(inputValue)) {
    //   return 'Negative values are not allowed';
    // }
  
    return true;
  };
  

// Check Number Input Validity
export const checkNumberInputValidity = (inputValue: string, min: number, max: number, customErrorText?: string) => {
    if (inputValue === '') {
        return customErrorText || 'This field is required'
    } else if (Number(inputValue) < min) {
        return customErrorText || `Please provide a number greater than or equal to ${min}`
    } else if (Number(inputValue) > max) {
        return customErrorText || `Please provide a number less than or equal to ${max}`
    } else {
        return true
    }
}


// Email Input Regex
export const validateEmailAddress = (inputValue: string) => {
    const emailValidRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return inputValue.match(emailValidRegex) ? true : false
}


// Email Validity Check
export const checkEmailInputValidity = (inputValue: string) => {
    if (inputValue === '') {
        return 'Email is required'
    } else {
        return validateEmailAddress(inputValue) ? true : 'Please enter a valid email address'
    }
}


// Select Dropdown Validity Check
export const checkSelectInputValidity = (inputValue: string) => {
    if (inputValue === '') {
        return 'Please select an option'
    } else {
        return true
    }
}

// Check Website URL Validity
export const checkWebsiteUrlValidity = (inputValue: string, customErrorText?: string) => {
    const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;

    if (!inputValue.match(urlPattern)) {
        return customErrorText || 'Invalid website URL format. Please include "http://" or "https://" if missing.';
    } else {
        return true;
    }
}


// Validate input (check that it's not a URL link, email, or phone number, but a name; can contain letters and numbers, but no special characters or white spaces at the beginning or end)
// export const checkNameInputValidity = (inputValue: string, customErrorText?: string) => {
//     const namePattern = /^[a-zA-Z0-9]+(([',. -][a-zA-Z0-9 ])?[a-zA-Z0-9]*)*$/;

//     if (!inputValue.match(namePattern)) {
//         return customErrorText || 'Invalid name format. Name must not contain special characters or white spaces at the beginning or end.';
//     } else {
//         return true;
//     }
// }


export const checkNameInputValidity = (inputValue: string, customErrorText?: string) => {
    const pattern = /^[a-zA-Z0-9]+$/;
    if (!pattern.test(inputValue)) {
        return customErrorText || 'Invalid alias format. Name must not contain special characters or white spaces.';
    } else {
        return true;
    }
}




// Check Password Validity
export const checkPasswordValidity = (inputValue: string, customErrorText?: string) => {
    // Check if password contains at least one uppercase letter
    if (!inputValue.match(/[A-Z]/)) {
        return customErrorText || 'Password must contain at least one uppercase letter'
    } else if (!inputValue.match(/[a-z]/)) {
        return customErrorText || 'Password must contain at least one lowercase letter'
    } else if (!inputValue.match(/[0-9]/)) {
        return customErrorText || 'Password must contain at least one number'
    } else if (!inputValue.match(/[!@#$%^&*(),.?":{}|<>]/)) {
        return customErrorText || 'Password must contain at least one special character'
    } else if (inputValue.length < 8) {
        return customErrorText || 'Password must be at least 8 characters long'
    } else {
        return true
    }
}


// Check Password Validity Manually

export const checkPasswordValidityManual = (inputValue: string) => {
    const validationData: PasswordValidationDataManual = {
        upperCase: false,
        lowerCase: false,
        number: false,
        specialCharacter: false,
        length: false
    }

    // Check if password contains at least one uppercase letter
    if (!inputValue.match(/[A-Z]/)) {
        validationData.upperCase = false
    } else {
        validationData.upperCase = true
    }

    // Check if password contains at least one lowercase letter
    if (!inputValue.match(/[a-z]/)) {
        validationData.lowerCase = false
    } else {
        validationData.lowerCase = true
    }

    // Check if password contains at least one number
    if (!inputValue.match(/[0-9]/)) {
        validationData.number = false
    } else {
        validationData.number = true
    }

    // Check if password contains at least one special character
    if (!inputValue.match(/[!@#$%^&*(),.?":{}|<>]/)) {
        validationData.specialCharacter = false
    } else {
        validationData.specialCharacter = true
    }

    // Check if password is at least 8 characters long
    if (inputValue.length < 8) {
        validationData.length = false
    } else {
        validationData.length = true
    }

    return validationData
}