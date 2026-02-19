'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dna, Shield, Zap, TrendingUp, Upload, ArrowRight,
  FileJson, Target, Sparkles, BarChart3, Activity,
  CheckCircle2, ChevronRight, ChevronDown, LayoutDashboard, LogIn, User, LogOut,
  AlertCircle, HeartPulse, Microscope, FlaskConical,
  Database, BrainCircuit, Lock,   FileWarning, HardDrive,
} from 'lucide-react';
import Link from 'next/link';
import { FileUpload } from '@/components/file-upload';
import { DrugInput, type SupportedDrug } from '@/components/drug-input';
import { AnalysisResults } from '@/components/analysis-results';
import { parseVCFFile, validateVCFFile, analyzeDrugs } from '@/lib/vcf-parser';
import type { AnalysisResult, DrugAnalysis } from '@/lib/vcf-parser';
import { useAuth } from '@/lib/auth-context';

/* ============ HOOKS ============ */
function useCountUp(target: number, duration = 2000, trigger = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(interval); }
      setValue(Math.round(start * 10) / 10);
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration, trigger]);
  return value;
}

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setVisible(true); }); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ============ MAIN ============ */
export default function Home() {
  const { user, logout, addToHistory } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [drugAnalyses, setDrugAnalyses] = useState<DrugAnalysis[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<SupportedDrug[]>([]);
  const [vcfContent, setVcfContent] = useState<string | null>(null);
  const [vcfFile, setVcfFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState('');
  const [statsVisible, setStatsVisible] = useState(false);
  const uploadRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const howSection = useScrollReveal(0.1);
  const revealSection = useScrollReveal(0.1);
  const platformSection = useScrollReveal(0.1);


  const genomes = useCountUp(2547, 2200, statsVisible);
  const predictions = useCountUp(12843, 2200, statsVisible);
  const accuracy = useCountUp(98.7, 2200, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setStatsVisible(true); }); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToUpload = () => uploadRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleFileSelect = async (file: File, content: string) => {
    const validation = validateVCFFile(content);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid VCF file');
      return;
    }
    setValidationError('');
    setVcfContent(content);
    setVcfFile(file);
  };

  const canAnalyze = vcfContent !== null && selectedDrugs.length > 0;

  const runAnalysis = async () => {
    if (!vcfContent || !vcfFile || selectedDrugs.length === 0) {
      setValidationError('VCF file and Drug Name are both required for analysis');
      return;
    }
    setIsAnalyzing(true);
    setValidationError('');
    try {
      const result = parseVCFFile(vcfContent);
      result.fileName = vcfFile.name;
      const drugResults = analyzeDrugs(selectedDrugs, result.pharmacogenes);
      setAnalysisResult(result);
      setDrugAnalyses(drugResults);
      if (user) addToHistory(result);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadJSON = (result: AnalysisResult) => {
    const outputData = drugAnalyses.length > 0 ? { ...result, drugAnalysis: drugAnalyses } : result;
    const json = JSON.stringify(outputData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biosentinel-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ===== RESULTS VIEW ===== */
  if (analysisResult) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <nav className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center">
              <Dna className="w-4.5 h-4.5 text-secondary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Bio<span className="text-secondary">Sentinel</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-muted"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}
            <button
              onClick={() => {
                setAnalysisResult(null);
                setDrugAnalyses([]);
                setSelectedDrugs([]);
                setVcfContent(null);
                setVcfFile(null);
              }}
              className="px-5 py-2 bg-secondary text-secondary-foreground rounded-xl hover:opacity-90 transition font-semibold text-sm"
            >
              New Analysis
            </button>
          </div>
        </nav>
        <main className="px-6 py-10 max-w-7xl mx-auto">
          <AnalysisResults result={analysisResult} onDownload={handleDownloadJSON} drugAnalyses={drugAnalyses} />
        </main>
        <Footer />
      </div>
    );
  }

  /* ===== LANDING PAGE ===== */
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ==================== HERO - FULL BLACK ==================== */}
      <div className="bg-[#030303] text-[#F0F0F0]">
        {/* Nav */}
        <nav className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#00E6BE] rounded-xl flex items-center justify-center animate-glow">
              <Dna className="w-4.5 h-4.5 text-[#030303] logo-icon" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#F0F0F0]">
              Bio<span className="text-[#00E6BE]">Sentinel</span>
            </span>
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <a href="#platform" className="text-sm text-[#888] hover:text-[#00E6BE] transition font-medium">Platform</a>
            <a href="#features" className="text-sm text-[#888] hover:text-[#00E6BE] transition font-medium">Features</a>
            <a href="#how-it-works" className="text-sm text-[#888] hover:text-[#00E6BE] transition font-medium">How It Works</a>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#00E6BE] transition font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00E6BE]/10 border border-[#00E6BE]/20 rounded-xl text-sm text-[#00E6BE] font-medium">
                    <User className="w-3.5 h-3.5" />
                    {user.name.split(' ')[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="p-1.5 text-[#888] hover:text-[#DC2626] transition rounded-lg hover:bg-[#DC2626]/5"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#00E6BE] transition font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <button
                  onClick={scrollToUpload}
                  className="px-5 py-2.5 bg-[#00E6BE] text-[#030303] rounded-xl hover:shadow-lg hover:shadow-[#00E6BE]/20 transition-all font-semibold text-sm"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </nav>

        <section className="relative px-6 pt-24 pb-20 md:pt-36 md:pb-32 max-w-7xl mx-auto overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 opacity-[0.04] text-[#F0F0F0]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }} />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#00E6BE]/5 blur-[120px]" />
          </div>

          <div className="relative text-center max-w-4xl mx-auto animate-slide-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00E6BE]/10 border border-[#00E6BE]/20 rounded-full text-xs text-[#00E6BE] font-semibold tracking-wide uppercase mb-8">
              <Activity className="w-3.5 h-3.5" />
              Pharmacogenomic Intelligence Platform
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-balance text-[#F0F0F0]">
              {"The World's Most Trusted Platform for "}
              <span className="gradient-text-light">Precision Health</span>
            </h1>

            <p className="text-[#999] max-w-2xl mx-auto leading-relaxed text-lg md:text-xl mt-6">
              Where multiomic data and AI converge, and scientific breakthroughs happen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a
                href="#how-it-works"
                className="px-8 py-4 border-2 border-[#333] text-[#F0F0F0] rounded-xl hover:border-[#00E6BE]/40 hover:bg-[#00E6BE]/5 transition-all font-semibold text-center flex items-center justify-center gap-2"
              >
                Learn More
                <ChevronRight className="w-4 h-4" />
              </a>
              <button
                onClick={scrollToUpload}
                className="group px-8 py-4 bg-[#00E6BE] text-[#030303] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00E6BE]/25 transition-all flex items-center justify-center gap-2.5"
              >
                <Upload className="w-4 h-4" />
                Upload VCF File
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ==================== SCAN PORTAL / PLATFORM ==================== */}
      <section id="platform" ref={platformSection.ref} className="px-6 py-20 md:py-28 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Harness the full potential{' '}
            <br className="hidden sm:block" />
            of your <span className="gradient-text">precision health data.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Database,
              title: 'Manage',
              desc: 'Break down silos with a single source of truth for multimodal data.',
              accent: 'bg-secondary/10 text-secondary',
              borderHover: 'hover:border-secondary/40',
            },
            {
              icon: BrainCircuit,
              title: 'Analyze',
              desc: 'Use AI to build cohorts and to generate insights faster with an intuitive user interface.',
              accent: 'bg-chart-3/10 text-chart-3',
              borderHover: 'hover:border-chart-3/40',
            },
            {
              icon: Lock,
              title: 'Collaborate',
              desc: 'Enable breakthrough science at scale with regulatory-grade security.',
              accent: 'bg-chart-6/10 text-chart-6',
              borderHover: 'hover:border-chart-6/40',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`card-slide-rtl ${platformSection.visible ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className={`group p-8 bg-card rounded-2xl border border-border ${item.borderHover} transition-all h-full glow-hover`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${item.accent} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section ref={statsRef} className="px-6 py-14 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Dna, label: 'Genomes Analyzed', value: Math.round(genomes).toLocaleString(), color: 'text-secondary', bg: 'bg-secondary/10', borderColor: 'border-secondary/20' },
            { icon: Zap, label: 'Risk Predictions', value: Math.round(predictions).toLocaleString(), color: 'text-chart-3', bg: 'bg-chart-3/10', borderColor: 'border-chart-3/20' },
            { icon: TrendingUp, label: 'Accuracy Rate', value: `${accuracy.toFixed(1)}%`, color: 'text-chart-4', bg: 'bg-chart-4/10', borderColor: 'border-chart-4/20' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`group p-7 bg-card rounded-2xl border glow-hover ${stat.borderColor}`}
                style={{
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 150}ms`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">{stat.label}</p>
                    <p className="text-4xl font-bold tabular-nums font-mono mt-3 text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" ref={howSection.ref} className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/25 rounded-full text-xs text-secondary font-semibold uppercase tracking-wider mb-5">
            <FlaskConical className="w-3.5 h-3.5" />
            Analysis Pipeline
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            How <span className="gradient-text">BioSentinel</span> Works
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            Four stages from raw genomic data to actionable clinical insights
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', icon: Upload, title: 'Upload VCF File', desc: 'Drag and drop your VCF file. VCFv4.x from any platform. Data stays in your browser.', color: 'bg-secondary', borderColor: 'hover:border-secondary/40' },
            { step: '02', icon: BarChart3, title: 'Quality Scoring', desc: 'Phred-scale accuracy, Ti/Tv validation, filter sensitivity, and five weighted criteria generate a quality grade.', color: 'bg-chart-3', borderColor: 'hover:border-chart-3/40' },
            { step: '03', icon: Dna, title: 'Pharmacogene Detection', desc: 'rsID matching against PharmGKB/CPIC for 12 loci including CYP2D6, CYP3A4, TPMT, DPYD with phenotype classification.', color: 'bg-chart-4', borderColor: 'hover:border-chart-4/40' },
            { step: '04', icon: FileJson, title: 'Report & Export', desc: 'Risk assessments, drug analysis, clinical recommendations, data value insights, and full JSON export.', color: 'bg-chart-6', borderColor: 'hover:border-chart-6/40' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`card-slide-rtl ${howSection.visible ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className={`relative p-7 bg-card rounded-2xl border border-border ${item.borderColor} transition-all h-full group glow-hover`}>
                  <div className={`absolute -top-3.5 left-6 px-4 py-1.5 ${item.color} text-background text-[11px] font-bold rounded-full shadow-sm tracking-wider`}>
                    STEP {item.step}
                  </div>
                  <div className="pt-5">
                    <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mb-5 group-hover:bg-secondary/10 transition">
                      <Icon className="w-7 h-7 text-foreground group-hover:text-secondary transition" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section id="features" ref={revealSection.ref} className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-chart-3/10 border border-chart-3/25 rounded-full text-xs text-chart-3 font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Capabilities
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            What Your <span className="gradient-text">Data Reveals</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            Every VCF file holds valuable insights. Here is what BioSentinel extracts.
          </p>
        </div>
        {/* Top row: 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {[
            { icon: Target, title: 'Accuracy Metrics', desc: 'Phred-scale variant call accuracy, genotype quality, Ti/Tv validation, and filter sensitivity.', accent: 'bg-secondary/10 text-secondary', borderColor: 'hover:border-secondary/40' },
            { icon: Dna, title: 'Pharmacogene Detection', desc: 'CYP2D6, CYP3A4, TPMT, CYP2C19, DPYD with phenotype classification and risk levels.', accent: 'bg-chart-3/10 text-chart-3', borderColor: 'hover:border-chart-3/40' },
            { icon: HeartPulse, title: 'Drug-Specific Analysis', desc: 'Select drugs for personalized risk assessment, gene-drug interaction mapping, and dosing guidance.', accent: 'bg-chart-4/10 text-chart-4', borderColor: 'hover:border-chart-4/40' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`card-slide-ltr ${revealSection.visible ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className={`group p-7 bg-card rounded-2xl border border-border ${f.borderColor} transition-all h-full glow-hover`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${f.accent} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Bottom row: 2 cards centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {[
            { icon: BarChart3, title: 'Quality Score & Grade', desc: 'A-F grading across five weighted criteria: data completeness, variant quality, coverage depth, Ti/Tv ratio, and clinical relevance.', accent: 'bg-chart-6/10 text-chart-6', borderColor: 'hover:border-chart-6/40' },
            { icon: FileJson, title: 'Full JSON Export', desc: 'Download structured JSON with quality metrics, accuracy data, judging criteria, pharmacogenes, and drug analysis.', accent: 'bg-chart-4/10 text-chart-4', borderColor: 'hover:border-chart-4/40' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`card-slide-ltr ${revealSection.visible ? 'visible' : ''}`}
                style={{ transitionDelay: `${(i + 3) * 120}ms` }}
              >
                <div className={`group p-7 bg-card rounded-2xl border border-border ${f.borderColor} transition-all h-full glow-hover`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${f.accent} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== UPLOAD SECTION ==================== */}
      <section ref={uploadRef} className="px-6 py-20 max-w-7xl mx-auto">
        <div className="bg-card rounded-2xl border border-border p-8 md:p-12 glow-hover">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-balance text-foreground">
              Upload <span className="gradient-text">Genomic Data</span>
            </h2>
            <p className="text-center text-muted-foreground mb-10 leading-relaxed">
              Securely upload your VCF file and select drug(s) for instant pharmacogenomic analysis
            </p>

            {/* Step 1: VCF Upload */}
            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${vcfContent ? 'bg-secondary text-secondary-foreground' : 'bg-chart-3 text-background'}`}>
                  {vcfContent ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <span className="text-sm font-bold text-foreground">Upload VCF File</span>
                {vcfFile && <span className="text-xs text-secondary font-mono ml-auto">{vcfFile.name}</span>}
              </div>

              {/* File Size Limit Indicator */}
              <div className="mb-3 flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
                <HardDrive className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground font-medium">Max file size: 5 MB</span>
                    {vcfFile && (
                      <span className={`text-xs font-mono ${vcfFile.size > 5 * 1024 * 1024 ? 'text-chart-5' : 'text-secondary'}`}>
                        {(vcfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        vcfFile
                          ? vcfFile.size > 5 * 1024 * 1024
                            ? 'bg-chart-5'
                            : vcfFile.size > 3.5 * 1024 * 1024
                              ? 'bg-chart-4'
                              : 'bg-secondary'
                          : 'bg-border'
                      }`}
                      style={{ width: vcfFile ? `${Math.min((vcfFile.size / (5 * 1024 * 1024)) * 100, 100)}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>

              <FileUpload onFileSelect={handleFileSelect} isLoading={isAnalyzing} />
            </div>

            {/* Step 2: Drug Input */}
            <div className={`mb-8 transition-all duration-500 ${vcfContent ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2 pointer-events-none'}`}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedDrugs.length > 0 ? 'bg-secondary text-secondary-foreground' : vcfContent ? 'bg-chart-3 text-background' : 'bg-muted text-muted-foreground'}`}>
                  {selectedDrugs.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                </div>
                <span className="text-sm font-bold text-foreground">Select Drug(s) for Analysis</span>
                {selectedDrugs.length > 0 && (
                  <span className="text-xs text-secondary font-mono ml-auto">
                    {selectedDrugs.length} drug{selectedDrugs.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              <DrugInput
                selectedDrugs={selectedDrugs}
                onDrugsChange={setSelectedDrugs}
                disabled={!vcfContent || isAnalyzing}
              />
            </div>

            {/* Validation error */}
            {validationError && (
              <div className="mb-6 flex items-start gap-2 p-4 bg-chart-5/5 border border-chart-5/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-chart-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-chart-5 font-medium">{validationError}</p>
                  {validationError.toLowerCase().includes('invalid') && (
                    <p className="text-xs text-chart-5/70 mt-1">
                      Ensure your file starts with ##fileformat=VCFv4.x and contains proper tab-separated variant data.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Run Analysis */}
            <button
              onClick={runAnalysis}
              disabled={!canAnalyze || isAnalyzing}
              className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                canAnalyze && !isAnalyzing
                  ? 'bg-secondary text-secondary-foreground hover:shadow-lg hover:shadow-secondary/25 cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Analyzing {vcfFile?.name} with {selectedDrugs.length} drug(s)...
                </>
              ) : (
                <>
                  <Dna className="w-4 h-4" />
                  {canAnalyze
                    ? `Run Analysis (${selectedDrugs.length} drug${selectedDrugs.length > 1 ? 's' : ''})`
                    : !vcfContent ? 'Upload VCF file first' : 'Select at least one drug'
                  }
                  {canAnalyze && <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
              {[
                { icon: Shield, title: 'Client-Side Only', desc: 'Your data never leaves the browser during parsing.', color: 'text-secondary' },
                { icon: Zap, title: 'Instant Results', desc: 'Quality scoring, accuracy, and JSON export in seconds.', color: 'text-chart-3' },
                { icon: CheckCircle2, title: 'Clinical Grade', desc: 'CPIC-aligned with transparent judging criteria.', color: 'text-chart-4' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="text-center p-6 rounded-xl bg-muted/50 group hover:bg-muted transition">
                    <div className={`flex justify-center mb-3 ${f.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}



/* ============ FOOTER ============ */
function Footer() {
  const linkClass = 'text-[#999] hover:text-[#00E6BE] transition-colors duration-200 text-sm leading-relaxed';
  return (
    <footer className="relative mt-16">
      {/* Glow divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00A88A]/30 to-transparent" aria-hidden="true" />

      <div className="bg-[#050505] text-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
          {/* 4-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Column 1: About */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-[#00E6BE] rounded-xl flex items-center justify-center">
                  <Dna className="w-4 h-4 text-[#030303]" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#F0F0F0]">
                  Bio<span className="text-[#00E6BE]">Sentinel</span>
                </span>
              </div>
              <p className="text-sm text-[#777] leading-relaxed mb-4">
                BioSentinel is an AI-powered pharmacogenomic intelligence platform that analyzes genomic VCF data to predict drug risks, generate clinical recommendations, and enable precision medicine through secure, client-side genomic analysis.
              </p>
              <p className="text-xs text-[#00E6BE]/80 font-semibold italic mb-4">
                Guarding Precision Medicine Through Genomic Intelligence.
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#555] uppercase tracking-wider font-semibold">
                <span>Client-Side Processing</span>
                <span aria-hidden="true">&bull;</span>
                <span>CPIC-Aligned Analysis</span>
                <span aria-hidden="true">&bull;</span>
                <span>Secure Genomic Handling</span>
              </div>
            </div>

            {/* Column 2: Features */}
            <div>
              <h3 className="text-sm font-bold text-[#F0F0F0] uppercase tracking-wider mb-4">Features</h3>
              <ul className="space-y-2.5">
                {[
                  'Pharmacogenomic Intelligence',
                  'VCF File Analysis',
                  'Quality & Accuracy Scoring',
                  'Pharmacogene Detection',
                  'Clinical Risk Dashboard',
                  'JSON Report Export',
                ].map((item) => (
                  <li key={item}>
                    <a href="#features" className={linkClass}>{item}</a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[10px] text-[#555] font-mono">CYP2D6, CYP2C19, CYP2C9, DPYD, TPMT, SLCO1B1</p>
            </div>

            {/* Column 3: How It Works */}
            <div>
              <h3 className="text-sm font-bold text-[#F0F0F0] uppercase tracking-wider mb-4">How It Works</h3>
              <ol className="space-y-2.5 list-none">
                {[
                  'Upload VCF File',
                  'Enter Drug Name(s)',
                  'Analyze Pharmacogenomic Risks',
                  'View Results & Download JSON',
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00E6BE]/15 text-[#00E6BE] text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <a href="#how-it-works" className={linkClass}>{step}</a>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[10px] text-[#555] leading-relaxed">
                Four steps from raw genomic data to actionable clinical insights.
              </p>
            </div>

            {/* Column 4: Privacy & Support */}
            <div>
              <h3 className="text-sm font-bold text-[#F0F0F0] uppercase tracking-wider mb-4">Privacy & Support</h3>
              <ul className="space-y-2.5">
                {[
                  'Privacy Policy',
                  'Terms of Service',
                  'Data Security',
                  'Clinical Disclaimer',
                  'Contact Support',
                ].map((item) => (
                  <li key={item}>
                    <a href="#" className={linkClass}>{item}</a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[10px] text-[#555] leading-relaxed bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg px-3 py-2">
                All genomic data is processed securely in-browser and is not stored permanently.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-[#1A1A1A]">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-[11px] text-[#555]">
              <p>&copy; 2026 BioSentinel. All rights reserved.</p>
              <p className="text-center max-w-md">
                For research and educational purposes only. Not a substitute for professional medical advice.
              </p>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider font-semibold">
                <span className="text-[#00E6BE]/60">Client-Side Only</span>
                <span>&bull;</span>
                <span className="text-[#60A5FA]/60">Genomic Privacy First</span>
                <span>&bull;</span>
                <span className="text-[#FBBF24]/60">Clinical-Grade Transparency</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
