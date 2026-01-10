/** -----------------------------
 * Design Tokens (Dashboard)
 * ----------------------------- */
export const TOKENS = {
  color: {
    positive: "#22C55E", // green-500
    negative: "#EF4444", // red-500
    neutral: "#9CA3AF", // gray-400
    primary: "#6366F1", // indigo-500 (active/selection)
    grid: "#E5E7EB",
    axis: "#9CA3AF",
    text: "#111827",
    subtext: "#4B5563",
  },
  badge: {
    POS: { bg: "#DCFCE7", text: "#166534" },
    NEG: { bg: "#FEE2E2", text: "#991B1B" },
    NEU: { bg: "#F3F4F6", text: "#374151" },
  },
};

/** -----------------------------
 * Chart.js plugins
 * - doughnut center text
 * ----------------------------- */
export const doughnutCenterTextPlugin = {
  id: "doughnutCenterText",
  afterDraw(chart, args, pluginOptions) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;

    const centerX = meta.data[0].x;
    const centerY = meta.data[0].y;

    const title = pluginOptions?.title ?? "";
    const subtitle = pluginOptions?.subtitle ?? "";

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // title
    ctx.fillStyle = TOKENS.color.text;
    ctx.font = "700 18px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText(title, centerX, centerY - 6);

    // subtitle
    ctx.fillStyle = TOKENS.color.subtext;
    ctx.font = "500 12px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText(subtitle, centerX, centerY + 14);

    ctx.restore();
  },
};

/** -----------------------------
 * Utility functions
 * ----------------------------- */
export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const sentimentLabel = (s) => {
  if (s === "POS") return "긍정";
  if (s === "NEG") return "부정";
  return "중립";
};

export const sentimentColor = (s) => {
  if (s === "POS") return TOKENS.color.positive;
  if (s === "NEG") return TOKENS.color.negative;
  return TOKENS.color.neutral;
};

export const badgeStyle = (s) => TOKENS.badge[s] || TOKENS.badge.NEU;


