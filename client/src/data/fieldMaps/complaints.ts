import { createFieldMap, getStatusClass } from "../fieldMapper";

export const complaintFieldMap = createFieldMap([
  { id: "complaintNumber", label: "Complaint No", type: "text", showInForm: false, sortable: true },
  { id: "customerName", label: "Customer Name", type: "text", required: true, placeholder: "Enter customer name", sortable: true, filterable: true },
  { id: "customerPhone", label: "Phone", type: "phone", required: true, placeholder: "Enter phone number" },
  { id: "vehicleNumber", label: "Vehicle No", type: "text", placeholder: "e.g., MH 12 AB 1234" },
  { id: "category", label: "Category", type: "select", required: true, options: [
    { value: "product_quality", label: "Product Quality" },
    { value: "service_issue", label: "Service Issue" },
    { value: "delivery_delay", label: "Delivery Delay" },
    { value: "battery_problem", label: "Battery Problem" },
    { value: "staff_behavior", label: "Staff Behavior" },
    { value: "billing", label: "Billing Issue" },
    { value: "other", label: "Other" },
  ], filterable: true },
  { id: "description", label: "Description", type: "textarea", required: true, placeholder: "Describe the complaint in detail" },
  { id: "status", label: "Status", type: "select", options: [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ], defaultValue: "open", conditionalClass: (v) => getStatusClass(v as string), filterable: true },
  { id: "escalationLevel", label: "Escalation", type: "number", showInForm: false },
  { id: "createdAt", label: "Created At", type: "datetime", showInForm: false, sortable: true },
]);
