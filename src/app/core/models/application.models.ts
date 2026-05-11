export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface ApplyRequest {
  offerId: number;
  coverLetter?: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  adminNotes?: string;
}

export interface ApplicationResponse {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  offerId: number;
  offerTitle: string;
  companyName: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  adminNotes: string | null;
  appliedAt: string;
}
