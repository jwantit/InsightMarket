import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import {
  getDailyStats,
  getSentimentStats,
  getTokenStats,
  getCompetitors,
} from "../../api/snsApi";
import { getBrandDetail } from "../../api/brandApi";

// Components
import WordCloudComponent from "../../components/sns/SentimentTrend/WordCloudComponent";
import SentimentTrendComponent from "../../components/sns/SentimentTrend/SentimentTrendComponent";
import SentimentRatioComponent from "../../components/sns/SentimentTrend/SentimentRatioComponent";

// Utils
import {
  TOKENS,
  sentimentLabel,
  sentimentColor,
  badgeStyle,
} from "../../components/sns/SentimentTrend/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Comparison = () => {
  const { brandId } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data
  const [brandName, setBrandName] = useState("");
  const [competitors, setCompetitors] = useState([]);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState(null);

  // Brand data (competitorId = null)
  const [brandDailyStats, setBrandDailyStats] = useState([]);
  const [brandSentimentStats, setBrandSentimentStats] = useState([]);
  const [brandTokenStats, setBrandTokenStats] = useState([]);

  // Competitor data (competitorId = selectedCompetitorId)
  const [competitorDailyStats, setCompetitorDailyStats] = useState([]);
  const [competitorSentimentStats, setCompetitorSentimentStats] = useState([]);
  const [competitorTokenStats, setCompetitorTokenStats] = useState([]);

  // UI state
  const [wordView, setWordView] = useState("cloud"); // "cloud" | "table"
  const [activeSentiments, setActiveSentiments] = useState([
    "POS",
    "NEG",
    "NEU",
  ]);
  const [selectedSentiment, setSelectedSentiment] = useState("POS"); // 비교 차트용: "POS" | "NEG" | "NEU"
  const [selectedToken, setSelectedToken] = useState(null);
  const [selectedSources, setSelectedSources] = useState({
    naver: true,
    youtube: true,
  });

  /** -----------------------------
   * Fetch brand name and competitors
   * ----------------------------- */
  useEffect(() => {
    const fetchBrandAndCompetitors = async () => {
      try {
        const [brandData, competitorsData] = await Promise.all([
          getBrandDetail(brandId),
          getCompetitors(brandId),
        ]);
        setBrandName(brandData?.name || "");
        setCompetitors(
          Array.isArray(competitorsData)
            ? competitorsData.filter((c) => c.enabled)
            : []
        );
        if (
          competitorsData &&
          competitorsData.length > 0 &&
          competitorsData[0].enabled
        ) {
          setSelectedCompetitorId(competitorsData[0].competitorId);
        }
      } catch (err) {
        console.error("브랜드/경쟁사 목록 조회 실패:", err);
        setError("브랜드/경쟁사 목록을 불러오는데 실패했습니다.");
      }
    };
    fetchBrandAndCompetitors();
  }, [brandId]);

  /** -----------------------------
   * Fetch data for brand and competitor
   * ----------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCompetitorId) return;

      setLoading(true);
      setError(null);
      setSelectedToken(null);

      try {
        // Calculate source param directly from selectedSources
        const sources = [];
        if (selectedSources.naver) sources.push("NAVER");
        if (selectedSources.youtube) sources.push("YOUTUBE");

        const sourceParam =
          sources.length === 0 || sources.length === 2 ? null : sources[0];

        console.log(
          "[ComparisonPage] Fetching data with source:",
          sourceParam,
          "Selected:",
          selectedSources
        );

        // Fetch brand data (competitorId = null)
        const [brandDailyData, brandSentimentData, brandTokenData] =
          await Promise.all([
            getDailyStats(brandId, null, null, null, sourceParam, null, null),
            getSentimentStats(
              brandId,
              null,
              null,
              null,
              sourceParam,
              null,
              null
            ),
            getTokenStats(brandId, null, null, null, sourceParam, null, null),
          ]);

        // Fetch competitor data (competitorId = selectedCompetitorId)
        const [
          competitorDailyData,
          competitorSentimentData,
          competitorTokenData,
        ] = await Promise.all([
          getDailyStats(
            brandId,
            null,
            null,
            selectedCompetitorId,
            sourceParam,
            null,
            null
          ),
          getSentimentStats(
            brandId,
            null,
            null,
            selectedCompetitorId,
            sourceParam,
            null,
            null
          ),
          getTokenStats(
            brandId,
            null,
            null,
            selectedCompetitorId,
            sourceParam,
            null,
            null
          ),
        ]);

        setBrandDailyStats(Array.isArray(brandDailyData) ? brandDailyData : []);
        setBrandSentimentStats(
          Array.isArray(brandSentimentData) ? brandSentimentData : []
        );
        setBrandTokenStats(Array.isArray(brandTokenData) ? brandTokenData : []);

        setCompetitorDailyStats(
          Array.isArray(competitorDailyData) ? competitorDailyData : []
        );
        setCompetitorSentimentStats(
          Array.isArray(competitorSentimentData) ? competitorSentimentData : []
        );
        setCompetitorTokenStats(
          Array.isArray(competitorTokenData) ? competitorTokenData : []
        );
      } catch (err) {
        console.error("데이터 조회 실패:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandId, selectedCompetitorId, selectedSources]);

  /** -----------------------------
   * Process word cloud data for brand
   * ----------------------------- */
  const brandRawWordData = useMemo(() => {
    if (!brandTokenStats.length) return [];

    const tokenMap = new Map();
    brandTokenStats.forEach((stat) => {
      const key = String(stat.token || "").trim();
      if (!key) return;

      if (!tokenMap.has(key)) {
        tokenMap.set(key, {
          text: key,
          value: 0,
          sentiment: stat.sentiment,
        });
      }
      tokenMap.get(key).value += Number(stat.tokenCount || 0);
    });

    return Array.from(tokenMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 60);
  }, [brandTokenStats]);

  const brandWordCloudMeta = useMemo(() => {
    if (!brandRawWordData || !brandRawWordData.length)
      return { max: 1, min: 0 };
    let max = 0;
    let min = Number.POSITIVE_INFINITY;
    brandRawWordData.forEach((w) => {
      if (w.value > max) max = w.value;
      if (w.value < min) min = w.value;
    });
    if (!Number.isFinite(min)) min = 0;
    if (max === min) min = Math.max(0, max - 1);
    return { max, min };
  }, [brandRawWordData]);

  const brandWordCloudData = useMemo(() => {
    if (!brandRawWordData || brandRawWordData.length === 0) return [];
    return brandRawWordData.filter((w) =>
      activeSentiments.includes(w.sentiment)
    );
  }, [brandRawWordData, activeSentiments]);

  /** -----------------------------
   * Process word cloud data for competitor
   * ----------------------------- */
  const competitorRawWordData = useMemo(() => {
    if (!competitorTokenStats.length) return [];

    const tokenMap = new Map();
    competitorTokenStats.forEach((stat) => {
      const key = String(stat.token || "").trim();
      if (!key) return;

      if (!tokenMap.has(key)) {
        tokenMap.set(key, {
          text: key,
          value: 0,
          sentiment: stat.sentiment,
        });
      }
      tokenMap.get(key).value += Number(stat.tokenCount || 0);
    });

    return Array.from(tokenMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 60);
  }, [competitorTokenStats]);

  const competitorWordCloudMeta = useMemo(() => {
    if (!competitorRawWordData || !competitorRawWordData.length)
      return { max: 1, min: 0 };
    let max = 0;
    let min = Number.POSITIVE_INFINITY;
    competitorRawWordData.forEach((w) => {
      if (w.value > max) max = w.value;
      if (w.value < min) min = w.value;
    });
    if (!Number.isFinite(min)) min = 0;
    if (max === min) min = Math.max(0, max - 1);
    return { max, min };
  }, [competitorRawWordData]);

  const competitorWordCloudData = useMemo(() => {
    if (!competitorRawWordData || competitorRawWordData.length === 0) return [];
    return competitorRawWordData.filter((w) =>
      activeSentiments.includes(w.sentiment)
    );
  }, [competitorRawWordData, activeSentiments]);

  /** -----------------------------
   * Process chart data for brand (stacked bar)
   * ----------------------------- */
  const brandSentimentBarData = useMemo(() => {
    if (!brandSentimentStats.length) return null;

    const dateMap = new Map();
    brandSentimentStats.forEach((stat) => {
      const dateKey = stat.statDate;
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { pos: 0, neg: 0, neu: 0, count: 0 });
      }
      const entry = dateMap.get(dateKey);
      entry.pos += Number(stat.positiveRatio || 0);
      entry.neg += Number(stat.negativeRatio || 0);
      entry.neu += Number(stat.neutralRatio || 0);
      entry.count += 1;
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    const rows = sortedDates.map((d) => {
      const e = dateMap.get(d);
      const c = e.count || 1;
      return { pos: e.pos / c, neg: e.neg / c, neu: e.neu / c };
    });

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "긍정",
          data: rows.map((r) => r.pos),
          backgroundColor: `${TOKENS.color.positive}D9`,
          borderRadius: 2,
        },
        {
          label: "중립",
          data: rows.map((r) => r.neu),
          backgroundColor: "rgba(156, 163, 175, 0.55)",
          borderRadius: 2,
        },
        {
          label: "부정",
          data: rows.map((r) => r.neg),
          backgroundColor: `${TOKENS.color.negative}D9`,
          borderRadius: 2,
        },
      ],
    };
  }, [brandSentimentStats]);

  /** -----------------------------
   * Process chart data for competitor (stacked bar)
   * ----------------------------- */
  const competitorSentimentBarData = useMemo(() => {
    if (!competitorSentimentStats.length) return null;

    const dateMap = new Map();
    competitorSentimentStats.forEach((stat) => {
      const dateKey = stat.statDate;
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { pos: 0, neg: 0, neu: 0, count: 0 });
      }
      const entry = dateMap.get(dateKey);
      entry.pos += Number(stat.positiveRatio || 0);
      entry.neg += Number(stat.negativeRatio || 0);
      entry.neu += Number(stat.neutralRatio || 0);
      entry.count += 1;
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    const rows = sortedDates.map((d) => {
      const e = dateMap.get(d);
      const c = e.count || 1;
      return { pos: e.pos / c, neg: e.neg / c, neu: e.neu / c };
    });

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "긍정",
          data: rows.map((r) => r.pos),
          backgroundColor: `${TOKENS.color.positive}D9`,
          borderRadius: 2,
        },
        {
          label: "중립",
          data: rows.map((r) => r.neu),
          backgroundColor: "rgba(156, 163, 175, 0.55)",
          borderRadius: 2,
        },
        {
          label: "부정",
          data: rows.map((r) => r.neg),
          backgroundColor: `${TOKENS.color.negative}D9`,
          borderRadius: 2,
        },
      ],
    };
  }, [competitorSentimentStats]);

  /** -----------------------------
   * Mention volume comparison chart
   * ----------------------------- */
  const mentionComparisonChartData = useMemo(() => {
    if (!brandDailyStats.length && !competitorDailyStats.length) return null;

    const allDates = [
      ...new Set([
        ...brandDailyStats.map((s) => s.statDate),
        ...competitorDailyStats.map((s) => s.statDate),
      ]),
    ].sort();

    const selectedCompetitor = competitors.find(
      (c) => c.competitorId === selectedCompetitorId
    );

    // 날짜별 언급량 집계
    const brandMentionsByDate = new Map();
    brandDailyStats.forEach((stat) => {
      const dateKey = stat.statDate;
      brandMentionsByDate.set(
        dateKey,
        (brandMentionsByDate.get(dateKey) || 0) + (stat.mentionCount || 0)
      );
    });

    const competitorMentionsByDate = new Map();
    competitorDailyStats.forEach((stat) => {
      const dateKey = stat.statDate;
      competitorMentionsByDate.set(
        dateKey,
        (competitorMentionsByDate.get(dateKey) || 0) + (stat.mentionCount || 0)
      );
    });

    // 총 언급량 계산
    const totalBrandMentions = brandDailyStats.reduce(
      (sum, stat) => sum + (stat.mentionCount || 0),
      0
    );
    const totalCompetitorMentions = competitorDailyStats.reduce(
      (sum, stat) => sum + (stat.mentionCount || 0),
      0
    );

    return {
      labels: allDates.map((d) => d.toString()),
      datasets: [
        {
          label: `${brandName} ${totalBrandMentions.toLocaleString()}`,
          data: allDates.map((d) => brandMentionsByDate.get(d) || 0),
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          borderColor: "rgb(99, 102, 241)",
          borderWidth: 2,
          tension: 0.1,
          fill: false,
        },
        {
          label: `${
            selectedCompetitor?.name || "경쟁사"
          } ${totalCompetitorMentions.toLocaleString()}`,
          data: allDates.map((d) => competitorMentionsByDate.get(d) || 0),
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 2,
          tension: 0.1,
          fill: false,
        },
      ],
    };
  }, [
    brandDailyStats,
    competitorDailyStats,
    brandName,
    competitors,
    selectedCompetitorId,
  ]);

  /** -----------------------------
   * Combined sentiment trend chart (both brand and competitor)
   * ----------------------------- */
  const combinedSentimentChartData = useMemo(() => {
    if (!brandSentimentStats.length && !competitorSentimentStats.length)
      return null;

    const allDates = [
      ...new Set([
        ...brandSentimentStats.map((s) => s.statDate),
        ...competitorSentimentStats.map((s) => s.statDate),
      ]),
    ].sort();

    const selectedCompetitor = competitors.find(
      (c) => c.competitorId === selectedCompetitorId
    );

    // 선택된 감성에 따라 데이터 필터링
    const sentimentMap = {
      POS: {
        brandKey: "positiveRatio",
        brandLabel: "긍정",
        competitorLabel: "긍정",
        brandColor: "rgb(99, 102, 241)",
        competitorColor: "rgb(16, 185, 129)",
      },
      NEG: {
        brandKey: "negativeRatio",
        brandLabel: "부정",
        competitorLabel: "부정",
        brandColor: "rgb(239, 68, 68)",
        competitorColor: "rgb(245, 158, 11)",
      },
      NEU: {
        brandKey: "neutralRatio",
        brandLabel: "중립",
        competitorLabel: "중립",
        brandColor: "rgb(156, 163, 175)",
        competitorColor: "rgb(156, 163, 175)",
      },
    };

    const sentiment = sentimentMap[selectedSentiment];

    return {
      labels: allDates.map((d) => d.toString()),
      datasets: [
        {
          label: `${brandName} ${sentiment.brandLabel}`,
          data: allDates.map(
            (d) =>
              brandSentimentStats.find((s) => s.statDate === d)?.[
                sentiment.brandKey
              ] || 0
          ),
          backgroundColor: `${sentiment.brandColor}20`,
          borderColor: sentiment.brandColor,
          borderWidth: 2,
          tension: 0.1,
          fill: false,
        },
        {
          label: `${selectedCompetitor?.name || "경쟁사"} ${
            sentiment.competitorLabel
          }`,
          data: allDates.map(
            (d) =>
              competitorSentimentStats.find((s) => s.statDate === d)?.[
                sentiment.brandKey
              ] || 0
          ),
          backgroundColor: `${sentiment.competitorColor}20`,
          borderColor: sentiment.competitorColor,
          borderWidth: 2,
          tension: 0.1,
          fill: false,
        },
      ],
    };
  }, [
    brandSentimentStats,
    competitorSentimentStats,
    brandName,
    competitors,
    selectedCompetitorId,
    selectedSentiment,
  ]);

  /** -----------------------------
   * Sentiment ratios
   * ----------------------------- */
  const brandSentimentAverages = useMemo(() => {
    if (!brandSentimentStats.length) {
      return { pos: 0, neg: 0, neu: 0 };
    }
    let totalPos = 0;
    let totalNeg = 0;
    let totalNeu = 0;

    brandSentimentStats.forEach((stat) => {
      totalPos += Number(stat.positiveRatio || 0);
      totalNeg += Number(stat.negativeRatio || 0);
      totalNeu += Number(stat.neutralRatio || 0);
    });

    const count = brandSentimentStats.length || 1;
    return {
      pos: totalPos / count,
      neg: totalNeg / count,
      neu: totalNeu / count,
    };
  }, [brandSentimentStats]);

  const competitorSentimentAverages = useMemo(() => {
    if (!competitorSentimentStats.length) {
      return { pos: 0, neg: 0, neu: 0 };
    }
    let totalPos = 0;
    let totalNeg = 0;
    let totalNeu = 0;

    competitorSentimentStats.forEach((stat) => {
      totalPos += Number(stat.positiveRatio || 0);
      totalNeg += Number(stat.negativeRatio || 0);
      totalNeu += Number(stat.neutralRatio || 0);
    });

    const count = competitorSentimentStats.length || 1;
    return {
      pos: totalPos / count,
      neg: totalNeg / count,
      neu: totalNeu / count,
    };
  }, [competitorSentimentStats]);

  const brandPositiveRatioText = useMemo(() => {
    const v = brandSentimentAverages.pos;
    return Number.isFinite(v) ? `${v.toFixed(1)}%` : "0.0%";
  }, [brandSentimentAverages.pos]);

  const competitorPositiveRatioText = useMemo(() => {
    const v = competitorSentimentAverages.pos;
    return Number.isFinite(v) ? `${v.toFixed(1)}%` : "0.0%";
  }, [competitorSentimentAverages.pos]);

  const brandSentimentDoughnutData = useMemo(() => {
    if (!brandSentimentStats.length) return null;

    return {
      labels: ["긍정", "부정", "중립"],
      datasets: [
        {
          data: [
            brandSentimentAverages.pos,
            brandSentimentAverages.neg,
            brandSentimentAverages.neu,
          ],
          backgroundColor: [
            `${TOKENS.color.positive}CC`,
            `${TOKENS.color.negative}CC`,
            "rgba(156, 163, 175, 0.70)",
          ],
          borderColor: [
            TOKENS.color.positive,
            TOKENS.color.negative,
            TOKENS.color.neutral,
          ],
          borderWidth: 1.5,
          hoverOffset: 3,
          cutout: "68%",
        },
      ],
    };
  }, [brandSentimentStats, brandSentimentAverages]);

  const competitorSentimentDoughnutData = useMemo(() => {
    if (!competitorSentimentStats.length) return null;

    return {
      labels: ["긍정", "부정", "중립"],
      datasets: [
        {
          data: [
            competitorSentimentAverages.pos,
            competitorSentimentAverages.neg,
            competitorSentimentAverages.neu,
          ],
          backgroundColor: [
            `${TOKENS.color.positive}CC`,
            `${TOKENS.color.negative}CC`,
            "rgba(156, 163, 175, 0.70)",
          ],
          borderColor: [
            TOKENS.color.positive,
            TOKENS.color.negative,
            TOKENS.color.neutral,
          ],
          borderWidth: 1.5,
          hoverOffset: 3,
          cutout: "68%",
        },
      ],
    };
  }, [competitorSentimentStats, competitorSentimentAverages]);

  const brandSummaryStats = useMemo(() => {
    if (!brandDailyStats.length) return null;

    const totalMentions = brandDailyStats.reduce(
      (sum, stat) => sum + stat.mentionCount,
      0
    );

    return {
      totalMentions,
    };
  }, [brandDailyStats]);

  const competitorSummaryStats = useMemo(() => {
    if (!competitorDailyStats.length) return null;

    const totalMentions = competitorDailyStats.reduce(
      (sum, stat) => sum + stat.mentionCount,
      0
    );

    return {
      totalMentions,
    };
  }, [competitorDailyStats]);

  /** -----------------------------
   * Chart options
   * ----------------------------- */
  const baseChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: TOKENS.color.subtext,
            boxWidth: 10,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: { size: 14 },
          bodyFont: { size: 13 },
        },
      },
      scales: {
        x: {
          grid: { color: TOKENS.color.border },
          ticks: { color: TOKENS.color.subtext },
        },
        y: {
          grid: { color: TOKENS.color.border },
          ticks: { color: TOKENS.color.subtext },
          beginAtZero: true,
          max: 100,
        },
      },
    };
  }, []);

  const brandDoughnutOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: baseChartOptions.plugins.tooltip,
        doughnutCenterText: {
          title: `긍정 ${brandPositiveRatioText}`,
          subtitle: brandSummaryStats
            ? `총 ${brandSummaryStats.totalMentions.toLocaleString()}건`
            : "",
        },
      },
    };
  }, [
    baseChartOptions.plugins.tooltip,
    brandPositiveRatioText,
    brandSummaryStats,
  ]);

  const competitorDoughnutOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: baseChartOptions.plugins.tooltip,
        doughnutCenterText: {
          title: `긍정 ${competitorPositiveRatioText}`,
          subtitle: competitorSummaryStats
            ? `총 ${competitorSummaryStats.totalMentions.toLocaleString()}건`
            : "",
        },
      },
    };
  }, [
    baseChartOptions.plugins.tooltip,
    competitorPositiveRatioText,
    competitorSummaryStats,
  ]);

  const stackedBarOptions = useMemo(() => {
    return {
      ...baseChartOptions,
      scales: {
        ...baseChartOptions.scales,
        x: { ...baseChartOptions.scales.x, stacked: true },
        y: { ...baseChartOptions.scales.y, stacked: true, max: 100 },
      },
    };
  }, [baseChartOptions]);

  const toggleSentiment = (s) => {
    setActiveSentiments((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const selectedCompetitor = competitors.find(
    (c) => c.competitorId === selectedCompetitorId
  );

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 rounded-2xl shadow-xl border border-indigo-100/50 p-8 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                경쟁사 비교
              </h1>
              <p className="text-gray-600 font-medium">
                브랜드와 경쟁사의 감성 트렌드를 비교 분석하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">필터</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                경쟁사 선택
              </label>
              <div className="relative">
                <select
                  value={selectedCompetitorId || ""}
                  onChange={(e) =>
                    setSelectedCompetitorId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full p-3.5 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 shadow-sm hover:shadow-md font-medium text-gray-900"
                >
                  <option value="">경쟁사를 선택하세요</option>
                  {competitors.map((c) => (
                    <option key={c.competitorId} value={c.competitorId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                데이터 소스
              </label>
              <div className="flex items-center gap-4">
                {/* NAVER Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                    NAVER
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSources((prev) => ({
                        ...prev,
                        naver: !prev.naver,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      selectedSources.naver ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedSources.naver
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* YOUTUBE Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 min-w-[70px]">
                    YOUTUBE
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSources((prev) => ({
                        ...prev,
                        youtube: !prev.youtube,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                      selectedSources.youtube ? "bg-red-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedSources.youtube
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error & Loading */}
      {error && (
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg border-2 border-red-200/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-red-900 mb-1">
                오류가 발생했습니다
              </h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100"></div>
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                데이터를 불러오는 중...
              </p>
              <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && selectedCompetitorId && (
        <>
          {/* 섹션 1: 언급량 비교 분석 */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 rounded-2xl shadow-lg border border-emerald-100/50 p-8 backdrop-blur-sm mb-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  언급량 비교 분석
                </h2>
                <p className="text-xs text-gray-500">
                  브랜드 vs 경쟁사 언급량 추이 비교
                </p>
              </div>

              {/* 요약 카드 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {brandName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{brandName}</p>
                      <p className="text-xs text-gray-500 mb-1">분석 기간</p>
                      <p className="text-lg font-bold text-gray-900">
                        {brandDailyStats.length > 0 &&
                        competitorDailyStats.length > 0
                          ? `${brandDailyStats[0]?.statDate || ""} - ${
                              brandDailyStats[brandDailyStats.length - 1]
                                ?.statDate || ""
                            }`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {selectedCompetitor?.name?.charAt(0) || "경"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        {selectedCompetitor?.name || "경쟁사"}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">분석 기간</p>
                      <p className="text-lg font-bold text-gray-900">
                        {brandDailyStats.length > 0 &&
                        competitorDailyStats.length > 0
                          ? `${competitorDailyStats[0]?.statDate || ""} - ${
                              competitorDailyStats[
                                competitorDailyStats.length - 1
                              ]?.statDate || ""
                            }`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 언급량 추이 비교 차트 */}
              <div className="relative w-full">
                {mentionComparisonChartData ? (
                  <div className="relative rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 p-6 shadow-inner w-full">
                    <div className="h-[400px]">
                      <Line
                        data={mentionComparisonChartData}
                        options={{
                          ...baseChartOptions,
                          plugins: {
                            ...baseChartOptions.plugins,
                            legend: {
                              display: true,
                              position: "bottom",
                              labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: { size: 12, weight: "500" },
                              },
                            },
                          },
                          scales: {
                            ...baseChartOptions.scales,
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function (value) {
                                  return value.toLocaleString();
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-gray-400">
                    데이터가 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 섹션 2: 긍부정 비교 분석 */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 rounded-2xl shadow-lg border border-purple-100/50 p-8 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  긍·부정 비교 분석
                </h2>
                <p className="text-xs text-gray-500">
                  브랜드 vs 경쟁사 감성 분석 비교
                </p>
              </div>

              {/* 요약 카드 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* 브랜드 긍정 최고 */}
                {brandSentimentAverages.pos > 0 && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">
                          긍정 감성이 가장 높은 분석 단어
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          {brandName} {brandPositiveRatioText}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 경쟁사 부정 최고 */}
                {competitorSentimentAverages.neg > 0 && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200/50 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">
                          부정 감성이 가장 높은 분석 단어
                        </p>
                        <p className="text-2xl font-bold text-red-700">
                          {selectedCompetitor?.name || "경쟁사"}{" "}
                          {competitorSentimentAverages.neg.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 브랜드 부정 최고 (경쟁사 부정이 없을 때) */}
                {competitorSentimentAverages.neg === 0 &&
                  brandSentimentAverages.neg > 0 && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200/50 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">
                            부정 감성이 가장 높은 분석 단어
                          </p>
                          <p className="text-2xl font-bold text-red-700">
                            {brandName} {brandSentimentAverages.neg.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* 경쟁사 긍정 최고 (브랜드 긍정이 없을 때) */}
                {brandSentimentAverages.pos === 0 &&
                  competitorSentimentAverages.pos > 0 && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">
                            긍정 감성이 가장 높은 분석 단어
                          </p>
                          <p className="text-2xl font-bold text-blue-700">
                            {selectedCompetitor?.name || "경쟁사"}{" "}
                            {competitorPositiveRatioText}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* 브랜드와 경쟁사 워드클라우드 비교 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Brand Panel */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-xl shadow-lg border border-blue-100/50 p-6 backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative mb-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {brandName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">브랜드 분석</p>
                  </div>

                  {/* Word Cloud */}
                  <div className="mb-6">
                    <WordCloudComponent
                      wordCloudData={brandWordCloudData}
                      wordCloudMeta={brandWordCloudMeta}
                      wordView={wordView}
                      setWordView={setWordView}
                      activeSentiments={activeSentiments}
                      toggleSentiment={toggleSentiment}
                      selectedToken={selectedToken}
                      setSelectedToken={setSelectedToken}
                      tokenStats={brandTokenStats}
                    />
                  </div>

                  {/* Sentiment Ratio */}
                  <SentimentRatioComponent
                    sentimentDoughnutData={brandSentimentDoughnutData}
                    sentimentAverages={brandSentimentAverages}
                    doughnutOptions={brandDoughnutOptions}
                    summaryStats={brandSummaryStats}
                    size="small"
                  />
                </div>

                {/* Competitor Panel */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 rounded-xl shadow-lg border border-green-100/50 p-6 backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative mb-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {selectedCompetitor?.name || "경쟁사"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">경쟁사 분석</p>
                  </div>

                  {/* Word Cloud */}
                  <div className="mb-6">
                    <WordCloudComponent
                      wordCloudData={competitorWordCloudData}
                      wordCloudMeta={competitorWordCloudMeta}
                      wordView={wordView}
                      setWordView={setWordView}
                      activeSentiments={activeSentiments}
                      toggleSentiment={toggleSentiment}
                      selectedToken={selectedToken}
                      setSelectedToken={setSelectedToken}
                      tokenStats={competitorTokenStats}
                    />
                  </div>

                  {/* Sentiment Ratio */}
                  <SentimentRatioComponent
                    sentimentDoughnutData={competitorSentimentDoughnutData}
                    sentimentAverages={competitorSentimentAverages}
                    doughnutOptions={competitorDoughnutOptions}
                    summaryStats={competitorSummaryStats}
                    size="small"
                  />
                </div>
              </div>

              {/* 긍·부정 추이 비교 차트 */}
              <div className="relative mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      긍·부정 추이 비교
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      브랜드 vs 경쟁사 감성 트렌드 비교
                    </p>
                  </div>
                  {/* 감성 필터 라디오 버튼 */}
                  <div className="flex items-center gap-2">
                    {[
                      { value: "POS", label: "긍정" },
                      { value: "NEG", label: "부정" },
                      { value: "NEU", label: "중립" },
                    ].map((sentiment) => (
                      <button
                        key={sentiment.value}
                        onClick={() => setSelectedSentiment(sentiment.value)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                          selectedSentiment === sentiment.value
                            ? sentiment.value === "POS"
                              ? "bg-blue-500 text-white shadow-md"
                              : sentiment.value === "NEG"
                              ? "bg-red-500 text-white shadow-md"
                              : "bg-gray-500 text-white shadow-md"
                            : "bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {sentiment.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative w-full">
                {combinedSentimentChartData ? (
                  <div className="relative rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 p-6 shadow-inner w-full">
                    <div className="h-[400px]">
                      <Line
                        data={combinedSentimentChartData}
                        options={baseChartOptions}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-50/50 border border-gray-200 p-12 text-center w-full">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-gray-500 font-medium">
                      데이터가 없습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && !selectedCompetitorId && (
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                경쟁사를 선택하세요
              </p>
              <p className="text-sm text-gray-500">
                위 필터에서 경쟁사를 선택하면 비교 데이터가 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comparison;
