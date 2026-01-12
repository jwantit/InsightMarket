// src/components/ai/SolutionDetailModal.jsx
import React, { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { X, Download, FileText, FileJson, ChevronDown } from "lucide-react";

const SolutionDetailModal = ({ isOpen, onClose, solution }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    if (isDropdownOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [isDropdownOpen]);

  const handleDownloadPDF = () => {
    const opt = {
      margin: 10,
      filename: `Startup_Report_${new Date().getTime()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf()
      .set(opt)
      .from(document.getElementById("pdf-report-content"))
      .save();
    setIsDropdownOpen(false);
  };

  const handleDownloadTXT = () => {
    // 리포트 내용에서 텍스트 추출
    const contentElement = document.getElementById("pdf-report-content");
    if (!contentElement) return;
    
    // HTML 태그 제거하고 순수 텍스트만 추출
    const textContent = contentElement.innerText || contentElement.textContent;
    
    // Blob 생성
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    
    // 다운로드 링크 생성 및 클릭
    const link = document.createElement("a");
    link.href = url;
    link.download = `Startup_Report_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // 정리
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in zoom-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* 모달 상단 헤더 */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              상세 창업 리포트
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* 세련된 다운로드 드롭다운 */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black transition-all"
              >
                <Download size={14} /> EXPORT <ChevronDown size={12} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full px-4 py-3 text-left text-[11px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50"
                  >
                    <FileText size={14} className="text-rose-500" /> PDF로 저장
                  </button>
                  <button
                    onClick={handleDownloadTXT}
                    className="w-full px-4 py-3 text-left text-[11px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileJson size={14} className="text-blue-500" /> TXT로 저장
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 리포트 내용 영역 */}
        <div className="px-10 py-10 overflow-y-auto flex-1 bg-slate-50/30">
          <div
            id="pdf-report-content"
            className="max-w-3xl mx-auto bg-white p-12 rounded-[2rem] shadow-sm border border-slate-100 prose prose-slate prose-sm lg:prose-base"
          >
            <div
              className="text-slate-700 leading-relaxed space-y-6 
                           [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:border-b-2 [&_h2]:border-blue-600 [&_h2]:pb-2 [&_h2]:mb-8
                           [&_h3]:text-lg [&_h3]:font-black [&_h3]:text-blue-600 [&_h3]:mt-10
                           [&_ul]:list-none [&_ul]:pl-0 [&_li]:mb-4 [&_li]:p-4 [&_li]:bg-slate-50 [&_li]:rounded-2xl [&_li]:border [&_li]:border-slate-100
                           [&_strong]:text-slate-900 [&_strong]:font-black"
              dangerouslySetInnerHTML={{ __html: solution }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetailModal;
