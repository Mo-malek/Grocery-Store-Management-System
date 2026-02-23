importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// This uses a placeholder config.
// Ideally, this should dynamically load or match the environment config.
// For standard Firebase usage, we paste a config block here manually or via build scripts.
// But as per the Firebase v9+ we actually just need to point to the config.

firebase.initializeApp({
    apiKey: "AIzaSyAvYUfwvAHltc9hjxhBgkichJPDWKgCfgk",
    authDomain: "grocery-store-management-bfc4f.firebaseapp.com",
    projectId: "grocery-store-management-bfc4f",
    storageBucket: "grocery-store-management-bfc4f.firebasestorage.app",
    messagingSenderId: "1092811827372",
    appId: "1:1092811827372:web:ea7558a92875e27352d709"
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
