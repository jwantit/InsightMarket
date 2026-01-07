import PurchaseFilterSection from "../../components/maket/PurchaseFilterSection";
import PurchaseComponent from "../../components/maket/PurchaseComponent";
import { useSearchParams } from "react-router-dom";
import { History } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

const PurchaseHistoryPage = () => {
  const [params, setParams] = useSearchParams();

  const fromDate = params.get("from") || "";
  const toDate = params.get("to") || "";
  const sort = params.get("sort") || "latest";

  const updateFilter = (f, t, s) => {
    setParams({ from: f, to: t, sort: s });
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      <PageHeader
        icon={History}
        title="구매 내역"
        breadcrumb="Market / Purchase History"
        subtitle="구매한 AI 솔루션 리포트의 내역을 확인할 수 있습니다."
      />

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
