export interface Variant {
  chromosome: string;
  position: number;
  id: string;
  ref: string;
  alt: string;
  quality: number;
  filter: string;
  info: string;
  genotype?: string;
  genotypeQuality?: number;
  readDepth?: number;
}

export interface QualityMetrics {
  totalVariants: number;
  passedVariants: number;
  failedVariants: number;
  averageQuality: number;
  medianQuality: number;
  q1Quality: number;
  q3Quality: number;
  minQuality: number;
  maxQuality: number;
  qualityStdDev: number;
  qualityDistribution: { range: string; count: number }[];
  chromosomeDistribution: { chromosome: string; count: number }[];
  transitionCount: number;
  transversionCount: number;
  tiTvRatio: number;
  snpCount: number;
  indelCount: number;
  multiAllelicCount: number;
  hetHomRatio: number;
  averageReadDepth: number;
  dbSnpAnnotated: number;
  novelVariants: number;
}

export interface AccuracyMetrics {
  variantCallAccuracy: { value: number; method: string; detail: string };
  genotypeAccuracy: { value: number; method: string; detail: string };
  tiTvAccuracy: { value: number; method: string; detail: string };
  filterSensitivity: { value: number; method: string; detail: string };
  pharmacogeneConfidence: { value: number; method: string; detail: string };
  overallReliability: { value: number; method: string; detail: string };
}

export interface JudgingCriteria {
  overallScore: number;
  dataCompleteness: { score: number; label: string; detail: string; rawMetrics: string[] };
  variantQuality: { score: number; label: string; detail: string; rawMetrics: string[] };
  coverageDepth: { score: number; label: string; detail: string; rawMetrics: string[] };
  tiTvRatioScore: { score: number; label: string; detail: string; rawMetrics: string[] };
  clinicalRelevance: { score: number; label: string; detail: string; rawMetrics: string[] };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  confidenceLevel: 'High' | 'Medium' | 'Low';
  strengths: string[];
  weaknesses: string[];
}

export interface DataValueInsight {
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric: string;
}

export interface AnalysisResult {
  fileName: string;
  uploadTime: string;
  totalVariants: number;
  variants: Variant[];
  pharmacogenes: PharmacoGene[];
  riskAssessment: RiskAssessment;
  qualityMetrics: QualityMetrics;
  judgingCriteria: JudgingCriteria;
  accuracyMetrics: AccuracyMetrics;
  dataValueInsights: DataValueInsight[];
  vcfMetadata: VCFMetadata;
}

export interface VCFMetadata {
  fileFormat: string;
  source: string;
  reference: string;
  sampleNames: string[];
  infoFields: string[];
  filterFields: string[];
  contigCount: number;
}

export interface PharmacoGene {
  gene: string;
  phenotype: string;
  variants: string[];
  recommendations: string[];
  riskLevel: 'low' | 'moderate' | 'high';
  matchedRsIds: string[];
  matchedPositions: number;
  totalLociChecked: number;
  confidence: number;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high';
  affectedDrugs: string[];
  clinicalSignificance: string;
  riskFactors: string[];
}

export interface DrugAnalysis {
  drug: string;
  relatedGenes: string[];
  detectedGenes: PharmacoGene[];
  riskLevel: 'low' | 'moderate' | 'high';
  confidence: number;
  recommendation: string;
  clinicalNote: string;
}

// ========== STANDARDIZED PHARMACOGENOMIC JSON FORMAT ==========
export interface PharmacoVariant {
  rsid: string;
  chromosome?: string;
  position?: number;
  ref?: string;
  alt?: string;
  allele?: string;
  effect?: string;
}

export interface PharmacoProfile {
  primary_gene: string;
  diplotype: string;
  phenotype: string;
  detected_variants: PharmacoVariant[];
}

export interface RiskAssessmentJson {
  risk_label: 'Safe' | 'Adjust Dosage' | 'Toxic' | 'Contraindicated' | 'Unknown';
  confidence_score: number;
  severity: 'none' | 'low' | 'moderate' | 'high' | 'critical';
}

export interface ClinicalRecommendation {
  dosage_adjustment?: string;
  monitoring_required?: boolean;
  monitoring_type?: string;
  alternative_drug?: string;
  contraindicated?: boolean;
  notes?: string;
}

export interface LLMExplanation {
  summary: string;
  clinical_implications?: string;
  dosing_recommendations?: string;
  monitoring_recommendations?: string;
  important_notes?: string;
}

export interface QualityMetricsJson {
  vcf_parsing_success: boolean;
  total_variants: number;
  passed_variants: number;
  average_quality: number;
  median_quality: number;
  snp_count: number;
  indel_count: number;
  confidence_score?: number;
}

export interface PharmacoJSON {
  patient_id: string;
  drug: string;
  timestamp: string;
  risk_assessment: RiskAssessmentJson;
  pharmacogenomic_profile: PharmacoProfile;
  clinical_recommendation: ClinicalRecommendation;
  llm_generated_explanation: LLMExplanation;
  quality_metrics: QualityMetricsJson;
}

// ========== KNOWN PHARMACOGENE LOCI DATABASE ==========
// Genomic positions from PharmGKB / CPIC for GRCh37/hg19 and GRCh38/hg38
// Each gene has known rsIDs for star alleles and a genomic region [chr, start, end]
interface PharmaGeneLocus {
  gene: string;
  chromosome: string; // without 'chr' prefix
  startPos: number;
  endPos: number;
  knownRsIds: Record<string, { allele: string; effect: string; riskWeight: number }>;
  drugMap: string[];
  metabolizerLogic: (matchedRs: string[], genotypes: Map<string, string>, totalVariants: number) => { phenotype: string; risk: 'low' | 'moderate' | 'high' };
}

const PHARMA_GENE_DB: PharmaGeneLocus[] = [
  {
    gene: 'CYP2D6',
    chromosome: '22',
    startPos: 42522500,
    endPos: 42528400,
    knownRsIds: {
      'rs3892097': { allele: '*4', effect: 'Non-functional', riskWeight: 3 },
      'rs5030655': { allele: '*6', effect: 'Non-functional (frameshift)', riskWeight: 3 },
      'rs16947': { allele: '*2', effect: 'Normal function', riskWeight: 0 },
      'rs1065852': { allele: '*10', effect: 'Decreased function', riskWeight: 2 },
      'rs28371706': { allele: '*17', effect: 'Decreased function', riskWeight: 2 },
      'rs1135840': { allele: '*2/*10 tag', effect: 'Variable', riskWeight: 1 },
      'rs28371725': { allele: '*41', effect: 'Decreased function', riskWeight: 2 },
    },
    drugMap: ['Codeine', 'Tramadol', 'Venlafaxine', 'Risperidone', 'Aripiprazole', 'Tamoxifen', 'Ondansetron'],
    metabolizerLogic: (matchedRs, genotypes, totalVariants) => {
      const nonFunctional = matchedRs.filter(r => ['rs3892097', 'rs5030655'].includes(r));
      const decreased = matchedRs.filter(r => ['rs1065852', 'rs28371706', 'rs28371725'].includes(r));
      if (nonFunctional.length >= 2) return { phenotype: 'Poor Metabolizer', risk: 'high' };
      if (nonFunctional.length === 1 && decreased.length >= 1) return { phenotype: 'Poor Metabolizer', risk: 'high' };
      if (nonFunctional.length === 1) return { phenotype: 'Intermediate Metabolizer', risk: 'moderate' };
      if (decreased.length >= 2) return { phenotype: 'Intermediate Metabolizer', risk: 'moderate' };
      if (decreased.length === 1) return { phenotype: 'Normal Metabolizer (one decreased allele)', risk: 'low' };
      if (totalVariants > 0 && matchedRs.length === 0) return { phenotype: 'Normal Metabolizer (no known functional variants)', risk: 'low' };
      return { phenotype: 'Normal Metabolizer', risk: 'low' };
    },
  },
  {
    gene: 'CYP2C19',
    chromosome: '10',
    startPos: 96521657,
    endPos: 96612830,
    knownRsIds: {
      'rs4244285': { allele: '*2', effect: 'Non-functional (splicing defect)', riskWeight: 3 },
      'rs4986893': { allele: '*3', effect: 'Non-functional (premature stop)', riskWeight: 3 },
      'rs12248560': { allele: '*17', effect: 'Increased function (ultrarapid)', riskWeight: 2 },
      'rs28399504': { allele: '*4', effect: 'Non-functional', riskWeight: 3 },
      'rs56337013': { allele: '*5', effect: 'Non-functional', riskWeight: 3 },
      'rs72552267': { allele: '*6', effect: 'Non-functional', riskWeight: 3 },
      'rs72558186': { allele: '*7', effect: 'Non-functional', riskWeight: 3 },
    },
    drugMap: ['Clopidogrel', 'Omeprazole', 'Escitalopram', 'Sertraline', 'Voriconazole', 'Pantoprazole'],
    metabolizerLogic: (matchedRs, genotypes) => {
      const lof = matchedRs.filter(r => ['rs4244285', 'rs4986893', 'rs28399504', 'rs56337013', 'rs72552267', 'rs72558186'].includes(r));
      const gof = matchedRs.filter(r => r === 'rs12248560');
      if (lof.length >= 2) return { phenotype: 'Poor Metabolizer', risk: 'high' };
      if (lof.length === 1 && gof.length === 0) return { phenotype: 'Intermediate Metabolizer', risk: 'moderate' };
      if (gof.length >= 1 && lof.length === 0) return { phenotype: 'Rapid/Ultrarapid Metabolizer', risk: 'moderate' };
      if (gof.length >= 1 && lof.length >= 1) return { phenotype: 'Normal Metabolizer (conflicting alleles)', risk: 'low' };
      return { phenotype: 'Normal Metabolizer', risk: 'low' };
    },
  },
  {
    gene: 'CYP2C9',
    chromosome: '10',
    startPos: 96698415,
    endPos: 96749148,
    knownRsIds: {
      'rs1799853': { allele: '*2', effect: 'Decreased function', riskWeight: 2 },
      'rs1057910': { allele: '*3', effect: 'Decreased function (major)', riskWeight: 3 },
      'rs28371686': { allele: '*5', effect: 'Decreased function', riskWeight: 2 },
      'rs9332131': { allele: '*6', effect: 'Non-functional', riskWeight: 3 },
      'rs7900194': { allele: '*8', effect: 'Decreased function', riskWeight: 2 },
      'rs28371685': { allele: '*11', effect: 'Decreased function', riskWeight: 2 },
    },
    drugMap: ['Warfarin', 'Phenytoin', 'Celecoxib', 'Flurbiprofen', 'Losartan'],
    metabolizerLogic: (matchedRs) => {
      const lof = matchedRs.filter(r => ['rs1057910', 'rs9332131'].includes(r));
      const decreased = matchedRs.filter(r => ['rs1799853', 'rs28371686', 'rs7900194', 'rs28371685'].includes(r));
      if (lof.length >= 2) return { phenotype: 'Poor Metabolizer', risk: 'high' };
      if (lof.length >= 1) return { phenotype: 'Intermediate Metabolizer', risk: 'moderate' };
      if (decreased.length >= 2) return { phenotype: 'Intermediate Metabolizer', risk: 'moderate' };
      if (decreased.length === 1) return { phenotype: 'Normal Metabolizer (one decreased allele)', risk: 'low' };
      return { phenotype: 'Normal Metabolizer', risk: 'low' };
    },
  },
  {
    gene: 'CYP3A4',
    chromosome: '7',
    startPos: 99354582,
    endPos: 99381811,
    knownRsIds: {
      'rs35599367': { allele: '*22', effect: 'Decreased expression', riskWeight: 2 },
      'rs2740574': { allele: '*1B', effect: 'Increased expression', riskWeight: 1 },
      'rs55785340': { allele: '*2', effect: 'Decreased function', riskWeight: 2 },
      'rs4986910': { allele: '*3', effect: 'Decreased function', riskWeight: 2 },
    },
    drugMap: ['Atorvastatin', 'Simvastatin', 'Clarithromycin', 'Cyclosporine', 'Tacrolimus', 'Midazolam'],
    metabolizerLogic: (matchedRs) => {
      const decreased = matchedRs.filter(r => ['rs35599367', 'rs55785340', 'rs4986910'].includes(r));
      const increased = matchedRs.filter(r => r === 'rs2740574');
      if (decreased.length >= 2) return { phenotype: 'Poor Metabolizer', risk: 'high' };
      if (decreased.length === 1) return { phenotype: 'Intermediate Metabolizer', risk: 'moderate' };
      if (increased.length >= 1) return { phenotype: 'Increased Expression', risk: 'moderate' };
      return { phenotype: 'Normal Metabolizer', risk: 'low' };
    },
  },
  {
    gene: 'CYP3A5',
    chromosome: '7',
    startPos: 99245000,
    endPos: 99277000,
    knownRsIds: {
      'rs776746': { allele: '*3', effect: 'Non-expressor (most common)', riskWeight: 1 },
      'rs10264272': { allele: '*6', effect: 'Non-expressor', riskWeight: 1 },
      'rs41303343': { allele: '*7', effect: 'Non-expressor', riskWeight: 1 },
    },
    drugMap: ['Tacrolimus', 'Cyclosporine', 'Sirolimus'],
    metabolizerLogic: (matchedRs) => {
      const nonExpressor = matchedRs.filter(r => ['rs776746', 'rs10264272', 'rs41303343'].includes(r));
      if (nonExpressor.length >= 2) return { phenotype: 'Non-expressor (CYP3A5*3/*3)', risk: 'moderate' };
      if (nonExpressor.length === 1) return { phenotype: 'Intermediate Expressor', risk: 'low' };
      return { phenotype: 'Expressor (*1/*1)', risk: 'low' };
    },
  },
  {
    gene: 'TPMT',
    chromosome: '6',
    startPos: 18128542,
    endPos: 18155374,
    knownRsIds: {
      'rs1800462': { allele: '*2', effect: 'Non-functional', riskWeight: 3 },
      'rs1800460': { allele: '*3B', effect: 'Non-functional', riskWeight: 3 },
      'rs1142345': { allele: '*3C', effect: 'Non-functional', riskWeight: 3 },
      'rs1800584': { allele: '*4', effect: 'Non-functional', riskWeight: 3 },
    },
    drugMap: ['Azathioprine', 'Mercaptopurine', '6-Thioguanine'],
    metabolizerLogic: (matchedRs) => {
      if (matchedRs.length >= 2) return { phenotype: 'Poor Metabolizer (TPMT deficient)', risk: 'high' };
      if (matchedRs.length === 1) return { phenotype: 'Intermediate Metabolizer', risk: 'moderate' };
      return { phenotype: 'Normal Metabolizer', risk: 'low' };
    },
  },
  {
    gene: 'DPYD',
    chromosome: '1',
    startPos: 97543299,
    endPos: 98386615,
    knownRsIds: {
      'rs3918290': { allele: '*2A (IVS14+1G>A)', effect: 'Non-functional (splice site)', riskWeight: 4 },
      'rs55886062': { allele: '*13', effect: 'Non-functional', riskWeight: 4 },
      'rs67376798': { allele: 'D949V', effect: 'Decreased function', riskWeight: 3 },
      'rs56038477': { allele: 'HapB3 tag', effect: 'Decreased function', riskWeight: 2 },
      'rs75017182': { allele: 'HapB3 causal', effect: 'Decreased function', riskWeight: 2 },
    },
    drugMap: ['Fluorouracil (5-FU)', 'Capecitabine', 'Tegafur'],
    metabolizerLogic: (matchedRs) => {
      const critical = matchedRs.filter(r => ['rs3918290', 'rs55886062'].includes(r));
      const decreased = matchedRs.filter(r => ['rs67376798', 'rs56038477', 'rs75017182'].includes(r));
      if (critical.length >= 1) return { phenotype: 'DPD Deficient - CONTRAINDICATED for fluoropyrimidines', risk: 'high' };
      if (decreased.length >= 2) return { phenotype: 'Intermediate DPD Activity', risk: 'high' };
      if (decreased.length === 1) return { phenotype: 'Possible Decreased DPD Activity', risk: 'moderate' };
      return { phenotype: 'Normal DPD Activity', risk: 'low' };
    },
  },
  {
    gene: 'VKORC1',
    chromosome: '16',
    startPos: 31102175,
    endPos: 31106699,
    knownRsIds: {
      'rs9923231': { allele: '-1639G>A', effect: 'Reduced VKORC1 expression (warfarin sensitive)', riskWeight: 3 },
      'rs9934438': { allele: '1173C>T', effect: 'Reduced expression (LD with -1639)', riskWeight: 2 },
      'rs8050894': { allele: '1542G>C', effect: 'Haplotype tag', riskWeight: 1 },
    },
    drugMap: ['Warfarin', 'Acenocoumarol', 'Phenprocoumon'],
    metabolizerLogic: (matchedRs, genotypes) => {
      const sensitive = matchedRs.includes('rs9923231') || matchedRs.includes('rs9934438');
      // Check if homozygous alt for rs9923231
      const gt = genotypes.get('rs9923231');
      const isHom = gt && !gt.includes('0');
      if (sensitive && isHom) return { phenotype: 'High Warfarin Sensitivity (homozygous)', risk: 'high' };
      if (sensitive) return { phenotype: 'Intermediate Warfarin Sensitivity', risk: 'moderate' };
      return { phenotype: 'Normal Warfarin Sensitivity', risk: 'low' };
    },
  },
  {
    gene: 'SLCO1B1',
    chromosome: '12',
    startPos: 21284127,
    endPos: 21392730,
    knownRsIds: {
      'rs4149056': { allele: '*5 (Val174Ala)', effect: 'Decreased transport (statin myopathy risk)', riskWeight: 3 },
      'rs2306283': { allele: '*1B (Asn130Asp)', effect: 'Increased function', riskWeight: 1 },
      'rs4149015': { allele: '*1A tag', effect: 'Normal', riskWeight: 0 },
    },
    drugMap: ['Simvastatin', 'Atorvastatin', 'Rosuvastatin', 'Pravastatin', 'Methotrexate'],
    metabolizerLogic: (matchedRs, genotypes) => {
      const myopathyRisk = matchedRs.includes('rs4149056');
      const gt = genotypes.get('rs4149056');
      const isHom = gt && !gt.includes('0');
      if (myopathyRisk && isHom) return { phenotype: 'Poor Transporter - HIGH statin myopathy risk', risk: 'high' };
      if (myopathyRisk) return { phenotype: 'Intermediate Transporter - increased myopathy risk', risk: 'moderate' };
      return { phenotype: 'Normal Transporter Function', risk: 'low' };
    },
  },
  {
    gene: 'UGT1A1',
    chromosome: '2',
    startPos: 234668879,
    endPos: 234681945,
    knownRsIds: {
      'rs8175347': { allele: '*28 (TA repeat)', effect: 'Reduced glucuronidation (Gilbert syndrome)', riskWeight: 2 },
      'rs4148323': { allele: '*6 (G71R)', effect: 'Reduced function', riskWeight: 2 },
      'rs887829': { allele: '*80', effect: 'Reduced expression (LD with *28)', riskWeight: 1 },
    },
    drugMap: ['Irinotecan', 'Atazanavir', 'Belinostat'],
    metabolizerLogic: (matchedRs) => {
      const reduced = matchedRs.filter(r => ['rs8175347', 'rs4148323'].includes(r));
      if (reduced.length >= 2) return { phenotype: 'Poor Metabolizer (UGT1A1 deficient)', risk: 'high' };
      if (reduced.length === 1) return { phenotype: 'Intermediate Metabolizer', risk: 'moderate' };
      return { phenotype: 'Normal Metabolizer', risk: 'low' };
    },
  },
  {
    gene: 'CYP2B6',
    chromosome: '19',
    startPos: 41497153,
    endPos: 41524301,
    knownRsIds: {
      'rs3745274': { allele: '*6 (Q172H)', effect: 'Decreased function', riskWeight: 2 },
      'rs2279343': { allele: '*4 (K262R)', effect: 'Increased function', riskWeight: 1 },
      'rs28399499': { allele: '*18', effect: 'Non-functional', riskWeight: 3 },
    },
    drugMap: ['Efavirenz', 'Nevirapine', 'Methadone', 'Bupropion', 'Cyclophosphamide'],
    metabolizerLogic: (matchedRs) => {
      const lof = matchedRs.filter(r => ['rs28399499'].includes(r));
      const decreased = matchedRs.filter(r => r === 'rs3745274');
      const increased = matchedRs.filter(r => r === 'rs2279343');
      if (lof.length >= 1) return { phenotype: 'Poor Metabolizer', risk: 'high' };
      if (decreased.length >= 1 && increased.length === 0) return { phenotype: 'Intermediate Metabolizer', risk: 'moderate' };
      if (increased.length >= 1) return { phenotype: 'Rapid Metabolizer', risk: 'moderate' };
      return { phenotype: 'Normal Metabolizer', risk: 'low' };
    },
  },
  {
    gene: 'NAT2',
    chromosome: '8',
    startPos: 18248755,
    endPos: 18258728,
    knownRsIds: {
      'rs1801280': { allele: '*5 (Ile114Thr)', effect: 'Slow acetylator', riskWeight: 2 },
      'rs1799930': { allele: '*6 (Arg197Gln)', effect: 'Slow acetylator', riskWeight: 2 },
      'rs1208': { allele: '*4 tag (Lys268Arg)', effect: 'Rapid acetylator', riskWeight: 1 },
      'rs1799931': { allele: '*7 (Gly286Glu)', effect: 'Slow acetylator', riskWeight: 2 },
    },
    drugMap: ['Isoniazid', 'Hydralazine', 'Procainamide', 'Sulfasalazine'],
    metabolizerLogic: (matchedRs) => {
      const slow = matchedRs.filter(r => ['rs1801280', 'rs1799930', 'rs1799931'].includes(r));
      const rapid = matchedRs.filter(r => r === 'rs1208');
      if (slow.length >= 2) return { phenotype: 'Slow Acetylator', risk: 'high' };
      if (slow.length === 1) return { phenotype: 'Intermediate Acetylator', risk: 'moderate' };
      if (rapid.length >= 1) return { phenotype: 'Rapid Acetylator', risk: 'low' };
      return { phenotype: 'Normal Acetylator', risk: 'low' };
    },
  },
];

// ========== MAIN PARSER ==========
export function parseVCFFile(content: string): AnalysisResult {
  const lines = content.split('\n');
  const variants: Variant[] = [];
  const metadata = extractMetadata(lines);

  const fileName = 'genome_data.vcf';
  const uploadTime = new Date().toISOString();

  let formatIndices: Record<string, number> = {};

  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') continue;

    const fields = line.split('\t');
    if (fields.length >= 5) {
      if (fields.length >= 10 && fields[8] && !Object.keys(formatIndices).length) {
        const formatKeys = fields[8].split(':');
        formatKeys.forEach((key, idx) => { formatIndices[key] = idx; });
      }

      const sampleField = fields.length >= 10 ? fields[9] : '';
      const sampleValues = sampleField ? sampleField.split(':') : [];

      const variant: Variant = {
        chromosome: fields[0],
        position: parseInt(fields[1]),
        id: fields[2] || '.',
        ref: fields[3],
        alt: fields[4],
        quality: fields[5] && fields[5] !== '.' ? parseFloat(fields[5]) : 0,
        filter: fields[6] || '.',
        info: fields[7] || '.',
      };

      if (formatIndices['GT'] !== undefined && sampleValues[formatIndices['GT']]) {
        variant.genotype = sampleValues[formatIndices['GT']];
      }
      if (formatIndices['GQ'] !== undefined && sampleValues[formatIndices['GQ']]) {
        const gq = parseFloat(sampleValues[formatIndices['GQ']]);
        if (!isNaN(gq)) variant.genotypeQuality = gq;
      }
      if (formatIndices['DP'] !== undefined && sampleValues[formatIndices['DP']]) {
        const dp = parseInt(sampleValues[formatIndices['DP']]);
        if (!isNaN(dp)) variant.readDepth = dp;
      }

      variants.push(variant);
    }
  }

  const pharmacogenes = analyzePharmacoGenes(variants);
  const riskAssessment = calculateRiskAssessment(variants, pharmacogenes);
  const qualityMetrics = calculateQualityMetrics(variants);
  const judgingCriteria = calculateJudgingCriteria(variants, qualityMetrics, pharmacogenes, metadata);
  const accuracyMetrics = calculateAccuracyMetrics(variants, qualityMetrics, pharmacogenes);
  const dataValueInsights = generateDataValueInsights(variants, qualityMetrics, pharmacogenes, riskAssessment, accuracyMetrics);

  return {
    fileName,
    uploadTime,
    totalVariants: variants.length,
    variants,
    pharmacogenes,
    riskAssessment,
    qualityMetrics,
    judgingCriteria,
    accuracyMetrics,
    dataValueInsights,
    vcfMetadata: metadata,
  };
}

// ========== METADATA EXTRACTION ==========
function extractMetadata(lines: string[]): VCFMetadata {
  let fileFormat = '';
  let source = '';
  let reference = '';
  const sampleNames: string[] = [];
  const infoFields: string[] = [];
  const filterFields: string[] = [];
  let contigCount = 0;

  for (const line of lines) {
    if (line.startsWith('##fileformat=')) fileFormat = line.replace('##fileformat=', '');
    else if (line.startsWith('##source=')) source = line.replace('##source=', '');
    else if (line.startsWith('##reference=')) reference = line.replace('##reference=', '');
    else if (line.startsWith('##INFO=')) {
      const match = line.match(/ID=([^,]+)/);
      if (match) infoFields.push(match[1]);
    } else if (line.startsWith('##FILTER=')) {
      const match = line.match(/ID=([^,]+)/);
      if (match) filterFields.push(match[1]);
    } else if (line.startsWith('##contig=')) contigCount++;
    else if (line.startsWith('#CHROM')) {
      const cols = line.split('\t');
      if (cols.length > 9) {
        for (let i = 9; i < cols.length; i++) sampleNames.push(cols[i].trim());
      }
    }
  }

  return { fileFormat, source, reference, sampleNames, infoFields, filterFields, contigCount };
}

// ========== PHARMACOGENE ANALYSIS (position + rsID-based) ==========
function analyzePharmacoGenes(variants: Variant[]): PharmacoGene[] {
  const genes: PharmacoGene[] = [];

  // Normalize chromosome names: "chr22" -> "22", "22" -> "22"
  function normChr(c: string): string {
    return c.replace(/^chr/i, '');
  }

  // Build quick lookup maps
  const rsIdToVariant = new Map<string, Variant>();
  const chrPosMap = new Map<string, Variant[]>();

  for (const v of variants) {
    // Index by rsID
    if (v.id && v.id.startsWith('rs')) {
      const ids = v.id.split(';');
      for (const id of ids) {
        if (id.startsWith('rs')) rsIdToVariant.set(id, v);
      }
    }
    // Index by chr:pos
    const chr = normChr(v.chromosome);
    const key = chr;
    if (!chrPosMap.has(key)) chrPosMap.set(key, []);
    chrPosMap.get(key)!.push(v);
  }

  for (const locus of PHARMA_GENE_DB) {
    const matchedRsIds: string[] = [];
    const matchedVariantDetails: string[] = [];
    const genotypes = new Map<string, string>();
    let positionMatchCount = 0;

    // 1. Check by rsID (most reliable)
    for (const [rsId, info] of Object.entries(locus.knownRsIds)) {
      const v = rsIdToVariant.get(rsId);
      if (v) {
        matchedRsIds.push(rsId);
        matchedVariantDetails.push(`${rsId} (${info.allele}: ${info.effect})`);
        if (v.genotype) genotypes.set(rsId, v.genotype);
      }
    }

    // 2. Check by genomic position (for variants without rsIDs)
    const chrVariants = chrPosMap.get(locus.chromosome) || [];
    for (const v of chrVariants) {
      if (v.position >= locus.startPos && v.position <= locus.endPos) {
        positionMatchCount++;
        // If this variant doesn't have a known rsID, it's a novel variant in gene region
        if (!v.id.startsWith('rs') || !Object.keys(locus.knownRsIds).includes(v.id)) {
          matchedVariantDetails.push(`${normChr(v.chromosome)}:${v.position} ${v.ref}>${v.alt} (novel in ${locus.gene} region)`);
        }
      }
    }

    // Only include gene if we have matches (rsID or position)
    const hasEvidence = matchedRsIds.length > 0 || positionMatchCount > 0;

    if (hasEvidence) {
      const { phenotype, risk } = locus.metabolizerLogic(matchedRsIds, genotypes, positionMatchCount);

      // Confidence: rsID match is much higher confidence than position-only
      let confidence = 0;
      if (matchedRsIds.length > 0) {
        confidence = Math.min(40 + matchedRsIds.length * 20, 95);
      } else if (positionMatchCount > 0) {
        // Position-only: lower confidence, scaled by variant count
        confidence = Math.min(15 + positionMatchCount * 3, 50);
      }

      genes.push({
        gene: locus.gene,
        phenotype,
        variants: matchedVariantDetails.slice(0, 20),
        recommendations: generateGeneRecommendations(locus.gene, phenotype, risk, locus.drugMap),
        riskLevel: risk,
        matchedRsIds,
        matchedPositions: positionMatchCount,
        totalLociChecked: Object.keys(locus.knownRsIds).length,
        confidence,
      });
    }
  }

  return genes;
}

function generateGeneRecommendations(gene: string, phenotype: string, risk: 'low' | 'moderate' | 'high', drugs: string[]): string[] {
  const recs: string[] = [];

  if (risk === 'high') {
    recs.push(`ALERT: Significant ${gene} variant(s) detected - clinical action required`);
    recs.push(`Avoid or adjust doses of: ${drugs.slice(0, 4).join(', ')}`);
    recs.push('Urgent pharmacist/physician consultation recommended');
  } else if (risk === 'moderate') {
    recs.push(`${gene} ${phenotype} - dose adjustments may be needed`);
    recs.push(`Monitor response to: ${drugs.slice(0, 3).join(', ')}`);
    recs.push('Consider therapeutic drug monitoring');
  } else {
    recs.push(`Standard dosing appropriate for ${gene} substrate drugs`);
    if (drugs.length > 0) recs.push(`Applies to: ${drugs.slice(0, 3).join(', ')}`);
  }

  return recs;
}

// ========== RISK ASSESSMENT (data-driven) ==========
function calculateRiskAssessment(variants: Variant[], pharmacogenes: PharmacoGene[]): RiskAssessment {
  const highRiskGenes = pharmacogenes.filter(g => g.riskLevel === 'high');
  const moderateRiskGenes = pharmacogenes.filter(g => g.riskLevel === 'moderate');

  let overallRisk: 'low' | 'moderate' | 'high' = 'low';
  if (highRiskGenes.length > 0) overallRisk = 'high';
  else if (moderateRiskGenes.length >= 2) overallRisk = 'high';
  else if (moderateRiskGenes.length > 0) overallRisk = 'moderate';

  // Collect affected drugs from detected genes only
  const drugs = new Set<string>();
  for (const gene of pharmacogenes) {
    const locus = PHARMA_GENE_DB.find(l => l.gene === gene.gene);
    if (locus) locus.drugMap.forEach(d => drugs.add(d));
  }

  // Build risk factors from actual findings
  const riskFactors: string[] = [];
  for (const g of highRiskGenes) {
    riskFactors.push(`${g.gene}: ${g.phenotype} (${g.matchedRsIds.length} known variant(s), confidence: ${g.confidence}%)`);
  }
  for (const g of moderateRiskGenes) {
    riskFactors.push(`${g.gene}: ${g.phenotype} (${g.matchedRsIds.length > 0 ? g.matchedRsIds.join(', ') : g.matchedPositions + ' positional match(es)'})`);
  }

  const geneNames = pharmacogenes.map(g => g.gene).join(', ');
  const clinicalSignificance = pharmacogenes.length === 0
    ? `No known pharmacogene variants detected among ${PHARMA_GENE_DB.length} genes analyzed. Standard care pathway appropriate. Note: absence of detected variants does not rule out all pharmacogenomic interactions.`
    : `Identified ${pharmacogenes.length} pharmacogene(s): ${geneNames}. ${highRiskGenes.length} high-risk, ${moderateRiskGenes.length} moderate-risk finding(s). ${overallRisk === 'high' ? 'Urgent clinical review recommended.' : overallRisk === 'moderate' ? 'Clinical consultation advised for dose adjustments.' : 'Standard care with monitoring.'}`;

  return {
    overallRisk,
    affectedDrugs: Array.from(drugs),
    clinicalSignificance,
    riskFactors,
  };
}

// ========== QUALITY METRICS ==========
function calculateQualityMetrics(variants: Variant[]): QualityMetrics {
  const qualities = variants.map(v => v.quality).filter(q => q > 0);
  const sorted = [...qualities].sort((a, b) => a - b);

  const passedVariants = variants.filter(v => v.filter === 'PASS' || v.filter === '.').length;
  const failedVariants = variants.length - passedVariants;

  let transitions = 0;
  let transversions = 0;
  let snpCount = 0;
  let indelCount = 0;
  let multiAllelicCount = 0;
  let hetCount = 0;
  let homAltCount = 0;

  const readDepths = variants.map(v => v.readDepth).filter((d): d is number => d !== undefined && d > 0);

  for (const v of variants) {
    const alts = v.alt.split(',');
    if (alts.length > 1) multiAllelicCount++;

    if (v.genotype) {
      const alleles = v.genotype.replace('|', '/').split('/');
      if (alleles.length === 2) {
        if (alleles[0] !== alleles[1] && alleles.some(a => a !== '0' && a !== '.')) hetCount++;
        else if (alleles[0] === alleles[1] && alleles[0] !== '0' && alleles[0] !== '.') homAltCount++;
      }
    }

    for (const alt of alts) {
      if (alt === '.' || alt === '*') continue;
      if (v.ref.length === 1 && alt.length === 1) {
        snpCount++;
        if ((v.ref === 'A' && alt === 'G') || (v.ref === 'G' && alt === 'A') ||
            (v.ref === 'C' && alt === 'T') || (v.ref === 'T' && alt === 'C')) {
          transitions++;
        } else {
          transversions++;
        }
      } else {
        indelCount++;
      }
    }
  }

  const tiTvRatio = transversions > 0 ? Math.round((transitions / transversions) * 100) / 100 : 0;
  const hetHomRatio = homAltCount > 0 ? Math.round((hetCount / homAltCount) * 100) / 100 : 0;

  const mean = qualities.length > 0 ? qualities.reduce((a, b) => a + b, 0) / qualities.length : 0;
  const variance = qualities.length > 1
    ? qualities.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / (qualities.length - 1)
    : 0;
  const stdDev = Math.sqrt(variance);

  const q1 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.25)] : 0;
  const median = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.5)] : 0;
  const q3 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.75)] : 0;

  const ranges = [
    { range: '0-20', min: 0, max: 20 },
    { range: '20-50', min: 20, max: 50 },
    { range: '50-100', min: 50, max: 100 },
    { range: '100-200', min: 100, max: 200 },
    { range: '200-500', min: 200, max: 500 },
    { range: '500+', min: 500, max: Infinity },
  ];
  const qualityDistribution = ranges.map(r => ({
    range: r.range,
    count: qualities.filter(q => q >= r.min && q < r.max).length,
  }));

  const chromCounts: Record<string, number> = {};
  for (const v of variants) chromCounts[v.chromosome] = (chromCounts[v.chromosome] || 0) + 1;
  const chromosomeDistribution = Object.entries(chromCounts)
    .map(([chromosome, count]) => ({ chromosome, count }))
    .sort((a, b) => {
      const aNum = parseInt(a.chromosome.replace('chr', ''));
      const bNum = parseInt(b.chromosome.replace('chr', ''));
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.chromosome.localeCompare(b.chromosome);
    });

  const dbSnpAnnotated = variants.filter(v => v.id.startsWith('rs')).length;
  const novelVariants = variants.filter(v => v.id === '.' || v.id === '').length;

  return {
    totalVariants: variants.length,
    passedVariants,
    failedVariants,
    averageQuality: mean,
    medianQuality: median,
    q1Quality: q1,
    q3Quality: q3,
    minQuality: sorted.length > 0 ? sorted[0] : 0,
    maxQuality: sorted.length > 0 ? sorted[sorted.length - 1] : 0,
    qualityStdDev: stdDev,
    qualityDistribution,
    chromosomeDistribution,
    transitionCount: transitions,
    transversionCount: transversions,
    tiTvRatio,
    snpCount,
    indelCount,
    multiAllelicCount,
    hetHomRatio,
    averageReadDepth: readDepths.length > 0 ? readDepths.reduce((a, b) => a + b, 0) / readDepths.length : 0,
    dbSnpAnnotated,
    novelVariants,
  };
}

// ========== ACCURACY METRICS (Phred-scale) ==========
function calculateAccuracyMetrics(
  variants: Variant[],
  metrics: QualityMetrics,
  pharmacogenes: PharmacoGene[]
): AccuracyMetrics {
  const variantCallAccuracy = (() => {
    const qualScores = variants.map(v => v.quality).filter(q => q > 0);
    if (qualScores.length === 0) return { value: 0, method: 'No quality scores available', detail: 'VCF file lacks QUAL values' };
    const sorted = [...qualScores].sort((a, b) => a - b);
    const medianQual = sorted[Math.floor(sorted.length / 2)];
    const effectiveQual = Math.min(medianQual, 60);
    const errorProb = Math.pow(10, -effectiveQual / 10);
    const accuracy = (1 - errorProb) * 100;
    return {
      value: Math.round(accuracy * 100) / 100,
      method: 'Phred-scale quality conversion',
      detail: `Median QUAL=${medianQual.toFixed(1)}, P(error)=${errorProb.toExponential(2)}, ${qualScores.length} scored variants`,
    };
  })();

  const genotypeAccuracy = (() => {
    const gqScores = variants.map(v => v.genotypeQuality).filter((gq): gq is number => gq !== undefined && gq > 0);
    if (gqScores.length === 0) {
      const passRate = metrics.totalVariants > 0 ? metrics.passedVariants / metrics.totalVariants : 0;
      const qualFactor = Math.min(metrics.averageQuality / 200, 1);
      const estimated = (passRate * 0.6 + qualFactor * 0.4) * 100;
      return {
        value: Math.round(Math.min(estimated, 99) * 100) / 100,
        method: 'Estimated from QUAL + filter pass rate (no GQ field)',
        detail: `Pass rate=${(passRate * 100).toFixed(1)}%, Avg QUAL=${metrics.averageQuality.toFixed(1)}, no GQ data available`,
      };
    }
    const sorted = [...gqScores].sort((a, b) => a - b);
    const medianGQ = sorted[Math.floor(sorted.length / 2)];
    const effectiveGQ = Math.min(medianGQ, 60);
    const errorProb = Math.pow(10, -effectiveGQ / 10);
    const accuracy = (1 - errorProb) * 100;
    return {
      value: Math.round(accuracy * 100) / 100,
      method: 'Phred-scale genotype quality conversion',
      detail: `Median GQ=${medianGQ.toFixed(1)}, ${gqScores.length}/${variants.length} variants with GQ`,
    };
  })();

  const tiTvAccuracy = (() => {
    const observed = metrics.tiTvRatio;
    if (observed === 0 || (metrics.transitionCount + metrics.transversionCount) === 0) {
      return { value: 0, method: 'Insufficient SNP data', detail: `Ti=${metrics.transitionCount}, Tv=${metrics.transversionCount}` };
    }
    const expectedWGS = 2.1;
    const expectedWES = 2.8;
    const distWGS = Math.abs(observed - expectedWGS);
    const distWES = Math.abs(observed - expectedWES);
    const expected = distWGS < distWES ? expectedWGS : expectedWES;
    const seqType = distWGS < distWES ? 'WGS' : 'WES';
    const deviation = Math.abs(observed - expected);
    const sigma = 0.5;
    const accuracy = Math.exp(-0.5 * Math.pow(deviation / sigma, 2)) * 100;
    return {
      value: Math.round(accuracy * 100) / 100,
      method: `Gaussian deviation from expected ${seqType} ratio`,
      detail: `Observed=${observed}, Expected=${expected} (${seqType}), Ti=${metrics.transitionCount}, Tv=${metrics.transversionCount}`,
    };
  })();

  const filterSensitivity = (() => {
    if (metrics.totalVariants === 0) return { value: 0, method: 'No variants', detail: 'Empty dataset' };
    const passRate = metrics.passedVariants / metrics.totalVariants;
    let score: number;
    // Most VCFs have very high pass rates (>98% or even 100% when FILTER='.'), so don't penalize harshly
    if (passRate >= 0.85 && passRate <= 0.98) score = 95 + (1 - Math.abs(passRate - 0.92) / 0.06) * 5;
    else if (passRate > 0.98) score = 85 + (1 - passRate) * 500; // 100% pass = 85, much better than before
    else if (passRate >= 0.5) score = 60 + (passRate - 0.5) * 100;
    else score = passRate * 120;
    return {
      value: Math.round(Math.min(Math.max(score, 0), 100) * 100) / 100,
      method: 'Filter pass rate optimization analysis',
      detail: `${metrics.passedVariants}/${metrics.totalVariants} passed (${(passRate * 100).toFixed(1)}%), optimal: 85-98%`,
    };
  })();

  const pharmacogeneConfidence = (() => {
    if (pharmacogenes.length === 0) {
      return { value: 0, method: 'No pharmacogenes detected', detail: `0/${PHARMA_GENE_DB.length} genes had matching variants` };
    }
    // Weighted average of individual gene confidences
    const avgConfidence = pharmacogenes.reduce((acc, g) => acc + g.confidence, 0) / pharmacogenes.length;
    const rsIdMatchCount = pharmacogenes.reduce((acc, g) => acc + g.matchedRsIds.length, 0);
    const geneDetectionRate = pharmacogenes.length / PHARMA_GENE_DB.length;
    // Composite: avg gene confidence (60%) + detection breadth (20%) + rsID enrichment (20%)
    const rsIdFactor = Math.min(rsIdMatchCount / 10, 1) * 100;
    const composite = avgConfidence * 0.6 + geneDetectionRate * 100 * 0.2 + rsIdFactor * 0.2;
    return {
      value: Math.round(Math.min(composite, 100) * 100) / 100,
      method: 'Gene confidence + detection breadth + rsID enrichment',
      detail: `${pharmacogenes.length} genes, ${rsIdMatchCount} rsID matches, avg confidence=${avgConfidence.toFixed(0)}%`,
    };
  })();

  const overallReliability = (() => {
    // Only include dimensions with real data (value > 0)
    const dims: { value: number; weight: number; label: string }[] = [];
    if (variantCallAccuracy.value > 0) dims.push({ value: variantCallAccuracy.value, weight: 0.30, label: 'VCA' });
    if (genotypeAccuracy.value > 0) dims.push({ value: genotypeAccuracy.value, weight: 0.20, label: 'GT' });
    if (tiTvAccuracy.value > 0) dims.push({ value: tiTvAccuracy.value, weight: 0.15, label: 'TiTv' });
    if (filterSensitivity.value > 0) dims.push({ value: filterSensitivity.value, weight: 0.15, label: 'Filter' });
    if (pharmacogeneConfidence.value > 0) dims.push({ value: pharmacogeneConfidence.value, weight: 0.20, label: 'PGx' });

    if (dims.length === 0) {
      return { value: 0, method: 'No data available for reliability calculation', detail: 'All accuracy dimensions returned 0' };
    }

    // Normalize weights among active dimensions
    const totalW = dims.reduce((a, d) => a + d.weight, 0);
    const composite = dims.reduce((sum, d) => sum + d.value * (d.weight / totalW), 0);
    const weightDesc = dims.map(d => `${d.label}:${Math.round(d.weight / totalW * 100)}%`).join(', ');

    return {
      value: Math.round(composite * 100) / 100,
      method: `Weighted composite (${weightDesc})`,
      detail: `${dims.length} active dimension(s) with real data`,
    };
  })();

  return { variantCallAccuracy, genotypeAccuracy, tiTvAccuracy, filterSensitivity, pharmacogeneConfidence, overallReliability };
}

// ========== JUDGING CRITERIA ==========
function calculateJudgingCriteria(
  variants: Variant[],
  metrics: QualityMetrics,
  pharmacogenes: PharmacoGene[],
  metadata: VCFMetadata
): JudgingCriteria {
  const dataCompleteness = (() => {
    const total = variants.length || 1;
    const withId = variants.filter(v => v.id !== '.' && v.id !== '').length;
    const withFilter = variants.filter(v => v.filter !== '.' && v.filter !== '').length;
    const withInfo = variants.filter(v => v.info !== '.' && v.info !== '').length;
    const withGenotype = variants.filter(v => v.genotype !== undefined).length;
    const withReadDepth = variants.filter(v => v.readDepth !== undefined && v.readDepth > 0).length;

    const idRatio = withId / total;
    const filterRatio = withFilter / total;
    const infoRatio = withInfo / total;
    const gtRatio = withGenotype / total;
    const dpRatio = withReadDepth / total;

    // Balanced scoring: core fields weighted higher, optional fields (GT/DP) are bonuses
    // Most VCFs have ID + FILTER + INFO but may lack GT/DP
    const coreScore = (idRatio * 25 + filterRatio * 25 + infoRatio * 25); // 75 max from core
    const bonusScore = (gtRatio * 15 + dpRatio * 10); // 25 max from optional
    const score = Math.round(coreScore + bonusScore);

    // Ensure minimum 35 if we at least have basic variant data
    const adjustedScore = variants.length > 0 ? Math.max(score, 35) : score;

    return {
      score: Math.min(adjustedScore, 100),
      label: adjustedScore >= 80 ? 'Excellent' : adjustedScore >= 60 ? 'Good' : adjustedScore >= 40 ? 'Fair' : 'Poor',
      detail: `${variants.length} variants, ${metadata.infoFields.length} INFO fields, ${metadata.sampleNames.length} sample(s)`,
      rawMetrics: [
        `rsID annotation: ${(idRatio * 100).toFixed(1)}% (${withId}/${total})`,
        `FILTER field: ${(filterRatio * 100).toFixed(1)}% (${withFilter}/${total})`,
        `INFO field: ${(infoRatio * 100).toFixed(1)}% (${withInfo}/${total})`,
        `Genotype (GT): ${(gtRatio * 100).toFixed(1)}% (${withGenotype}/${total})`,
        `Read Depth (DP): ${(dpRatio * 100).toFixed(1)}% (${withReadDepth}/${total})`,
      ],
    };
  })();

  const variantQuality = (() => {
    if (metrics.totalVariants === 0) return { score: 0, label: 'No Data', detail: 'No variants', rawMetrics: [] };
    // More generous median scaling: 30 QUAL = decent, 100 = very good, 200+ = excellent
    const medianFactor = metrics.medianQuality >= 100 ? 35
      : metrics.medianQuality >= 50 ? 25 + (metrics.medianQuality - 50) / 50 * 10
      : metrics.medianQuality >= 20 ? 15 + (metrics.medianQuality - 20) / 30 * 10
      : Math.min(metrics.medianQuality / 20, 1) * 15;
    const iqrFactor = (() => {
      const iqr = metrics.q3Quality - metrics.q1Quality;
      if (metrics.medianQuality === 0) return 0;
      const cv = iqr / metrics.medianQuality;
      if (cv < 0.5) return 20;
      if (cv < 1.0) return 17;
      if (cv < 2.0) return 12;
      return 8;
    })();
    const highQualFraction = (variants.filter(v => v.quality >= 20).length / metrics.totalVariants) * 25;
    const passRateFactor = (metrics.passedVariants / Math.max(metrics.totalVariants, 1)) * 20;
    const score = Math.round(medianFactor + iqrFactor + highQualFraction + passRateFactor);
    return {
      score: Math.min(score, 100),
      label: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Moderate' : 'Low',
      detail: `Median QUAL=${metrics.medianQuality.toFixed(1)}, Std Dev=${metrics.qualityStdDev.toFixed(1)}`,
      rawMetrics: [
        `Median QUAL: ${metrics.medianQuality.toFixed(1)}`,
        `IQR: ${metrics.q1Quality.toFixed(1)} - ${metrics.q3Quality.toFixed(1)}`,
        `Std Dev: ${metrics.qualityStdDev.toFixed(1)}`,
        `QUAL >= 30: ${((variants.filter(v => v.quality >= 30).length / Math.max(metrics.totalVariants, 1)) * 100).toFixed(1)}%`,
        `Pass rate: ${((metrics.passedVariants / Math.max(metrics.totalVariants, 1)) * 100).toFixed(1)}%`,
      ],
    };
  })();

  const coverageDepth = (() => {
    const dpVariants = variants.filter(v => v.readDepth !== undefined && v.readDepth > 0);
    if (dpVariants.length === 0) {
      const passRate = metrics.totalVariants > 0 ? metrics.passedVariants / metrics.totalVariants : 0;
      // Without DP data, estimate generously from pass rate + variant count. Most pipelines that produce PASS variants had adequate coverage.
      const passScore = passRate * 70;
      const volumeScore = Math.min(metrics.totalVariants / 500, 1) * 30;
      const score = Math.round(passScore + volumeScore);
      return {
        score: Math.min(Math.max(score, 40), 100),
        label: score >= 60 ? 'Moderate' : 'Estimated',
        detail: `No DP field. Estimated from pass rate (${(passRate * 100).toFixed(1)}%) and variant volume`,
        rawMetrics: [`Read depth data: Not available`, `Filter pass rate: ${(passRate * 100).toFixed(1)}%`, `Total variants: ${metrics.totalVariants}`],
      };
    }
    const avgDP = metrics.averageReadDepth;
    let score: number;
    if (avgDP >= 30) score = 85 + Math.min((avgDP - 30) / 70, 1) * 15;
    else if (avgDP >= 20) score = 70 + ((avgDP - 20) / 10) * 15;
    else if (avgDP >= 10) score = 50 + ((avgDP - 10) / 10) * 20;
    else score = (avgDP / 10) * 50;
    return {
      score: Math.round(Math.min(score, 100)),
      label: avgDP >= 30 ? 'High' : avgDP >= 20 ? 'Adequate' : avgDP >= 10 ? 'Low' : 'Very Low',
      detail: `Mean depth: ${avgDP.toFixed(1)}x across ${dpVariants.length} variants`,
      rawMetrics: [`Mean read depth: ${avgDP.toFixed(1)}x`, `Variants with DP: ${dpVariants.length}/${variants.length}`, `Target: 30x (WGS) / 100x (WES)`],
    };
  })();

  const tiTvRatioScore = (() => {
    const observed = metrics.tiTvRatio;
    const totalSNPs = metrics.transitionCount + metrics.transversionCount;
    if (totalSNPs === 0) return { score: 0, label: 'N/A', detail: 'No SNPs detected', rawMetrics: ['No SNP data'] };
    const expectedWGS = 2.1;
    const expectedWES = 2.8;
    const distWGS = Math.abs(observed - expectedWGS);
    const distWES = Math.abs(observed - expectedWES);
    const expected = distWGS < distWES ? expectedWGS : expectedWES;
    const seqType = distWGS < distWES ? 'WGS' : 'WES';
    const deviation = Math.abs(observed - expected);
    const sigma = 0.4;
    const score = Math.round(Math.exp(-0.5 * Math.pow(deviation / sigma, 2)) * 100);
    return {
      score: Math.min(score, 100),
      label: score >= 85 ? 'Normal' : score >= 60 ? 'Acceptable' : score >= 40 ? 'Marginal' : 'Anomalous',
      detail: `Ti/Tv=${observed} (expected ~${expected} for ${seqType})`,
      rawMetrics: [`Observed Ti/Tv: ${observed}`, `Expected (${seqType}): ${expected}`, `Transitions: ${metrics.transitionCount}`, `Transversions: ${metrics.transversionCount}`, `Deviation: ${deviation.toFixed(3)}`],
    };
  })();

  const clinicalRelevance = (() => {
    const geneCount = pharmacogenes.length;
    const highRisk = pharmacogenes.filter(g => g.riskLevel === 'high').length;
    const rsIdMatches = pharmacogenes.reduce((acc, g) => acc + g.matchedRsIds.length, 0);
    const avgConfidence = geneCount > 0 ? pharmacogenes.reduce((acc, g) => acc + g.confidence, 0) / geneCount : 0;

    // More generous scoring: even 1-2 genes with rsID matches is clinically relevant
    const geneFactor = Math.min(geneCount / 3, 1) * 30; // 3 genes = full score
    const rsIdFactor = Math.min(rsIdMatches / 4, 1) * 25; // 4 rsID matches = full score
    const confidenceFactor = (avgConfidence / 100) * 25;
    const riskFactor = (highRisk > 0 ? 15 : geneCount > 0 ? 8 : 0) + Math.min(geneCount / 2, 1) * 5;

    const score = Math.round(geneFactor + rsIdFactor + confidenceFactor + riskFactor);

    return {
      score: Math.min(score, 100),
      label: score >= 80 ? 'High' : score >= 60 ? 'Moderate' : score >= 35 ? 'Limited' : 'Minimal',
      detail: `${geneCount} gene(s), ${rsIdMatches} rsID match(es), avg confidence ${avgConfidence.toFixed(0)}%`,
      rawMetrics: [
        `Pharmacogenes detected: ${geneCount}/${PHARMA_GENE_DB.length}`,
        `rsID matches: ${rsIdMatches}`,
        `High-risk genes: ${highRisk}`,
        `Avg gene confidence: ${avgConfidence.toFixed(1)}%`,
        `Total affected drugs: ${pharmacogenes.reduce((acc, g) => { const l = PHARMA_GENE_DB.find(x => x.gene === g.gene); return acc + (l ? l.drugMap.length : 0); }, 0)}`,
      ],
    };
  })();

  // Only include criteria with meaningful data in scoring
  const scoreParts: { score: number; weight: number }[] = [];
  scoreParts.push({ score: dataCompleteness.score, weight: 0.15 });

  // Always include variant quality if we have variants
  if (variants.length > 0) scoreParts.push({ score: variantQuality.score, weight: 0.30 });

  // Only include coverage if DP data exists or we have decent pass rate
  scoreParts.push({ score: coverageDepth.score, weight: 0.20 });

  // Only include Ti/Tv if we actually have SNP data
  if (metrics.transitionCount + metrics.transversionCount > 0) {
    scoreParts.push({ score: tiTvRatioScore.score, weight: 0.15 });
  }

  // Always include clinical relevance
  scoreParts.push({ score: clinicalRelevance.score, weight: 0.20 });

  // Normalize weights to sum to 1.0
  const totalWeight = scoreParts.reduce((a, p) => a + p.weight, 0);
  const overallScore = Math.round(
    scoreParts.reduce((sum, p) => sum + p.score * (p.weight / totalWeight), 0)
  );

  const grade: 'A' | 'B' | 'C' | 'D' | 'F' =
    overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 50 ? 'C' : overallScore >= 35 ? 'D' : 'F';
  const confidenceLevel: 'High' | 'Medium' | 'Low' =
    overallScore >= 75 ? 'High' : overallScore >= 45 ? 'Medium' : 'Low';

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (variantQuality.score >= 75) strengths.push(`Strong variant quality (median QUAL=${metrics.medianQuality.toFixed(0)}) supports reliable calls`);
  else if (variantQuality.score < 50) weaknesses.push(`Low variant quality (median QUAL=${metrics.medianQuality.toFixed(0)}) may reduce reliability`);

  if (coverageDepth.score >= 75) strengths.push(`Good coverage depth supports confident variant calling`);
  else if (coverageDepth.score < 50) weaknesses.push(`Limited read depth reduces confidence in heterozygous calls`);

  if (tiTvRatioScore.score >= 75) strengths.push(`Ti/Tv ratio (${metrics.tiTvRatio}) consistent with high-quality data`);
  else if (tiTvRatioScore.score < 50) weaknesses.push(`Ti/Tv ratio (${metrics.tiTvRatio}) deviates from expected, suggesting artifacts`);

  if (clinicalRelevance.score >= 70) strengths.push(`${pharmacogenes.length} pharmacogene(s) detected with rsID-level evidence`);
  else if (pharmacogenes.length === 0) weaknesses.push(`No pharmacogene variants detected - VCF may lack coverage in pharmacogene regions`);
  else weaknesses.push(`Limited pharmacogene evidence (${pharmacogenes.reduce((a, g) => a + g.matchedRsIds.length, 0)} rsID matches)`);

  if (dataCompleteness.score >= 70) strengths.push(`Well-annotated VCF with comprehensive field population`);
  else weaknesses.push(`Incomplete annotation limits analysis depth`);

  if (metrics.dbSnpAnnotated > 0) strengths.push(`${metrics.dbSnpAnnotated} dbSNP-annotated variants for clinical reference`);

  if (metrics.hetHomRatio > 0 && metrics.hetHomRatio >= 1.2 && metrics.hetHomRatio <= 2.5)
    strengths.push(`Het/Hom ratio (${metrics.hetHomRatio}) within normal diploid range`);
  else if (metrics.hetHomRatio > 0 && (metrics.hetHomRatio < 1.0 || metrics.hetHomRatio > 3.0))
    weaknesses.push(`Unusual Het/Hom ratio (${metrics.hetHomRatio}) may indicate sample issues`);

  return { overallScore, dataCompleteness, variantQuality, coverageDepth, tiTvRatioScore, clinicalRelevance, grade, confidenceLevel, strengths, weaknesses };
}

// ========== DATA VALUE INSIGHTS (data-driven) ==========
function generateDataValueInsights(
  variants: Variant[],
  metrics: QualityMetrics,
  pharmacogenes: PharmacoGene[],
  riskAssessment: RiskAssessment,
  accuracy: AccuracyMetrics
): DataValueInsight[] {
  const insights: DataValueInsight[] = [];

  // Variant landscape - unique to each file
  insights.push({
    category: 'Genomic Coverage',
    title: 'Variant Landscape',
    description: `${metrics.totalVariants.toLocaleString()} genetic variants across ${metrics.chromosomeDistribution.length} chromosomes: ${metrics.snpCount.toLocaleString()} SNPs, ${metrics.indelCount.toLocaleString()} indels, ${metrics.multiAllelicCount} multi-allelic sites. Het/Hom ratio: ${metrics.hetHomRatio || 'N/A'}. ${metrics.totalVariants > 500 ? 'Comprehensive genomic profile suitable for pharmacogenomic analysis.' : metrics.totalVariants > 100 ? 'Moderate coverage - key pharmacogenes may be partially represented.' : 'Limited variant set - results should be interpreted with caution.'}`,
    impact: metrics.totalVariants > 500 ? 'high' : metrics.totalVariants > 100 ? 'medium' : 'low',
    metric: `${metrics.totalVariants.toLocaleString()} variants`,
  });

  // Pharmacogene findings - unique per file based on actual rsID matches
  if (pharmacogenes.length > 0) {
    const rsIdTotal = pharmacogenes.reduce((a, g) => a + g.matchedRsIds.length, 0);
    const posOnly = pharmacogenes.filter(g => g.matchedRsIds.length === 0).length;
    insights.push({
      category: 'Precision Medicine',
      title: 'Pharmacogene Discovery',
      description: `${pharmacogenes.length} pharmacogene(s) detected: ${pharmacogenes.map(g => `${g.gene} (${g.phenotype})`).join(', ')}. Evidence: ${rsIdTotal} known rsID variant(s)${posOnly > 0 ? `, ${posOnly} gene(s) by position only` : ''}. Each gene influences specific drug metabolism pathways.`,
      impact: pharmacogenes.some(g => g.riskLevel === 'high') ? 'high' : 'medium',
      metric: `${pharmacogenes.length} genes`,
    });
  } else {
    insights.push({
      category: 'Precision Medicine',
      title: 'Pharmacogene Coverage',
      description: `No known pharmacogene variants detected among ${PHARMA_GENE_DB.length} genes screened. This may indicate (a) normal/wild-type genotype across all loci, (b) insufficient coverage in pharmacogene regions, or (c) variants not annotated with rsIDs. Consider re-analysis with annotated VCF.`,
      impact: 'low',
      metric: `0/${PHARMA_GENE_DB.length} genes`,
    });
  }

  // Drug safety - based on actual detected genes
  if (riskAssessment.affectedDrugs.length > 0) {
    insights.push({
      category: 'Drug Safety',
      title: 'Medication Impact',
      description: `${riskAssessment.affectedDrugs.length} medications may require dose adjustments: ${riskAssessment.affectedDrugs.slice(0, 5).join(', ')}${riskAssessment.affectedDrugs.length > 5 ? ` and ${riskAssessment.affectedDrugs.length - 5} others` : ''}. Based on detected pharmacogene variants with ${pharmacogenes.filter(g => g.matchedRsIds.length > 0).length} rsID-confirmed gene(s).`,
      impact: riskAssessment.affectedDrugs.length > 5 ? 'high' : riskAssessment.affectedDrugs.length > 2 ? 'medium' : 'low',
      metric: `${riskAssessment.affectedDrugs.length} drugs`,
    });
  }

  // Data quality - unique per file
  insights.push({
    category: 'Data Quality',
    title: 'Sequencing Reliability',
    description: `Variant call accuracy: ${accuracy.variantCallAccuracy.value.toFixed(1)}% (${accuracy.variantCallAccuracy.method}). Filter pass rate: ${((metrics.passedVariants / Math.max(metrics.totalVariants, 1)) * 100).toFixed(1)}%. ${metrics.tiTvRatio > 0 ? `Ti/Tv ratio: ${metrics.tiTvRatio} (${metrics.tiTvRatio >= 1.8 && metrics.tiTvRatio <= 3.2 ? 'within expected range' : 'outside expected range'}).` : 'No Ti/Tv ratio available.'} Avg read depth: ${metrics.averageReadDepth > 0 ? metrics.averageReadDepth.toFixed(1) + 'x' : 'N/A'}.`,
    impact: accuracy.variantCallAccuracy.value >= 99 ? 'high' : accuracy.variantCallAccuracy.value >= 90 ? 'medium' : 'low',
    metric: `${accuracy.variantCallAccuracy.value.toFixed(1)}% accuracy`,
  });

  // Risk factors - unique per file
  if (riskAssessment.riskFactors.length > 0) {
    insights.push({
      category: 'Clinical Alert',
      title: 'Actionable Findings',
      description: `${riskAssessment.riskFactors.length} risk factor(s) identified: ${riskAssessment.riskFactors.slice(0, 2).join('; ')}${riskAssessment.riskFactors.length > 2 ? ` and ${riskAssessment.riskFactors.length - 2} more` : ''}. Clinical review recommended.`,
      impact: riskAssessment.overallRisk === 'high' ? 'high' : 'medium',
      metric: `${riskAssessment.riskFactors.length} factors`,
    });
  }

  // Annotation coverage - unique per file
  if (metrics.dbSnpAnnotated > 0 || metrics.novelVariants > 0) {
    const annotationRate = ((metrics.dbSnpAnnotated / Math.max(metrics.totalVariants, 1)) * 100).toFixed(1);
    insights.push({
      category: 'Annotation',
      title: 'dbSNP Coverage',
      description: `${metrics.dbSnpAnnotated.toLocaleString()} variants (${annotationRate}%) have dbSNP annotations. ${metrics.novelVariants.toLocaleString()} novel variants without database records. ${parseFloat(annotationRate) > 80 ? 'High annotation rate enables confident pharmacogenomic interpretation.' : parseFloat(annotationRate) > 30 ? 'Moderate annotation - some variants may lack clinical context.' : 'Low annotation rate - consider re-annotating with Ensembl VEP or SnpEff.'}`,
      impact: parseFloat(annotationRate) > 50 ? 'high' : 'medium',
      metric: `${annotationRate}% annotated`,
    });
  }

  return insights;
}

// ========== DRUG-SPECIFIC ANALYSIS ==========
// Maps user-friendly drug names to the genes in our database
const DRUG_GENE_MAP: Record<string, string[]> = {
  'CODEINE': ['CYP2D6'],
  'WARFARIN': ['CYP2C9', 'VKORC1'],
  'CLOPIDOGREL': ['CYP2C19'],
  'SIMVASTATIN': ['CYP3A4', 'SLCO1B1'],
  'AZATHIOPRINE': ['TPMT'],
  'FLUOROURACIL': ['DPYD'],
};

export function analyzeDrugs(drugs: string[], pharmacogenes: PharmacoGene[]): DrugAnalysis[] {
  return drugs.map((drug) => {
    const relatedGenes = DRUG_GENE_MAP[drug.toUpperCase()] || [];
    const detectedGenes = pharmacogenes.filter((g) => relatedGenes.includes(g.gene));

    // Calculate risk from detected genes
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    const highRisk = detectedGenes.filter((g) => g.riskLevel === 'high');
    const modRisk = detectedGenes.filter((g) => g.riskLevel === 'moderate');

    if (highRisk.length > 0) riskLevel = 'high';
    else if (modRisk.length > 0) riskLevel = 'moderate';

    // Confidence from gene evidence
    const confidence = detectedGenes.length > 0
      ? Math.round(detectedGenes.reduce((a, g) => a + g.confidence, 0) / detectedGenes.length)
      : 0;

    // Build recommendation
    let recommendation = '';
    let clinicalNote = '';

    if (detectedGenes.length === 0) {
      recommendation = `No pharmacogene variants detected for ${drug}-related genes (${relatedGenes.join(', ')}). Standard dosing appropriate based on available data.`;
      clinicalNote = `Absence of detected variants in ${relatedGenes.join(', ')} suggests standard ${drug} metabolism. However, this does not rule out all pharmacogenomic interactions. Consider targeted testing if adverse effects occur.`;
    } else if (riskLevel === 'high') {
      const geneDetails = detectedGenes.map((g) => `${g.gene}: ${g.phenotype}`).join('; ');
      recommendation = `HIGH RISK: Significant variant(s) detected in ${geneDetails}. Avoid ${drug} or use alternative medication. Urgent clinical consultation recommended.`;
      clinicalNote = `Critical pharmacogenomic finding for ${drug}. ${detectedGenes.map((g) => `${g.gene} shows ${g.phenotype} with ${g.matchedRsIds.length} rsID match(es) at ${g.confidence}% confidence.`).join(' ')} Dose adjustment or alternative therapy strongly recommended.`;
    } else if (riskLevel === 'moderate') {
      const geneDetails = detectedGenes.map((g) => `${g.gene}: ${g.phenotype}`).join('; ');
      recommendation = `MODERATE RISK: Variant(s) detected in ${geneDetails}. Consider dose adjustment for ${drug}. Therapeutic drug monitoring advised.`;
      clinicalNote = `Pharmacogene variant(s) may affect ${drug} metabolism. ${detectedGenes.map((g) => `${g.gene}: ${g.phenotype}.`).join(' ')} Monitor therapeutic response and consider pharmacokinetic testing.`;
    } else {
      recommendation = `LOW RISK: Detected genes show normal function. Standard ${drug} dosing expected to be appropriate.`;
      clinicalNote = `Normal metabolizer status for ${drug}-related genes. Standard prescribing protocols apply.`;
    }

    return { drug, relatedGenes, detectedGenes, riskLevel, confidence, recommendation, clinicalNote };
  });
}

// ========== CONVERT TO STANDARDIZED JSON FORMAT ==========
/**
 * Converts VCF analysis results to standardized pharmacogenomic JSON format
 * @param analysisResult - The analysis result from parseVCFFile
 * @param drug - The drug name to generate assessment for
 * @param patientId - Optional patient identifier (defaults to PATIENT_XXXX format)
 * @param explanation - Optional LLM-generated explanation
 * @returns PharmacoJSON formatted result
 */
export function convertToPharmacoJSON(
  analysisResult: AnalysisResult,
  drug: string,
  patientId: string = `PATIENT_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  explanation: string = ''
): PharmacoJSON {
  // Find primary gene for the drug
  const relatedGenes = DRUG_GENE_MAP[drug.toUpperCase()] || [];
  const detectedGenes = analysisResult.pharmacogenes.filter((g) => relatedGenes.includes(g.gene));
  const primaryGene = detectedGenes.length > 0 ? detectedGenes[0] : relatedGenes[0] || 'UNKNOWN';

  // Map risk level to severity
  const riskToSeverity = (risk: string): 'none' | 'low' | 'moderate' | 'high' | 'critical' => {
    switch (risk) {
      case 'high': return 'critical';
      case 'moderate': return 'high';
      case 'low': return 'low';
      default: return 'none';
    }
  };

  // Determine risk label
  const getRiskLabel = (detectedGenes: PharmacoGene[]): 'Safe' | 'Adjust Dosage' | 'Toxic' | 'Contraindicated' | 'Unknown' => {
    if (detectedGenes.length === 0) return 'Safe';
    const highRisk = detectedGenes.filter((g) => g.riskLevel === 'high');
    const modRisk = detectedGenes.filter((g) => g.riskLevel === 'moderate');

    if (highRisk.length > 0 && highRisk.some((g) => g.phenotype.toLowerCase().includes('poor'))) return 'Contraindicated';
    if (highRisk.length > 0) return 'Toxic';
    if (modRisk.length > 0) return 'Adjust Dosage';
    return 'Safe';
  };

  // Build pharmacogenomic profile
  const profile: PharmacoProfile = {
    primary_gene: typeof primaryGene === 'string' ? primaryGene : primaryGene.gene,
    diplotype: detectedGenes.length > 0 ? `${detectedGenes[0].phenotype.charAt(0)}/*Y` : '*1/*1',
    phenotype: detectedGenes.length > 0 ? detectedGenes[0].phenotype : 'Normal Metabolizer',
    detected_variants: analysisResult.variants
      .filter((v) => v.id && v.id.startsWith('rs'))
      .slice(0, 10)
      .map((v) => ({
        rsid: v.id,
        chromosome: v.chromosome,
        position: v.position,
        ref: v.ref,
        alt: v.alt,
      })),
  };

  // Build risk assessment
  const riskLevel = detectedGenes.length > 0
    ? Math.max(...detectedGenes.map((g) => (g.riskLevel === 'high' ? 3 : g.riskLevel === 'moderate' ? 2 : 1)))
    : 1;
  const confidenceScore = detectedGenes.length > 0
    ? detectedGenes.reduce((a, g) => a + g.confidence, 0) / detectedGenes.length / 100
    : 0.5;

  const riskAssessment: RiskAssessmentJson = {
    risk_label: getRiskLabel(detectedGenes),
    confidence_score: Math.min(confidenceScore, 0.95),
    severity: riskToSeverity(
      detectedGenes.length > 0 ? (riskLevel === 3 ? 'high' : 'moderate') : 'low'
    ),
  };

  // Build clinical recommendation
  const clinicalRec: ClinicalRecommendation = {
    dosage_adjustment: detectedGenes.length > 0 ? true : false,
    monitoring_required: detectedGenes.length > 0,
    monitoring_type: detectedGenes.length > 0 ? 'Therapeutic Drug Monitoring (TDM)' : undefined,
    contraindicated: detectedGenes.length > 0 && riskAssessment.risk_label === 'Contraindicated',
    notes: detectedGenes
      .map((g) => `${g.gene}: ${g.phenotype} (${g.recommendations[0]})`)
      .join('; '),
  };

  // Build LLM explanation
  const llmExplanation: LLMExplanation = {
    summary: explanation || (
      detectedGenes.length === 0
        ? `No significant pharmacogene variants detected for ${drug}. Standard dosing protocols are expected to be appropriate.`
        : `Detected ${detectedGenes.length} pharmacogene variant(s) affecting ${drug} metabolism. Clinical review recommended.`
    ),
    clinical_implications: detectedGenes
      .map((g) => `${g.gene} ${g.phenotype} may affect ${drug} pharmacokinetics`)
      .join('; '),
    dosing_recommendations: clinicalRec.dosage_adjustment
      ? `Consider dose adjustment based on ${detectedGenes.map((g) => g.gene).join('/')} phenotype`
      : 'Standard dosing appropriate',
    monitoring_recommendations: clinicalRec.monitoring_required
      ? 'Therapeutic drug monitoring recommended; monitor for treatment response and adverse effects'
      : 'Standard clinical monitoring',
  };

  // Build quality metrics
  const qualityMetrics: QualityMetricsJson = {
    vcf_parsing_success: true,
    total_variants: analysisResult.totalVariants,
    passed_variants: analysisResult.qualityMetrics.passedVariants,
    average_quality: analysisResult.qualityMetrics.averageQuality,
    median_quality: analysisResult.qualityMetrics.medianQuality,
    snp_count: analysisResult.qualityMetrics.snpCount,
    indel_count: analysisResult.qualityMetrics.indelCount,
    confidence_score: analysisResult.judgingCriteria.overallScore,
  };

  return {
    patient_id: patientId,
    drug,
    timestamp: new Date().toISOString(),
    risk_assessment: riskAssessment,
    pharmacogenomic_profile: profile,
    clinical_recommendation: clinicalRec,
    llm_generated_explanation: llmExplanation,
    quality_metrics: qualityMetrics,
  };
}

// ========== VALIDATION ==========
export function validateVCFFile(content: string): { valid: boolean; error?: string } {
  const lines = content.split('\n');
  const hasHeader = lines.some(line => line.startsWith('##fileformat=VCFv'));
  if (!hasHeader) return { valid: false, error: 'Invalid VCF file format. Missing VCF header (##fileformat=VCFv4.x)' };
  const hasColumns = lines.some(line => line.startsWith('#CHROM'));
  if (!hasColumns) return { valid: false, error: 'Invalid VCF file format. Missing column header (#CHROM)' };
  const hasData = lines.some(line => !line.startsWith('#') && line.trim());
  if (!hasData) return { valid: false, error: 'VCF file contains no variant data' };
  return { valid: true };
}
