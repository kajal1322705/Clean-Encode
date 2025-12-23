import { createFieldMap, getStatusClass } from "../fieldMapper";

export const userFieldMap = createFieldMap([
  { id: "employeeId", label: "Employee ID", type: "text", required: true, placeholder: "e.g., EMP-001", sortable: true },
  { id: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter full name", sortable: true, filterable: true },
  { id: "email", label: "Email", type: "email", required: true, placeholder: "user@example.com" },
  { id: "phone", label: "Phone", type: "phone", placeholder: "Enter phone number" },
  { id: "role", label: "Role", type: "select", required: true, options: [
    { value: "admin", label: "Administrator" },
    { value: "ho_manager", label: "HO Manager" },
    { value: "dealer_owner", label: "Dealer Owner" },
    { value: "sales_executive", label: "Sales Executive" },
    { value: "service_manager", label: "Service Manager" },
    { value: "technician", label: "Technician" },
    { value: "accountant", label: "Accountant" },
  ], filterable: true },
  { id: "dealerId", label: "Assigned Dealer", type: "select", options: [], placeholder: "Select dealer (optional)" },
  { id: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ], defaultValue: "active", conditionalClass: (v) => getStatusClass(v as string), filterable: true },
]);
