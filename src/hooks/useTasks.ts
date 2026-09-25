import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import * as api from "@/lib/manus-api";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.listTasks(40);
      if (!res.ok) throw new Error(res.error?.message || "Failed to list tasks");
      return res.data || [];
    },
    refetchInterval: 20_000,
    enabled: api.hasApiKey(),
  });
}

export function useTaskMessages(taskId: string | undefined) {
  return useQuery({
    queryKey: ["messages", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await api.listMessages(taskId, 80, "asc");
      if (!res.ok) throw new Error(res.error?.message || "Failed to load messages");
      return res.data || [];
    },
    enabled: Boolean(taskId) && api.hasApiKey(),
    refetchInterval: (q) => {
      const msgs = q.state.data;
      if (!msgs?.length) return 4000;
      const last = msgs[msgs.length - 1];
      if (last?.agent_status === "running" || last?.agent_status === "waiting")
        return 2500;
      return 12_000;
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: string | { content: string; connectors?: string[] }) => {
      if (typeof args === "string") return api.createTask({ content: args });
      return api.createTask(args);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useSendMessage(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => api.sendMessage(taskId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useConfirmAction(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, accept }: { eventId: string; accept: boolean }) =>
      api.confirmAction(taskId, eventId, accept),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", taskId] }),
  });
}

export function useStopTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => api.stopTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => api.deleteTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useValidateKey() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.getMe();
      if (!res.ok) throw new Error(res.error?.message || "Invalid API key");
      return res;
    },
  });
}

export function useConnectors() {
  return useQuery({
    queryKey: ["connectors"],
    queryFn: async () => {
      const res = await api.listConnectors();
      if (!res.ok) throw new Error(res.error?.message || "Failed to list connectors");
      return res.data || [];
    },
    enabled: api.hasApiKey(),
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.listProjects();
      if (!res.ok) throw new Error(res.error?.message || "Failed to list projects");
      return res.data || [];
    },
    enabled: api.hasApiKey(),
  });
}

export function useCredits() {
  return useQuery({
    queryKey: ["credits"],
    queryFn: async () => {
      const res = await api.availableCredits();
      if (!res.ok) return null;
      return res;
    },
    enabled: api.hasApiKey(),
    retry: false,
  });
}

export function useWebhookEvents() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["webhook-events"],
    queryFn: async () => {
      const res = await api.fetchWebhookEvents(40);
      return res.data || [];
    },
    refetchInterval: 15_000,
  });

  // Live SSE from OpenMuse server
  useEffect(() => {
    const base = api.serverBase();
    if (!base) return;
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${base}/events`);
      es.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.type === "webhook") {
            qc.invalidateQueries({ queryKey: ["webhook-events"] });
            qc.invalidateQueries({ queryKey: ["tasks"] });
            if (data.event?.task_id) {
              qc.invalidateQueries({
                queryKey: ["messages", data.event.task_id],
              });
            }
          }
        } catch {
          /* ignore */
        }
      };
    } catch {
      /* SSE unavailable */
    }
    return () => es?.close();
  }, [qc]);

  return q;
}
