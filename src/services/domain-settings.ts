import { api } from "@/lib/api";

export interface StoreDomain {
  id: number;
  hostname: string;
  is_primary: boolean;
  status: "active" | "pending_review" | "rejected";
  rejection_reason?: string | null;
  verified_at: string | null;
  is_verified: boolean;
  created_at?: string | null;
}

export interface DnsRecordInstruction {
  type: string;
  name: string;
  value: string;
  ttl: string;
}

export interface DomainSettingsData {
  items: StoreDomain[];
  can_connect_directly: boolean;
  instructions: {
    server_ip: string;
    cname_target: string;
    a_record: DnsRecordInstruction;
    cname_record: DnsRecordInstruction;
  };
}

export const domainSettingsApi = {
  getDomains: () => api.get<DomainSettingsData>("/admin/settings/domains"),
  addDomain: (hostname: string) =>
    api.post<StoreDomain>("/admin/settings/domains", { hostname }),
  makePrimary: (domainId: number) =>
    api.post<StoreDomain>(`/admin/settings/domains/${domainId}/primary`),
  removeDomain: (domainId: number) =>
    api.delete<null>(`/admin/settings/domains/${domainId}`),
};
