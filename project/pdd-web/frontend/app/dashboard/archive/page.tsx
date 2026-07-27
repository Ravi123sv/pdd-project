"use client";

import { useEffect, useState } from "react";
import { useStore } from "../../../lib/store/useStore";
import { apiClient } from "../../../lib/api/client";
import {
  Search,
  Filter,
  Download,
  FileText,
  User,
  Calendar,
  MoreVertical,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default function ArchivePage() {
  const { user } = useStore();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // If hospital user, fetch hospital patients. If individual, fetch private/mock list.
        const targetId = user?.userType === 'hospital' ? user.hospitalId : user?.uid;
        const response = await apiClient.get(`/patients/${targetId || 'DEMO-UNIT'}`);
        setRecords(response.data);
      } catch (err) {
        console.error("Failed to fetch records", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Clinical Archive</h1>
          <p className="text-sm font-medium text-slate-500">Manage and review patient diagnostic history</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="neuro-button bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center space-x-2 text-sm">
            <Filter className="h-4 w-4" />
            <span>FILTER</span>
          </button>
          <button className="neuro-button bg-primary text-white flex items-center space-x-2 text-sm">
            <Download className="h-4 w-4" />
            <span>BULK EXPORT</span>
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, MRN, or date..."
              className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-12 pr-4 text-sm font-medium outline-none"
            />
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
            <span>SHOWING {records.length} RECORDS</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient / MRN</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modality</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SQI Score</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Technician</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                    </td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No clinical records found in the archive.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{record.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase">{record._id || 'MRN-7701'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase">
                        {record.testType || 'ECG'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <Calendar className="h-4 w-4 opacity-50" />
                        <span>{new Date(record.date || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary rounded-full"
                            style={{ width: `${record.quality || 95}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{record.quality || 95}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {record.technician || 'Dr. Sterling'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-primary">
                          <FileText className="h-4 w-4" />
                        </button>
                        <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
