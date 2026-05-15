"use client";

import { useSyncExternalStore } from "react";

const EMPTY_LIST = [];
const snapshots = new Map();

function subscribe(callback) {
  const onChange = () => callback();
  window.addEventListener("storage", onChange);
  window.addEventListener("local-storage-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("local-storage-change", onChange);
  };
}

function readList(key) {
  let raw = null;

  try {
    raw = localStorage.getItem(key);
  } catch {
    return EMPTY_LIST;
  }

  const cached = snapshots.get(key);
  if (cached?.raw === raw) {
    return cached.value;
  }

  try {
    const data = raw ? JSON.parse(raw) : EMPTY_LIST;
    const value = Array.isArray(data) ? data : EMPTY_LIST;
    snapshots.set(key, { raw, value });
    return value;
  } catch {
    snapshots.set(key, { raw, value: EMPTY_LIST });
    return EMPTY_LIST;
  }
}

export function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new Event("local-storage-change"));
  } catch {
    // noop
  }
}

export function useLocalStorageList(key) {
  return useSyncExternalStore(
    subscribe,
    () => readList(key),
    () => EMPTY_LIST
  );
}
