import { createContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'react-native-appwrite';


export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Attempt to create a session with email/password. On success fetch the account to populate `user`.
    async function login(email, password) {
        try {
            // Creates server session for the provided credentials
            await account.createEmailPasswordSession(email, password);

            // Fetch the current account (server-side) so client state matches server session
            const response = await account.get();
            setUser(response); // Persist user object into context state
        } catch (error) {
            // Bubble a normalized error string to UI
            throw Error(error.message);
        }
    }

    // Create a user account, then sign in immediately
    async function register(email, password) {
        try {
            // create user on server. ID.unique() prevents client id collisions
            await account.create(ID.unique(), email, password);
            // After create, reuse login flow to establish session & set user
            await login(email, password);
        } catch (error) {
            throw Error(error.message);
        }
    }

    // Deletes current session on server and clears local user state
    async function logout() {
        await account.deleteSession('current'); // deletes current session cookie/token
        setUser(null);
    }

    // On app mount, check if a server session exists and populate user.
    // Set `authChecked` true whether user exists or not so UI can continue.
    async function getInitialUserValue() {
        try {
            const response = await account.get();
            setUser(response);
        } catch (error) {
            setUser(null); // no active session
        } finally {
            setAuthChecked(true);
        }
    }

    useEffect(() => {
        getInitialUserValue();
    }, []);

    return (
        <UserContext.Provider value={{ user, login, register, logout, authChecked }}>
            {children}
        </UserContext.Provider>
    );
}