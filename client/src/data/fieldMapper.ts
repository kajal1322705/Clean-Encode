import type { ReactNode } from "react";

export type FieldType = 
  | "text" 
  | "email" 
  | "phone" 
  | "number" 
  | "currency" 
  | "date" 
  | "datetime" 
  | "select" 
  | "textarea" 
  | "checkbox"
  | "file"
  | "hidden";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDescriptor {
  id: string;
  label: string;
  type: FieldType;
  schemaKey?: string;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  defaultValue?: unknown;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  formatter?: (value: unknown) => string | ReactNode;
  parser?: (value: string) => unknown;
  showInTable?: boolean;
  showInForm?: boolean;
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  className?: string;
  conditionalClass?: (value: unknown, row?: unknown) => string;
}

export interface FieldMap {
  [key: string]: FieldDescriptor;
}

export function createFieldMap(fields: FieldDescriptor[]): FieldMap {
  return fields.reduce((acc, field) => {
    acc[field.id] = field;
    return acc;
  }, {} as FieldMap);
}

export function getTableColumns(fieldMap: FieldMap): FieldDescriptor[] {
  return Object.values(fieldMap).filter(f => f.showInTable !== false);
}

export function getFormFields(fieldMap: FieldMap): FieldDescriptor[] {
  return Object.values(fieldMap).filter(f => f.showInForm !== false && f.type !== "hidden");
}

export function formatFieldValue(field: FieldDescriptor, value: unknown): string | ReactNode {
  if (value === null || value === undefined) return "-";
  if (field.formatter) return field.formatter(value);
  
  switch (field.type) {
    case "currency":
      return `₹${Number(value).toLocaleString("en-IN")}`;
    case "date":
      return value ? new Date(value as string).toLocaleDateString("en-IN") : "-";
    case "datetime":
      return value ? new Date(value as string).toLocaleString("en-IN") : "-";
    case "checkbox":
      return value ? "Yes" : "No";
    default:
      return String(value);
  }
}

export function getConditionalClass(field: FieldDescriptor, value: unknown, row?: unknown): string {
  if (field.conditionalClass) {
    return field.conditionalClass(value, row);
  }
  return field.className || "";
}

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  open: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export function getStatusClass(status: string): string {
  return statusColors[status?.toLowerCase()] || statusColors.pending;
}
