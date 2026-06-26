export default function SubmissionManagementHeader() {
  return (
    <div className="flex items-start justify-between w-full" style={{ marginBottom: '14px' }}>
      <div>
        <h2 className="font-inter font-bold text-[#142d55]" style={{ fontSize: '26px', lineHeight: 1.15 }}>
          Submission Management
        </h2>
        <p className="font-inter text-gray-500 mt-0.5" style={{ fontSize: '13px' }}>
          Review and process recent document submissions from student organizations.
        </p>
      </div>
    </div>
  )
}
