import { createFieldMap, getStatusClass } from "../fieldMapper";

export const dealerFieldMap = createFieldMap([
  { id: "dealerCode", label: "Dealer Code", type: "text", required: true, placeholder: "e.g., DLR-001", sortable: true },
  { id: "name", label: "Dealer Name", type: "text", required: true, placeholder: "Enter dealer name", sortable: true, filterable: true },
  { id: "ownerName", label: "Owner Name", type: "text", placeholder: "Name of dealership owner" },
  { id: "email", label: "Email", type: "email", required: true, placeholder: "dealer@example.com" },
  { id: "phone", label: "Phone", type: "phone", required: true, placeholder: "Enter phone number" },
  { id: "address", label: "Address", type: "textarea", placeholder: "Full address" },
  { id: "city", label: "City", type: "text", placeholder: "City", filterable: true },
  { id: "state", label: "State", type: "text", placeholder: "State", filterable: true },
  { id: "pincode", label: "Pincode", type: "text", placeholder: "PIN Code" },
  { id: "gstNumber", label: "GST Number", type: "text", placeholder: "GSTIN" },
  { id: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ], defaultValue: "active", conditionalClass: (v) => getStatusClass(v as string), filterable: true },
]);
