import AuditLogTable from "../../../../components/AuditLogTable";

export default function AuditLogHeader({ onViewLog }) {
  return <AuditLogTable onViewLog={onViewLog} includeAuthActions />;
}
