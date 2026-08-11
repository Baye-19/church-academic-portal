import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Mark, SubmissionReview } from '../types';
import { CheckSquare, CheckCircle, XCircle, Eye, AlertCircle, MessageSquare } from 'lucide-react';

export const ReviewQueueView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [submissions, setSubmissions] = useState<SubmissionReview[]>([]);
  const [selectedSub, setSelectedSub] = useState<SubmissionReview | null>(null);
  const [previewMarks, setPreviewMarks] = useState<Mark[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    api.getSubmissions().then((res) => {
      if (res.success) setSubmissions(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePreviewMarks = async (sub: SubmissionReview) => {
    setSelectedSub(sub);
    const res = await api.getMarks(sub.courseId);
    if (res.success) setPreviewMarks(res.data);
  };

  const handleApprove = async (sub: SubmissionReview) => {
    const res = await api.approveSubmission(sub.id, user?.id, user?.name);
    if (res.success) {
      setSelectedSub(null);
      loadData();
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !rejectReason.trim()) return;

    const res = await api.rejectSubmission(selectedSub.id, rejectReason, user?.id, user?.name);
    if (res.success) {
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedSub(null);
      loadData();
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#4A2715]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5A623]" />
            <span>{t('reviewQueueTitle')}</span>
          </h2>
          <p className="text-xs text-[#CBB39C] mt-1">
            Review submitted student mark lists, evaluate statistical distributions, approve, or request revisions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[#CBB39C]">Loading submissions queue...</div>
      ) : submissions.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-[#27140B] border border-[#522B17] rounded-2xl shadow-xl text-[#CBB39C]">
          <CheckCircle className="w-12 h-12 text-[#F5A623] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Pending Submissions</h3>
          <p className="text-xs text-[#CBB39C] mt-1">
            All submitted course marks have been reviewed and processed!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 sm:p-5 bg-[#27140B] border border-[#522B17] hover:border-[#6E3B1F] rounded-2xl shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-4 transition"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-bold text-sm sm:text-base text-[#F5A623]">{sub.courseCode}</span>
                  <span className="font-semibold text-white text-xs sm:text-sm">{sub.courseTitle}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    sub.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                    sub.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {sub.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>Submitted by: <strong className="text-slate-200">{sub.teacherName}</strong></span>
                  <span>Students: <strong className="text-slate-200">{sub.studentCount}</strong></span>
                  <span>Date: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                </div>

                {sub.rejectionReason && (
                  <p className="text-xs text-rose-400 italic mt-1">Rejection Reason: "{sub.rejectionReason}"</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePreviewMarks(sub)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Inspect Marks</span>
                </button>

                {sub.status !== 'APPROVED' && (
                  <>
                    <button
                      onClick={() => handleApprove(sub)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('approveMarks')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{t('rejectMarks')}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Marks Preview Modal */}
      {selectedSub && !showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-850 border border-slate-700 w-full max-w-3xl rounded-2xl p-6 shadow-2xl text-white space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <h3 className="font-bold text-base text-emerald-400">
                Mark List Preview — {selectedSub.courseCode} ({selectedSub.courseTitle})
              </h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-800 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3 text-center">Assignment</th>
                    <th className="p-3 text-center">Quiz</th>
                    <th className="p-3 text-center">Midterm</th>
                    <th className="p-3 text-center">Final</th>
                    <th className="p-3 text-center font-bold text-emerald-400">Total</th>
                    <th className="p-3 text-center font-bold text-emerald-400">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {previewMarks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-emerald-400">{m.studentCode}</td>
                      <td className="p-3 font-semibold text-slate-200">{m.studentName}</td>
                      <td className="p-3 text-center">{m.assignment}</td>
                      <td className="p-3 text-center">{m.quiz}</td>
                      <td className="p-3 text-center">{m.midterm}</td>
                      <td className="p-3 text-center">{m.final}</td>
                      <td className="p-3 text-center font-bold text-slate-100">{m.total}</td>
                      <td className="p-3 text-center font-bold">{m.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 text-xs"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Comment Modal */}
      {showRejectModal && selectedSub && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-850 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span>{t('rejectMarks')}</span>
            </h3>

            <p className="text-xs text-slate-300">
              State clearly why these marks are being sent back to <strong className="text-white">{selectedSub.teacherName}</strong> for correction.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{t('rejectionReason')}</label>
                <textarea
                  required
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('enterReasonPlaceholder')}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-lg shadow-rose-950/40"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
