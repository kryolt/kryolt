import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
    initializeApp,
    cert,
    getApps,
} from "firebase-admin/app";

import {
    getFirestore,
} from "firebase-admin/firestore";

import {
    getAuth,
} from "firebase-admin/auth";


const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


// ==============================================
// SERVICE ACCOUNT PATH
// ==============================================

const serviceAccountPath = path.join(
    __dirname,
    "..",
    "serviceAccount.json"
);


// ==============================================
// CHECK SERVICE ACCOUNT
// ==============================================

if (!fs.existsSync(serviceAccountPath)) {

    throw new Error(
        "❌ serviceAccount.json not found inside backend/"
    );

}


// ==============================================
// LOAD SERVICE ACCOUNT
// ==============================================

const serviceAccount = JSON.parse(
    fs.readFileSync(
        serviceAccountPath,
        "utf8"
    )
);


// ==============================================
// INITIALIZE FIREBASE ADMIN
// ==============================================

const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert(serviceAccount),
        });


console.log(
    "🔥 Firebase Admin initialized successfully"
);


// ==============================================
// FIRESTORE
// ==============================================

export const adminDb =
    getFirestore(app);


// ==============================================
// FIREBASE AUTH
// ==============================================

export const adminAuth =
    getAuth(app);


export default app;