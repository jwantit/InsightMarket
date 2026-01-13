import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Package, Calendar, Tag, Download, FileJson, ChevronDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useBrand } from "../../hooks/brand/useBrand";
import { getPurchasedSolutionDetail } from "../../api/solutionApi";

const ReportDetailPage = () => {
  const { solutionId } = useParams();
  const { brandId } = useBrand();
  const navigate = useNavigate();
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        setLoading(true);
        const data = await getPurchasedSolutionDetail(solutionId);
        setSolution(data);
      } catch (err) {
        console.error("리포트 조회 실패:", err);
        setError(
          "리포트를 불러올 수 없습니다. 구매한 리포트인지 확인해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    if (solutionId) {
      fetchSolution();
    }
  }, [solutionId]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    if (isDropdownOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [isDropdownOpen]);

  const handleBack = () => {
    navigate(`/app/${brandId}/market/history`);
  };

  // PDF 다운로드 핸들러
  const handleDownloadPDF = () => {
    const opt = {
      margin: 10,
      filename: `Report_${solution?.title || solutionId}_${new Date().getTime()}.pdf`,
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

  // TXT 다운로드 핸들러
  const handleDownloadTXT = () => {
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
    link.download = `Report_${solution?.title || solutionId}_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // 정리
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
            <p className="text-sm text-slate-500">리포트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
              <FileText size={32} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-2">
                오류 발생
              </h2>
              <p className="text-sm text-slate-600 mb-6">{error}</p>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
              >
                <ArrowLeft size={18} />
                구매 내역으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!solution) {
    return null;
  }

  // 리포트 내용을 마크다운 형식으로 파싱하여 표시
  const formatReportContent = (content) => {
    if (!content) return "";

    // 마크다운 코드 블록 제거 (```markdown, ```json 등)
    // 먼저 코드 블록 전체를 제거 (언어 지정 포함)
    let formatted = content
      .replace(/```[a-zA-Z]*\n[\s\S]*?```/g, "") // 코드 블록 전체 제거 (언어 지정 포함)
      .replace(/```\n[\s\S]*?```/g, "") // 코드 블록 전체 제거 (언어 없음)
      .replace(/```[a-zA-Z]*/g, "") // 남은 코드 블록 시작 제거
      .replace(/```/g, "") // 남은 코드 블록 끝 제거
      // 마크다운 헤더 (#, ##, ###) 처리
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-xl font-bold mt-6 mb-3 text-slate-900">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-2xl font-bold mt-8 mb-4 text-slate-900">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-3xl font-bold mt-10 mb-6 text-slate-900">$1</h1>'
      )
      // 리스트 항목 처리
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 text-slate-700">$1</li>')
      // 볼드 처리
      .replace(
        /\*\*(.*?)\*\*/gim,
        '<strong class="font-bold text-slate-900">$1</strong>'
      )
      // 줄바꿈 처리
      .replace(/\n/g, "<br>");

    return formatted;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                {solution.title}
              </h1>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200 shrink-0"
            >
              <ArrowLeft size={18} />
              목록으로
            </button>
          </div>

          {/* 메타 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  프로젝트
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {solution.projectname}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Tag size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  전략
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {solution.strategytitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  생성일
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {solution.createdAt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 리포트 내용 */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden relative">
        {/* EXPORT 버튼 - 우상단 고정 */}
        <div className="absolute top-6 right-6 z-10" ref={dropdownRef}>
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
        <div className="p-8 lg:p-10">
          <div
            id="pdf-report-content"
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: formatReportContent(solution.description),
            }}
            style={{
              lineHeight: "1.8",
              color: "#1e293b",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
