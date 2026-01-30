export type CaseSeverity = "Low" | "Moderate" | "High" | "Critical";

export type CaseStatus = "Unresolved" | "Likely Explained" | "Unknown";

export type CaseMedia = {
  type: "image" | "video";
  src: string;
  caption?: string;
};

export type CaseFile = {
  id: string;
  slug: string;
  title: string;
  date: string;
  location: string;
  coordinates: [number, number];
  summary: string;
  readMore?: string;
  severity: CaseSeverity;
  status: CaseStatus;
  media: CaseMedia[];
};
