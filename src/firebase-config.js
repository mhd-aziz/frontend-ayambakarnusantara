import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// TODO: Ganti dengan konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyAGM3Sn3OLLxg-7--gzjmu8AnjIPxLF6ww",
  authDomain: "ayambakarnusantara-51a05.firebaseapp.com",
  projectId: "ayambakarnusantara-51a05",
  storageBucket: "ayambakarnusantara-51a05.firebasestorage.app",
  messagingSenderId: "1013559069503",
  appId: "1:1013559069503:web:10c410858415c6eb7aa18a",
  measurementId: "G-F348XTFCX4",
};

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Meminta izin notifikasi dan mendapatkan FCM Token.
 * @returns {Promise<string|null>} FCM Token atau null jika gagal.
 */
export const getFCMToken = async () => {
  // TODO: Ganti dengan VAPID key dari Firebase Console Anda
  const VAPID_KEY =
    "BGncMmcruMDN3GtMsiT-YysR22TUG2KFwK0UpOMnplE6cY_oz6VDBnCC4I9gJ7FQGq-JhlYUxqrEONlIQbKY55s";

  try {
    // Meminta izin dari pengguna untuk menerima notifikasi
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Izin notifikasi diberikan.");

      // Mendapatkan token
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (currentToken) {
        return currentToken;
      } else {
        console.log(
          "Gagal mendapatkan FCM Token. Izin mungkin perlu diberikan ulang."
        );
        return null;
      }
    } else {
      console.log("Izin notifikasi tidak diberikan oleh pengguna.");
      return null;
    }
  } catch (err) {
    console.error("Terjadi kesalahan saat mengambil FCM token.", err);
    return null;
  }
};
