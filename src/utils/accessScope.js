export function accessScope(user) {
  if (!user) return "anonymous";
  return JSON.stringify([user.user_id, user.role, user.org_id ?? null, user.org_joined_at ?? null]);
}

// Clear queries AND remount panels when a recognized membership/account changes.
// This includes older locally managed staff panels, attachment previews and drafts.
export async function reconcileAccessScope(queryClient, user, { preserveProfileRequest = false } = {}) {
  const previous = queryClient.getQueryData(["current_user"]);
  if (previous && accessScope(previous) !== accessScope(user)) {
    await queryClient.cancelQueries({ predicate: query => !["current_user", "me"].includes(query.queryKey[0]) });
    queryClient.removeQueries({ predicate: query => !["current_user", "me"].includes(query.queryKey[0]) });
    if (!preserveProfileRequest) queryClient.removeQueries({ queryKey: ["me"] });
  }
  return user;
}
