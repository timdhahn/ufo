import cases from "@/data/cases.json";
import type { CaseFile } from "@/models/case";

const typedCases = cases as CaseFile[];

export function getCases(): CaseFile[] {
  return typedCases;
}

export function getCaseBySlug(slug: string): CaseFile | undefined {
  return typedCases.find((caseFile) => caseFile.slug === slug);
}
