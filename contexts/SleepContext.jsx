import { createContext, useState } from 'react';
import { databases } from '../lib/appwrite';
import { ID, Permission, Role, Query } from 'react-native-appwrite';
import { useUser } from '../hooks/useUser';

// Query constants for the Sleep collection
const DATABASE_ID = '68ced0fb00362096eee7';
const COLLECTION_ID = 'sleep_entries';

export const SleepContext = createContext();

export function SleepProvider({ children }) {
    const [sleepData, setSleepData] = useState([]);
    const { user } = useUser();

    async function fetchSleepData() {
        if (!user) return;

        try {
            // List documents filtered by userID, ordered by date desc, limited to last 50
            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                Query.equal('userID', user.$id),
                Query.orderDesc('date'),
                Query.limit(50),
            ]);

            setSleepData(response.documents);
            return response.documents;
        } catch (error) {
            console.error('Error fetching sleep data:', error.message);
            throw error;
        }
    }

    // Fetch a single sleep entry by id
    async function fetchSleepDataById(id) {
        try {
            // TODO: implement fetching a single document by id (databases.getDocument)
        } catch (error) {
            console.error(error.message);
        }
    }

    // Create a sleep entry and give owner-only permissions
    async function createSleepData(data) {
        try {
            const newSleepData = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                { ...data, userID: user.$id },
                [
                    // Owner-only permissions: only the creating user can read/update/delete
                    Permission.read(Role.user(user.$id)),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id)),
                ]
            );

            setSleepData((prev) => [newSleepData, ...prev]);

            return newSleepData;
        } catch (error) {
            console.error('Error creating sleep data:', error.message);
            throw error;
        }
    }

    // Delete a sleep entry and update local state
    async function deleteSleepData(id) {
        try {
            // TODO: implement document deletion using databases.deleteDocument
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <SleepContext.Provider
            value={{ sleepData, fetchSleepData, fetchSleepDataById, createSleepData, createSleepLog: createSleepData, deleteSleepData }}
        >
            {children}
        </SleepContext.Provider>
    );
}