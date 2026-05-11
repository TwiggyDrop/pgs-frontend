export type InternshipStatus = 'ONGOING' | 'COMPLETED' | 'INTERRUPTED';

export interface CreateInternshipRequest {
  applicationId: number;
  supervisorId?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateInternshipStatusRequest {
  status: InternshipStatus;
}

export interface AddNotesRequest {
  notes: string;
}

export interface InternshipResponse {
  id: number;
  applicationId: number;
  studentName: string;
  studentEmail: string;
  offerTitle: string;
  companyName: string;
  supervisorName: string | null;
  status: InternshipStatus;
  startDate: string | null;
  endDate: string | null;
  reportUrl: string | null;
  supervisorNotes: string | null;
  createdAt: string;
}
