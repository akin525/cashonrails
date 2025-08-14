import { useEffect } from 'react'

// Detect User Stops Typing, by using a delay to detect when the user stops typing and then call the callback function
/**
 * 
 * @param value 
 * @param delay 
 * @param callback 
 */
export const useTypingStoppedDetector = (value: string | number, delay = 1000, callback: () => void) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            callback()
        }, delay)

        return () => clearTimeout(timer)
    }, [value])
}