export interface Customer {
  id: string;
  internalCustomerId: string | null;
  phoneNumber: string;
  email: string;
  bvn: string | null;
  nin: string | null;
  dateOfBirth: string | null;
  isTriadVerified: boolean;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
