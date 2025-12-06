import { createContext, useEffect, useState } from 'react';
import { account, getAccountSafe, databases } from '../lib/appwrite';
import { ID, Permission, Role, Query } from 'react-native-appwrite';


export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const DATABASE_ID = '68ced0fb00362096eee7'
    const COLLECTION_PROFILES = 'profile' // set to your new collection id

    // Attempt to create a session with email/password. On success fetch the account to populate `user`.
    async function login(email, password) {
        try {
            // Creates server session for the provided credentials
            await account.createEmailPasswordSession(email, password);

            const response = await getAccountSafe();
            if(response && response.$id){
                try{
                    const p = await databases.listDocuments(DATABASE_ID, COLLECTION_PROFILES, [ Query.equal('userID', response.$id), Query.limit(1) ])
                    const profileDoc = p.documents && p.documents[0] ? p.documents[0] : null
                    setUser({ ...response, profile: profileDoc })
                }catch(_){
                    setUser(response)
                }
            }else{
                setUser(response)
            }
        } catch (error) {
            throw Error(error.message);
        }
    }
    // Create a user account, then sign in immediately
    async function register(email, password, username) {
        try {
            // create user on server. ID.unique() prevents client id collisions
            await account.create(ID.unique(), email, password);

            // After create, reuse login flow to establish session & set user
            await login(email, password);

            // Create profile document for this user if username provided
            const serverAccount = await getAccountSafe()
            if(!serverAccount || !serverAccount.$id) return

            // Basic client-side uniqueness check for username
            if(username){
                const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_PROFILES, [ Query.equal('username', username), Query.limit(1) ])
                if(existing.documents && existing.documents.length){
                    throw new Error('Username already taken')
                }

                const profile = await databases.createDocument(DATABASE_ID, COLLECTION_PROFILES, ID.unique(), { userID: serverAccount.$id, username }, [ Permission.read(Role.any()), Permission.update(Role.user(serverAccount.$id)), Permission.delete(Role.user(serverAccount.$id)) ])

                // attach profile to local user state
                setUser(prev => ({ ...(prev || serverAccount), profile }))
            }
        } catch (error) {
            throw Error(error.message);
        }
    }

    // Deletes current session on server and clears local user state
    async function logout() {
        try{
            await account.deleteSession('current'); // deletes current session cookie/token
        }catch(err){
            console.warn('logout: account.deleteSession failed:', err?.message || err)
        }finally{
            setUser(null);
        }
    }

    // Set `authChecked` true whether user exists or not so UI can continue.
    async function getInitialUserValue() {
        try {
            const response = await getAccountSafe();
            if(response && response.$id){
                try{
                    const p = await databases.listDocuments(DATABASE_ID, COLLECTION_PROFILES, [ Query.equal('userID', response.$id), Query.limit(1) ])
                    const profileDoc = p.documents && p.documents[0] ? p.documents[0] : null
                    setUser({ ...response, profile: profileDoc })
                }catch(_){
                    setUser(response)
                }
            }else{
                setUser(response)
            }
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