"use client";

import { useEffect, useState } from "react";
import { useStore } from "../../../lib/store/useStore";
import { apiClient } from "../../../lib/api/client";
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Mail,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Search,
  Trash2
} from "lucide-react";

export default function TeamManagementPage() {
  const { user } = useStore();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  const fetchTeam = async () => {
    try {
      // In the real app, this would hit the backend which queries Firestore or MongoDB
      const response = await apiClient.get(`/auth/hospital-team/${user?.hospitalId || 'HOSP-DEFAULT'}`);
      setTeam(response.data);
    } catch (err) {
      console.error("Failed to fetch team", err);
      // Fallback for demo if endpoint not ready
      setTeam([
        { id: "1", name: "Dr. Sarah Sterling", email: "s.sterling@hospital.org", role: "admin", status: "Active", key: "NS-HOSP1-992831" },
        { id: "2", name: "Marcus Wright", email: "m.wright@hospital.org", role: "technician", status: "Active", key: "NS-HOSP1-110293" },
        { id: "3", name: "Elena Gilbert", email: "e.gilbert@hospital.org", role: "technician", status: "Invited", key: "NS-HOSP1-443210" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [user]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/auth/invite-staff", {
        email: inviteEmail,
        name: inviteName,
        hospitalId: user?.hospitalId,
        invitedBy: user?.email
      });
      setShowAddModal(false);
      fetchTeam();
    } catch (err) {
      console.error("Failed to invite staff", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Team Management</h1>
          <p className="text-sm font-medium text-slate-500">Manage clinical staff and access protocols for {user?.hospitalName}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="neuro-button bg-primary text-white flex items-center space-x-2 text-sm shadow-lg shadow-primary/20"
        >
          <UserPlus className="h-4 w-4" />
          <span>INVITE PRACTITIONER</span>
        </button>
      </div>

      {/* Access Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-primary">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Licenses</p>
          <h4 className="text-2xl font-black text-foreground">12 / 20</h4>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-secondary">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
          <h4 className="text-2xl font-black text-foreground">4</h4>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-amber-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Keys</p>
          <h4 className="text-2xl font-black text-foreground">3</h4>
        </div>
      </div>

      {/* Team Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full h-11 bg-white dark:bg-slate-800 border border-border rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Practitioner</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Key</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                 Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" /></td>
                  </tr>
                ))
              ) : (
                team.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{member.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {member.role === 'admin' ? <ShieldCheck className="h-4 w-4 text-primary" /> : <Shield className="h-4 w-4 text-slate-400" />}
                        <span className="text-xs font-bold capitalize">{member.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Key className="h-3 w-3 text-slate-400" />
                        <code className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">{member.key}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        member.status === 'Active' ? 'bg-secondary/10 text-secondary' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-8 bg-white dark:bg-slate-900 shadow-2xl">
            <h3 className="text-xl font-black text-foreground mb-2">Invite Staff</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Generate a new clinical access key for a practitioner.</p>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Dr. Jane Watson"
                  className="neuro-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="j.watson@hospital.org"
                  className="neuro-input"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 neuro-button bg-slate-100 dark:bg-slate-800 text-slate-600 text-sm"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 neuro-button bg-primary text-white text-sm flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>SEND INVITE</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
