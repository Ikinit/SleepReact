import { createContext, useState } from "react";
import { databases, account } from "../lib/appwrite";
import { ID, Permission, Role, Query } from "react-native-appwrite";
import { useUser } from "../hooks/useUser";

const DATABASE_ID = '68ced0fb00362096eee7'
const COLLECTION_ID = 'sleep_goals'

export const GoalsContext = createContext()

export function GoalsProvider({ children }){
    const [goals, setGoals] = useState([])
    const { user } = useUser()

    // Fetch goals for the current user.
    // Accepts options for limit and ordering.
    async function fetchGoals({ limit = 100, orderDesc = true } = {}){
        if(!user) return []

        try{
            const queries = [ Query.equal('userID', user.$id) ]
            if(orderDesc) queries.push(Query.orderDesc('$createdAt'))
            if(limit) queries.push(Query.limit(limit))

            const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries)
            setGoals(res.documents)
            return res.documents
        }catch(error){
            console.error('Error fetching goals:', error.message)
            throw error
        }
    }

    async function createGoal(data){
    if(!user) throw new Error('User is not authenticated')

        const payload = {
            ...data,
            userID: user.$id,
            status: data.status || 'Active'
        }
        
        // Normalize `days` array -> comma string for storage/display
        if(Array.isArray(payload.days)){
            try{
                payload.days = payload.days.join(',')
            }catch(_){
                payload.days = JSON.stringify(payload.days)
            }
        }

        try{
            try{
                // Confirm server session is active (helpful diagnostic)
                console.log('Goals.createGoal - client user:', user)
                const serverUserLog = await account.get().catch(e => {
                    console.log('Goals.createGoal - account.get() error:', e?.message ?? e)
                    return null
                })
                console.log('Goals.createGoal - account.get() returned:', serverUserLog)
            }catch(_){/* ignore logging errors */}

            const serverUser = await account.get().catch(() => null)
            if(!serverUser) {
                throw new Error('No active server session (account.get() returned null). Please sign in again.')
            }
            if(serverUser.$id !== user.$id){
                console.warn('Goals.createGoal - mismatch between client user and server session', { clientId: user.$id, serverId: serverUser.$id })
            }

            // Create with owner-only permissions so only the user can access it
            const newGoal = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                payload,
                [
                    Permission.read(Role.user(user.$id)),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]
            )

            setGoals(prev => [newGoal, ...prev])
            return newGoal
        }catch(error){
            console.error('Error creating goal - full error:', error)
            console.error('Error creating goal - message:', error?.message ?? error)

            const msg = (error && (error.message || (error.response && error.response.message))) || ''
            const code = error?.code || error?.status || null

            // If permission denied, attempt a development fallback (document created without custom permissions)
            if(code === 401 || code === 403 || /not authorized|unauthorized/i.test(msg)){
                try{
                    console.warn('Appwrite create unauthorized - attempting fallback create WITHOUT custom permissions (dev).')
                    const fallback = await databases.createDocument(
                        DATABASE_ID,
                        COLLECTION_ID,
                        ID.unique(),
                        payload,
                        [] // no custom permissions -> public according to collection settings

                    )
                    console.warn('Fallback create succeeded. Document created without owner-only permissions; update collection permissions in Appwrite Console to enforce owner-only access.')
                    setGoals(prev => [fallback, ...prev])
                    return fallback
                }catch(fallbackErr){
                    console.error('Fallback create also failed:', fallbackErr)
                    throw new Error('Appwrite rejected the create request (unauthorized) and fallback create failed.\n' +
                        'Likely causes: client session missing/expired, project/endpoint mismatch, or collection create policy disallows this operation.\n' +
                        'Fixes: 1) Verify you are signed in (account.get()). 2) In Appwrite Console -> Database -> Collections -> "sleep_goals" set Create to "Authenticated" or allow creating with custom permissions.\n')
                }
            }

            throw error
        }
    }

    async function updateGoal(id, updates){
        try{
            const payload = {
                ...updates
            }

            if(Array.isArray(payload.days)){
                try{
                    payload.days = payload.days.join(',')
                }catch(_){
                    payload.days = JSON.stringify(payload.days)
                }
            }

            const updated = await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id,
                payload
            )

            setGoals(prev => prev.map(g => g.$id === id ? updated : g))
            return updated
        }catch(error){
            console.error('Error updating goal:', error.message)
            throw error
        }
    }

    async function deleteGoal(id){
        try{
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id)
            setGoals(prev => prev.filter(g => g.$id !== id))
            return true
        }catch(error){
            console.error('Error deleting goal:', error.message)
            throw error
        }
    }

    async function setGoalStatus(id, status){
        if(!['Active','Completed','Cancelled'].includes(status)){
            throw new Error('Invalid status')
        }

        return updateGoal(id, { status })
    }

    // Filter goals client-side for date-range overlap if server-side date queries are not used.
    async function searchGoals({ status, startDate, endDate, limit = 100 } = {}){
        if(!user) return []

        try{
            const queries = [ Query.equal('userID', user.$id), Query.limit(limit) ]
            if(status) queries.push(Query.equal('status', status))

            const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries)
            let docs = res.documents || []

            if(startDate || endDate){
                const startT = startDate ? new Date(startDate).getTime() : null
                const endT = endDate ? new Date(endDate).getTime() : null

                docs = docs.filter(d => {
                    const docStart = d.startDate ? Date.parse(d.startDate) : null
                    const docEnd = d.endDate ? Date.parse(d.endDate) : null

                    // If both provided, check for overlap between ranges
                    if(startT !== null && endT !== null){
                        const s = docStart !== null ? docStart : -Infinity
                        const e = docEnd !== null ? docEnd : Infinity
                        return s <= endT && e >= startT
                    }

                    // Otherwise check partial conditions
                    if(startT !== null){
                        const e = docEnd !== null ? docEnd : docStart
                        return (e !== null) && e >= startT
                    }

                    if(endT !== null){
                        const s = docStart !== null ? docStart : docEnd
                        return (s !== null) && s <= endT
                    }

                    return true
                })
            }

            return docs
        }catch(error){
            console.error('Error searching goals:', error.message)
            throw error
        }
    }

    return(
        <GoalsContext.Provider value={{ goals, fetchGoals, createGoal, updateGoal, deleteGoal, setGoalStatus, searchGoals }}>
            {children}
        </GoalsContext.Provider>
    )
}

export default GoalsProvider
