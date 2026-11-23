import { BackButton, PageHeader } from '../../../../components';

export default function LogDetailsHeader({ onBack }) {
  return <div>
    <PageHeader title="Audit Log History Details" subtitle="Review the recorded activity, account or record involved, and available changes." />
    <div className="flex flex-wrap items-center gap-4 mt-5">
      <BackButton onClick={onBack} />
      <span className="font-inter font-medium text-[#0a1e3f]" style={{ fontSize: '16px' }}>Audit log history details.</span>
    </div>
  </div>;
}
