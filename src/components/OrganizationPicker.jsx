import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import api from "../lib/axios";
import { fetchOrganizationOptions, nextOrganizationPage, organizationOptions } from "../utils/organizationPicker";
import "./OrganizationPicker.css";

export default function OrganizationPicker({ id, value, onChange, disabled = false, error = "", selectedLabel = "" }) {
  const generatedId = useId();
  const controlId = id || `organization-${generatedId}`;
  const listId = `${controlId}-list`;
  const helpId = `${controlId}-help`;
  const errorId = `${controlId}-error`;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  const trigger = useRef(null);
  const list = useRef(null);
  const cache = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 350);
    return () => clearTimeout(timer);
  }, [input]);

  const selected = useQuery({
    queryKey: ["organizations", "detail", value],
    queryFn: async ({ signal }) => {
      const { data } = await api.get(`/organizations/${value}/`, { signal });
      return data;
    },
    enabled: !!value,
    staleTime: 5 * 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
  const options = useInfiniteQuery({
    queryKey: ["organizations", "picker", search],
    queryFn: ({ pageParam, signal }) => fetchOrganizationOptions(api, { page: pageParam, search, signal }),
    initialPageParam: 1,
    getNextPageParam: nextOrganizationPage,
    enabled: open && !disabled,
    staleTime: 60_000,
    gcTime: 120_000,
    retry: 1,
  });
  const organizations = useMemo(() => organizationOptions(options.data?.pages), [options.data]);
  const total = options.data?.pages[0]?.count || 0;
  const pendingSearch = input.trim() !== search;
  const activeIndex = organizations.findIndex(org => org.org_id === highlightedId);
  const activeOption = open && !pendingSearch && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;
  const selectedName = selected.data?.name || selectedLabel;

  useEffect(() => {
    if (!activeOption) return;
    list.current?.querySelector(`[id="${activeOption}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeOption]);

  function choose(org) {
    cache.setQueryData(["organizations", "detail", org.org_id], org);
    onChange(org.org_id);
    setOpen(false);
    trigger.current?.focus();
  }

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  function onSearchKey(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) && !pendingSearch && organizations.length) {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? organizations.length - 1
        : activeIndex < 0 ? (direction > 0 ? 0 : organizations.length - 1)
          : Math.max(0, Math.min(organizations.length - 1, activeIndex + direction));
      setHighlightedId(organizations[nextIndex].org_id);
    } else if (event.key === "Enter" && !pendingSearch && activeIndex >= 0) {
      event.preventDefault();
      choose(organizations[activeIndex]);
    }
  }

  return <div className="organization-picker" onKeyDown={event => {
    if (open && event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
  }} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={trigger} id={controlId} type="button" className="organization-picker-trigger"
      disabled={disabled} aria-expanded={open} aria-haspopup="listbox" aria-controls={open ? listId : undefined}
      aria-invalid={!!error} aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
      onClick={() => { setOpen(current => !current); setInput(""); setSearch(""); setHighlightedId(value || null); }}>
      <Building2 size={19} aria-hidden="true" />
      <span className="organization-picker-selected">
        {value ? <>
          <strong>{selected.data?.acronym || "Selected organization"}</strong>
          <span>{selectedName || (selected.isPending ? "Loading organization…" : "Organization details unavailable")}</span>
        </> : <span className="organization-picker-placeholder">Search and select an organization</span>}
      </span>
      <ChevronDown size={17} aria-hidden="true" />
    </button>
    <p id={helpId} className="organization-picker-help">Search by organization name or acronym.</p>
    {error && <p id={errorId} role="alert" className="organization-picker-error">{error}</p>}
    {value && selected.isError && <p role="alert" className="organization-picker-error">
      Could not load the selected organization. <button type="button" onClick={() => selected.refetch()}>Try again</button>
    </p>}
    {open && !disabled && <div className="organization-picker-panel">
      <div className="organization-picker-search">
        <Search size={17} aria-hidden="true" />
        <input autoFocus role="combobox" aria-label="Search organizations" aria-expanded="true" aria-autocomplete="list"
          aria-controls={listId} aria-activedescendant={activeOption} autoComplete="off"
          placeholder="Type a name or acronym…" value={input} disabled={disabled}
          onKeyDown={onSearchKey} onChange={event => { setInput(event.target.value); setHighlightedId(null); }} />
        <button type="button" aria-label="Close organization picker" onClick={close}><X size={16} /></button>
      </div>
      <div className="organization-picker-results" ref={list}>
        <div id={listId} role="listbox" aria-label="Organizations" aria-busy={pendingSearch || options.isFetching}>
          {!pendingSearch && organizations.map((org, index) => <button
            key={org.org_id} id={`${listId}-${index}`} type="button" role="option" tabIndex={-1}
            aria-selected={org.org_id === value} className={`organization-picker-option${org.org_id === highlightedId ? " is-highlighted" : ""}`}
            onMouseDown={event => event.preventDefault()} onMouseEnter={() => setHighlightedId(org.org_id)} onClick={() => choose(org)}>
            <span className="organization-picker-option-text">
              <strong>{org.acronym || "Organization"}{org.is_active === false && <small>Inactive</small>}</strong>
              <span>{org.name}</span>
            </span>
            {org.org_id === value && <Check size={18} aria-hidden="true" />}
          </button>)}
        </div>
        {(pendingSearch || options.isPending) && <p className="organization-picker-message" role="status"><Loader2 size={16} className="animate-spin" /> Searching organizations…</p>}
        {!pendingSearch && options.isError && <div className="organization-picker-message organization-picker-error" role="alert">
          Could not load organizations. <button type="button" onClick={() => options.isFetchNextPageError ? options.fetchNextPage() : options.refetch()}>Try again</button>
        </div>}
        {!pendingSearch && !options.isPending && !options.isError && !organizations.length && <p className="organization-picker-message" role="status">
          {search ? "No organizations match your search. Try another name or acronym." : "No organizations are available."}
        </p>}
      </div>
      {!pendingSearch && !!organizations.length && <div className="organization-picker-footer">
        <span role="status">Showing {organizations.length} of {total} organizations</span>
        {options.hasNextPage && <button type="button" disabled={options.isFetching} onClick={() => options.fetchNextPage()}>
          {options.isFetchingNextPage ? "Loading…" : "Load more"}
        </button>}
      </div>}
    </div>}
  </div>;
}
