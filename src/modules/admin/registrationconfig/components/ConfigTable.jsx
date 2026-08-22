import { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  Loader2,
  Building2,
  Calendar,
  FileText,
  Tag,
} from "lucide-react";
import api from "../../../../lib/axios";

const CONTENT_PADDING = "30px";

export default function ConfigTable({
  activeTab,
  refreshTrigger,
  onEdit,
  onDelete,
}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getEndpoint = (tab) => {
    return `/${tab.replace("_", "-")}/`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(getEndpoint(activeTab));
        setData(response.data.results || response.data || []);
      } catch (error) {
        console.error(`Error fetching data for ${activeTab}:`, error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, refreshTrigger]);

  const getItemId = (item) => {
    return (
      item.org_id ||
      item.academic_year_id ||
      item.doc_type_id ||
      item.category_id ||
      item.id
    );
  };

  const renderEmptyIcon = () => {
    if (activeTab === "organizations")
      return <Building2 className="w-8 h-8 mb-3 text-gray-300" />;
    if (activeTab === "academic_years")
      return <Calendar className="w-8 h-8 mb-3 text-gray-300" />;
    if (activeTab === "document_types")
      return <FileText className="w-8 h-8 mb-3 text-gray-300" />;
    return <Tag className="w-8 h-8 mb-3 text-gray-300" />;
  };

  const getTableConfig = () => {
    switch (activeTab) {
      case "organizations":
        return {
          headers: [
            "ID",
            "NAME",
            "ACRONYM",
            "DESCRIPTION",
            "DATE ADDED",
            "ACTIONS",
          ],
          renderRow: (item) => (
            <>
              <td className="px-5 py-2.5">
                <p className="font-inter font-bold text-[#142d55] text-[15px]">
                  {item.name || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5">
                <p className="font-inter text-gray-600 font-medium text-[13px]">
                  {item.acronym || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5">
                <p
                  className="font-inter text-gray-600 font-medium text-[13px] truncate max-w-[200px]"
                  title={item.description}
                >
                  {item.description || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5">
                <p className="font-inter text-gray-600 font-medium text-[13px]">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </td>
            </>
          ),
        };
      case "categories":
        return {
          headers: ["ID", "NAME", "ACTIONS"],
          renderRow: (item) => (
            <>
              <td className="px-5 py-2.5">
                <p className="font-inter font-bold text-[#142d55] text-[15px]">
                  {item.name || "N/A"}
                </p>
              </td>
            </>
          ),
        };
      case "document_types":
        return {
          headers: ["ID", "NAME", "DESCRIPTION", "CODE", "ACTIONS"],
          renderRow: (item) => (
            <>
              <td className="px-5 py-2.5">
                <p className="font-inter font-bold text-[#142d55] text-[15px]">
                  {item.name || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5">
                <p
                  className="font-inter text-gray-600 font-medium text-[13px] truncate max-w-[250px]"
                  title={item.description}
                >
                  {item.description || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5">
                <span className="font-mono font-bold text-[#1f5cae] bg-blue-50 px-2.5 py-1 rounded text-[12px] border border-blue-100">
                  {item.code || "N/A"}
                </span>
              </td>
            </>
          ),
        };
      case "academic_years":
      default:
        return {
          headers: ["ID", "YEAR", "DATE ADDED", "ACTIONS"],
          renderRow: (item) => (
            <>
              <td className="px-5 py-2.5 w-1/3">
                <p className="font-inter font-bold text-[#142d55] text-[15px]">
                  {item.year || item.name || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5 w-1/3">
                <p className="font-inter text-gray-600 font-medium text-[13px]">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </td>
            </>
          ),
        };
    }
  };

  const { headers, renderRow } = getTableConfig();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
            {headers.map((heading) => (
              <th
                key={heading}
                className="px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500"
                style={
                  heading === "ID"
                    ? { paddingLeft: CONTENT_PADDING }
                    : undefined
                }
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-16 text-center">
                <div className="inline-flex flex-col items-center justify-center text-[#1f5cae]">
                  <Loader2 className="w-8 h-8 mb-3 animate-spin" />
                  <p className="font-inter text-[14px] font-medium">
                    Loading {activeTab.replace("_", " ")}...
                  </p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-16 text-center">
                <div className="inline-flex flex-col items-center justify-center text-gray-400">
                  {renderEmptyIcon()}
                  <p className="font-inter text-[14px] font-medium text-gray-500">
                    No{" "}
                    <span className="font-bold text-gray-700">
                      {activeTab.replace("_", " ")}
                    </span>{" "}
                    found in the database.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={getItemId(item)}
                className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
              >
                <td
                  className="px-5 py-2.5 min-w-[150px]"
                  style={{ paddingLeft: CONTENT_PADDING }}
                >
                  <span className="font-mono text-[12px] font-semibold text-gray-400">
                    {String(getItemId(item)).slice(0, 8).toUpperCase()}
                  </span>
                </td>

                {renderRow(item)}

                <td className="px-5 py-2.5 w-[100px]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-gray-400 hover:text-[#1f5cae] hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
