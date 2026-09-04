import { setActiveFarmIdForRequests } from "@/api/api";
import { useSession } from "@/auth/SessionProvider";
import { queryKeys } from "@/cache/query-keys";
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
  farmSelectionHydrated: boolean;
  setActiveFarmId: (farmId: string) => void;
  clearActiveFarmId: () => void;
};

const ActiveFarmContext = createContext<ActiveFarm>({
  activeFarmId: null,
  farmSelectionHydrated: true,
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
  const [hydratedForUserId, setHydratedForUserId] = useState<string | null>(null);
  const farmSelectionHydrated = authUser
    ? hydratedForUserId === authUser.id
    : true;

  useEffect(() => {
    if (!authUser) {
      setActiveFarmIdForRequests(null);
      setActiveFarmIdState(null);
      setHydratedForUserId(null);
      return;
    }
    let isMounted = true;
    AsyncStorage.getItem(storageKeyForUser(authUser.id)).then((value) => {
      if (!isMounted) {
        return;
      }
      setActiveFarmIdForRequests(value);
      setActiveFarmIdState(value);
      if (value && queryClient.getQueryData(queryKeys.users.me.queryKey)) {
        queryClient.removeQueries({ queryKey: queryKeys.users.me.queryKey });
      }
      setHydratedForUserId(authUser.id);
    });
    return () => {
      isMounted = false;
    };
  }, [authUser, queryClient]);

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
    if (previousFarmId !== null && previousFarmId !== farmId) {
      // Switching between existing farms: every farm-scoped query holds the old farm's data.
      queryClient.removeQueries();
    } else {
      // First-ever selection (onboarding, or joining a first farm): no farm-scoped data is
      // cached yet, but farms.list / farm / users.me were all fetched before this farm
      // existed. Drop just those so they refetch fresh — otherwise RootStack briefly sees a
      // farm selected that isn't in the (stale, empty) farms list and treats it as invalid.
      queryClient.removeQueries({ queryKey: queryKeys.farms.list.queryKey });
      queryClient.removeQueries({ queryKey: queryKeys.farms.farm.queryKey });
      queryClient.removeQueries({ queryKey: queryKeys.users.me.queryKey });
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
        farmSelectionHydrated,
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
