import React, { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";

const SolutionDetailModal = ({ isOpen, onClose, solution }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // PDF 다운로드 함수
  const handleDownloadPDF = () => {
    if (!solution) return;

    const element = document.createElement("div");
    element.innerHTML = solution;
    element.className = "pdf-content p-8";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.fontSize = "12pt";
    element.style.lineHeight = "1.6";
    element.style.color = "#333";

    // PDF 옵션 설정
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `상세_창업_리포트_${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
    setIsDropdownOpen(false);
  };

  // TXT 다운로드 함수
  const handleDownloadTXT = () => {
    if (!solution) return;

    // HTML에서 텍스트만 추출
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = solution;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Blob 생성 및 다운로드
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `상세_창업_리포트_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between bg-white flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">상세 창업 리포트</h2>
          <div className="flex items-center gap-3">
            {/* 다운로드 드롭다운 */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
                title="다운로드"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                다운로드
                <svg
                  className={`w-3 h-3 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors first:rounded-t-lg"
                  >
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    PDF 다운로드
                  </button>
                  <button
                    onClick={handleDownloadTXT}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors last:rounded-b-lg border-t border-gray-100"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    TXT 다운로드
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center"
              aria-label="close modal"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-6 py-6 overflow-y-auto flex-1">
          {solution ? (
            <div
              className="max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:leading-tight
                          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:leading-tight
                          [&_p]:text-sm [&_p]:text-gray-700 [&_p]:mb-3 [&_p]:leading-relaxed
                          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3 [&_ul]:space-y-1
                          [&_li]:text-sm [&_li]:text-gray-700 [&_li]:mb-1 [&_li]:leading-relaxed
                          [&_strong]:font-bold [&_strong]:text-gray-900"
              dangerouslySetInnerHTML={{ __html: solution }}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              상세 리포트 내용이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionDetailModal;

