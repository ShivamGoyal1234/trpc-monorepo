import { Parser } from "json2csv";

interface ExportRow {
  responseId: string;
  submittedAt: string;
  respondentEmail: string | null;
  status: string;
  [fieldLabel: string]: string | number | boolean | null;
}

export function responsesToCsv(
  rows: ExportRow[],
  fieldLabels: string[],
): string {
  const fields = [
    "responseId",
    "submittedAt",
    "respondentEmail",
    "status",
    ...fieldLabels,
  ];
  const parser = new Parser({ fields });
  return parser.parse(rows);
}

export function responsesToJson(rows: ExportRow[]): string {
  return JSON.stringify(rows, null, 2);
}
