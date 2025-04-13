import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";

/**
 * Grab from docs, don't commit:
 */
const token = "battesta;battesta@miadi.ch";

const config: AxiosRequestConfig = {
  headers: {
    Authorization: token,
    "Content-Type": "application/json",
  },
};

const fetchData = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(endpoint, { ...config, params });
    return response.data ?? {};
  } catch (e) {
    console.log(e.message);
    throw e;
  }
};

/**
 * A basic wrapper around the useQuery hook to not always to do same trick..
 * would be nice to generate an OpenAPI client still but for starters OK.
 * @param endpoint
 * @param params
 * @param queryOptions
 */
export const useFetchPastorino = (
  endpoint,
  params = {},
  queryOptions = {}
): UseQueryResult => {
  return useQuery({
    queryKey: [endpoint, params],
    queryFn: () => fetchData(endpoint, params),
  });
};
