import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Package,
  Calendar,
  Tag,
  Download,
  FileJson,
  ChevronDown,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { useBrand } from "../../hooks/brand/useBrand";
import { getPurchasedSolutionDetail } from "../../api/solutionApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
        setError("리포트를 불러올 수 없습니다. 구매한 리포트인지 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    if (solutionId) fetchSolution();
  }, [solutionId]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
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

    html2pdf().set(opt).from(document.getElementById("pdf-report-content")).save();
    setIsDropdownOpen(false);
  };

  // TXT 다운로드 핸들러
  const handleDownloadTXT = () => {
    const contentElement = document.getElementById("pdf-report-content");
    if (!contentElement) return;

    const textContent = contentElement.innerText || contentElement.textContent;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Report_${solution?.title || solutionId}_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  // 리포트 내용을 파싱하여 섹션별 데이터 추출
  const parseReportSections = useMemo(() => {
    if (!solution || !solution.description) return null;

    const content = solution.description;

    const sections = {
      keyIssues: [],
      strategies: [],
      executiveSummary: "",
    };

    const issueKeywords = ["위험 요소", "문제점", "위험", "이슈", "문제"];
    const strategyKeywords = ["전략", "솔루션", "실행", "방안", "대응"];
    const summaryKeywords = ["요약", "종합", "경영진", "executive"];

    const lines = content.split("\n").filter((line) => line.trim());

    let currentSection = null;
    let currentItems = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (issueKeywords.some((keyword) => trimmedLine.includes(keyword))) {
        if (currentSection === "strategies" && currentItems.length > 0) {
          sections.strategies = currentItems;
        }
        currentSection = "keyIssues";
        currentItems = [];
        return;
      }

      if (strategyKeywords.some((keyword) => trimmedLine.includes(keyword))) {
        if (currentSection === "keyIssues" && currentItems.length > 0) {
          sections.keyIssues = currentItems;
        }
        currentSection = "strategies";
        currentItems = [];
        return;
      }

      if (summaryKeywords.some((keyword) => trimmedLine.includes(keyword))) {
        if (currentSection && currentItems.length > 0) {
          if (currentSection === "keyIssues") sections.keyIssues = currentItems;
          if (currentSection === "strategies") sections.strategies = currentItems;
        }
        currentSection = "summary";
        sections.executiveSummary = lines.slice(index).join(" ").substring(0, 200);
        return;
      }

      if ((currentSection === "keyIssues" || currentSection === "strategies") && trimmedLine.length > 10) {
        currentItems.push({
          title: trimmedLine.substring(0, 50),
          description: trimmedLine,
        });
      }
    });

    if (currentSection === "keyIssues" && currentItems.length > 0) {
      sections.keyIssues = currentItems;
    } else if (currentSection === "strategies" && currentItems.length > 0) {
      sections.strategies = currentItems;
    }

    // 임시 데이터 (실제 데이터가 없을 경우)
    if (sections.keyIssues.length === 0) {
      sections.keyIssues = [
        { title: "브랜드 인지도 저하", description: "소셜 미디어에서 브랜드 언급량이 감소하고 있습니다." },
        { title: "부정적 감정 증가", description: "최근 부정적 리뷰와 피드백이 증가하는 추세입니다." },
        { title: "경쟁사 대비 약세", description: "경쟁사 대비 시장 점유율이 하락하고 있습니다." },
      ];
    }

    if (sections.strategies.length === 0) {
      sections.strategies = [
        { title: "콘텐츠 마케팅 강화", description: "고품질 콘텐츠를 통한 브랜드 인지도 향상 전략을 수립합니다." },
        { title: "소셜 리스닝 활성화", description: "실시간 소셜 미디어 모니터링을 통한 즉각적인 대응 체계를 구축합니다." },
        { title: "고객 참여 프로그램", description: "고객과의 소통을 강화하여 브랜드 충성도를 높입니다." },
      ];
    }

    if (!sections.executiveSummary) {
      sections.executiveSummary =
        "본 리포트는 소셜 데이터 분석을 기반으로 한 전략적 인사이트를 제공합니다. 위험 요소와 실행 전략을 종합하여 브랜드 성장을 위한 실행 계획을 제시합니다.";
    }

    return sections;
  }, [solution]);

  // ✅ chartData useMemo는 “딱 1번만” 선언 (중첩/중복 제거)
  const chartData = useMemo(() => {
    if (!parseReportSections) return null;

    return {
      riskPriority: parseReportSections.keyIssues.map((issue, index) => ({
        name: issue.title.substring(0, 15),
        value: Math.floor(Math.random() * 40) + 60,
        priority: parseReportSections.keyIssues.length - index,
      })),

      strategyEffectiveness: parseReportSections.strategies.map((strategy, index) => ({
        name: strategy.title.substring(0, 15),
        impact: Math.floor(Math.random() * 30) + 70,
        feasibility: Math.floor(Math.random() * 20) + 80,
        priority: parseReportSections.strategies.length - index,
      })),

      radarData: [
        { axis: "인지도", value: Math.floor(Math.random() * 20) + 70 },
        { axis: "참여도", value: Math.floor(Math.random() * 20) + 75 },
        { axis: "만족도", value: Math.floor(Math.random() * 20) + 80 },
        { axis: "충성도", value: Math.floor(Math.random() * 20) + 75 },
        { axis: "성장성", value: Math.floor(Math.random() * 20) + 70 },
      ],
    };
  }, [parseReportSections]);

  // 리포트 내용을 섹션별로 파싱하고 시각화 삽입
  const parseReportWithVisualizations = useMemo(() => {
    if (!solution?.description) return [];

    const content = solution.description;
    const lines = content.split("\n");
    const sections = [];
    let currentSection = { type: "text", content: "", title: "" };

    // 섹션 키워드 매핑 (섹션 제목 -> 시각화 타입)
    const sectionVisualizations = {
      "고객 세분화": "bar",
      "디지털 채널": "line",
      "시간 한정": "bar",
      "피드백": "pie",
      "성과 분석": "radar",
      "프로모션": "bar",
      "혜택": "bar",
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      // 섹션 헤더 감지 (## 또는 ### 또는 숫자로 시작하는 제목)
      const sectionMatch = trimmed.match(/^(#{1,3}|[0-9]+\.)\s*(.+)$/);
      if (sectionMatch) {
        const title = sectionMatch[2].trim();

        // 이전 섹션 저장
        if (currentSection.content) {
          sections.push(currentSection);
        }

        // 새 섹션 시작
        const visualizationType = Object.keys(sectionVisualizations).find((key) =>
          title.includes(key)
        );

        currentSection = {
          type: "section",
          title,
          content: "",
          visualizationType: visualizationType
            ? sectionVisualizations[visualizationType]
            : null,
        };
      } else if (trimmed) {
        // 일반 텍스트 추가
        currentSection.content += (currentSection.content ? "<br>" : "") + trimmed;
      }
    });

    // 마지막 섹션 추가
    if (currentSection.content || currentSection.title) {
      sections.push(currentSection);
    }

    return sections;
  }, [solution?.description]);

  // 리포트 내용을 마크다운 형식으로 파싱하여 표시
  const formatReportContent = (content) => {
    if (!content) return "";

    let formatted = content
      .replace(/```[a-zA-Z]*\n[\s\S]*?```/g, "")
      .replace(/```\n[\s\S]*?```/g, "")
      .replace(/```[a-zA-Z]*/g, "")
      .replace(/```/g, "")
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
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 text-slate-700">$1</li>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\n/g, "<br>");

    return formatted;
  };

  // 섹션별 시각화 데이터 생성
  const getSectionChartData = (sectionTitle, visualizationType) => {
    if (!visualizationType) return null;

    // 섹션 제목에 따른 의미 있는 데이터 생성
    let data = [];

    if (sectionTitle.includes("고객 세분화") || sectionTitle.includes("세분화")) {
      data = [
        { name: "신규 고객", value: Math.floor(Math.random() * 20) + 75 },
        { name: "기존 고객", value: Math.floor(Math.random() * 15) + 80 },
        { name: "VIP 고객", value: Math.floor(Math.random() * 10) + 85 },
        { name: "이탈 위험", value: Math.floor(Math.random() * 25) + 60 },
      ];
    } else if (sectionTitle.includes("디지털 채널") || sectionTitle.includes("채널")) {
      data = [
        { name: "인스타그램", value: Math.floor(Math.random() * 20) + 75 },
        { name: "페이스북", value: Math.floor(Math.random() * 20) + 70 },
        { name: "유튜브", value: Math.floor(Math.random() * 15) + 80 },
        { name: "블로그", value: Math.floor(Math.random() * 25) + 65 },
        { name: "카카오톡", value: Math.floor(Math.random() * 15) + 78 },
      ];
    } else if (sectionTitle.includes("시간 한정") || sectionTitle.includes("시간")) {
      data = [
        { name: "오전 (9-12시)", value: Math.floor(Math.random() * 20) + 70 },
        { name: "오후 (12-18시)", value: Math.floor(Math.random() * 15) + 80 },
        { name: "저녁 (18-21시)", value: Math.floor(Math.random() * 10) + 85 },
        { name: "심야 (21-24시)", value: Math.floor(Math.random() * 25) + 60 },
      ];
    } else if (sectionTitle.includes("피드백") || sectionTitle.includes("의견")) {
      data = [
        { name: "긍정적", value: Math.floor(Math.random() * 15) + 75 },
        { name: "중립적", value: Math.floor(Math.random() * 20) + 60 },
        { name: "건의사항", value: Math.floor(Math.random() * 15) + 70 },
        { name: "불만사항", value: Math.floor(Math.random() * 20) + 50 },
      ];
    } else if (sectionTitle.includes("성과 분석") || sectionTitle.includes("성과")) {
      data = [
        { axis: "매출 증가율", value: Math.floor(Math.random() * 20) + 75 },
        { axis: "고객 증가율", value: Math.floor(Math.random() * 15) + 80 },
        { axis: "브랜드 인지도", value: Math.floor(Math.random() * 10) + 85 },
        { axis: "고객 만족도", value: Math.floor(Math.random() * 15) + 78 },
        { axis: "재구매율", value: Math.floor(Math.random() * 20) + 70 },
      ];
    } else if (sectionTitle.includes("프로모션") || sectionTitle.includes("혜택")) {
      data = [
        { name: "할인 쿠폰", value: Math.floor(Math.random() * 15) + 80 },
        { name: "무료 배송", value: Math.floor(Math.random() * 10) + 85 },
        { name: "적립금", value: Math.floor(Math.random() * 20) + 75 },
        { name: "증정품", value: Math.floor(Math.random() * 25) + 65 },
      ];
    } else if (sectionTitle.includes("콘텐츠") || sectionTitle.includes("마케팅")) {
      data = [
        { name: "이미지 콘텐츠", value: Math.floor(Math.random() * 15) + 80 },
        { name: "동영상 콘텐츠", value: Math.floor(Math.random() * 10) + 85 },
        { name: "텍스트 콘텐츠", value: Math.floor(Math.random() * 20) + 70 },
        { name: "인터랙티브", value: Math.floor(Math.random() * 15) + 75 },
      ];
    } else {
      // 기본 데이터 (섹션 제목과 무관한 경우)
      data = [
        { name: "주요 지표 1", value: Math.floor(Math.random() * 20) + 75 },
        { name: "주요 지표 2", value: Math.floor(Math.random() * 15) + 80 },
        { name: "주요 지표 3", value: Math.floor(Math.random() * 10) + 85 },
        { name: "주요 지표 4", value: Math.floor(Math.random() * 20) + 70 },
      ];
    }

    switch (visualizationType) {
      case "bar":
        return data;
      case "line":
        // 라인 차트는 시간 순서 데이터
        if (sectionTitle.includes("시간") || sectionTitle.includes("추이")) {
          return [
            { name: "1주차", value: Math.floor(Math.random() * 20) + 65 },
            { name: "2주차", value: Math.floor(Math.random() * 20) + 70 },
            { name: "3주차", value: Math.floor(Math.random() * 20) + 75 },
            { name: "4주차", value: Math.floor(Math.random() * 20) + 80 },
          ];
        }
        return data.map((item) => ({ ...item, date: item.name }));
      case "pie":
        return data;
      case "radar":
        // 레이더 차트는 axis 속성이 있는 데이터
        if (data[0]?.axis) {
          return data;
        }
        // axis가 없으면 변환
        return data.map((item, idx) => ({
          axis: item.name,
          value: item.value,
        }));
      default:
        return data;
    }
  };

  // ---- early returns (훅들 아래) ----
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
              <h2 className="text-xl font-black text-slate-900 mb-2">오류 발생</h2>
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

  if (!solution) return null;

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
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">프로젝트</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{solution.projectname}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Tag size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">전략</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{solution.strategytitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">생성일</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{solution.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 리포트 내용 */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden relative">
        {/* EXPORT 버튼 */}
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
          <div id="pdf-report-content" className="space-y-8">
            {parseReportWithVisualizations.length > 0 ? (
              // 섹션별로 파싱된 리포트 렌더링
              parseReportWithVisualizations.map((section, index) => {
                const chartData = section.visualizationType
                  ? getSectionChartData(section.title, section.visualizationType)
                  : null;

                return (
                  <div key={index} className="space-y-4">
                    {/* 섹션 제목 */}
                    {section.title && (
                      <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900 border-b-2 border-blue-600 pb-2">
                        {section.title}
                      </h2>
                    )}

                    {/* 섹션 내용 */}
                    {section.content && (
                      <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: formatReportContent(section.content),
                        }}
                        style={{ lineHeight: "1.8", color: "#1e293b" }}
                      />
                    )}

                    {/* 섹션별 시각화 */}
                    {chartData && section.visualizationType && (
                      <div className="my-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            {section.visualizationType === "bar" && (
                              <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 10, fill: "#64748b" }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 100]} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "8px",
                                  }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            )}

                            {section.visualizationType === "line" && (
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 100]} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "8px",
                                  }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                              </LineChart>
                            )}

                            {section.visualizationType === "pie" && (
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][index % 4]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "8px",
                                  }}
                                />
                              </PieChart>
                            )}

                            {section.visualizationType === "radar" && (
                              <RadarChart data={chartData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                  name="점수"
                                  dataKey="value"
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  fillOpacity={0.6}
                                  strokeWidth={2}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "8px",
                                  }}
                                />
                              </RadarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // 파싱 실패 시 기본 렌더링
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: formatReportContent(solution.description) }}
                style={{ lineHeight: "1.8", color: "#1e293b" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
