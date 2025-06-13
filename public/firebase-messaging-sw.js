// Service worker ini berjalan di background, sehingga menggunakan importScripts
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

// TODO: Ganti dengan konfigurasi Firebase Anda (harus sama persis)
const firebaseConfig = {
  apiKey: "AIzaSyAGM3Sn3OLLxg-7--gzjmu8AnjIPxLF6ww",
  authDomain: "ayambakarnusantara-51a05.firebaseapp.com",
  projectId: "ayambakarnusantara-51a05",
  storageBucket: "ayambakarnusantara-51a05.firebasestorage.app",
  messagingSenderId: "1013559069503",
  appId: "1:1013559069503:web:10c410858415c6eb7aa18a",
  measurementId: "G-F348XTFCX4",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Menerima pesan background ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
