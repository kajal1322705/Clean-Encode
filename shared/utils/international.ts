export const ISO_COUNTRY_CODE = "IN";
export const ISO_CURRENCY_CODE = "INR";
export const DEFAULT_LOCALE = "en-IN";

export const PHONE_REGEX = /^\+91[6-9]\d{9}$/;
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }
  return phone;
}

export function isValidIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return INDIAN_MOBILE_REGEX.test(cleaned.slice(2));
  }
  return INDIAN_MOBILE_REGEX.test(cleaned);
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: ISO_CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateISO(date: Date): string {
  return date.toISOString();
}

export function formatDateLocal(date: Date): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function parseAmountToMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function formatAmountFromMinorUnits(minorUnits: number): number {
  return minorUnits / 100;
}

export function generateUniqueCode(prefix: string, sequence?: number): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  if (sequence !== undefined) {
    return `${prefix}-${sequence.toString().padStart(6, "0")}`;
  }
  return `${prefix}-${timestamp}${random}`;
}

export function generateVIN(modelCode: string): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ZF${year}${modelCode}${random}`;
}

export const GST_RATE = 0.18;
export const CGST_RATE = 0.09;
export const SGST_RATE = 0.09;
export const IGST_RATE = 0.18;

export function calculateGST(baseAmount: number, isInterState: boolean = false): {
  baseAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number;
} {
  if (isInterState) {
    const igst = Math.round(baseAmount * IGST_RATE);
    return {
      baseAmount,
      cgst: 0,
      sgst: 0,
      igst,
      totalTax: igst,
      grandTotal: baseAmount + igst,
    };
  }
  const cgst = Math.round(baseAmount * CGST_RATE);
  const sgst = Math.round(baseAmount * SGST_RATE);
  return {
    baseAmount,
    cgst,
    sgst,
    igst: 0,
    totalTax: cgst + sgst,
    grandTotal: baseAmount + cgst + sgst,
  };
}

export const BookingStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ALLOCATED: "allocated",
  READY_FOR_DELIVERY: "ready_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

export const JobCardStatus = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  PENDING_PARTS: "pending_parts",
  COMPLETED: "completed",
  INVOICED: "invoiced",
  CLOSED: "closed",
} as const;

export type JobCardStatusType = typeof JobCardStatus[keyof typeof JobCardStatus];

export const WarrantyClaimStatus = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  PARTIALLY_APPROVED: "partially_approved",
  REJECTED: "rejected",
  REIMBURSED: "reimbursed",
} as const;

export type WarrantyClaimStatusType = typeof WarrantyClaimStatus[keyof typeof WarrantyClaimStatus];

export const LeadStatus = {
  NEW: "new",
  CONTACTED: "contacted",
  INTERESTED: "interested",
  HOT: "hot",
  WARM: "warm",
  COLD: "cold",
  CONVERTED: "converted",
  LOST: "lost",
} as const;

export type LeadStatusType = typeof LeadStatus[keyof typeof LeadStatus];

export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatusType, BookingStatusType[]> = {
  draft: ["pending", "cancelled"],
  pending: ["confirmed", "cancelled"],
  confirmed: ["allocated", "cancelled"],
  allocated: ["ready_for_delivery", "confirmed"],
  ready_for_delivery: ["delivered", "allocated"],
  delivered: [],
  cancelled: [],
};

export const JOB_CARD_STATUS_TRANSITIONS: Record<JobCardStatusType, JobCardStatusType[]> = {
  open: ["in_progress", "closed"],
  in_progress: ["pending_parts", "completed", "open"],
  pending_parts: ["in_progress"],
  completed: ["invoiced", "in_progress"],
  invoiced: ["closed"],
  closed: [],
};

export const WARRANTY_STATUS_TRANSITIONS: Record<WarrantyClaimStatusType, WarrantyClaimStatusType[]> = {
  draft: ["submitted"],
  submitted: ["under_review"],
  under_review: ["approved", "partially_approved", "rejected"],
  approved: ["reimbursed"],
  partially_approved: ["reimbursed"],
  rejected: [],
  reimbursed: [],
};

export function canTransitionTo<T extends string>(
  currentStatus: T,
  newStatus: T,
  transitions: Record<T, T[]>
): boolean {
  const allowed = transitions[currentStatus];
  return allowed?.includes(newStatus) ?? false;
}
