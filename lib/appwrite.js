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