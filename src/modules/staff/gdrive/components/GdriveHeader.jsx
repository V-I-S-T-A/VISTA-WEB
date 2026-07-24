import { CloudUpload } from "lucide-react";

export default function GdriveHeader() {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2
        className="font-inter font-bold text-[#142d55]"
        style={{ fontSize: '26px', lineHeight: 1.15 }}
      >
        Google Drive Sync
      </h2>
      <p
        className="font-inter text-gray-500 mt-0.5"
        style={{ fontSize: '13px' }}
      >
        Sync your Google Drive Account.
      </p>
    </div>
  );
}
