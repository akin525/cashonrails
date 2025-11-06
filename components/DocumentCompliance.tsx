import React, { useState } from 'react';
import { ComplianceDocument, ComplianceIssue, COMPLIANCE_ISSUES, DocumentType } from '@/types/compliance';
import { useUI } from '@/contexts/uiContext';
import { Tooltip } from '@/components/utils';
import { CloseIcon } from '@/assets/icons';

interface DocumentComplianceCardProps {
  document: {
    id: string;
    name: string;
    type: DocumentType;
    submissionDate?: string;
    url?: string;
  };
  merchantId: string;
  onComplianceChange?: (documentId: string, status: ComplianceDocument['status'], reason?: string) => void;
}

export const DocumentComplianceCard: React.FC<DocumentComplianceCardProps> = ({
  document,
  merchantId,
  onComplianceChange
}) => {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceDocument['status']>('under_review');
  const [selectedIssue, setSelectedIssue] = useState<ComplianceIssue | ''>('');
  const [customReason, setCustomReason] = useState('');
  const [showIssueSelector, setShowIssueSelector] = useState(false);
  const { addFlaggedDocument, removeFlaggedDocument, flaggedDocuments } = useUI();

  const isDocumentFlagged = flaggedDocuments[merchantId]?.some(flagged => flagged.id === document.id);

  const handleStatusChange = (status: ComplianceDocument['status']) => {
    setComplianceStatus(status);
    
    if (status === 'non_compliant') {
      setShowIssueSelector(true);
      // Add to flagged documents
      addFlaggedDocument({
        id: document.id,
        name: document.name
      }, merchantId);
    } else {
      setShowIssueSelector(false);
      setSelectedIssue('');
      setCustomReason('');
      // Remove from flagged documents if it was flagged
      if (isDocumentFlagged) {
        removeFlaggedDocument(document.id, merchantId);
      }
    }

    onComplianceChange?.(document.id, status, getReasonText());
  };

  const getReasonText = () => {
    if (selectedIssue && selectedIssue !== 'other') {
      return COMPLIANCE_ISSUES[selectedIssue];
    }
    return customReason;
  };

  const handleIssueSubmit = () => {
    const reason = getReasonText();
    if (reason.trim()) {
      onComplianceChange?.(document.id, 'non_compliant', reason);
      setShowIssueSelector(false);
    }
  };

  const getStatusColor = (status: ComplianceDocument['status']) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-300';
      case 'non_compliant': return 'bg-red-100 text-red-800 border-red-300';
      case 'missing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getStatusColor(complianceStatus)}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-sm">{document.name}</h4>
          <p className="text-xs text-gray-600 mt-1">
            Type: {document.type.replace(/_/g, ' ').toUpperCase()}
          </p>
          {document.submissionDate && (
            <p className="text-xs text-gray-500">
              Submitted: {new Date(document.submissionDate).toLocaleDateString()}
            </p>
          )}
        </div>
        {isDocumentFlagged && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
            Flagged
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => handleStatusChange('compliant')}
          className={`px-3 py-1 text-xs rounded ${
            complianceStatus === 'compliant' 
              ? 'bg-green-600 text-white' 
              : 'bg-white border border-green-600 text-green-600 hover:bg-green-50'
          }`}
        >
          ✓ Compliant
        </button>
        
        <button
          onClick={() => handleStatusChange('non_compliant')}
          className={`px-3 py-1 text-xs rounded ${
            complianceStatus === 'non_compliant' 
              ? 'bg-red-600 text-white' 
              : 'bg-white border border-red-600 text-red-600 hover:bg-red-50'
          }`}
        >
          ✗ Non-Compliant
        </button>
        
        <button
          onClick={() => handleStatusChange('missing')}
          className={`px-3 py-1 text-xs rounded ${
            complianceStatus === 'missing' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-white border border-yellow-600 text-yellow-600 hover:bg-yellow-50'
          }`}
        >
          ? Missing
        </button>
      </div>

      {showIssueSelector && (
        <div className="mt-3 p-3 bg-white rounded border">
          <h5 className="text-sm font-medium mb-2">Why is this document non-compliant?</h5>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(COMPLIANCE_ISSUES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedIssue(key as ComplianceIssue)}
                className={`p-2 text-xs text-left rounded border ${
                  selectedIssue === key
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {selectedIssue === 'other' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please specify the compliance issue..."
              className="w-full p-2 text-sm border rounded resize-none"
              rows={3}
            />
          )}

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setShowIssueSelector(false);
                setComplianceStatus('under_review');
                if (isDocumentFlagged) {
                  removeFlaggedDocument(document.id, merchantId);
                }
              }}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleIssueSubmit}
              disabled={!selectedIssue && !customReason.trim()}
              className={`px-3 py-1 text-xs rounded ${
                (selectedIssue || customReason.trim())
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Flag Document
            </button>
          </div>
        </div>
      )}

      {complianceStatus === 'non_compliant' && !showIssueSelector && getReasonText() && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-700">
            <strong>Issue:</strong> {getReasonText()}
          </p>
        </div>
      )}
    </div>
  );
};

// Summary component to show all flagged documents
export const ComplianceSummary: React.FC<{ merchantId: string }> = ({ merchantId }) => {
  const { flaggedDocuments, clearFlaggedDocuments, removeFlaggedDocument } = useUI();
  const merchantDocs = flaggedDocuments[merchantId] || [];

  if (merchantDocs.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 text-sm">✓ All documents are compliant</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-red-800 font-medium text-sm">Non-Compliant Documents ({merchantDocs.length})</h4>
        <button
          onClick={() => clearFlaggedDocuments(merchantId)}
          className="text-red-600 hover:text-red-800 text-xs"
        >
          Clear All
        </button>
      </div>
      
      <div className="space-y-1">
        {merchantDocs.map((doc) => (
          <div key={doc.id} className="flex justify-between items-center bg-white p-2 rounded border">
            <span className="text-red-700 text-sm">{doc.name}</span>
            <button
              onClick={() => removeFlaggedDocument(doc.id, merchantId)}
              className="text-red-400 hover:text-red-600"
            >
              <CloseIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};