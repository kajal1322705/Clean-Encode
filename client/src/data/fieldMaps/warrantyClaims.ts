import { createFieldMap, getStatusClass } from "../fieldMapper";

export const warrantyClaimFieldMap = createFieldMap([
  { id: "claimNumber", label: "Claim No", type: "text", showInForm: false, sortable: true },
  { id: "vin", label: "VIN", type: "text", required: true, placeholder: "Vehicle Identification Number" },
  { id: "vehicleNumber", label: "Vehicle No", type: "text", required: true, placeholder: "e.g., MH 12 AB 1234" },
  { id: "customerName", label: "Customer Name", type: "text", required: true, placeholder: "Enter customer name", sortable: true, filterable: true },
  { id: "claimType", label: "Claim Type", type: "select", required: true, options: [
    { value: "battery", label: "Battery" },
    { value: "motor", label: "Motor" },
    { value: "controller", label: "Controller" },
    { value: "charger", label: "Charger" },
    { value: "body", label: "Body Parts" },
    { value: "electrical", label: "Electrical" },
    { value: "other", label: "Other" },
  ], filterable: true },
  { id: "description", label: "Failure Description", type: "textarea", required: true, placeholder: "Describe the failure in detail" },
  { id: "claimAmount", label: "Claim Amount", type: "currency", placeholder: "Estimated claim amount" },
  { id: "status", label: "Status", type: "select", options: [
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "closed", label: "Closed" },
  ], defaultValue: "pending", conditionalClass: (v) => getStatusClass(v as string), filterable: true },
  { id: "approvedAmount", label: "Approved Amount", type: "currency", showInForm: false },
  { id: "createdAt", label: "Submitted At", type: "datetime", showInForm: false, sortable: true },
]);
