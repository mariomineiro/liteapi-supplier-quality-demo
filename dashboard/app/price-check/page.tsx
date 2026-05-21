import Paywall from "@/components/paywall";
export default function PriceCheck() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Price Check <span style={{ fontSize: 11, padding: "2px 6px", background: "rgba(255,179,71,0.2)", color: "var(--warn)", borderRadius: 4, marginLeft: 8 }}>NEW</span></h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>Real-time rate-parity check against competitor sources.</p>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Price check (rate parity)" description="Live comparison of LiteAPI offered rates vs the same property on competitor sources. Quantifies undercut % and overcharge %. Critical for keeping API customers from leaving for the cheaper source." />
      </div>
    </div>
  );
}
