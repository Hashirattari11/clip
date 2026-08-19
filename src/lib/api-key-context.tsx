"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ApiKeyContextType {
  apiKey: string;
  provider: "gemini" | "openai";
  setApiKey: (key: string) => void;
  setProvider: (provider: "gemini" | "openai") => void;
  hasApiKey: boolean;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType>({
  apiKey: "",
  provider: "gemini",
  setApiKey: () => {},
  setProvider: () => {},
  hasApiKey: false,
  showModal: false,
  setShowModal: () => {},
});

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState("");
  const [provider, setProviderState] = useState<"gemini" | "openai">("gemini");
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedKey = localStorage.getItem("clipspark_api_key") || "";
    const savedProvider = (localStorage.getItem("clipspark_provider") as "gemini" | "openai") || "gemini";
    setApiKeyState(savedKey);
    setProviderState(savedProvider);

    // Auto-show modal only if no key anywhere (localStorage OR account)
    if (!savedKey) {
      fetch("/api/settings")
        .then(r => r.json())
        .then(d => {
          if (!d.hasKey) setShowModal(true);
        })
        .catch(() => setShowModal(true));
    }
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem("clipspark_api_key", key);
  };

  const setProvider = (p: "gemini" | "openai") => {
    setProviderState(p);
    localStorage.setItem("clipspark_provider", p);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ApiKeyContext.Provider
        value={{
          apiKey: "",
          provider: "gemini",
          setApiKey: () => {},
          setProvider: () => {},
          hasApiKey: false,
          showModal: false,
          setShowModal: () => {},
        }}
      >
        {children}
      </ApiKeyContext.Provider>
    );
  }

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        provider,
        setApiKey,
        setProvider,
        hasApiKey: !!apiKey,
        showModal,
        setShowModal,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  return useContext(ApiKeyContext);
}
