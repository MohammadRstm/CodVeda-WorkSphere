export function ImpactCard({ number, label }) {
  return (
    <div className="impact-card">
      <h3>{number}</h3>
      <p>{label}</p>
    </div>
  );
}
