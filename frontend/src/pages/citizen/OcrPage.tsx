import React, { useState, useEffect } from 'react';
import { Upload, FileCheck, AlertTriangle, FileText, CheckCircle2, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Badge } from '../../components/common/Badge';
import { landService } from '../../services/landService';
import { ocrService } from '../../services/ocrService';
import type { LandRecord, VerificationResult } from '../../types';

export const CitizenOcrPage: React.FC = () => {
  const navigate = useNavigate();
  const [lands, setLands] = useState<LandRecord[]>([]);
  const [selectedLandId, setSelectedLandId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'select' | 'upload' | 'processing' | 'result'>('select');
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [progressStatus, setProgressStatus] = useState<string>('');

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const res = await landService.getMyLandRecords();
        if ((res.success || res.status === 'success') && res.data) {
          setLands(res.data);
        }
      } catch (err: any) {
        console.error('Failed to load land records:', err);
      }
    };
    fetchLands();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartOcr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedLandId) return;

    setStep('processing');
    setProgressStatus('Uploading document...');
    setNotice(null);
    setErrorMsg(null);

    try {
      // 1. Upload file to Supabase Storage and database
      const uploadRes = await ocrService.uploadLandDocument(selectedLandId, file);
      if (uploadRes.status === 'error' || !uploadRes.data) {
        throw new Error(uploadRes.message || 'File upload failed');
      }

      const documentId = uploadRes.data.id;

      // 2. Reading
      setProgressStatus('Reading document...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // 3. Extracting
      setProgressStatus('Extracting text...');
      const extractRes = await ocrService.startOcrExtraction(documentId);
      if (!extractRes.success || !extractRes.data) {
        throw new Error(extractRes.error || 'OCR extraction failed');
      }

      // 4. Analyzing
      setProgressStatus('Analyzing land-record fields...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 5. Comparing
      setProgressStatus('Comparing with official record...');
      const verifyRes = await ocrService.getVerificationResults(documentId);
      if (!verifyRes.success || !verifyRes.data) {
        throw new Error(verifyRes.error || 'Verification comparison failed');
      }

      // 6. Complete
      setProgressStatus('Verification complete');
      await new Promise(resolve => setTimeout(resolve, 500));

      setVerificationResult(verifyRes.data);
      setStep('result');

      if (verifyRes.data.overallStatus === 'MISMATCH') {
        setNotice(`Verification completed with mismatches: ${verifyRes.data.mismatchCount} field values differ from official registry records.`);
      } else if (verifyRes.data.overallStatus === 'MATCH') {
        setNotice('Verification completed successfully! All deed document fields match official registry values.');
      } else {
        setNotice('OCR processing completed, but verification could not be fully run.');
      }
    } catch (err: any) {
      console.error('OCR verification error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during OCR verification.');
      setStep('upload');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#034E4E] tracking-tight">Document OCR Verification</h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Upload physical deed copies (PDF, JPG, PNG) to verify extracted text against official digital registry records.
        </p>
      </div>

      <ErrorAlert
        title="OCR Service Status"
        message="Optical Character Recognition (Tesseract engine) and comparison matching will run dynamically when you process documents."
      />

      {errorMsg && (
        <ErrorAlert
          title="OCR Execution Failed"
          message={errorMsg}
        />
      )}

      {/* Workflow Step Progress */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 tracia-card p-2 text-center text-xs font-bold">
        <div className={`p-2 rounded-md ${step === 'select' ? 'bg-[#034E4E] text-white' : 'bg-[#F4F8F7] text-[#667085]'}`}>
          1. Select Title
        </div>
        <div className={`p-2 rounded-md ${step === 'upload' ? 'bg-[#034E4E] text-white' : 'bg-[#F4F8F7] text-[#667085]'}`}>
          2. Upload File
        </div>
        <div className={`p-2 rounded-md ${step === 'processing' ? 'bg-[#034E4E] text-white' : 'bg-[#F4F8F7] text-[#667085]'}`}>
          3. Process OCR
        </div>
        <div className={`p-2 rounded-md ${step === 'result' ? 'bg-[#034E4E] text-white' : 'bg-[#F4F8F7] text-[#667085]'}`}>
          4. Review Field Match
        </div>
      </div>

      {/* Main Upload Card */}
      <div className="tracia-card p-6">
        {step === 'processing' ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <Loader2 className="w-12 h-12 text-[#034E4E] animate-spin" />
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#034E4E]">{progressStatus}</h3>
              <p className="text-xs text-[#667085]">Parsing document data. Please do not close or refresh this tab.</p>
            </div>
            
            {/* Steps visualizer */}
            <div className="w-full max-w-md space-y-3 pt-2">
              {[
                { label: 'Uploading document...', key: 'Uploading' },
                { label: 'Reading document...', key: 'Reading' },
                { label: 'Extracting text...', key: 'Extracting' },
                { label: 'Analyzing land-record fields...', key: 'Analyzing' },
                { label: 'Comparing with official record...', key: 'Comparing' },
                { label: 'Verification complete', key: 'complete' }
              ].map((s, idx) => {
                const isCurrent = progressStatus.startsWith(s.key) || (s.key === 'complete' && progressStatus === 'Verification complete');
                const isCompleted = (() => {
                  const states = ['Uploading', 'Reading', 'Extracting', 'Analyzing', 'Comparing', 'complete'];
                  const currentIdx = states.findIndex(state => progressStatus.startsWith(state));
                  const stepIdx = states.indexOf(s.key);
                  return stepIdx < currentIdx;
                })();

                return (
                  <div key={idx} className="flex items-center space-x-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                      isCompleted 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : isCurrent 
                          ? 'bg-[#034E4E] text-white animate-pulse' 
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className={`${
                      isCompleted 
                        ? 'text-emerald-700 font-medium' 
                        : isCurrent 
                          ? 'text-[#034E4E] font-bold' 
                          : 'text-[#667085]'
                    }`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleStartOcr} className="space-y-6">
            {/* Step 1: Select Own Land Record */}
            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1">
                Select Your Registered Land Title <span className="text-rose-600">*</span>
              </label>
              <p className="text-xs text-[#667085] mb-2">Choose the land property you wish to verify against your uploaded document.</p>
              <select
                value={selectedLandId}
                onChange={(e) => {
                  setSelectedLandId(e.target.value);
                  if (e.target.value) setStep('upload');
                }}
                className="w-full px-3 py-2 bg-white border border-[#D9E2E1] rounded-md text-xs sm:text-sm text-[#101828] focus:border-[#034E4E] focus:outline-none"
              >
                <option value="">-- Select Registered Property --</option>
                {lands.map((land) => (
                  <option key={land.id} value={land.id}>
                    Survey No: {land.survey_number} - {land.village}, {land.taluk} (Patta: {land.patta_number || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Upload Document */}
            {step !== 'select' && (
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  Upload Title Deed Document <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">Accepted formats: PDF, JPG, JPEG, PNG (Max 10MB).</p>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-600 transition-colors bg-slate-50">
                  <Upload className="w-8 h-8 text-blue-700 mx-auto mb-2" />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="document-file-input"
                  />
                  <label
                    htmlFor="document-file-input"
                    className="cursor-pointer text-xs font-bold text-blue-700 hover:underline"
                  >
                    Click to browse file
                  </label>
                  <span className="text-xs text-slate-500"> or drag and drop</span>
                  {file && (
                    <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-mono">
                      <FileText className="w-4 h-4" />
                      <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Action */}
            {step !== 'select' && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!file}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center space-x-2 disabled:opacity-50 transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Run Document OCR Verification</span>
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Field-by-Field Verification UI Template Structure */}
      {step === 'result' && verificationResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">OCR Field Matching Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">Field-by-field verification compared to official database records.</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
              <Badge variant={verificationResult.overallStatus === 'MATCH' ? 'success' : 'warning'}>
                {verificationResult.overallStatus === 'MATCH' ? 'Exact Match' : 'Potential Mismatch'}
              </Badge>
              {typeof verificationResult.ocr_confidence === 'number' && (
                <span className="text-xs font-semibold text-slate-600 mt-1 sm:mt-0 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  OCR Confidence: {verificationResult.ocr_confidence}%
                </span>
              )}
            </div>
          </div>

          {notice && (
            <div className={`p-3 rounded-xl text-xs border ${
              verificationResult.overallStatus === 'MATCH' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              {notice}
            </div>
          )}

          {/* Document Analysis Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#034E4E] uppercase tracking-wider">Document Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-[#F4F8F7] p-4 rounded-xl border border-[#DDE5E3]">
              {verificationResult.fields.map((f) => (
                <div key={f.field} className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-500">{f.field.replace(/_/g, ' ')}</span>
                  <span className="block text-xs font-bold text-[#034E4E]">{f.ocrValue || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Result Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-[#034E4E] uppercase tracking-wider">Verification Result</h3>
            
            <div className="space-y-3">
              {/* Matches */}
              {verificationResult.fields.filter(f => f.status === 'MATCH').length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                    <span>✓</span>
                    <span>Matching Fields</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {verificationResult.fields.filter(f => f.status === 'MATCH').map(f => (
                      <span key={f.field} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs capitalize">
                        {f.field.replace(/_/g, ' ')}: <span className="font-semibold">{f.ocrValue}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mismatches */}
              {verificationResult.fields.filter(f => f.status === 'MISMATCH').length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-rose-800 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>Potential Discrepancies</span>
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {verificationResult.fields.filter(f => f.status === 'MISMATCH').map(f => (
                      <div key={f.field} className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex justify-between items-center font-bold text-rose-950 capitalize border-b border-rose-200 pb-1.5">
                          <span>{f.field.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded font-bold">⚠ Potential discrepancy</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase font-medium">Official Record</span>
                            <span className="font-mono text-slate-800">{f.officialValue || '—'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase font-medium">Document Value</span>
                            <span className="font-mono text-rose-700 font-bold">{f.ocrValue || '—'}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-rose-800 italic font-bold">"Requires officer verification"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unavailable */}
              {verificationResult.fields.filter(f => f.status === 'NOT_AVAILABLE').length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                    <span>—</span>
                    <span>Information Not Found</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {verificationResult.fields.filter(f => f.status === 'NOT_AVAILABLE').map(f => (
                      <span key={f.field} className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded text-xs capitalize">
                        {f.field.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Trigger for Grievance */}
          {verificationResult.overallStatus === 'MISMATCH' && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900">Potential Mismatch Detected</h4>
                  <p className="text-xs text-rose-700">If extracted field values differ from official titles, you may lodge a formal grievance.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const mismatches = verificationResult.fields
                    .filter((x) => x.status === 'MISMATCH')
                    .map((x) => x.field.replace(/_/g, ' '))
                    .join(', ');
                  const desc = `OCR discrepancy detected on: ${mismatches}. Extracted document values do not align with registry.`;
                  navigate(`/citizen/grievances?land_id=${selectedLandId}&category=ocr_mismatch&description=${encodeURIComponent(desc)}`);
                }}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shrink-0 transition-colors"
              >
                Raise Grievance
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
