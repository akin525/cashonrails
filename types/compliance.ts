// Enhanced document compliance types

export interface ComplianceDocument {
  id: string;
  name: string;
  status: 'compliant' | 'non_compliant' | 'missing' | 'under_review';
  reason?: string; // Reason for non-compliance
  submissionDate?: string;
  reviewDate?: string;
  documentType: DocumentType;
}

export type DocumentType = 
  | 'certificate_of_incorporation'
  | 'status_report'
  | 'aml_policy'
  | 'memorandum_articles'
  | 'aml_cft_questionnaire'
  | 'kyc_policy'
  | 'proof_of_address'
  | 'idcard'
  | 'cac'
  | 'bank_statement'
  | 'business_license'
  | 'tax_clearance'
  | 'other';

export interface ComplianceReview {
  merchantId: string;
  documents: ComplianceDocument[];
  overallStatus: 'approved' | 'rejected' | 'pending';
  reviewDate: string;
  reviewerNotes: string;
}

// Document compliance reasons
export const COMPLIANCE_ISSUES = {
  'poor_quality': 'Document quality is too poor to verify',
  'expired': 'Document has expired',
  'incorrect_name': 'Name on document does not match application',
  'incomplete': 'Document is incomplete or missing required information',
  'invalid_format': 'Document format is not acceptable',
  'unreadable': 'Document is not clearly readable',
  'suspicious': 'Document appears to be altered or suspicious',
  'wrong_type': 'Wrong type of document submitted',
  'missing_signature': 'Document is missing required signature/stamp',
  'other': 'Other compliance issue'
} as const;

export type ComplianceIssue = keyof typeof COMPLIANCE_ISSUES;