export interface PaymentMethod {
  code: string;
  name: string;
  description: string | null;
  paymentType: string;
}
