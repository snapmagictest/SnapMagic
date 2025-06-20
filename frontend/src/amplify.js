/**
 * Modern Amplify SDK v6 Initialization
 * Uses the latest patterns and best practices
 */

import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './amplify-config.js';

// Configure Amplify with modern approach
Amplify.configure(amplifyConfig);

// Export commonly used Amplify modules for the app
export { 
    Amplify,
    // Auth modules
    signIn,
    signOut,
    getCurrentUser,
    fetchAuthSession
} from 'aws-amplify/auth';

export {
    // API modules  
    get,
    post,
    put,
    del
} from 'aws-amplify/api';

export {
    // Storage modules
    uploadData,
    downloadData,
    remove,
    list
} from 'aws-amplify/storage';

export {
    // Predictions modules (for AI/ML features)
    convert
} from 'aws-amplify/predictions';

// Initialize and export a ready-to-use Amplify instance
console.log('✅ Amplify SDK v6 initialized with Gen 2 configuration');
