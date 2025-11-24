import { useContext } from 'react'
import { SleepContext } from '../contexts/SleepContext'

export function useSleep() {
    const context = useContext(SleepContext)
    
    if (!context) {
        throw new Error("useSleep must be used within a SleepProvider")
    }
    
    return context
}