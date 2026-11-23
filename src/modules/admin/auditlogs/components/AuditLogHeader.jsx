import AuditLogTable from "../../../../components/AuditLogTable";
import { presentAuditEvent } from "../auditPresentation";

export default function AuditLogHeader({ onViewLog }) {
  return <AuditLogTable onViewLog={onViewLog} includeAuthActions presentEvent={presentAuditEvent} />;
}
