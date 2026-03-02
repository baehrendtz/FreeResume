import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import type { PerTemplateStyleOverrides } from "@/lib/model/TemplateStyleSettings";
import { FIRESTORE_MAX_DOC_BYTES } from "@/lib/constants";

export interface FirestoreCvDocument {
  cv: CvModel;
  templateId: string;
  displaySettings: DisplaySettings;
  styleOverrides: PerTemplateStyleOverrides;
  updatedAt: unknown; // FieldValue (serverTimestamp)
  version: 1;
}

export type FirestoreCvData = Omit<FirestoreCvDocument, "updatedAt" | "version">;

function estimateJsonBytes(obj: unknown): number {
  return new TextEncoder().encode(JSON.stringify(obj)).length;
}

function stripPhotoIfTooLarge(data: FirestoreCvData): FirestoreCvData {
  const estimate = estimateJsonBytes(data);
  if (estimate > FIRESTORE_MAX_DOC_BYTES && data.cv.photo) {
    console.warn(
      `Firestore document ~${estimate} bytes exceeds limit. Stripping photo for cloud save.`,
    );
    return { ...data, cv: { ...data.cv, photo: "" } };
  }
  return data;
}

export async function saveCvToFirestore(
  uid: string,
  data: FirestoreCvData,
): Promise<void> {
  const { getFirestore, doc, setDoc, serverTimestamp } = await import(
    "firebase/firestore"
  );
  const { getFirebaseApp } = await import("@/lib/firebase/config");

  const db = getFirestore(getFirebaseApp());
  const ref = doc(db, "cvs", uid);

  const cleaned = stripPhotoIfTooLarge(data);

  const firestoreDoc: FirestoreCvDocument = {
    ...cleaned,
    updatedAt: serverTimestamp(),
    version: 1,
  };

  await setDoc(ref, firestoreDoc);
}

export async function loadCvFromFirestore(
  uid: string,
): Promise<FirestoreCvData | null> {
  const { getFirestore, doc, getDoc } = await import("firebase/firestore");
  const { getFirebaseApp } = await import("@/lib/firebase/config");

  const db = getFirestore(getFirebaseApp());
  const ref = doc(db, "cvs", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const raw = snap.data() as Partial<FirestoreCvDocument>;
  if (!raw.cv) return null;

  return {
    cv: raw.cv,
    templateId: raw.templateId ?? "basic",
    displaySettings: raw.displaySettings ?? ({} as DisplaySettings),
    styleOverrides: raw.styleOverrides ?? {},
  };
}
