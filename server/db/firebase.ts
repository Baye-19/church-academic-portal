import path from 'path';
import fs from 'fs';
import { initializeApp as initFirebaseApp, getApps as getFirebaseApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

// Firebase Firestore Cloud Database Connection
export let db: any = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const firebaseConfig = {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    };

    const firebaseApp = !getFirebaseApps().length ? initFirebaseApp(firebaseConfig) : getFirebaseApps()[0];
    db = config.firestoreDatabaseId && config.firestoreDatabaseId.trim() !== ''
      ? getFirestore(firebaseApp, config.firestoreDatabaseId)
      : getFirestore(firebaseApp);
    console.log('✅ Connected to Firebase Firestore Database:', config.projectId);
  }
} catch (err) {
  console.error('❌ Firebase connection error:', err);
}

// Firestore Helper Functions
export async function dbGetCollection(colName: string): Promise<any[]> {
  if (!db) return [];
  try {
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({ ...d.data() }));
  } catch (e) {
    console.error(`Error reading ${colName} from Firestore:`, e);
    return [];
  }
}

export async function dbSaveDoc(colName: string, docId: string, data: any) {
  if (!db) return;
  try {
    const docRef = doc(db, colName, docId);
    await setDoc(docRef, JSON.parse(JSON.stringify(data)), { merge: true });
  } catch (e) {
    console.error(`Error saving doc ${docId} in ${colName} to Firestore:`, e);
  }
}

export async function dbDeleteDoc(colName: string, docId: string) {
  if (!db) return;
  try {
    const docRef = doc(db, colName, docId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error(`Error deleting doc ${docId} in ${colName} from Firestore:`, e);
  }
}
