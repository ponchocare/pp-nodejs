type ISO8601Date = `${number}-${number}-${number}`;
type ISO8601Time = `${number}:${number}:${number}.${number}Z`;
type DateValue = `${ISO8601Date}T${ISO8601Time}` | Date;

type Constraints = { minimum_card_amount?: number };

type BasePaymentInit = {
  amount: number;
  metadata: string;
  note?: string;
  expiry?: DateValue;
  constraints?: Constraints;
};

type LineItem = {
  description: string;
  amount: number;
  quantity: number;
};

export type PaymentInit = BasePaymentInit & {
  urn: string;
  email: string;
  line_items?: LineItem[];
};

export enum Weekday {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday',
}

type SubscriptionRepetition =
  | { granularity: 'day'; period: number }
  | { granularity: 'week'; period: number; weekdays: Set<Weekday> }
  | { granularity: 'month'; period: number; day: number }
  | { granularity: 'year'; period: number };

type SubscriptionEnding =
  | { condition: 'never' }
  | { condition: 'occurrences'; occurrences: number }
  | { condition: 'date'; date: DateValue };

export type SubscriptionInit = {
  urn: string;
  amount: number;
  metadata: string;
  note?: string;
  email: string;
  repetition: SubscriptionRepetition;
  ending?: SubscriptionEnding;
  additional_one_time_payment?: BasePaymentInit;
};

export enum PaymentMethodType {
  Card = 'card',
  ChildcareVouchers = 'childcare-voucher',
  TaxFreeChildcare = 'tax-free-childcare',
}

export type JWTPayload = {
  urn: string;
  email: string;
};

export type PaymentMethodUpdate = JWTPayload & {
  type: PaymentMethodType;
  amount: number;
  voucher_provider?: string;
};

export type PaymentMethodRefund = JWTPayload & {
  amount: number;
};

export type LocationStatus = {
  verification_status: boolean;
  card_payments_enabled: boolean;
  childcare_voucher_payments_enabled: boolean;
  tax_free_childcare_payments_enabled: boolean;
};
