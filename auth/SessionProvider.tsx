import { supabase } from "@/supabase/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState } from "react-native";

const AuthContext = createContext<{
  setUser: (user: User) => void;
  setSession: (session: Session) => void;
  clearSession: () => void;
  authUser?: User | null;
  token?: string | null;
  loadingFromStorage: boolean;
  // fetching: boolean;
  // error: string | null;
}>({
  setUser: () => {},
  setSession: () => {},
  clearSession: () => {},
  token: null,
  authUser: null,
  loadingFromStorage: false,
  // fetching: false,
  // error: null,
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

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    console.log("active");
    supabase.auth.startAutoRefresh();
  } else {
    console.log("stop refresh");
    supabase.auth.stopAutoRefresh();
  }
});

export function SessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loadingFromStorage, setLoadingFromStorage] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;
    setLoadingFromStorage(true);
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (isMounted) {
        setToken(session?.access_token ?? null);
        setAuthUser(session?.user ?? null);
        setLoadingFromStorage(false);
      }
    });
    supabase.auth.onAuthStateChange((event, session) => {
      setToken(session?.access_token ?? null);
      setAuthUser(session?.user ?? null);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Wipe every cached query when the session ends. This runs in an effect reacting to
  // `token` becoming null — deliberately not inside the SIGNED_OUT callback — because by
  // the time an effect runs, the tree has re-rendered with all query observers disabled
  // (they're gated on `token != null`). Clearing while observers are still enabled makes
  // removeQueries() trigger an immediate refetch that goes out with the just-signed-out
  // user's token (React hasn't re-rendered yet), repopulating the cache with their data —
  // which is exactly the "new user briefly sees the previous user's farm" bug.
  // cancelQueries() first kills anything already on the wire so a late response can't
  // zombie-repopulate a removed query.
  useEffect(() => {
    if (token === null) {
      queryClient.cancelQueries();
      queryClient.removeQueries();
    }
  }, [token, queryClient]);

  function setUser(user: User) {
    setAuthUser(user);
  }

  function setSession(session: Session) {
    setToken(session.access_token);
    setAuthUser(session.user);
  }

  async function clearSession() {
    await supabase.auth.signOut();
    setToken(null);
    setAuthUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        setSession,
        setUser,
        clearSession,
        token,
        authUser,
        loadingFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
