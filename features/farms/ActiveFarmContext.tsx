import { setActiveFarmIdForRequests } from "@/api/api";
import { useSession } from "@/auth/SessionProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type ActiveFarm = {
  activeFarmId: string | null;
  loadingActiveFarm: boolean;
  setActiveFarmId: (farmId: string) => void;
  clearActiveFarmId: () => void;
};

const ActiveFarmContext = createContext<ActiveFarm>({
  activeFarmId: null,
  loadingActiveFarm: false,
  setActiveFarmId: () => {},
  clearActiveFarmId: () => {},
});

function storageKeyForUser(userId: string) {
  return `activeFarmId:${userId}`;
}

// There's no server-side "current farm" concept by design (so multiple tabs/devices for the
// same account never interfere) — the active farm is purely a local, per-device, per-user
// selection sent as the x-farm-id header on every request (see api/api.ts).
export function ActiveFarmProvider({ children }: PropsWithChildren) {
  const { authUser } = useSession();
  const queryClient = useQueryClient();
  const [activeFarmId, setActiveFarmIdState] = useState<string | null>(null);
  const [loadingActiveFarm, setLoadingActiveFarm] = useState(false);

  useEffect(() => {
    if (!authUser) {
      setActiveFarmIdForRequests(null);
      setActiveFarmIdState(null);
      return;
    }
    let isMounted = true;
    setLoadingActiveFarm(true);
    AsyncStorage.getItem(storageKeyForUser(authUser.id)).then((value) => {
      if (isMounted) {
        setActiveFarmIdForRequests(value);
        setActiveFarmIdState(value);
        setLoadingActiveFarm(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [authUser]);

  function setActiveFarmId(farmId: string) {
    const previousFarmId = activeFarmId;
    // Update the value the request middleware reads immediately, before anything else runs —
    // so any refetch triggered below (or by React re-rendering) is guaranteed to already see
    // the new farm, never a stale one from before the switch.
    setActiveFarmIdForRequests(farmId);
    setActiveFarmIdState(farmId);
    if (authUser) {
      AsyncStorage.setItem(storageKeyForUser(authUser.id), farmId);
    }
    // Only wipe when actually switching away from a previously-selected farm — not on the
    // first-ever selection (nothing farm-scoped is cached yet at that point), since query
    // keys aren't farm-scoped and would otherwise leak the previous farm's data.
    if (previousFarmId !== null && previousFarmId !== farmId) {
      queryClient.removeQueries();
    }
  }

  function clearActiveFarmId() {
    const previousFarmId = activeFarmId;
    setActiveFarmIdForRequests(null);
    setActiveFarmIdState(null);
    if (authUser) {
      AsyncStorage.removeItem(storageKeyForUser(authUser.id));
    }
    if (previousFarmId !== null) {
      queryClient.removeQueries();
    }
  }

  return (
    <ActiveFarmContext.Provider
      value={{
        activeFarmId,
        loadingActiveFarm,
        setActiveFarmId,
        clearActiveFarmId,
      }}
    >
      {children}
    </ActiveFarmContext.Provider>
  );
}

export function useActiveFarm() {
  return useContext(ActiveFarmContext);
}
