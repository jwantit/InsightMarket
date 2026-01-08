// src/pages/ai/ImageAnalysisPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  FileText,
  Cpu,
  History,
  Info,
  X,
  Zap,
  Shield,
  DollarSign,
  Clock,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  analyzeImageContent,
  getFreeReportCount,
} from "../../api/insightAiApi";
import { getErrorMessage } from "../../util/errorUtil";
import { ImageAnalysisStorage } from "../../util/storageUtil";
import useFileUpload from "../../hooks/common/useFileUpload";
import PageHeader from "../../components/common/PageHeader";
import ImageUploadZone from "../../components/ai/ImageUploadZone";
import ImageAnalysisResult from "../../components/ai/ImageAnalysisResult";

const ImageAnalysisPage = () => {
  const { brandId } = useParams();
  const [status, setStatus] = useState("IDLE");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [provider, setProvider] = useState("openai");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);
  const [showProviderInfo, setShowProviderInfo] = useState(null); // "ollama" | "openai" | null

  const {
    fileInputRef,
    dropZoneRef,
    isDragging,
    handleDragOver,
    handleDragLeave,
    openFileDialog,
  } = useFileUpload();

  useEffect(() => {
    setRecentHistory(ImageAnalysisStorage.getRecentList(4));
  }, []);

  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }
    setSelectedFile(file);

    // Base64로 변환하여 저장 (localStorage용)
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result); // Base64 data URL
    };
    reader.readAsDataURL(file);

    setError(null);
    setStatus("IDLE");
  };

  const handleRemoveFile = () => {
    // Base64는 revokeObjectURL 불필요
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
    setStatus("IDLE");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setStatus("LOADING");
    setError(null);
    try {
      const res = await analyzeImageContent({
        brandId: Number(brandId),
        imageFile: selectedFile,
        provider,
      });
      setResult(res.data);
      // imagePreview는 이미 Base64 문자열이므로 그대로 저장
      ImageAnalysisStorage.save({
        ...res.data,
        imagePreview: imagePreview, // Base64 data URL
      });
      setRecentHistory(ImageAnalysisStorage.getRecentList(4));
      setStatus("SUCCESS");
    } catch (e) {
      setError(getErrorMessage(e) || "분석 중 오류가 발생했습니다.");
      setStatus("IDLE");
    }
  };

  const handleLoadRecent = (index) => {
    const savedData = ImageAnalysisStorage.load(index);
    if (savedData) {
      setResult(savedData);
      setImagePreview(savedData.imagePreview);
      setStatus("SUCCESS");
    }
  };

  // 엔진별 장단점 정보 (사용자 관점)
  const providerInfo = {
    ollama: {
      name: "Ollama (llava)",
      pros: [
        "무료로 사용 가능",
        "데이터가 외부로 전송되지 않음",
        "오프라인에서도 사용 가능",
      ],
      cons: ["분석 시간이 오래 걸림 (1-5분)", "결과 품질이 다소 낮을 수 있음"],
      icon: Shield,
      color: "slate",
    },
    openai: {
      name: "OpenAI (GPT-4o)",
      pros: ["빠르고 정확한 분석 (10-30초)", "더 상세하고 전문적인 결과"],
      cons: ["유료 서비스 (API 키 필요)", "인터넷 연결 필수"],
      icon: Zap,
      color: "blue",
    },
  };

  // 헤더 우측에 들어갈 엔진 선택기
  const headerExtra = (
    <div className="relative flex items-center gap-2">
      <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
        <button
          onClick={() => setProvider("ollama")}
          className={`relative px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${
            provider === "ollama"
              ? "bg-slate-900 text-white"
              : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          OLLAMA
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowProviderInfo(
                showProviderInfo === "ollama" ? null : "ollama"
              );
            }}
            className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-600 hover:bg-slate-500 transition-colors"
            title="Ollama 정보 보기"
          >
            <Info size={8} />
          </button>
        </button>
        <button
          onClick={() => setProvider("openai")}
          className={`relative px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${
            provider === "openai"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
              : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          OPENAI (GPT-4o)
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowProviderInfo(
                showProviderInfo === "openai" ? null : "openai"
              );
            }}
            className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-500 hover:bg-blue-400 transition-colors"
            title="OpenAI 정보 보기"
          >
            <Info size={8} />
          </button>
        </button>
      </div>

      {/* 엔진 정보 팝오버 */}
      {showProviderInfo && (
        <div
          className="absolute right-0 top-12 z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2"
          onMouseEnter={() => setShowProviderInfo(showProviderInfo)}
          onMouseLeave={() => setShowProviderInfo(null)}
        >
          <div className="p-6 space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    providerInfo[showProviderInfo].color === "blue"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  {React.createElement(providerInfo[showProviderInfo].icon, {
                    size: 20,
                  })}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {providerInfo[showProviderInfo].name}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {showProviderInfo === "ollama"
                      ? "로컬 AI 엔진"
                      : "클라우드 AI 엔진"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProviderInfo(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* 장점 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <Check size={12} className="text-emerald-500" />
                장점
              </div>
              <ul className="space-y-1.5">
                {providerInfo[showProviderInfo].pros.map((pro, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-emerald-500 mt-0.5 shrink-0"
                    />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 단점 */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest">
                <AlertTriangle size={12} className="text-rose-500" />
                단점
              </div>
              <ul className="space-y-1.5">
                {providerInfo[showProviderInfo].cons.map((con, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                  >
                    <AlertTriangle
                      size={14}
                      className="text-rose-500 mt-0.5 shrink-0"
                    />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 relative">
      <PageHeader
        icon={ImageIcon}
        isAi={true}
        title="광고 이미지 분석"
        breadcrumb="AI Marketing / Vision"
        subtitle="광고 배너 및 SNS 이미지를 AI가 분석하여 마케팅 효과와 톤앤매너를 진단합니다."
        extra={headerExtra}
      />

      {status === "IDLE" && (
        <div className="space-y-8">
          <ImageUploadZone
            fileInputRef={fileInputRef}
            dropZoneRef={dropZoneRef}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              e.preventDefault();
              handleFileChange(e.dataTransfer.files[0]);
            }}
            onFileChange={handleFileChange}
            onOpenFileDialog={openFileDialog}
            selectedFile={selectedFile}
            onRemoveFile={handleRemoveFile}
          />

          {selectedFile && (
            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                className="group flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-200 active:scale-95"
              >
                <Cpu
                  size={24}
                  className="group-hover:rotate-12 transition-transform"
                />
                AI 분석 실행하기
              </button>
            </div>
          )}

          {recentHistory.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2 text-slate-400 uppercase tracking-widest font-black text-[11px]">
                <History size={14} /> 최근 분석 결과
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentHistory.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLoadRecent(item.index)}
                    className="group relative h-32 rounded-2xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all shadow-sm"
                  >
                    <img
                      src={item.imagePreview}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      alt="history"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                      <span className="text-[10px] text-white font-bold truncate">
                        분석 {idx + 1}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {status === "LOADING" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-10">
          <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
            <img
              src={imagePreview}
              className="w-full h-auto brightness-50"
              alt="preview"
            />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-white">
                <Loader2 size={48} className="animate-spin text-blue-400" />
                <p className="font-black text-xl tracking-tighter">
                  이미지 해석 중...
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              AI가 이미지를
              <br />
              <span className="text-blue-600">스캔하고 있습니다.</span>
            </h3>
            <div className="space-y-3">
              {[
                "비주얼 요소 추출",
                "텍스트 가독성 측정",
                "마케팅 톤앤매너 분석",
                "최적화 전략 도출",
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={14} className="animate-pulse" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {status === "SUCCESS" && result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Sparkles className="text-blue-600" /> 분석 리포트 결과
            </h2>
            <button
              onClick={handleRemoveFile}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all"
            >
              <RefreshCw size={14} /> 다른 이미지 분석
            </button>
          </div>
          <ImageAnalysisResult result={result} imagePreview={imagePreview} />
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageAnalysisPage;
