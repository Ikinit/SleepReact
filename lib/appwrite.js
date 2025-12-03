import { Client, Account, Avatars, Databases } from 'react-native-appwrite'

// Create a single Appwrite Client instance used across the app.
// Keeping one client avoids session/instance mismatches.
export const client = new Client()
    .setProject('68ce7e190035ac1bca1f') // Appwrite project id (move to env for multi-env)
    .setPlatform('dev.ken.sleeptracker')   // Platform identifier
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // Appwrite API endpoint

// Common service singletons derived from client
export const account = new Account(client)    // For auth (login/register/session)
export const avatars = new Avatars(client)    // For avatar images (unused but available)
export const databases = new Databases(client)// For database operations (CRUD)

// Safe account.get() helper — wraps Appwrite `account.get()` and returns
// `null` on expected failures (missing scopes, no session) while logging
// the underlying error. Use this whenever a non-fatal account probe is
// needed to avoid uncaught promise rejections from the SDK.
export async function getAccountSafe(){
    try{
        const a = await account.get()
        return a
    }catch(err){
        // AppwriteException messages sometimes mention 'missing scopes'.
        // Log for diagnostics and return null so callers can handle unauthenticated state.
        try{
            console.warn('getAccountSafe: account.get() failed:', err?.message || err)
        }catch(_){/* ignore logging errors */}
        return null
    }
}