import Paywall from "@/components/paywall";
export default function Billing() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Billing &amp; Services</h1>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Billing &amp; Services" description="Per-API-customer subscription + usage billing. SaaS-tier revenue (platform tier) vs transactional revenue (per-booking). Critical for forecasting next quarter's recurring revenue." />
      </div>
    </div>
  );
}
