import { createQueryKeys } from "@lukemorales/query-key-factory";

export const farmsQueryKeys = createQueryKeys("farms", {
  farm: null,
  list: null,
  stats: null,
  invites: null,
  membershipStatus: null,
  membershipPayments: null,
  memberPermissions: (userId: string) => [{ userId }],
});
