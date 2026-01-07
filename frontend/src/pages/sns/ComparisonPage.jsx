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
import { Activity, Heart, Users } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

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

// 대시보드와 동일한 아이콘
const Icons = {
  Shield: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Smile: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Zap: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  TrendingUp: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  TrendingDown: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
};

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
            color: "#64748b",
            boxWidth: 8,
            font: { size: 11 },
            padding: 8,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          padding: 10,
          titleFont: { size: 11 },
          bodyFont: { size: 10 },
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: "#f1f5f9", drawBorder: false },
          ticks: { color: "#94a3b8", font: { size: 10 } },
        },
        y: {
          grid: { color: "#f1f5f9", drawBorder: false },
          ticks: { color: "#94a3b8", font: { size: 10 } },
          beginAtZero: true,
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
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Page Header */}
      <PageHeader
        icon={Users}
        title="경쟁사 비교 분석"
        breadcrumb="Analytics / Comparison"
        subtitle="브랜드와 경쟁사의 언급량, 감성, 키워드를 비교하여 경쟁 우위를 분석합니다."
      />

      {/* Filters */}
      <div className="sticky top-8 z-50 w-full flex justify-center pointer-events-none transition-all duration-500 mb-4">
        <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-5 py-2 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 gap-4 pointer-events-auto transition-all duration-300 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-500 uppercase tracking-widest transition-colors">
              Filter
            </span>
          </div>

          {/* Competitor */}
          <div className="flex items-center gap-2 border-l border-gray-200/30 group-hover:border-gray-200 pl-4">
            <select
              value={selectedCompetitorId || ""}
              onChange={(e) =>
                setSelectedCompetitorId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="">경쟁사 선택</option>
              {competitors.map((c) => (
                <option key={c.competitorId} value={c.competitorId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source Toggles */}
          <div className="flex items-center gap-2.5 border-l border-gray-200/30 group-hover:border-gray-200 pl-4">
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700">
              NAVER
            </span>
            <button
              onClick={() =>
                setSelectedSources((prev) => ({
                  ...prev,
                  naver: !prev.naver,
                }))
              }
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all ${
                selectedSources.naver
                  ? "bg-green-500/60 group-hover:bg-green-500"
                  : "bg-gray-200/40 group-hover:bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${
                  selectedSources.naver ? "translate-x-4.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2.5 border-l border-gray-200/30 group-hover:border-gray-200 pl-4">
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700">
              YOUTUBE
            </span>
            <button
              onClick={() =>
                setSelectedSources((prev) => ({
                  ...prev,
                  youtube: !prev.youtube,
                }))
              }
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all ${
                selectedSources.youtube
                  ? "bg-red-500/60 group-hover:bg-red-500"
                  : "bg-gray-200/40 group-hover:bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${
                  selectedSources.youtube
                    ? "translate-x-4.5"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Error & Loading */}
      {error && (
        <div className="w-full bg-white border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900 mb-0.5">
                오류가 발생했습니다
              </h3>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="w-full bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                데이터를 불러오는 중...
              </p>
              <p className="text-xs text-gray-500">잠시만 기다려주세요</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && selectedCompetitorId && (
        <div className="space-y-14">
          {/* 섹션 1: 언급량 비교 분석 */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">
                Mention Comparison
              </h3>
              <div className="h-px flex-1 bg-slate-200 opacity-50" />
            </div>
            <div className="w-full bg-white flex flex-col border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="p-4">
                {/* 요약 카드 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="group bg-gradient-to-br from-indigo-50/50 to-white p-5 rounded-2xl border border-indigo-100 hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-indigo-600">
                      <Icons.Shield />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Brand
                        </span>
                        <div className="text-indigo-500">
                          <Icons.Shield />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium mb-1">
                        {brandDailyStats.length > 0 &&
                        competitorDailyStats.length > 0
                          ? `${brandDailyStats[0]?.statDate || ""} ~ ${
                              brandDailyStats[brandDailyStats.length - 1]
                                ?.statDate || ""
                            }`
                          : "분석 기간"}
                      </p>
                      <p className="text-[13px] text-gray-600 font-bold mb-1">
                        브랜드 분석 대상
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-black text-gray-800">
                          {brandName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="group bg-gradient-to-br from-blue-50/50 to-white p-5 rounded-2xl border border-blue-100 hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-blue-600">
                      <Icons.Shield />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Competitor
                        </span>
                        <div className="text-blue-500">
                          <Icons.Shield />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium mb-1">
                        {brandDailyStats.length > 0 &&
                        competitorDailyStats.length > 0
                          ? `${competitorDailyStats[0]?.statDate || ""} ~ ${
                              competitorDailyStats[
                                competitorDailyStats.length - 1
                              ]?.statDate || ""
                            }`
                          : "분석 기간"}
                      </p>
                      <p className="text-[13px] text-gray-600 font-bold mb-1">
                        경쟁사 분석 대상
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-black text-gray-800">
                          {selectedCompetitor?.name || "경쟁사"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 언급량 추이 비교 차트 */}
                <div className="w-full bg-white border border-slate-200 rounded-[2rem] p-10 min-h-[350px]">
                  {mentionComparisonChartData ? (
                    <div className="h-[300px]">
                      <Line
                        data={mentionComparisonChartData}
                        options={{
                          ...baseChartOptions,
                          plugins: {
                            ...baseChartOptions.plugins,
                            legend: {
                              display: true,
                              position: "top",
                              labels: {
                                usePointStyle: true,
                                padding: 10,
                                font: { size: 11, weight: "500" },
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
                                font: { size: 10 },
                              },
                            },
                            x: {
                              ticks: { font: { size: 10 } },
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-slate-400 text-sm">
                      데이터가 없습니다
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 섹션 2: 긍부정 비교 분석 */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm">
                <Heart size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">
                Sentiment Comparison
              </h3>
              <div className="h-px flex-1 bg-slate-200 opacity-50" />
            </div>
            <div className="w-full bg-white flex flex-col border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="p-4">
                {/* 요약 카드 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* 브랜드 긍정 최고 */}
                  {brandSentimentAverages.pos > 0 && (
                    <div className="group bg-gradient-to-br from-blue-50/50 to-white p-5 rounded-2xl border border-blue-100 hover:shadow-md transition-all relative overflow-hidden">
                      <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-blue-600">
                        <Icons.TrendingUp />
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Brand Positive
                          </span>
                          <div className="text-blue-500">
                            <Icons.TrendingUp />
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium mb-1">
                          긍정 감성이 가장 높은 브랜드
                        </p>
                        <p className="text-[13px] text-gray-600 font-bold mb-1">
                          브랜드 평균 긍정도
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-2xl font-black text-gray-800">
                            {brandName} {brandPositiveRatioText}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 경쟁사 부정 최고 */}
                  {competitorSentimentAverages.neg > 0 && (
                    <div className="group bg-gradient-to-br from-rose-50/50 to-white p-5 rounded-2xl border border-rose-100 hover:shadow-md transition-all relative overflow-hidden">
                      <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-rose-600">
                        <Icons.TrendingDown />
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Competitor Negative
                          </span>
                          <div className="text-rose-500">
                            <Icons.TrendingDown />
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium mb-1">
                          부정 감성이 가장 높은 경쟁사
                        </p>
                        <p className="text-[13px] text-gray-600 font-bold mb-1">
                          경쟁사 평균 부정도
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-2xl font-black text-gray-800">
                            {selectedCompetitor?.name || "경쟁사"}{" "}
                            {competitorSentimentAverages.neg.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 브랜드 부정 최고 (경쟁사 부정이 없을 때) */}
                  {competitorSentimentAverages.neg === 0 &&
                    brandSentimentAverages.neg > 0 && (
                      <div className="group bg-gradient-to-br from-red-50/50 to-white p-4 rounded-xl border border-red-100 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
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
                                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 mb-0.5">
                              부정 감성이 가장 높은 분석 단어
                            </p>
                            <p className="text-lg font-bold text-red-700">
                              {brandName}{" "}
                              {brandSentimentAverages.neg.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* 경쟁사 긍정 최고 (브랜드 긍정이 없을 때) */}
                  {brandSentimentAverages.pos === 0 &&
                    competitorSentimentAverages.pos > 0 && (
                      <div className="group bg-gradient-to-br from-blue-50/50 to-white p-4 rounded-xl border border-blue-100 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
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
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 mb-0.5">
                              긍정 감성이 가장 높은 분석 단어
                            </p>
                            <p className="text-lg font-bold text-blue-700">
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
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-800">
                        {brandName}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        브랜드 분석
                      </p>
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
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-800">
                        {selectedCompetitor?.name || "경쟁사"}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        경쟁사 분석
                      </p>
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
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        긍·부정 추이 비교
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">
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
                          className={`px-3 py-1 rounded-lg font-medium text-xs transition-all ${
                            selectedSentiment === sentiment.value
                              ? sentiment.value === "POS"
                                ? "bg-blue-500 text-white"
                                : sentiment.value === "NEG"
                                ? "bg-red-500 text-white"
                                : "bg-gray-500 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {sentiment.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-white border border-slate-200 rounded-[2rem] p-10 min-h-[350px]">
                  {combinedSentimentChartData ? (
                    <div className="h-[350px]">
                      <Line
                        data={combinedSentimentChartData}
                        options={baseChartOptions}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-slate-400 text-sm">
                      데이터가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {!loading && !error && !selectedCompetitorId && (
        <div className="w-full bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
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
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                경쟁사를 선택하세요
              </p>
              <p className="text-xs text-gray-500">
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
