import Paywall from "@/components/paywall";
export default function Distributions() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Distributions</h1>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Distribution analytics" description="Channel mix: which API customers ship which booking patterns. Co-occurrence matrix of supplier × customer × market. Helps Commercial spot under-utilised supply." />
      </div>
    </div>
  );
}
