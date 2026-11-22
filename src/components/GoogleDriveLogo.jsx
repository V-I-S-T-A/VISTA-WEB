import googleDriveLogo from "../assets/shared/google-drive.png";

/** The same unmodified, locally bundled Google Drive asset used by VISTA Mobile. */
export default function GoogleDriveLogo({ size = 24, decorative = true, className = "", style }) {
  return (
    <img
      src={googleDriveLogo}
      width={size}
      height={size}
      alt={decorative ? "" : "Google Drive"}
      aria-hidden={decorative ? true : undefined}
      className={`google-drive-logo ${className}`}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, ...style }}
    />
  );
}
