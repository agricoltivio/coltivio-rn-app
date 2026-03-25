import { FetchClient } from "./api";
import { components } from "./v1";

export type Task =
  components["schemas"]["GetV1TasksPositiveResponse"]["data"]["result"][number];

export type TaskDetail =
  components["schemas"]["GetV1TasksByIdTaskIdPositiveResponse"]["data"];

export type TaskCreateInput = components["schemas"]["PostV1TasksRequestBody"];

export type TaskUpdateInput =
  components["schemas"]["PatchV1TasksByIdTaskIdRequestBody"];

export type TaskStatus = components["schemas"]["GetV1TasksParameterStatus"];

export type TaskChecklistItem =
  components["schemas"]["PatchV1TasksByIdTaskIdChecklistItemsByIdItemIdPositiveResponse"]["data"];

export type TaskStatusUpdateResult =
  components["schemas"]["PatchV1TasksByIdTaskIdStatusPositiveResponse"]["data"];

export function tasksApi(client: FetchClient) {
  return {
    async getTasks(status?: TaskStatus): Promise<Task[]> {
      const { data } = await client.GET("/v1/tasks", {
        params: { query: status ? { status } : undefined },
      });
      return data!.data.result;
    },

    async getTaskById(taskId: string): Promise<TaskDetail> {
      const { data } = await client.GET("/v1/tasks/byId/{taskId}", {
        params: { path: { taskId } },
      });
      return data!.data;
    },

    async createTask(body: TaskCreateInput): Promise<TaskDetail> {
      const { data } = await client.POST("/v1/tasks", { body });
      return data!.data;
    },

    async updateTask(
      taskId: string,
      body: TaskUpdateInput,
    ): Promise<TaskDetail> {
      const { data } = await client.PATCH("/v1/tasks/byId/{taskId}", {
        params: { path: { taskId } },
        body,
      });
      return data!.data;
    },

    async deleteTask(taskId: string): Promise<void> {
      await client.DELETE("/v1/tasks/byId/{taskId}", {
        params: { path: { taskId } },
      });
    },

    async setTaskStatus(
      taskId: string,
      status: TaskStatus,
    ): Promise<TaskStatusUpdateResult> {
      const { data } = await client.PATCH("/v1/tasks/byId/{taskId}/status", {
        params: { path: { taskId } },
        body: { status },
      });
      return data!.data;
    },

    async toggleChecklistItem(
      taskId: string,
      itemId: string,
      done: boolean,
    ): Promise<TaskChecklistItem> {
      const { data } = await client.PATCH(
        "/v1/tasks/byId/{taskId}/checklistItems/byId/{itemId}",
        {
          params: { path: { taskId, itemId } },
          body: { done },
        },
      );
      return data!.data;
    },
  };
}
