import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaClipboardList } from "react-icons/fa";
import HeaderBox from "../../components/common/HeaderBox";
import { getAuditActions, getAuditLogs } from "../../services/adminService";

const AuditLogs = () => {
  const [filters, setFilters] = useState({
    action: "",
    user: "",
    dateFrom: "",
    dateTo: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  const queryParams = useMemo(() => {
    const params = {
      action: appliedFilters.action.trim() || undefined,
      user: appliedFilters.user.trim() || undefined,
      dateFrom: appliedFilters.dateFrom || undefined,
      dateTo: appliedFilters.dateTo || undefined,
      page,
      limit: 20,
    };
    return params;
  }, [appliedFilters, page]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-audit-logs", queryParams],
    queryFn: () => getAuditLogs(queryParams),
    keepPreviousData: true,
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Not authorized");
      } else {
        toast.error("Could not load audit logs");
      }
    },
  });

  const { data: actionData } = useQuery({
    queryKey: ["admin-audit-actions"],
    queryFn: getAuditActions,
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Not authorized");
      } else {
        toast.error("Could not load audit log actions");
      }
    },
  });

  const actionOptions = actionData?.items || [];

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const handleApply = (event) => {
    event.preventDefault();
    setAppliedFilters({ ...filters });
    setPage(1);
  };

  const handleReset = () => {
    const cleared = {
      action: "",
      user: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
  };

  const formatUser = (log) => {
    if (!log.user) return "System";
    if (typeof log.user === "string") return log.user;
    const name = log.user.name || "User";
    const email = log.user.email ? ` (${log.user.email})` : "";
    return `${name}${email}`;
  };

  const formatUserAgent = (ua) => {
    if (!ua) return "-";
    if (ua.length <= 60) return ua;
    return `${ua.slice(0, 60)}...`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-10 space-y-6">
        <HeaderBox
          icon={<FaClipboardList className="text-[#2563eb]" />}
          title="Audit Logs"
          subtitle="Review security and activity logs with filters and metadata."
        />

        <div className="bg-white/95 rounded-[26px] border border-[#f3e0d8] shadow-[0_18px_45px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#0f6b6f] via-[#159ca3] to-[#0f6b6f]" />

          <div className="p-4 sm:p-6 space-y-4">
            <form
              onSubmit={handleApply}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            >
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Action
                </label>
                <select
                  value={filters.action}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, action: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                >
                  <option value="">All actions</option>
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  User (email or id)
                </label>
                <input
                  type="text"
                  value={filters.user}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, user: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#0f6b6f] text-white hover:bg-[#0b5559]"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </form>

            {isLoading ? (
              <p className="text-sm text-gray-500">Loading audit logs...</p>
            ) : isError ? (
              <p className="text-sm text-red-500">
                Something went wrong while fetching audit logs.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4">Time</th>
                      <th className="py-2 pr-4">User</th>
                      <th className="py-2 pr-4">Action</th>
                      <th className="py-2 pr-4">IP</th>
                      <th className="py-2 pr-4">User-Agent</th>
                      <th className="py-2 pr-2">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-sm">
                          No logs found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      items.map((log) => (
                        <tr key={log._id} className="border-b last:border-0">
                          <td className="py-3 pr-4 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            {formatUser(log)}
                          </td>
                          <td className="py-3 pr-4 font-medium">
                            {log.action}
                          </td>
                          <td className="py-3 pr-4">{log.ipAddress || "-"}</td>
                          <td className="py-3 pr-4">
                            {formatUserAgent(log.userAgent)}
                          </td>
                          <td className="py-3 pr-2">
                            <button
                              type="button"
                              onClick={() => setSelectedLog(log)}
                              className="text-xs font-semibold text-teal-700 hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold text-gray-800">
                Audit Metadata
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-auto">
              <pre className="text-xs bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
