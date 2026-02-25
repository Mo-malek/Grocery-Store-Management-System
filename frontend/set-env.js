/**
 * set-env.js
 * 
 * Pre-build script that injects environment variables from Vercel/Railway
 * into Angular environment files and firebase-messaging-sw.js.
 */
const fs = require('fs');
const path = require('path');

// Helper to mask secrets in logs
const mask = (str) => {
    if (!str) return 'MISSING';
    if (str.length <= 4) return '****';
    return str.substring(0, 4) + '...';
};

// Read from Vercel environment variables
const apiUrl = process.env.API_URL || 'http://localhost:8080/api';
const firebaseApiKey = process.env.FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.FIREBASE_APP_ID;
const firebaseMeasurementId = process.env.FIREBASE_MEASUREMENT_ID;

console.log('--- Environment Check ---');
console.log('API_URL:', apiUrl);
console.log('FIREBASE_API_KEY:', mask(firebaseApiKey));
console.log('FIREBASE_PROJECT_ID:', mask(firebaseProjectId));
console.log('-------------------------');

// Only proceed if we have at least the API Key
if (!firebaseApiKey) {
    console.log('⚠️ FIREBASE_API_KEY is not set. Skipping injection.');
    console.log('If this is a production build, please set your environment variables!');
    process.exit(0);
}

console.log('Injecting environment variables into source files...');

// --- 1. Write environment.prod.ts ---
const envProdContent = `export const environment = {
    production: true,
    apiUrl: '${apiUrl}',
    firebase: {
        apiKey: '${firebaseApiKey}',
        authDomain: '${firebaseAuthDomain || ''}',
        projectId: '${firebaseProjectId || ''}',
        storageBucket: '${firebaseStorageBucket || ''}',
        messagingSenderId: '${firebaseMessagingSenderId || ''}',
        appId: '${firebaseAppId || ''}',
        measurementId: '${firebaseMeasurementId || ''}'
    }
};
`;

const envProdPath = path.resolve(__dirname, 'src/environments/environment.prod.ts');
fs.writeFileSync(envProdPath, envProdContent, 'utf8');
console.log('✅ environment.prod.ts updated');

// --- 2. Write firebase-messaging-sw.js ---
const swContent = `importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "${firebaseApiKey}",
    authDomain: "${firebaseAuthDomain || ''}",
    projectId: "${firebaseProjectId || ''}",
    storageBucket: "${firebaseStorageBucket || ''}",
    messagingSenderId: "${firebaseMessagingSenderId || ''}",
    appId: "${firebaseAppId || ''}"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/assets/icons/icon-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
`;

const swPath = path.resolve(__dirname, 'src/firebase-messaging-sw.js');
fs.writeFileSync(swPath, swContent, 'utf8');
console.log('✅ firebase-messaging-sw.js updated');

console.log('✅ Finished preparing environment files.');
