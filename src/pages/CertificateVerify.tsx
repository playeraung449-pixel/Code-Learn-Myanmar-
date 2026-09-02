import React, { useState, useEffect } from "react";
import { 
  Award, 
  Search, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Printer, 
  Share2, 
  Copy, 
  Facebook, 
  Linkedin, 
  Twitter, 
  Trash2, 
  Edit, 
  Save, 
  ChevronRight,
  ExternalLink,
  Lock,
  Globe,
  Settings,
  RefreshCw,
  UserCheck
} from "lucide-react";
import { getCertificate, saveCertificate, deleteCertificate, getAllCertificates } from "../lib/db";
import { UserProfile } from "../types";

interface CertificateVerifyProps {
  user?: UserProfile;
}

export default function CertificateVerify({ user }: CertificateVerifyProps) {
  const [certIdInput, setCertIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Admin / Teacher Management State
  const [allCerts, setAllCerts] = useState<any[]>([]);
  const [loadingAllCerts, setLoadingAllCerts] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    issuedTo: "",
    courseName: "",
    certificateLevel: "",
    roadmapName: "",
    isPublic: true
  });
  const [adminMessage, setAdminMessage] = useState("");

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  // Check URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("certId") || params.get("id");
    if (idFromUrl) {
      setCertIdInput(idFromUrl);
      handleVerify(idFromUrl);
    }
  }, []);

  // Fetch all certificates if admin/teacher
  useEffect(() => {
    if (isTeacherOrAdmin) {
      fetchAdminCertificates();
    }
  }, [user]);

  const fetchAdminCertificates = async () => {
    setLoadingAllCerts(true);
    try {
      const data = await getAllCertificates();
      setAllCerts(data || []);
    } catch (error) {
      console.error("Error fetching all certificates for admin:", error);
    } finally {
      setLoadingAllCerts(false);
    }
  };

  const handleVerify = async (idToVerify?: string) => {
    const id = idToVerify || certIdInput.trim();
    if (!id) return;

    setLoading(true);
    setSearched(true);
    setCertificate(null);
    setIsEditing(false);

    try {
      const cert = await getCertificate(id);
      if (cert) {
        setCertificate(cert);
        setEditForm({
          issuedTo: cert.issuedTo || "",
          courseName: cert.courseName || cert.courseTitle || "",
          certificateLevel: cert.certificateLevel || "Foundation",
          roadmapName: cert.roadmapName || "Full Stack Developer",
          isPublic: cert.isPublic !== false
        });
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!certificate) return;
    setLoading(true);
    setAdminMessage("");
    try {
      const updatedCert = {
        ...certificate,
        issuedTo: editForm.issuedTo,
        courseName: editForm.courseName,
        courseTitle: editForm.courseName,
        certificateLevel: editForm.certificateLevel,
        roadmapName: editForm.roadmapName,
        isPublic: editForm.isPublic
      };

      await saveCertificate(updatedCert);
      setCertificate(updatedCert);
      setIsEditing(false);
      setAdminMessage("လက်မှတ်အချက်အလက်များကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။ (Certificate updated successfully!)");
      fetchAdminCertificates();
    } catch (error) {
      console.error("Error saving certificate edit:", error);
      setAdminMessage("ပြင်ဆင်မှု မအောင်မြင်ပါ ခင်ဗျာ။");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (certId: string) => {
    if (!window.confirm("ဤလက်မှတ်အား စာရင်းမှ ဖျက်သိမ်း/ရုပ်သိမ်းရန် သေချာပါသလားခင်ဗျာ။ (Are you sure you want to revoke/delete this certificate?)")) {
      return;
    }
    setLoading(true);
    setAdminMessage("");
    try {
      await deleteCertificate(certId);
      if (certificate?.id === certId) {
        setCertificate(null);
        setSearched(false);
      }
      setAdminMessage("လက်မှတ်ကို အောင်မြင်စွာ ရုပ်သိမ်းပြီးပါပြီ။ (Certificate revoked successfully!)");
      fetchAdminCertificates();
    } catch (error) {
      console.error("Error deleting certificate:", error);
      setAdminMessage("ရုပ်သိမ်းမှု မအောင်မြင်ပါ ခင်ဗျာ။");
    } finally {
      setLoading(false);
    }
  };

  const copyVerifyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?certId=${certificate?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-certificate-verify");
    if (!printContent) return;
    const windowUrl = window.location.href;
    const uniqueWindow = window.open("", "_blank", "width=900,height=650");
    if (!uniqueWindow) return;
    uniqueWindow.document.write(`
      <html>
        <head>
          <title>Code Learn Myanmar Certificate - ${certificate?.issuedTo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              padding: 20px; 
              background-color: #ffffff; 
              -webkit-print-color-adjust: exact;
            }
            .cert-container {
              border: 12px solid #D4AF37;
              border-radius: 12px;
              padding: 50px 80px;
              text-align: center;
              position: relative;
              max-width: 800px;
              margin: 0 auto;
              box-shadow: 0 0 15px rgba(0,0,0,0.05);
              background-color: #FAF9F6;
            }
            .ornament {
              position: absolute;
              width: 30px;
              height: 30px;
              border: 2px solid #D4AF37;
            }
            .top-left { top: 10px; left: 10px; border-bottom: none; border-right: none; }
            .top-right { top: 10px; right: 10px; border-bottom: none; border-left: none; }
            .bottom-left { bottom: 10px; left: 10px; border-top: none; border-right: none; }
            .bottom-right { bottom: 10px; right: 10px; border-top: none; border-left: none; }
            .badge-logo {
              width: 70px;
              height: 70px;
              border-radius: 50%;
              background-color: #2563eb;
              color: white;
              font-weight: 900;
              font-size: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px auto;
            }
            h1 { color: #D4AF37; font-size: 28px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 10px 0; }
            .council { font-size: 11px; color: #64748b; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px; }
            .intro { font-style: italic; font-size: 13px; color: #475569; margin-bottom: 15px; }
            .name { font-size: 32px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #cbd5e1; display: inline-block; padding-bottom: 8px; margin-bottom: 25px; }
            .course-label { font-size: 13px; color: #475569; margin-bottom: 5px; }
            .course-title { font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 40px; }
            .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px; }
            .meta-info { text-align: left; font-size: 11px; color: #64748b; line-height: 1.6; }
            .meta-info span { font-weight: bold; color: #1e3a8a; }
            .verification-badge { background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 18px; border-radius: 8px; text-align: left; display: flex; align-items: center; }
            .verification-badge-text { font-size: 10px; font-weight: bold; color: #1e40af; margin-bottom: 2px; }
            .verification-badge-sub { font-size: 9px; color: #64748b; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="cert-container">
            <div class="ornament top-left"></div>
            <div class="ornament top-right"></div>
            <div class="ornament bottom-left"></div>
            <div class="ornament bottom-right"></div>
            <div class="badge-logo">C</div>
            <h1>Certificate of Completion</h1>
            <div class="council">Code Learn Myanmar Education Council</div>
            <div class="intro">This certifies that the recipient has successfully met all curriculum requirements of:</div>
            <div class="name">${certificate?.issuedTo}</div>
            <div class="course-label">For completing the professional course:</div>
            <div class="course-title">${certificate?.courseName || certificate?.courseTitle}</div>
            <div class="footer">
              <div class="meta-info">
                <div>Certificate ID: <span>${certificate?.id}</span></div>
                <div>Verification ID: <span>${certificate?.verificationId}</span></div>
                <div>Issue Date: <span>${certificate?.issuedDate}</span></div>
                <div>Level: <span>${certificate?.certificateLevel || 'Foundation'}</span></div>
              </div>
              <div class="verification-badge">
                <div style="margin-left: 8px;">
                  <div class="verification-badge-text">✓ VERIFIED SECURE</div>
                  <div class="verification-badge-sub">Code Learn Myanmar Official System</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    uniqueWindow.document.close();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* 1. Header Banner */}
      <div className="text-center space-y-3 py-6 relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl">
        <div className="absolute -left-20 -top-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 font-mono font-bold text-xs px-4 py-1.5 rounded-full border border-blue-500/20">
          <ShieldCheck className="w-4 h-4 animate-pulse" />
          <span>OFFICIAL DIGITAL CREDENTIAL SERVICE</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
          အောင်မြင်မှုလက်မှတ် စစ်ဆေးရေးဌာန
        </h2>
        <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
          Code Learn Myanmar မှ ထုတ်ပေးထားသော မည်သည့်အောင်မြင်မှုလက်မှတ် (Official Certificates) ကိုမဆို Certificate ID သို့မဟုတ် Verification Code ထည့်သွင်း၍ လုံခြုံစိတ်ချစွာ စစ်ဆေးအတည်ပြုနိုင်ပါသည်ခင်ဗျာ။
        </p>
      </div>

      {/* 2. Interactive Search Tool */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white text-left font-display">
            Certificate ID သို့မဟုတ် Verification Code ဖြင့်ရှာဖွေရန် -
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text"
                placeholder="ဥပမာ- cert-react-student-uid သို့မဟုတ် CLM-..."
                value={certIdInput}
                onChange={(e) => setCertIdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerify();
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={loading || !certIdInput.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>စစ်ဆေးနေသည်...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>အတည်ပြုမည် (Verify)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Status Display & High Fidelity Certificate Rendering */}
      {searched && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Certificate Detail Panel (Left) */}
          <div className="lg:col-span-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 text-left shadow-lg">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white font-display">Credential Verification</h3>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>

            {certificate ? (
              <div className="space-y-5 text-xs">
                {/* Status Indicator */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle className="w-5 h-5" />
                    <span>Active & Verified (တရားဝင် လက်မှတ်)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                    ဤအောင်မြင်မှုလက်မှတ်သည် Code Learn Myanmar Database စာရင်းတွင် တရားဝင်မှတ်ပုံတင်ထားပြီး အတည်ပြုချက် ရရှိပြီးဖြစ်ပါသည်။
                  </p>
                </div>

                {/* Details list */}
                <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Recipient Student</span>
                    <span className="text-sm font-black text-slate-800 dark:text-white mt-0.5 block">{certificate.issuedTo}</span>
                  </div>
                  
                  <div className="pt-3">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Course Title</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5 block">{certificate.courseName || certificate.courseTitle}</span>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Roadmap Career Pathway</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 block">{certificate.roadmapName || "Full Stack Developer"}</span>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Achievement Level</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5 block bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded-full inline-block font-mono">{certificate.certificateLevel || "Foundation"}</span>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Unique Certificate ID</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 block font-mono select-all truncate bg-slate-50 dark:bg-slate-900/40 p-2 rounded border border-slate-100 dark:border-slate-800/80">{certificate.id}</span>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Verification Code</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 block font-mono text-blue-500">{certificate.verificationId}</span>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Completion Date</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 block font-mono">{certificate.issuedDate}</span>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-mono">Public Shareable</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">ကျောင်းသားကိုယ်ရေးစာမျက်နှာ</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {certificate.isPublic !== false ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full">
                          <Globe className="w-3 h-3" />
                          <span>Public</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" />
                          <span>Private</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Share Controls */}
                <div className="pt-3 border-t border-slate-150 dark:border-slate-800 space-y-3">
                  <span className="text-[10px] text-slate-400 uppercase block font-mono">Professional Social Sharing</span>
                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      onClick={copyVerifyLink}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all flex items-center justify-center cursor-pointer relative"
                      title="Copy Verification Link"
                    >
                      <Copy className="w-4 h-4" />
                      {copied && <span className="absolute -top-8 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow">Copied</span>}
                    </button>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?certId=${certificate.id}`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0077B5] text-slate-600 dark:text-slate-400 hover:text-[#0077B5] transition-all flex items-center justify-center cursor-pointer"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?certId=${certificate.id}`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#1877F2] text-slate-600 dark:text-slate-400 hover:text-[#1877F2] transition-all flex items-center justify-center cursor-pointer"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?certId=${certificate.id}`)}&text=${encodeURIComponent(`Verified Certificate: ${certificate.courseName} by Code Learn Myanmar!`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#1DA1F2] text-slate-600 dark:text-slate-400 hover:text-[#1DA1F2] transition-all flex items-center justify-center cursor-pointer"
                      title="Share on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Invalid/NotFound State */
              <div className="space-y-4 text-center py-6 text-xs font-sans">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 space-y-2">
                  <XCircle className="w-10 h-10 mx-auto" />
                  <p className="font-bold">ခေါင်းစဉ်မတွေ့ပါ (Certificate Not Found)</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    ထည့်သွင်းထားသော ID: "{certIdInput}" သည် ကျွန်ုပ်တို့၏ သင်တန်းစာရင်းတွင် မှတ်ပုံတင်ထားခြင်းမရှိပါ သို့မဟုတ် ရုပ်သိမ်းခြင်းခံထားရပါသည်ခင်ဗျာ။
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 text-left leading-relaxed">
                  <p className="font-bold mb-1">အကြံပြုချက်များ -</p>
                  <ul className="list-disc list-inside space-y-1.5 text-[10px]">
                    <li>စာလုံးပေါင်း မှားယွင်းမှုရှိမရှိ ပြန်လည်စစ်ဆေးပါ။</li>
                    <li>အစအဆုံး spaces မပါအောင် ဂရုစိုက်ပါ။</li>
                    <li>တရားမဝင် သို့မဟုတ် သံသယဖြစ်ဖွယ် လက်မှတ်ဖြစ်ပါက စနစ်မှ အလိုအလျောက် ပယ်ဖျက်ထားခြင်း ဖြစ်နိုင်ပါသည်။</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Certificate Render Stage (Right/Center - spans 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {certificate ? (
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg text-left space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white font-display">Certificate Dynamic Preview</h3>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>ပုံနှိပ်ထုတ်ယူရန် (Print / PDF)</span>
                  </button>
                </div>

                {/* Printable Frame wrapper */}
                <div 
                  id="printable-certificate-verify" 
                  className="bg-[#FAF9F6] text-[#1E293B] border-[12px] border-[#D4AF37] rounded-2xl p-6 md:p-12 text-center space-y-8 relative shadow-inner select-none transition-all duration-200"
                >
                  {/* Corner Ornaments */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37]" />
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37]" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37]" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37]" />

                  {/* Top Seal Badge */}
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
                      C
                    </div>
                    <h2 className="text-[#D4AF37] font-display font-extrabold text-xl md:text-2xl uppercase tracking-widest text-center">
                      Certificate of Completion
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase text-center">
                      Code Learn Myanmar Education Council
                    </p>
                  </div>

                  {/* Recipient info */}
                  <div className="space-y-2 py-2 text-center">
                    <p className="text-xs text-slate-500 italic text-center font-sans">ဤလက်မှတ်သည် အောက်ဖော်ပြပါပုဂ္ဂိုလ်အား သက်ဆိုင်ရာသင်တန်းပြီးဆုံးသည့်အတွက် ဂုဏ်ပြုချီးမြှင့်အပ်ပါသည်။</p>
                    <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-wide underline underline-offset-8 text-center uppercase">
                      {certificate.issuedTo}
                    </h3>
                  </div>

                  {/* Course Completed detail */}
                  <div className="space-y-1 py-1 text-center">
                    <p className="text-xs text-slate-500 text-center font-sans">အောင်မြင်စွာ စံချိန်တင်ပြီးမြောက်ခဲ့သည့် သင်တန်းလမ်းညွှန် -</p>
                    <h4 className="text-sm md:text-base font-extrabold text-slate-900 text-center font-display uppercase">
                      {certificate.courseName || certificate.courseTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400 tracking-wider font-mono uppercase">{certificate.roadmapName || "Full Stack Developer Pathway"}</p>
                  </div>

                  {/* Footer Seal Verification */}
                  <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-200/80 pt-5 mt-6 gap-4 text-xs">
                    <div className="space-y-0.5 text-slate-500 text-left font-mono text-[10px]">
                      <p>CERTIFICATE ID: <span className="font-bold text-slate-800">{certificate.id}</span></p>
                      <p>VERIFICATION ID: <span className="font-bold text-slate-800">{certificate.verificationId}</span></p>
                      <p>ISSUE DATE: <span className="font-bold text-slate-800">{certificate.issuedDate}</span></p>
                      <p>LEVEL: <span className="font-bold text-slate-800">{certificate.certificateLevel || "Foundation"}</span></p>
                    </div>

                    <div className="flex items-center space-x-2.5 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                      <ShieldCheck className="w-8 h-8 text-blue-600" />
                      <div className="text-left font-sans">
                        <p className="font-bold text-blue-900 text-[9px] uppercase tracking-wide">VERIFIED EDUCATIONAL DECREE</p>
                        <p className="text-[8px] text-slate-500">Code Learn Myanmar Registrar System</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code / Link section */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs leading-relaxed font-sans">
                  <div className="space-y-1 text-left flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white font-display">ရရှိသူကိုယ်တိုင် အသုံးပြုနိုင်ရန် (For Recipient)</h4>
                    <p className="text-slate-500 text-[11px]">
                      ဤလက်မှတ်၏ Verification link သည် တရားဝင် public link ဖြစ်သောကြောင့် LinkedIn Profile, CV Form သို့မဟုတ် အလုပ်လျှောက်လွှာများတွင် တိုက်ရိုက်ထည့်သွင်း ကိုးကားဖော်ပြနိုင်ပါသည် ခင်ဗျာ။
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button 
                      onClick={copyVerifyLink}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer transition-all text-[11px]"
                    >
                      {copied ? "Copied ✓" : "Copy Link 🔗"}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* Informative Banner when not loaded */
              <div className="bg-[#1E293B]/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4 shadow-inner">
                <Award className="w-16 h-16 text-slate-700 mx-auto animate-pulse" />
                <p className="font-display font-medium text-sm text-slate-300">
                  စစ်ဆေးလိုသည့် လက်မှတ်ကုဒ် (Certificate ID) ကို ထည့်သွင်းရှာဖွေပါဦးဗျာ။
                </p>
                <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
                  ကျောင်းသားများ သင်တန်းပြီးဆုံးသည့်အခါ ထုတ်ပေးအပ်နှင်းသော လက်မှတ်ပေါ်ရှိ 'အောင်မြင်မှုကုဒ်' သို့မဟုတ် Certificate ID ကို အထက်ပါ ရှာဖွေရေးဘောက်စ်တွင် ထည့်သွင်းစစ်ဆေးနိုင်သည်။
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. ADMIN & TEACHER MANAGEMENT PANEL (Only rendered for teachers and admins) */}
      {isTeacherOrAdmin && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 text-left space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="font-display font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500 animate-spin" />
                <span>လက်မှတ် စီမံခန့်ခွဲရေးကွန်ဆိုး (Admin Certificate Manager)</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                ဆရာ/ဆရာမများနှင့် စနစ်စီမံခန့်ခွဲသူများသာ အသုံးပြုနိုင်သော လက်မှတ် ပြင်ဆင်ခြင်း၊ ဖျက်သိမ်းခြင်းနှင့် တည်းဖြတ်ခြင်းဆိုင်ရာ လုပ်ဆောင်ချက်များ။
              </p>
            </div>
            
            <button
              onClick={fetchAdminCertificates}
              disabled={loadingAllCerts}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] rounded-lg font-bold flex items-center space-x-1.5 cursor-pointer self-start"
            >
              <RefreshCw className={`w-3 h-3 ${loadingAllCerts ? "animate-spin" : ""}`} />
              <span>Refresh List</span>
            </button>
          </div>

          {adminMessage && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/60 rounded-2xl text-xs text-blue-600 dark:text-blue-400 font-bold font-sans">
              {adminMessage}
            </div>
          )}

          {/* Correct/Edit Form (Shown when editing selected certificate) */}
          {isEditing && certificate && (
            <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-scale-up text-xs font-sans">
              <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2 font-display">
                <Edit className="w-4 h-4 text-blue-500" />
                <span>လက်မှတ် အချက်အလက်များ တည်းဖြတ်ရန် (Edit Certificate Details)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium font-sans">ကျောင်းသားအမည် (Student Name)</label>
                  <input 
                    type="text" 
                    value={editForm.issuedTo}
                    onChange={(e) => setEditForm({...editForm, issuedTo: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium font-sans">သင်တန်းခေါင်းစဉ် (Course Title)</label>
                  <input 
                    type="text" 
                    value={editForm.courseName}
                    onChange={(e) => setEditForm({...editForm, courseName: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium font-sans">အသိအမှတ်ပြုအဆင့် (Difficulty Level)</label>
                  <select 
                    value={editForm.certificateLevel}
                    onChange={(e) => setEditForm({...editForm, certificateLevel: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold"
                  >
                    <option value="Beginner">Beginner Level</option>
                    <option value="Intermediate">Intermediate Level</option>
                    <option value="Advanced">Advanced Level</option>
                    <option value="Professional">Professional Level</option>
                    <option value="Foundation">Foundation Level</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium font-sans">အသက်မွေးဝမ်းကျောင်း ကဏ္ဍ (Roadmap Name)</label>
                  <input 
                    type="text" 
                    value={editForm.roadmapName}
                    onChange={(e) => setEditForm({...editForm, roadmapName: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1 flex items-center space-x-2 pt-4">
                  <input 
                    type="checkbox"
                    id="isPublicEdit"
                    checked={editForm.isPublic}
                    onChange={(e) => setEditForm({...editForm, isPublic: e.target.checked})}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="isPublicEdit" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer select-none font-sans">
                    Publicly Shareable (ကျောင်းသားပရိုဖိုင်းတွင် အားလုံးမြင်နိုင်ရန်)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:opacity-95 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  မလုပ်တော့ပါ (Cancel)
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>သိမ်းဆည်းမည် (Save Changes)</span>
                </button>
              </div>
            </div>
          )}

          {/* List of Issued Certificates */}
          <div className="space-y-3 font-sans">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">Issued Digital Certificates ({allCerts.length})</h4>
            
            {loadingAllCerts ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                <span>လတ်တလော ထုတ်ပေးထားသော ဘွဲ့လက်မှတ်များ ဖတ်ရှုနေသည်...</span>
              </div>
            ) : allCerts.length > 0 ? (
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-semibold font-mono text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3">Issued Date</th>
                        <th className="px-4 py-3">Level / Roadmap</th>
                        <th className="px-4 py-3">Cert ID</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300">
                      {allCerts.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 dark:text-white">{cert.issuedTo}</div>
                            <div className="text-[10px] text-slate-400 font-mono">UID: {cert.uid?.slice(0, 8)}...</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold">{cert.courseName || cert.courseTitle}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">{cert.issuedDate}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold font-mono text-[9px] mr-1.5">{cert.certificateLevel || "Foundation"}</span>
                            <span className="text-[10px] text-slate-400">{cert.roadmapName || "Full Stack"}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500 text-[10px] select-all truncate max-w-[120px]" title={cert.id}>{cert.id}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setCertificate(cert);
                                  setCertIdInput(cert.id);
                                  setSearched(true);
                                  setEditForm({
                                    issuedTo: cert.issuedTo || "",
                                    courseName: cert.courseName || cert.courseTitle || "",
                                    certificateLevel: cert.certificateLevel || "Foundation",
                                    roadmapName: cert.roadmapName || "Full Stack Developer",
                                    isPublic: cert.isPublic !== false
                                  });
                                  window.scrollTo({ top: 300, behavior: 'smooth' });
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-blue-500/10 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all cursor-pointer"
                                title="View & Verify"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setCertificate(cert);
                                  setEditForm({
                                    issuedTo: cert.issuedTo || "",
                                    courseName: cert.courseName || cert.courseTitle || "",
                                    certificateLevel: cert.certificateLevel || "Foundation",
                                    roadmapName: cert.roadmapName || "Full Stack Developer",
                                    isPublic: cert.isPublic !== false
                                  });
                                  setIsEditing(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-yellow-500/10 text-slate-600 dark:text-slate-400 hover:text-yellow-500 transition-all cursor-pointer"
                                title="Correct Info"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRevoke(cert.id)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-red-500/10 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                title="Revoke Certificate"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-900/10 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                မထုတ်ပေးရသေးပါ (No issued certificates registered in database yet)
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
