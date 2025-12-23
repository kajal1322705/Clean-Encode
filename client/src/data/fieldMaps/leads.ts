import { createFieldMap, type FieldDescriptor, getStatusClass } from "../fieldMapper";

const leadFields: FieldDescriptor[] = [
  {
    id: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Enter lead name",
    sortable: true,
    filterable: true,
  },
  {
    id: "phone",
    label: "Phone",
    type: "phone",
    required: true,
    placeholder: "Enter phone number",
    validation: { minLength: 10, maxLength: 10 },
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email address",
  },
  {
    id: "source",
    label: "Source",
    type: "select",
    required: true,
    options: [
      { value: "website", label: "Website" },
      { value: "meta", label: "Meta (Facebook/Instagram)" },
      { value: "google", label: "Google Ads" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "walk_in", label: "Walk-in" },
      { value: "referral", label: "Referral" },
      { value: "event", label: "Event" },
    ],
    filterable: true,
  },
  {
    id: "interestedModel",
    label: "Interested Model",
    type: "select",
    options: [
      { value: "ZForce X1", label: "ZForce X1" },
      { value: "ZForce X2 Pro", label: "ZForce X2 Pro" },
      { value: "ZForce City", label: "ZForce City" },
      { value: "ZForce Cargo", label: "ZForce Cargo" },
    ],
    filterable: true,
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "new", label: "New" },
      { value: "contacted", label: "Contacted" },
      { value: "qualified", label: "Qualified" },
      { value: "negotiation", label: "Negotiation" },
      { value: "converted", label: "Converted" },
      { value: "lost", label: "Lost" },
    ],
    defaultValue: "new",
    conditionalClass: (value) => getStatusClass(value as string),
    filterable: true,
  },
  {
    id: "nextFollowUp",
    label: "Next Follow-up",
    type: "date",
    placeholder: "Select follow-up date",
    sortable: true,
  },
  {
    id: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Add notes",
    showInTable: false,
  },
  {
    id: "createdAt",
    label: "Created At",
    type: "datetime",
    showInForm: false,
    sortable: true,
  },
];

export const leadFieldMap = createFieldMap(leadFields);
