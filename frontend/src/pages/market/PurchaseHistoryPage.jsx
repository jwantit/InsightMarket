import PurchaseFilterSection from "../../components/maket/PurchaseFilterSection";
import PurchaseComponent from "../../components/maket/PurchaseComponent";
import { useSearchParams } from "react-router-dom";
import { Receipt } from "lucide-react";

const PurchaseHistoryPage = () => {
  const [params, setParams] = useSearchParams();

  const fromDate = params.get("from") || "";
  const toDate = params.get("to") || "";
  const sort = params.get("sort") || "latest";

  const updateFilter = (f, t, s) => {
    setParams({ from: f, to: t, sort: s });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Receipt size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              구매 내역
            </h1>
            <p className="text-sm text-slate-500">
              과거 구매한 AI 솔루션 내역을 확인하세요.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <PurchaseFilterSection
          fromDate={fromDate}
          toDate={toDate}
          setParams={setParams}
          sort={sort}
          updateFilter={updateFilter}
        />

        <PurchaseComponent params={params} />
      </div>
    </div>
  );
};

export default PurchaseHistoryPage;
