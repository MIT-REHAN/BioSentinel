'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  Dna, Trash2, Clock, FileText, BarChart3, Shield,
  ChevronDown, ChevronRight, AlertCircle, Info, ArrowLeft,
  Download, User, LogOut, Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading, history, deleteFromHistory, clearExpired, logout } = useAuth();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewResultId, setViewResultId] = useState<string | null>(null);
  const [expiredCount, setExpiredCount] = useState(0);
  const hasClearedRef = useRef(false);

  // Clear expired entries once on mount (guarded by ref to prevent re-runs)
  useEffect(() => {
    if (user && !isLoading && !hasClearedRef.current) {
      hasClearedRef.current = true;
      const removed = clearExpired();
      setExpiredCount(removed);
    }
  }, [user, isLoading, clearExpired]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mb-4">
          <Dna className="w-5 h-5 text-secondary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
        <p className="text-sm text-muted-foreground mb-6">You need to log in to access your analysis dashboard.</p>
        <Link
          href="/login"
          className="px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:opacity-90 transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setConfirmDeleteId(null);
  };

  const handleExportJSON = (entry: any) => {
    const json = JSON.stringify(entry.result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biosentinel-${entry.fileName.replace('.vcf', '')}-${entry.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <Dna className="w-4 h-4 text-secondary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">Bio<span className="text-secondary">Sentinel</span></span>
          </Link>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:block"
          >
            New Analysis
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline text-muted-foreground">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-chart-5 transition rounded-lg hover:bg-chart-5/5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="px-6 py-10 max-w-7xl mx-auto space-y-8 animate-slide-in-up">
        {/* Header Stats */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Analysis Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your VCF analysis history. Files auto-delete after 1 week.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total Analyses" value={history.length.toString()} />
          <StatCard
            icon={BarChart3}
            label="Avg. Grade"
            value={history.length > 0 ? getMostCommonGrade(history.map(h => h.grade)) : '--'}
          />
          <StatCard
            icon={Shield}
            label="High Risk"
            value={history.filter(h => h.overallRisk === 'high').length.toString()}
          />
          <StatCard
            icon={Activity}
            label="Avg. Reliability"
            value={history.length > 0 ? `${(history.reduce((a, h) => a + h.reliability, 0) / history.length).toFixed(1)}%` : '--'}
          />
        </div>

        {/* Auto-delete Notice */}
        <div className="flex items-start gap-3 p-4 bg-chart-4/5 border border-chart-4/20 rounded-xl">
          <Info className="w-4 h-4 text-chart-4 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-chart-4 font-medium">Auto-delete Policy</p>
            <p className="text-muted-foreground mt-1">
              Analysis results are automatically deleted after 1 week. You can also delete any entry manually at any time.
              {expiredCount > 0 && ` ${expiredCount} expired entry(ies) were just cleaned up.`}
            </p>
          </div>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="p-12 bg-card rounded-2xl border border-border text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Analysis History</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Upload a VCF file to see your analysis results here. Results are saved automatically when you are logged in.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:opacity-90 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Start Analysis
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Analyses ({history.length})
              </h2>
            </div>

            {history.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const isConfirmingDelete = confirmDeleteId === entry.id;

              return (
                <div key={entry.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:border-secondary/30 transition">
                  {/* Row Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm truncate">{entry.fileName}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getGradeColor(entry.grade)}`}>
                              {entry.grade}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${getRiskColor(entry.overallRisk)}`}>
                              {entry.overallRisk}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {entry.totalVariants.toLocaleString()} variants | {entry.pharmacogeneCount} pharmacogenes | {entry.reliability.toFixed(1)}% reliable
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">{getTimeAgo(entry.uploadedAt)}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {getTimeRemaining(entry.expiresAt)}
                          </p>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-border">
                      <div className="pt-4 space-y-4">
                        {/* Summary */}
                        <div className="p-4 bg-muted/50 rounded-xl">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Summary</p>
                          <p className="text-sm text-muted-foreground">{entry.summary}</p>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <MiniStat label="Variants" value={entry.totalVariants.toLocaleString()} />
                          <MiniStat label="Pharmacogenes" value={entry.pharmacogeneCount.toString()} />
                          <MiniStat label="Grade" value={entry.grade} />
                          <MiniStat label="Reliability" value={`${entry.reliability.toFixed(1)}%`} />
                        </div>

                        {/* Timestamps */}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Uploaded: {new Date(entry.uploadedAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3" />
                            Expires: {new Date(entry.expiresAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleExportJSON(entry)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Export JSON
                          </button>

                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="px-4 py-2 text-sm bg-chart-5 text-background rounded-lg hover:opacity-90 transition"
                              >
                                Confirm Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(entry.id)}
                              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border text-muted-foreground hover:text-chart-5 hover:border-chart-5/30 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-border mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">2026 BioSentinel. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition">Home</Link>
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-5 bg-card rounded-2xl border border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold font-mono mt-1">{value}</p>
        </div>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-background rounded-lg text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-base font-bold font-mono mt-0.5">{value}</p>
    </div>
  );
}

function getGradeColor(grade: string) {
  switch (grade) {
    case 'A': return 'bg-chart-3 text-background';
    case 'B': return 'bg-secondary text-secondary-foreground';
    case 'C': return 'bg-chart-4 text-background';
    case 'D': return 'bg-chart-4 text-background';
    case 'F': return 'bg-chart-5 text-background';
    default: return 'bg-muted text-foreground';
  }
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'high': return 'bg-chart-5/10 text-chart-5';
    case 'moderate': return 'bg-chart-4/10 text-chart-4';
    case 'low': return 'bg-chart-3/10 text-chart-3';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getMostCommonGrade(grades: string[]) {
  const counts: Record<string, number> = {};
  grades.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '--';
}
