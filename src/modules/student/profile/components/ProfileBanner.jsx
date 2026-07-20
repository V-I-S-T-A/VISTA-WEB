import banner from "../../../../assets/shared/vista_staff_landscape.png";

export default function ProfileBanner() {
  return (
    <div className="relative w-full h-[260px] overflow-hidden rounded-2xl">
      <img
        src={banner}
        alt="Profile Banner"
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
