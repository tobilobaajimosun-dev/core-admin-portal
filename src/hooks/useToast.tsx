"use client";

import { useState, useRef } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  description?: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: "info",
    title: "",
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: ToastType, title: string, description?: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: true, type, title, description });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  const hideToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return { toastProps: toast, showToast, hideToast };
}
