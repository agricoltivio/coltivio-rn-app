import { createQueryKeys } from "@lukemorales/query-key-factory";

export const userQueryKeys = createQueryKeys("users", {
  me: null,
  all: null,
  farms: null,
});
