import { getInitialURL, addEventListener } from "expo-linking";
import {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";

export type Url = string | null | undefined;

type UrlContextValue = {
  url: Url;
  resetUrl: () => void;
};

const UrlContext = createContext<UrlContextValue>({} as UrlContextValue);

export const useUrl = () => useContext(UrlContext);

export const UrlProvider = ({ children }: { children: ReactNode }) => {
  const [urlState, setUrlState] = useState<Url>();

  const resetUrl = useCallback(() => {
    setUrlState(null);
  }, []);

  useEffect(() => {
    async function updateURL() {
      const initialURL = await getInitialURL();
      setUrlState(initialURL);
    }

    void updateURL();
  }, []);

  useEffect(() => {
    const subscription = addEventListener("url", ({ url }) => {
      setUrlState(url);
    });
    return subscription.remove;
  }, []);

  return (
    <UrlContext.Provider
      value={{
        url: urlState,
        resetUrl,
      }}
    >
      {children}
    </UrlContext.Provider>
  );
};
