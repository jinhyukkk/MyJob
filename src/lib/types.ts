export type NormalizedJob = {
  externalId: string;
  title: string;
  company: string;
  team?: string | null;
  location?: string | null;
  type?: string | null;
  level?: string | null;
  category?: string | null;
  url: string;
  postedAt?: Date | null;
  deadlineAt?: Date | null;
  deadlineLabel?: string | null;
  ddayLabel?: string | null;
  description?: string | null;
  raw: unknown;
};

export type AdapterConfig = Record<string, unknown>;

export interface CrawlerAdapter {
  key: string;
  name: string;
  /** JSON-schema-like description of supported config keys, for UI. */
  configSchema?: AdapterConfigSchema;
  fetch(config: AdapterConfig): Promise<NormalizedJob[]>;
}

export type AdapterConfigField =
  | { key: string; label: string; type: 'multi'; options: { value: string; label: string }[] }
  | { key: string; label: string; type: 'keywords'; placeholder?: string };

export type AdapterConfigSchema = { fields: AdapterConfigField[] };
