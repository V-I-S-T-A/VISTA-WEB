const REQUIRED_FIELDS = {
  org_id: "organization",
  submitted_by: "submitter",
  academic_year_id: "academic year",
  doc_type_id: "document type",
  category_id: "category",
  title: "document title",
};

export function mergeRegistrationSuggestions(current, draft, manualFields, { categories = [], documentTypes = [] } = {}) {
  const suggestions = {
    org_id: draft.suggested_org_id,
    academic_year_id: draft.suggested_academic_year_id,
    category_id: categories.find(item => item.name === draft.suggested_category_name)?.category_id || draft.suggested_category_id,
    doc_type_id: documentTypes.find(item => item.name === draft.suggested_doc_type_name)?.doc_type_id || draft.suggested_doc_type_id,
    title: draft.display_name,
  };
  const next = { ...current };
  for (const [field, suggestion] of Object.entries(suggestions)) {
    if (!suggestion || manualFields.has(field)) continue;
    // A selected submitter pins their organization, including while OCR runs.
    if (field === "org_id" && current.org_id && current.submitted_by) continue;
    next[field] = suggestion;
  }
  if (String(next.org_id) !== String(current.org_id)) next.submitted_by = "";
  return next;
}

export function getRegistrationValidationError(form, { organizations, users }) {
  const missing = Object.entries(REQUIRED_FIELDS).filter(([key]) => !String(form[key] ?? "").trim()).map(([, label]) => label);
  if (missing.length) return `Please complete: ${missing.join(", ")}.`;
  const organization = organizations.find(item => String(item.org_id) === String(form.org_id));
  if (!organization || organization.is_active === false) return "The selected organization is no longer available. Please choose an active organization.";
  const submitter = users.find(item => String(item.user_id) === String(form.submitted_by));
  if (!submitter || submitter.is_active === false) return "The selected submitter is no longer available. Please choose an active user in this organization.";
  if (String(submitter.org_id) !== String(form.org_id)) return "The selected submitter does not belong to this organization. Please select the correct submitter before continuing.";
  return "";
}
