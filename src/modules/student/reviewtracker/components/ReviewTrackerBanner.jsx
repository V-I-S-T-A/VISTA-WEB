import banner from "../../../../assets/shared/vista_staff_landscape.png";

export default function ReviewTrackerBanner() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height: "220px", marginBottom: "20px" }}
    >
      <img
        src={banner}
        alt="Review Tracker Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(17,58,110,0.18) 100%)",
        }}
      />
    </div>
  );
}
