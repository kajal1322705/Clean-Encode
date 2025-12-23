import { createFieldMap, getStatusClass } from "../fieldMapper";

export const testRideFieldMap = createFieldMap([
  { id: "customerName", label: "Customer Name", type: "text", required: true, placeholder: "Enter customer name", sortable: true, filterable: true },
  { id: "customerPhone", label: "Phone", type: "phone", required: true, placeholder: "Enter phone number" },
  { id: "vehicleModel", label: "Vehicle Model", type: "select", required: true, options: [
    { value: "ZForce X1", label: "ZForce X1" },
    { value: "ZForce X2 Pro", label: "ZForce X2 Pro" },
    { value: "ZForce City", label: "ZForce City" },
    { value: "ZForce Cargo", label: "ZForce Cargo" },
  ], filterable: true },
  { id: "scheduledDate", label: "Scheduled Date & Time", type: "datetime", required: true, sortable: true },
  { id: "salesperson", label: "Salesperson", type: "text", placeholder: "Assigned salesperson" },
  { id: "status", label: "Status", type: "select", options: [
    { value: "scheduled", label: "Scheduled" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "no_show", label: "No Show" },
  ], defaultValue: "scheduled", conditionalClass: (v) => getStatusClass(v as string), filterable: true },
  { id: "feedback", label: "Feedback", type: "textarea", placeholder: "Customer feedback after test ride", showInForm: false },
  { id: "conversionStatus", label: "Conversion", type: "select", options: [
    { value: "pending", label: "Pending" },
    { value: "converted", label: "Converted" },
    { value: "lost", label: "Lost" },
  ], showInForm: false, conditionalClass: (v) => getStatusClass(v as string) },
]);
