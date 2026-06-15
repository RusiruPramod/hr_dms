import admin from "firebase-admin";

let initialized = false;
let isMock = false;

// In-memory fallback database for development when Firebase Admin is not configured
const mockDb = new Map<string, any[]>();

const mockAdmin = {
  auth: () => ({
    verifyIdToken: async (token: string) => {
      console.warn("Firebase Admin (Mock): Bypassing token verification.");
      return {
        uid: "mock-user-123",
        email: "recruiter@example.com",
        name: "Demo Recruiter",
        role: "recruiter",
      };
    },
  }),
  firestore: () => {
    const getCollection = (colName: string) => {
      if (!mockDb.has(colName)) {
        mockDb.set(colName, []);
      }
      return {
        get: async () => {
          const docs = mockDb.get(colName) || [];
          return {
            docs: docs.map((d) => ({
              id: d.id,
              data: () => d,
            })),
          };
        },
        doc: (id: string) => {
          const docs = mockDb.get(colName) || [];
          const docData = docs.find((d) => d.id === id) || null;
          return {
            get: async () => ({
              exists: !!docData,
              data: () => docData,
            }),
            set: async (data: any, options?: any) => {
              const list = mockDb.get(colName) || [];
              const idx = list.findIndex((d) => d.id === id);
              const merged = options?.merge ? { ...docData, ...data } : data;
              merged.id = id;
              if (idx > -1) {
                list[idx] = merged;
              } else {
                list.push(merged);
              }
              mockDb.set(colName, list);
              return { writeTime: new Date() };
            },
            delete: async () => {
              const list = mockDb.get(colName) || [];
              const nextList = list.filter((d) => d.id !== id);
              mockDb.set(colName, nextList);
              return { writeTime: new Date() };
            },
          };
        },
      };
    };
    return {
      collection: getCollection,
    };
  },
  storage: () => ({
    bucket: () => ({
      file: (filePath: string) => {
        return {
          save: async (content: Buffer | string, options?: any) => {
            console.log(`Mock Firebase Storage: file saved to ${filePath}`);
            return true;
          },
          getSignedUrl: async (options?: any) => {
            console.log(`Mock Firebase Storage: generating signed URL for ${filePath}`);
            if (filePath.includes("signature")) {
              // Return transparent single-pixel PNG as signature placeholder
              return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
            }
            return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
          },
          delete: async () => {
            console.log(`Mock Firebase Storage: file deleted from ${filePath}`);
            return true;
          },
        };
      },
    }),
  }),
} as any;

export function getFirebaseAdmin() {
  if (initialized) {
    return isMock ? mockAdmin : admin;
  }

  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!svc) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FIREBASE_SERVICE_ACCOUNT is required in production");
    }
    console.warn(
      "FIREBASE_SERVICE_ACCOUNT is not set. Starting Firebase Admin in MOCK/BYPASS mode.",
    );
    initialized = true;
    isMock = true;
    return mockAdmin;
  }

  try {
    const serviceAccount = JSON.parse(Buffer.from(svc, "base64").toString("utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    initialized = true;
    isMock = false;
    return admin;
  } catch (err: any) {
    if (process.env.NODE_ENV === "production") {
      throw err;
    }
    console.error(
      "Failed to parse/initialize real Firebase Admin service account. Falling back to MOCK mode.",
      err?.message,
    );
    initialized = true;
    isMock = true;
    return mockAdmin;
  }
}

export default getFirebaseAdmin;
