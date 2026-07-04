import { useStorageState } from "@/storage/useStorageState";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, type PropsWithChildren, useContext } from "react";

const TOKEN_STORAGE_KEY = "authToken";

const AuthContext = createContext<{
  setToken: (token: string) => void;
  clearSession: () => void;
  token?: string | null;
  loadingFromStorage: boolean;
}>({
  setToken: () => {},
  clearSession: () => {},
  token: null,
  loadingFromStorage: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[loadingFromStorage, token], setToken] =
    useStorageState(TOKEN_STORAGE_KEY);
  const queryClient = useQueryClient();

  function clearSession() {
    queryClient.removeQueries();
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        setToken,
        clearSession,
        token,
        loadingFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
