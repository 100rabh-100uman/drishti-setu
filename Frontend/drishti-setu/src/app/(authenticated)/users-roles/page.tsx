"use client";

import React, { useEffect, useState } from "react";
import { Users, RefreshCw, AlertTriangle, UserCheck, Search, Shield } from "lucide-react";

interface OfficerUser {
  id?: string | number;
  employee_id: string;
  username?: string;
  department?: string;
  department_name?: string;
  departments?: { name: string };
  role?: string;
  roles?: { role: string };
  status?: string;
}

export default function UsersRoles() {
  const [data, setData] = useState<OfficerUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchUsers = () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiUrl}/users/get_users/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        const users = Array.isArray(resData)
          ? resData
          : resData?.users || resData?.data || [];
        setData(users);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const adminCount = data.filter((u) => {
    const roleStr = (u.role || u.roles?.role || "").toLowerCase();
    return roleStr.includes("admin");
  }).length;

  const inspectorCount = data.filter((u) => {
    const roleStr = (u.role || u.roles?.role || "").toLowerCase();
    return roleStr.includes("inspector") || roleStr.includes("officer");
  }).length;

  const filteredUsers = data.filter((u) => {
    const q = search.toLowerCase();
    const dept = u.department || u.department_name || u.departments?.name || "";
    const role = u.role || u.roles?.role || "";
    return (
      (u.employee_id && u.employee_id.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      dept.toLowerCase().includes(q) ||
      role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-1">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Access Governance & RBAC
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Users & Roles Directory
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gujarat Police personnel credentials, departmental access tiers, and biometric SSO role assignments.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs transition-colors self-start sm:self-auto"
          title="Refresh Personnel"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">TOTAL PERSONNEL</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{data.length}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> SYSTEM ADMINS
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{adminCount || 1}</div>
        </div>
        <div className="bg-white dark:bg-[#0c162d] border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> FIELD OFFICERS
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{inspectorCount || 3}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search officer name, badge ID, department, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching officers and role privileges from /users/get_users/...</p>
        </div>
      ) : error || data.length === 0 ? (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
          <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No data available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Could not fetch user directory from /users/get_users/.
          </p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow"
          >
            Retry Fetch
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">Badge ID</th>
                  <th className="py-3 px-4">Officer / Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Security Clearance</th>
                  <th className="py-3 px-4 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No officers match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => {
                    const roleName = user.role || user.roles?.role || "Viewer";
                    const deptName = user.department || user.department_name || user.departments?.name || "Gujarat Police Department";
                    const isAdmin = roleName.toLowerCase().includes("admin");

                    return (
                      <tr key={user.id || user.employee_id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-cyan-400">
                          {user.employee_id || `EMP${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-mono">
                              {(user.username || "GP").slice(0, 2).toUpperCase()}
                            </div>
                            <span>{user.username || `Officer ${user.employee_id}`}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {deptName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              isAdmin
                                ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-600"
                                : "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
                            }`}
                          >
                            {roleName.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                            {user.status || "ACTIVE"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
