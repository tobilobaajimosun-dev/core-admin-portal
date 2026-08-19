export interface CustomerDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

export interface IdVerification {
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  matchedName?: string | null;
  dateOfBirth?: string | null;
  provider?: string | null;
  verifiedAt?: string | null;
}

export interface WorkDetails {
  employer: string;
  jobTitle: string;
  monthlyIncome: string;
  employmentType: string;
  workEmail?: string | null;
}

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
  work?: WorkDetails | null;
  bvnVerification?: IdVerification | null;
  ninVerification?: IdVerification | null;
  documents?: CustomerDocument[];
}
