import type { CaseFile, CaseSeverity, CaseStatus } from "@/models/case";

type SortDirection = "asc" | "desc";

export function sortCasesByDate(
  cases: CaseFile[],
  direction: SortDirection = "desc",
): CaseFile[] {
  return [...cases].sort((a, b) => {
    if (direction === "asc") {
      return a.date.localeCompare(b.date);
    }
    return b.date.localeCompare(a.date);
  });
}

export function filterCasesBySeverity(
  cases: CaseFile[],
  severity?: CaseSeverity | CaseSeverity[],
): CaseFile[] {
  if (!severity) {
    return cases;
  }

  const severityList = Array.isArray(severity) ? severity : [severity];
  return cases.filter((caseFile) => severityList.includes(caseFile.severity));
}

export function filterCasesByStatus(
  cases: CaseFile[],
  status?: CaseStatus | CaseStatus[],
): CaseFile[] {
  if (!status) {
    return cases;
  }

  const statusList = Array.isArray(status) ? status : [status];
  return cases.filter((caseFile) => statusList.includes(caseFile.status));
}
