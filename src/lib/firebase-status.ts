/**
 * Firebase Status Check - Diagnose connection and data flow
 * Run this in browser console: import { checkFirebaseStatus } from '@/lib/firebase-status'
 */

import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db, auth, firebaseEnabled } from './firebase'

export async function checkFirebaseStatus() {
  console.log('🔍 Firebase Status Check Started...')
  console.log('=' * 50)

  // 1. Check Configuration
  console.log('\n1️⃣ CONFIGURATION STATUS:')
  console.log(`   Firebase Enabled: ${firebaseEnabled ? '✅ YES' : '❌ NO'}`)
  console.log(`   Auth State: ${auth?.currentUser ? `✅ Logged in as ${auth.currentUser.email}` : '⚠️ Not logged in'}`)

  // 2. Test Firestore Connection
  console.log('\n2️⃣ FIRESTORE CONNECTION:')
  try {
    const q = query(collection(db, 'interns'), limit(1))
    const snap = await getDocs(q)
    console.log(`   ✅ Connected to Firestore`)
    console.log(`   📊 Total records found: ${snap.size > 0 ? 'at least 1' : '0 (empty)'}`)
    
    if (snap.size > 0) {
      const firstDoc = snap.docs[0]
      console.log(`   📄 Sample record ID: ${firstDoc.id}`)
      console.log(`   📋 Sample fields:`, Object.keys(firstDoc.data()).slice(0, 5))
    }
  } catch (err: any) {
    console.error(`   ❌ Firestore Connection Failed:`, err.message)
    console.error(`   Error Code: ${err.code}`)
  }

  // 3. Check localStorage fallback
  console.log('\n3️⃣ LOCALSTORAGE FALLBACK:')
  try {
    const localData = localStorage.getItem('docuflow.interns.v1')
    if (localData) {
      const parsed = JSON.parse(localData)
      console.log(`   ✅ Local cache exists with ${parsed.length} records`)
    } else {
      console.log(`   ⚠️ No local cache found (first time or cleared)`)
    }
  } catch (err) {
    console.error(`   ❌ LocalStorage Error:`, err)
  }

  // 4. Check Auth
  console.log('\n4️⃣ AUTHENTICATION:')
  console.log(`   Current User: ${auth?.currentUser?.email || 'Not authenticated'}`)
  console.log(`   User ID: ${auth?.currentUser?.uid || 'N/A'}`)

  console.log('\n' + '=' * 50)
  console.log('✅ Status check complete. Check results above.')
}

export async function logDataFlow(action: string, data: any) {
  const timestamp = new Date().toISOString()
  console.log(`\n📡 [${timestamp}] Data Flow: ${action}`)
  console.log(`   Payload:`, data)
  console.log(`   Firebase Enabled: ${firebaseEnabled}`)
}
