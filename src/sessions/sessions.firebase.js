// src/sessions/sessions.firebase.js
import {
  db, collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, serverTimestamp, query, orderBy,
} from "../lib/firebase";

// Chemin des sessions : users/{uid}/sessions/{sessionId}
const sessionsCol = (uid) => collection(db, "users", uid, "sessions");
const sessionDoc  = (uid, id) => doc(db, "users", uid, "sessions", id);

// CREATE ou UPDATE
export async function saveSession({ uid, id = null, name, data, icon = null }) {
  if (!uid) throw new Error("Utilisateur non connecté");

  if (id) {
    await updateDoc(sessionDoc(uid, id), {
      name: name || "Session sans nom",
      data,
      icon: icon || null,
      updatedAt: serverTimestamp(),
    });
    return { id };
  } else {
    const ref = await addDoc(sessionsCol(uid), {
      name: name || "Session sans nom",
      data,
      icon: icon || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: ref.id };
  }
}

export async function listSessions(uid) {
  if (!uid) return [];
  const q = query(sessionsCol(uid), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSession(uid, id) {
  const snap = await getDoc(sessionDoc(uid, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function renameSession(uid, id, name) {
  await updateDoc(sessionDoc(uid, id), { name, updatedAt: serverTimestamp() });
}

export async function deleteSession(uid, id) {
  await deleteDoc(sessionDoc(uid, id));
}
