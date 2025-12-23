import { createFieldMap } from "../fieldMapper";

export const spareFieldMap = createFieldMap([
  { id: "partNumber", label: "Part Number", type: "text", required: true, placeholder: "e.g., ZF-BAT-001", sortable: true },
  { id: "partName", label: "Part Name", type: "text", required: true, placeholder: "Enter part name", sortable: true, filterable: true },
  { id: "category", label: "Category", type: "select", required: true, options: [
    { value: "battery", label: "Battery" },
    { value: "motor", label: "Motor" },
    { value: "controller", label: "Controller" },
    { value: "charger", label: "Charger" },
    { value: "body", label: "Body Parts" },
    { value: "electrical", label: "Electrical" },
    { value: "suspension", label: "Suspension" },
    { value: "accessories", label: "Accessories" },
  ], filterable: true },
  { id: "quantity", label: "Stock Qty", type: "number", required: true, placeholder: "Current stock quantity", sortable: true },
  { id: "minStock", label: "Min Stock", type: "number", required: true, placeholder: "Minimum stock level" },
  { id: "unitPrice", label: "Unit Price", type: "currency", required: true, placeholder: "Price per unit" },
  { id: "binLocation", label: "Bin Location", type: "text", placeholder: "e.g., A-01-05" },
]);
