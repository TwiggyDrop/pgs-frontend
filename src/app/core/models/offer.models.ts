export type OfferStatus = 'ACTIVE' | 'CLOSED';

export interface CreateOfferRequest {
  title: string;
  description: string;
  requiredSkills?: string;
  domain?: string;
  location?: string;
  startDate: string;
  endDate: string;
  durationMonths?: number;
}

export interface OfferResponse {
  id: number;
  title: string;
  description: string;
  requiredSkills: string | null;
  domain: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  durationMonths: number | null;
  status: OfferStatus;
  companyName: string;
  companyId: number;
  createdAt: string;
}
