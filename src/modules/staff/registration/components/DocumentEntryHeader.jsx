export default function DocumentEntryHeader() {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2
        className="font-inter font-bold text-[#142d55]"
        style={{ fontSize: "var(--type-title)", lineHeight: 1.2 }}
      >
        Document Entry
      </h2>
      <p
        className="font-inter text-gray-500 mt-0.5"
        style={{ fontSize: "var(--type-body)" }}
      >
        Registration Portal.
      </p>
    </div>
  );
}
