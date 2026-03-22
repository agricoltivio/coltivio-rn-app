import { FetchClient } from "./api";
import { components } from "./v1";

export type OutdoorJournalEntry =
  components["schemas"]["GetV1AnimalsOutdoorJournalPositiveResponse"]["data"]["entries"][number];

export type OutdoorJournalData =
  components["schemas"]["GetV1AnimalsOutdoorJournalPositiveResponse"]["data"];

export type UncategorizedAnimal =
  OutdoorJournalData["uncategorizedAnimals"][number];

export function outdoorJournalApi(client: FetchClient) {
  return {
    async getOutdoorJournal(
      fromDate: string,
      toDate: string,
    ): Promise<OutdoorJournalData> {
      const { data } = await client.GET("/v1/animals/outdoorJournal", {
        params: { query: { fromDate, toDate } },
      });
      return data!.data;
    },
  };
}
