'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  AlertCircle,
  CheckCircle2,
  Loader,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  FileJson,
  BarChart3,
  Target,
  Sparkles,
  Activity,
  Dna,
  Info,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  FlaskConical,
} from 'lucide-react';
import type { AnalysisResult, DrugAnalysis } from '@/lib/vcf-parser';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onDownload: (data: AnalysisResult) => void;
  drugAnalyses?: DrugAnalysis[];
}

type TabId = 'overview' | 'drugs' | 'accuracy' | 'judging' | 'insights' | 'pharmacogenes' | 'json';

export function AnalysisResults({ result, onDownload, drugAnalyses = [] }: AnalysisResultsProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    generateExplanation();
  }, [result]);

  useEffect(() => {
    if (activeTab === 'judging' || activeTab === 'overview') {
      const target = result.judgingCriteria.overallScore;
      let current = 0;
      const step = target / 50;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        setAnimatedScore(Math.round(current));
      }, 20);
      return () => clearInterval(interval);
    }
  }, [activeTab, result.judgingCriteria.overallScore]);

  const generateExplanation = async () => {
    setIsLoadingExplanation(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacogenes: result.pharmacogenes,
          riskAssessment: result.riskAssessment,
          variants: result.variants.slice(0, 50),
        }),
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setExplanation(data.explanation);
    } catch {
      setExplanation('Unable to generate AI explanation. Displaying standard analysis report.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    ...(drugAnalyses.length > 0 ? [{ id: 'drugs' as TabId, label: `Drug Analysis (${drugAnalyses.length})`, icon: <FlaskConical className="w-4 h-4" /> }] : []),
    { id: 'accuracy', label: 'Accuracy', icon: <Target className="w-4 h-4" /> },
    { id: 'judging', label: 'Quality Score', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'insights', label: 'Data Value', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'pharmacogenes', label: 'Pharmacogenes', icon: <Dna className="w-4 h-4" /> },
    { id: 'json', label: 'JSON Output', icon: <FileJson className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Header Bar */}
      <div className="card-enter flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 sm:p-6 bg-card rounded-2xl border border-border">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold">Analysis Report</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
            {result.fileName} | {result.totalVariants.toLocaleString()} variants | {result.pharmacogenes.length} pharmacogenes{drugAnalyses.length > 0 ? ` | ${drugAnalyses.length} drug(s)` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base ${getGradeColor(result.judgingCriteria.grade)}`}>
            Grade {result.judgingCriteria.grade}
          </div>
          <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border ${getRiskBadgeColor(result.riskAssessment.overallRisk)}`}>
            {result.riskAssessment.overallRisk.toUpperCase()} RISK
          </div>
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-muted text-xs sm:text-sm font-mono">
            {result.accuracyMetrics.overallReliability.value.toFixed(1)}% reliable
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {[
          { label: 'Total Variants', value: result.totalVariants.toLocaleString() },
          { label: 'Passed Filter', value: result.qualityMetrics.passedVariants.toLocaleString() },
          { label: 'Median QUAL', value: result.qualityMetrics.medianQuality.toFixed(0) },
          { label: 'Ti/Tv Ratio', value: result.qualityMetrics.tiTvRatio.toString() },
          { label: 'SNPs / Indels', value: `${result.qualityMetrics.snpCount} / ${result.qualityMetrics.indelCount}` },
          { label: 'Confidence', value: result.judgingCriteria.confidenceLevel },
        ].map((stat, i) => (
          <div key={i} className="card-enter p-4 bg-card rounded-xl border border-border text-center" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-bold mt-1 font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-t-lg transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-card border border-b-0 border-border text-secondary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div key={activeTab} className="animate-tab-slide-in">
        {activeTab === 'overview' && (
          <OverviewTab result={result} explanation={explanation} isLoading={isLoadingExplanation} animatedScore={animatedScore} />
        )}
        {activeTab === 'drugs' && <DrugAnalysisTab drugAnalyses={drugAnalyses} />}
        {activeTab === 'accuracy' && <AccuracyTab result={result} />}
        {activeTab === 'judging' && <JudgingTab result={result} animatedScore={animatedScore} />}
        {activeTab === 'insights' && <InsightsTab result={result} />}
        {activeTab === 'pharmacogenes' && <PharmacogenesTab result={result} />}
        {activeTab === 'json' && (
          <JSONTab result={result} jsonExpanded={jsonExpanded} setJsonExpanded={setJsonExpanded} copied={copied} copyJSON={copyJSON} drugAnalyses={drugAnalyses} />
        )}
      </div>

      {/* Download */}
      <button
        onClick={() => onDownload(result)}
        className="w-full px-6 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        Download Full Report as JSON
      </button>
    </div>
  );
}

/* ==================== OVERVIEW TAB ==================== */
function OverviewTab({
  result, explanation, isLoading, animatedScore
}: {
  result: AnalysisResult; explanation: string; isLoading: boolean; animatedScore: number;
}) {
  return (
    <div className="space-y-6">
      {/* Risk + Score Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Assessment */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border-2 ${getRiskBadgeColor(result.riskAssessment.overallRisk)}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {result.riskAssessment.overallRisk === 'low' ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-lg capitalize mb-2">
                {result.riskAssessment.overallRisk} Risk Assessment
              </h3>
              <p className="text-sm leading-relaxed">{result.riskAssessment.clinicalSignificance}</p>
              {result.riskAssessment.riskFactors && result.riskAssessment.riskFactors.length > 0 && (
                <div className="mt-3 space-y-1">
                  {result.riskAssessment.riskFactors.slice(0, 4).map((f, i) => (
                    <p key={i} className="text-xs font-mono opacity-80">- {f}</p>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {result.riskAssessment.affectedDrugs.slice(0, 8).map((drug, i) => (
                  <span key={i} className="px-3 py-1 bg-background/50 rounded-lg text-xs font-medium">{drug}</span>
                ))}
                {result.riskAssessment.affectedDrugs.length > 8 && (
                  <span className="px-3 py-1 text-xs">+{result.riskAssessment.affectedDrugs.length - 8} more</span>
                )}
                {result.riskAssessment.affectedDrugs.length === 0 && (
                  <span className="text-xs opacity-60">No affected medications identified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mini Score */}
        <div className="p-6 bg-card rounded-2xl border border-border flex flex-col items-center justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke="currentColor"
                className={getScoreColor(result.judgingCriteria.overallScore)}
                strokeWidth="6"
                strokeDasharray={`${(animatedScore / 100) * 264} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(result.judgingCriteria.overallScore)}`}>{animatedScore}</span>
              <span className="text-[10px] text-muted-foreground">SCORE</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Quality Score</p>
        </div>
      </div>

      {/* Variant Breakdown + Chromosomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-2xl border border-border">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-secondary" />
            Variant Breakdown
          </h3>
          <div className="space-y-4">
            <VariantBar label="SNPs" value={result.qualityMetrics.snpCount} total={result.totalVariants} color="bg-secondary" />
            <VariantBar label="Indels" value={result.qualityMetrics.indelCount} total={result.totalVariants} color="bg-chart-3" />
            <VariantBar label="Multi-allelic" value={result.qualityMetrics.multiAllelicCount} total={result.totalVariants} color="bg-chart-4" />
            <VariantBar label="Passed Filter" value={result.qualityMetrics.passedVariants} total={result.totalVariants} color="bg-chart-1" />
          </div>
        </div>
        <div className="p-6 bg-card rounded-2xl border border-border">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Dna className="w-4 h-4 text-secondary" />
            Chromosome Distribution
          </h3>
          <div className="space-y-3">
            {result.qualityMetrics.chromosomeDistribution.slice(0, 6).map((chr) => (
              <VariantBar
                key={chr.chromosome}
                label={chr.chromosome.replace('chr', 'Chr ')}
                value={chr.count}
                total={result.totalVariants}
                color="bg-secondary"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Explanation */}
      <div className="p-6 bg-card rounded-2xl border border-border">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-secondary" />
          Clinical Explanation
          {isLoading && <Loader className="w-3 h-3 animate-spin text-secondary" />}
        </h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {explanation || (isLoading ? 'Generating clinical explanation...' : '')}
        </p>
      </div>
    </div>
  );
}

/* ==================== DRUG ANALYSIS TAB ==================== */
function DrugAnalysisTab({ drugAnalyses }: { drugAnalyses: DrugAnalysis[] }) {
  const riskColor = (risk: string) => {
    switch (risk) {
      case 'high': return { border: 'border-chart-5/30', bg: 'bg-chart-5/5', badge: 'bg-chart-5/10 text-chart-5 border-chart-5/20', icon: 'text-chart-5' };
      case 'moderate': return { border: 'border-chart-4/30', bg: 'bg-chart-4/5', badge: 'bg-chart-4/10 text-chart-4 border-chart-4/20', icon: 'text-chart-4' };
      default: return { border: 'border-chart-3/30', bg: 'bg-chart-3/5', badge: 'bg-chart-3/10 text-chart-3 border-chart-3/20', icon: 'text-chart-3' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <div className="p-6 bg-card rounded-2xl border border-secondary/20">
        <div className="flex items-center gap-3 mb-3">
          <FlaskConical className="w-5 h-5 text-secondary" />
          <h3 className="font-bold">Drug-Specific Risk Analysis</h3>
          <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded-full font-mono">
            {drugAnalyses.length} drug{drugAnalyses.length > 1 ? 's' : ''} analyzed
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Personalized risk assessment for each selected drug based on detected pharmacogene variants.
          Results below show gene-drug interactions, confidence scores, and clinical recommendations.
        </p>
      </div>

      {/* Drug Cards */}
      <div className="grid gap-4">
        {drugAnalyses.map((da, idx) => {
          const colors = riskColor(da.riskLevel);
          return (
            <div key={da.drug} className={`card-enter p-6 bg-card rounded-2xl border-2 ${colors.border} transition hover:shadow-lg`} style={{ animationDelay: `${idx * 100}ms` }}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${colors.bg} ${colors.icon}`}>
                    {da.drug[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{da.drug}</h4>
                    <p className="text-xs text-muted-foreground">
                      Related genes: {da.relatedGenes.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border ${colors.badge}`}>
                    {da.riskLevel} risk
                  </span>
                  {da.confidence > 0 && (
                    <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-mono">
                      {da.confidence}% confidence
                    </span>
                  )}
                </div>
              </div>

              {/* Confidence Bar */}
              {da.confidence > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Detection Confidence</span>
                    <span className={`font-mono font-medium ${getScoreColor(da.confidence)}`}>{da.confidence}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${getScoreBg(da.confidence)}`} style={{ width: `${da.confidence}%` }} />
                  </div>
                </div>
              )}

              {/* Detected Genes */}
              {da.detectedGenes.length > 0 ? (
                <div className="mb-5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Detected Gene Variants</p>
                  <div className="grid gap-2">
                    {da.detectedGenes.map((gene) => (
                      <div key={gene.gene} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="font-mono font-bold text-sm">{gene.gene}</span>
                          <span className="text-xs text-muted-foreground truncate">{gene.phenotype}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {gene.matchedRsIds.slice(0, 3).map((rs) => (
                            <span key={rs} className="px-2 py-0.5 bg-secondary/10 border border-secondary/20 rounded text-[10px] font-mono text-secondary">{rs}</span>
                          ))}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            gene.riskLevel === 'high' ? 'bg-chart-5/10 text-chart-5' :
                            gene.riskLevel === 'moderate' ? 'bg-chart-4/10 text-chart-4' :
                            'bg-chart-3/10 text-chart-3'
                          }`}>
                            {gene.riskLevel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-5 p-3 bg-muted/30 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground">
                    No variants detected in {da.relatedGenes.join(', ')} for this VCF file
                  </p>
                </div>
              )}

              {/* Recommendation */}
              <div className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Recommendation</p>
                <p className="text-sm font-medium leading-relaxed">{da.recommendation}</p>
              </div>

              {/* Clinical Note */}
              <div className="mt-3 p-3 bg-muted/30 rounded-xl">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Clinical Note</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{da.clinicalNote}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-muted/50 rounded-xl border border-border">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Disclaimer:</strong> Drug-specific analyses are based on pharmacogene variants detected in the uploaded VCF file,
          cross-referenced with PharmGKB/CPIC guidelines. Results are for educational purposes only. Always consult a healthcare
          provider or clinical pharmacist before making medication changes based on pharmacogenomic data.
        </p>
      </div>
    </div>
  );
}

/* ==================== ACCURACY TAB ==================== */
function AccuracyTab({ result }: { result: AnalysisResult }) {
  const metrics = result.accuracyMetrics;
  const items = [
    { key: 'Variant Call Accuracy', data: metrics.variantCallAccuracy, icon: <Target className="w-5 h-5" /> },
    { key: 'Genotype Accuracy', data: metrics.genotypeAccuracy, icon: <Dna className="w-5 h-5" /> },
    { key: 'Ti/Tv Ratio Quality', data: metrics.tiTvAccuracy, icon: <TrendingUp className="w-5 h-5" /> },
    { key: 'Filter Sensitivity', data: metrics.filterSensitivity, icon: <ShieldCheck className="w-5 h-5" /> },
    { key: 'Pharmacogene Confidence', data: metrics.pharmacogeneConfidence, icon: <FlaskConical className="w-5 h-5" /> },
    { key: 'Overall Reliability', data: metrics.overallReliability, icon: <Activity className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Reliability Banner */}
      <div className="p-6 bg-card rounded-2xl border border-border">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted" strokeWidth="5" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke="currentColor"
                className={getScoreColor(metrics.overallReliability.value)}
                strokeWidth="5"
                strokeDasharray={`${(metrics.overallReliability.value / 100) * 264} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold font-mono ${getScoreColor(metrics.overallReliability.value)}`}>
                {metrics.overallReliability.value.toFixed(1)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">Reliability %</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Overall Data Reliability</h3>
            <p className="text-sm text-muted-foreground mb-2">{metrics.overallReliability.method}</p>
            <p className="text-xs text-muted-foreground">{metrics.overallReliability.detail}</p>
          </div>
        </div>
      </div>

      {/* Individual Accuracy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.filter(i => i.key !== 'Overall Reliability').map((item, idx) => (
          <div key={item.key} className="card-enter p-5 bg-card rounded-2xl border border-border hover:border-secondary/40 transition group" style={{ animationDelay: `${idx * 80}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{item.key}</h4>
                  <p className="text-xs text-muted-foreground">{item.data.method}</p>
                </div>
              </div>
              <span className={`text-2xl font-bold font-mono ${getScoreColor(item.data.value)}`}>
                {item.data.value.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getScoreBg(item.data.value)}`}
                style={{ width: `${item.data.value}%` }}
              />
            </div>
            <div className="flex items-start gap-1.5 mt-2">
              <Info className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground font-mono">{item.data.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Methodology Note */}
      <div className="p-4 bg-muted/50 rounded-xl border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Methodology:</strong> Variant call accuracy uses Phred-scale quality conversion (P(error) = 10^(-Q/10)).
          Ti/Tv accuracy uses Gaussian deviation from expected ratios (WGS: 2.1, WES: 2.8).
          Pharmacogene confidence is a multi-factor score combining gene coverage, variant support depth, and quality metrics.
          Filter sensitivity evaluates pass rates against the optimal 85-98% range for well-calibrated pipelines.
        </p>
      </div>
    </div>
  );
}

/* ==================== JUDGING CRITERIA TAB ==================== */
function JudgingTab({ result, animatedScore }: { result: AnalysisResult; animatedScore: number }) {
  const criteria = result.judgingCriteria;
  const items = [
    { label: 'Data Completeness', weight: '15%', ...criteria.dataCompleteness },
    { label: 'Variant Quality', weight: '30%', ...criteria.variantQuality },
    { label: 'Coverage Depth', weight: '20%', ...criteria.coverageDepth },
    { label: 'Ti/Tv Ratio', weight: '15%', ...criteria.tiTvRatioScore },
    { label: 'Clinical Relevance', weight: '20%', ...criteria.clinicalRelevance },
  ];

  return (
    <div className="space-y-6">
      {/* Score + Grade Hero */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 p-5 sm:p-8 bg-card rounded-2xl border border-border">
        <div className="relative w-32 h-32 md:w-44 md:h-44 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-muted" strokeWidth="7" />
            <circle
              cx="60" cy="60" r="52" fill="none" stroke="currentColor"
              className={getScoreColor(criteria.overallScore)}
              strokeWidth="7"
              strokeDasharray={`${(animatedScore / 100) * 327} 327`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold font-mono ${getScoreColor(criteria.overallScore)}`}>{animatedScore}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className={`px-5 py-2 rounded-xl font-bold text-xl ${getGradeColor(criteria.grade)}`}>
              Grade {criteria.grade}
            </div>
            <div className="px-4 py-2 bg-muted rounded-lg text-sm">
              Confidence: <strong>{criteria.confidenceLevel}</strong>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3 max-w-xl">
            {result.judgingCriteria.grade === 'F' || result.judgingCriteria.grade === 'D'
              ? `This grade reflects the available data quality -- small VCF files or files missing QUAL/GQ/DP fields will score lower. This does not invalidate detected pharmacogene findings.`
              : result.judgingCriteria.grade === 'C'
              ? 'Moderate data quality. Some criteria scored below optimal thresholds. Results are usable but should be verified with additional testing.'
              : 'Strong data quality across most criteria. Results are reliable for pharmacogenomic interpretation.'
            }
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
            Quality score reflects overall data utility for pharmacogenomic analysis. Scores above 75 indicate
            reliable predictions. Each criterion is independently evaluated against clinical bioinformatics standards.
          </p>
        </div>
      </div>

      {/* Criteria Cards */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="card-enter" style={{ animationDelay: `${i * 80}ms` }}>
            <CriteriaCard item={item} />
          </div>
        ))}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-card rounded-2xl border border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 text-chart-3">
            <CheckCircle2 className="w-4 h-4" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {criteria.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-chart-3 mt-0.5 flex-shrink-0">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5 bg-card rounded-2xl border border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 text-chart-4">
            <AlertCircle className="w-4 h-4" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {criteria.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-chart-4 mt-0.5 flex-shrink-0">-</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ==================== CRITERIA CARD ==================== */
function CriteriaCard({ item }: { item: { label: string; weight: string; score: number; detail: string; rawMetrics: string[] } }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border hover:border-secondary/40 transition overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-semibold text-sm">{item.label}</h4>
            <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground uppercase tracking-wider">
              {item.weight}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{item.detail}</p>
        </div>
        <span className={`text-2xl font-bold font-mono ${getScoreColor(item.score)}`}>{item.score}</span>
        <div className="w-24 flex-shrink-0">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getScoreBg(item.score)}`} style={{ width: `${item.score}%` }} />
          </div>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && item.rawMetrics.length > 0 && (
        <div className="px-5 pb-5 pt-0 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4">
            {item.rawMetrics.map((metric, j) => (
              <div key={j} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                {metric}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== DATA VALUE INSIGHTS TAB ==================== */
function InsightsTab({ result }: { result: AnalysisResult }) {
  const [expandedIdx, setExpandedIdx] = useState<Set<number>>(new Set());

  const toggleExpand = (idx: number) => {
    setExpandedIdx(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-card rounded-2xl border border-secondary/20">
        <h3 className="font-bold mb-2">Why Your Data Matters</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Each variant in your VCF file represents a unique genetic marker that influences drug response,
          disease susceptibility, and treatment strategy. Below are key insights derived from your genomic profile
          with data-backed impact assessments. Click on any insight to expand details.
        </p>
      </div>

      <div className="grid gap-3">
        {result.dataValueInsights.map((insight, i) => {
          const isOpen = expandedIdx.has(i);
          return (
            <div key={i} className="card-enter bg-card rounded-2xl border border-border hover:border-secondary/40 transition overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
              <button
                onClick={() => toggleExpand(i)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold uppercase border ${getImpactColor(insight.impact)}`}>
                      {insight.impact}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{insight.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-secondary">{insight.metric}</span>
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                </div>
                <h4 className="font-semibold">{insight.title}</h4>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-0 border-t border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed pt-4">{insight.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          insight.impact === 'high' ? 'bg-chart-5' :
                          insight.impact === 'medium' ? 'bg-chart-4' : 'bg-chart-3'
                        }`}
                        style={{ width: `${insight.impact === 'high' ? 85 : insight.impact === 'medium' ? 55 : 25}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {insight.impact === 'high' ? 'Critical' : insight.impact === 'medium' ? 'Notable' : 'Informational'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==================== PHARMACOGENES TAB ==================== */
function PharmacogenesTab({ result }: { result: AnalysisResult }) {
  if (result.pharmacogenes.length === 0) {
    return (
      <div className="p-8 bg-card rounded-2xl border border-border text-center">
        <Dna className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">No Pharmacogene Variants Detected</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          None of the 12 screened pharmacogene loci had matching variants in this VCF file.
          This may indicate a normal/wild-type genotype, insufficient coverage in pharmacogene regions,
          or variants lacking rsID annotations. Consider annotating your VCF with Ensembl VEP or SnpEff.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {result.pharmacogenes.map((gene, idx) => (
        <div key={gene.gene} className="card-enter p-6 bg-card rounded-2xl border border-border hover:border-secondary/40 transition" style={{ animationDelay: `${idx * 100}ms` }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-bold font-mono">{gene.gene}</h4>
                <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground font-mono">
                  {gene.confidence}% confidence
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{gene.phenotype}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${
              gene.riskLevel === 'high' ? 'bg-chart-5/10 text-chart-5 border border-chart-5/20' :
              gene.riskLevel === 'moderate' ? 'bg-chart-4/10 text-chart-4 border border-chart-4/20' :
              'bg-chart-3/10 text-chart-3 border border-chart-3/20'
            }`}>
              {gene.riskLevel} risk
            </span>
          </div>

          {/* Evidence summary */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              {gene.matchedRsIds.length} rsID match(es) / {gene.totalLociChecked} checked
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-chart-3" />
              {gene.matchedPositions} variant(s) in gene region
            </span>
          </div>

          <div className="space-y-4">
            {/* Matched rsIDs */}
            {gene.matchedRsIds.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Matched rsIDs</p>
                <div className="flex flex-wrap gap-1.5">
                  {gene.matchedRsIds.map((rs, j) => (
                    <span key={j} className="px-2.5 py-1 bg-secondary/10 border border-secondary/20 rounded text-[11px] font-mono text-secondary">{rs}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Variant details */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Variant Evidence ({gene.variants.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {gene.variants.slice(0, 8).map((v, j) => (
                  <span key={j} className="px-2 py-1 bg-muted rounded text-[11px] font-mono">{v}</span>
                ))}
                {gene.variants.length > 8 && <span className="px-2 py-1 text-[11px] text-muted-foreground">+{gene.variants.length - 8}</span>}
              </div>
            </div>

            {/* Confidence bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Detection Confidence</span>
                <span className={`font-mono font-medium ${getScoreColor(gene.confidence)}`}>{gene.confidence}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getScoreBg(gene.confidence)}`} style={{ width: `${gene.confidence}%` }} />
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Recommendations</p>
              <ul className="space-y-1.5">
                {gene.recommendations.map((rec, j) => (
                  <li key={j} className="text-sm flex items-start gap-2">
                    <span className="text-secondary mt-0.5 flex-shrink-0">-</span>
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}

      {/* Summary footer */}
      <div className="p-4 bg-muted/50 rounded-xl border border-border">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Analysis scope:</strong> Screened {result.pharmacogenes.length > 0 ? '12' : '12'} pharmacogene loci
          (CYP2D6, CYP2C19, CYP2C9, CYP3A4, CYP3A5, TPMT, DPYD, VKORC1, SLCO1B1, UGT1A1, CYP2B6, NAT2)
          using rsID matching against PharmGKB/CPIC star allele definitions and genomic position overlap with GRCh37/hg19 coordinates.
        </p>
      </div>
    </div>
  );
}

/* ==================== JSON TAB ==================== */
function JSONTab({
  result, jsonExpanded, setJsonExpanded, copied, copyJSON, drugAnalyses,
}: {
  result: AnalysisResult;
  jsonExpanded: boolean;
  setJsonExpanded: (v: boolean) => void;
  copied: boolean;
  copyJSON: () => void;
  drugAnalyses?: DrugAnalysis[];
}) {
  const drugOutput = drugAnalyses?.map((da) => ({
    drug: da.drug,
    riskLevel: da.riskLevel,
    confidence: da.confidence,
    relatedGenes: da.relatedGenes,
    detectedGenes: da.detectedGenes.map((g) => ({ gene: g.gene, phenotype: g.phenotype, riskLevel: g.riskLevel })),
    recommendation: da.recommendation,
    clinicalNote: da.clinicalNote,
  }));

  const summaryJSON = {
    fileName: result.fileName,
    uploadTime: result.uploadTime,
    totalVariants: result.totalVariants,
    variantsSample: result.variants.slice(0, 5),
    ...(drugOutput && drugOutput.length > 0 ? { drugAnalysis: drugOutput } : {}),
    pharmacogenes: result.pharmacogenes,
    riskAssessment: result.riskAssessment,
    qualityMetrics: result.qualityMetrics,
    accuracyMetrics: result.accuracyMetrics,
    judgingCriteria: {
      overallScore: result.judgingCriteria.overallScore,
      grade: result.judgingCriteria.grade,
      confidenceLevel: result.judgingCriteria.confidenceLevel,
      strengths: result.judgingCriteria.strengths,
      weaknesses: result.judgingCriteria.weaknesses,
    },
    vcfMetadata: result.vcfMetadata,
  };

  const displayJSON = jsonExpanded ? result : summaryJSON;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">JSON Output</h3>
          <span className="text-[10px] px-2 py-1 bg-muted rounded uppercase tracking-wider text-muted-foreground">
            {jsonExpanded ? 'Full' : 'Summary'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setJsonExpanded(!jsonExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition"
          >
            {jsonExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {jsonExpanded ? 'Summary' : 'Full'}
          </button>
          <button
            onClick={copyJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="relative bg-card rounded-2xl border border-border overflow-hidden">
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-muted rounded text-[10px] text-muted-foreground font-mono uppercase">
          JSON
        </div>
        <pre className="p-6 overflow-x-auto max-h-[500px] overflow-y-auto text-xs leading-relaxed font-mono">
          <code className="text-muted-foreground">{JSON.stringify(displayJSON, null, 2)}</code>
        </pre>
      </div>
      {!jsonExpanded && (
        <p className="text-[10px] text-muted-foreground text-center">
          Summary view with first 5 variants. Click &quot;Full&quot; for complete output ({result.totalVariants.toLocaleString()} variants).
        </p>
      )}
    </div>
  );
}

/* ==================== SHARED COMPONENTS ==================== */
function VariantBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="font-mono text-xs font-medium">{value.toLocaleString()} <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span></span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(percentage, 0.5)}%` }} />
      </div>
    </div>
  );
}

/* ==================== HELPERS ==================== */
function getScoreColor(score: number) {
  if (score >= 80) return 'text-chart-3';
  if (score >= 60) return 'text-secondary';
  if (score >= 40) return 'text-chart-4';
  return 'text-chart-5';
}

function getScoreBg(score: number) {
  if (score >= 80) return 'bg-chart-3';
  if (score >= 60) return 'bg-secondary';
  if (score >= 40) return 'bg-chart-4';
  return 'bg-chart-5';
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

function getRiskBadgeColor(risk: string) {
  switch (risk) {
    case 'high': return 'text-chart-5 bg-chart-5/5 border-chart-5/20';
    case 'moderate': return 'text-chart-4 bg-chart-4/5 border-chart-4/20';
    case 'low': return 'text-chart-3 bg-chart-3/5 border-chart-3/20';
    default: return '';
  }
}

function getImpactColor(impact: string) {
  switch (impact) {
    case 'high': return 'bg-chart-5/10 text-chart-5 border-chart-5/20';
    case 'medium': return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
    case 'low': return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
    default: return '';
  }
}
