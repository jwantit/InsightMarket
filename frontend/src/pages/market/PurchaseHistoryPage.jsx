// PurchaseHistoryPage.jsx
import PurchaseFilterSection from "../../components/maket/PurchaseFilterSection";
import PurchaseComponent from "../../components/maket/PurchaseComponent";
import { useSearchParams } from "react-router-dom";



const PurchaseHistoryPage = () => {
  const [params, setParams] = useSearchParams();

  const fromDate = params.get("from") || "";
  const toDate = params.get("to") || "";
  const sort = params.get("sort") || "latest";

  const updateFilter = (f, t, s) => {
    setParams({ from: f, to: t, sort: s });
  };

  return (
    <section className="min-h-screen bg-gray-50 p-10 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        구매 내역
      </h1>

      <div className="space-y-6">
        <PurchaseFilterSection
          fromDate={fromDate}
          toDate={toDate}
          setParams={setParams}
          sort={sort}
          updateFilter={updateFilter}
        />

        <PurchaseComponent
        params={params}
        />
      </div>
      
    </section>
  );
};

export default PurchaseHistoryPage;
