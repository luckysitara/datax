import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AuditWithVulnerabilities, type CreateAuditRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAudit(id: number) {
  return useQuery({
    queryKey: [api.audits.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.audits.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch audit");
      return api.audits.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll every 3 seconds if the audit is running or pending
      const status = query.state.data?.status;
      return status === "running" || status === "pending" ? 3000 : false;
    },
  });
}

export function useCreateAudit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAuditRequest) => {
      const res = await fetch(api.audits.create.path, {
        method: api.audits.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to start audit");
      }

      return api.audits.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate both project list (if it shows audit counts) and the specific project details
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, data.projectId] });
      toast({
        title: "Audit Sequence Initiated",
        description: "Scanning protocols active. Analysis in progress.",
        className: "border-primary text-primary",
      });
    },
    onError: (error) => {
      toast({
        title: "Sequence Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
