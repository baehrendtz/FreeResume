"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { User } from "firebase/auth";
import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import type { PerTemplateStyleOverrides } from "@/lib/model/TemplateStyleSettings";
import type { FirestoreCvData } from "@/lib/firebase/firestore";
import { FIRESTORE_SAVE_DEBOUNCE_MS } from "@/lib/constants";

interface UseFirestoreSyncOptions {
  user: User | null;
  authLoading: boolean;
  cv: CvModel;
  templateId: string;
  displaySettings: DisplaySettings;
  styleOverrides: PerTemplateStyleOverrides;
  onDataLoaded: (data: FirestoreCvData) => void;
  enabled: boolean;
}

interface UseFirestoreSyncResult {
  firestoreLoading: boolean;
  lastSaved: Date | null;
  syncError: string | null;
}

export function useFirestoreSync({
  user,
  authLoading,
  cv,
  templateId,
  displaySettings,
  styleOverrides,
  onDataLoaded,
  enabled,
}: UseFirestoreSyncOptions): UseFirestoreSyncResult {
  const [firestoreLoading, setFirestoreLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Track whether we just loaded from Firestore to skip the first save
  const skipNextSave = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);
  const prevUid = useRef<string | null>(null);

  // Stable ref for onDataLoaded to avoid triggering effects
  const onDataLoadedRef = useRef(onDataLoaded);
  onDataLoadedRef.current = onDataLoaded;

  // --- Initial load when user signs in ---
  useEffect(() => {
    if (authLoading || !enabled) return;

    const uid = user?.uid ?? null;

    // Same user — no need to reload
    if (uid === prevUid.current) return;
    prevUid.current = uid;

    if (!uid) {
      // User signed out — clear state, keep sessionStorage
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setFirestoreLoading(false);
      setLastSaved(null);
      setSyncError(null);
      skipNextSave.current = false;
      return;
    }

    // User signed in — load from Firestore
    const currentRequest = ++requestId.current;
    setFirestoreLoading(true);
    setSyncError(null);

    import("@/lib/firebase/firestore")
      .then(({ loadCvFromFirestore }) => loadCvFromFirestore(uid))
      .then((remote) => {
        // Ignore stale responses
        if (currentRequest !== requestId.current) return;

        if (remote) {
          skipNextSave.current = true;
          onDataLoadedRef.current(remote);
        } else {
          // Firestore empty — push local data on next debounce cycle
          skipNextSave.current = false;
        }
      })
      .catch((err) => {
        if (currentRequest !== requestId.current) return;
        console.error("Firestore load failed:", err);
        setSyncError("Failed to load from cloud");
      })
      .finally(() => {
        if (currentRequest !== requestId.current) return;
        setFirestoreLoading(false);
      });
  }, [user, authLoading, enabled]);

  // --- Debounced auto-save ---
  const save = useCallback(() => {
    const uid = user?.uid;
    if (!uid || !enabled) return;

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const data: FirestoreCvData = { cv, templateId, displaySettings, styleOverrides };

    import("@/lib/firebase/firestore")
      .then(({ saveCvToFirestore }) => saveCvToFirestore(uid, data))
      .then(() => {
        setLastSaved(new Date());
        setSyncError(null);
      })
      .catch((err) => {
        console.error("Firestore save failed:", err);
        setSyncError("Failed to save to cloud");
      });
  }, [user, enabled, cv, templateId, displaySettings, styleOverrides]);

  useEffect(() => {
    if (!user || !enabled || authLoading || firestoreLoading) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(save, FIRESTORE_SAVE_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [save, user, enabled, authLoading, firestoreLoading]);

  return { firestoreLoading, lastSaved, syncError };
}
