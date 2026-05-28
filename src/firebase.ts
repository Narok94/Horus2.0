// Complete LocalStorage Offline Mock for Tatu Gym (Db Purged)

export class Timestamp {
  seconds: number;
  nanoseconds: number;
  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  static now() {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }
  static fromDate(date: Date) {
    return new Timestamp(Math.floor(date.getTime() / 1000), 0);
  }
  toDate() {
    return new Date(this.seconds * 1000);
  }
  toISOString() {
    return this.toDate().toISOString();
  }
}

export const auth = {
  currentUser: {
    uid: 'teste-uid',
    displayName: 'Teste',
    photoURL: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
    email: 'teste@tatugym.pro',
    emailVerified: true,
    isAnonymous: false,
    tenantId: null,
    providerData: []
  },
  signOut: async () => Promise.resolve()
};

export const db = {};
export const storage = {};

export const collection = (dbInstance: any, path: string) => {
  return { path };
};

export const doc = (dbInstance: any, collectionPath: string, docId: string) => {
  return { collectionPath, docId };
};

export const getDoc = async (docRef: any) => {
  const collectionPath = docRef.collectionPath;
  const docId = docRef.docId;
  
  if (collectionPath === 'users') {
    const key = `tatugym_user_profile_${docId.toLowerCase()}`;
    const value = localStorage.getItem(key);
    if (value) {
      const data = JSON.parse(value);
      return {
        exists: () => true,
        data: () => data,
        id: docId
      };
    }
  }
  
  return {
    exists: () => false,
    data: () => null,
    id: docId
  };
};

export const setDoc = async (docRef: any, data: any) => {
  const collectionPath = docRef.collectionPath;
  const docId = docRef.docId;
  
  if (collectionPath === 'users') {
    const key = `tatugym_user_profile_${docId.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(data));
  }
  return Promise.resolve();
};

export const getDocs = async (queryRef: any) => {
  const path = queryRef.path;
  if (path === 'exercises') {
    return { docs: [] };
  }
  if (path === 'users') {
    const saved = localStorage.getItem('tatugym_user_profile_teste');
    const list = [];
    if (saved) {
      list.push({
        id: 'teste',
        data: () => JSON.parse(saved)
      });
    }
    return { docs: list };
  }
  return { docs: [] };
};

export const addDoc = async (collectionRef: any, data: any) => {
  const path = collectionRef.path;
  const listKey = `tatugym_mock_collection_${path}`;
  const existing = localStorage.getItem(listKey);
  const list = existing ? JSON.parse(existing) : [];
  const newId = 'id_' + Math.random().toString(36).substring(2, 11);
  const newDoc = { id: newId, ...data };
  list.push(newDoc);
  localStorage.setItem(listKey, JSON.stringify(list));
  return { id: newId };
};

export const updateDoc = async (docRef: any, data: any) => {
  return Promise.resolve();
};

export const deleteDoc = async (docRef: any) => {
  return Promise.resolve();
};

export const onSnapshot = (docRef: any, callback: any) => {
  setTimeout(() => {
    const collectionPath = docRef.collectionPath;
    const docId = docRef.docId;
    if (collectionPath === 'users') {
      const key = `tatugym_user_profile_${docId.toLowerCase()}`;
      const value = localStorage.getItem(key);
      if (value) {
        callback({
          exists: () => true,
          data: () => JSON.parse(value),
          id: docId
        });
        return;
      }
    }
    callback({
      exists: () => false,
      data: () => null,
      id: docId
    });
  }, 0);
  return () => {};
};

export const signInAnonymously = async (authInstance: any) => {
  return {
    user: {
      uid: 'teste-uid'
    }
  };
};

export const signOut = async (authInstance: any) => {
  return Promise.resolve();
};

export const ref = (storageInstance: any, path: string) => {
  return { path };
};

export const uploadBytes = async (refInstance: any, file: any) => {
  return { ref: refInstance };
};

export const getDownloadURL = async (refInstance: any) => {
  return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop';
};
