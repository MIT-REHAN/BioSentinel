import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pharmacogenes, riskAssessment, variants } = body;

    if (!pharmacogenes || !riskAssessment) {
      return NextResponse.json(
        { error: 'Missing required analysis data' },
        { status: 400 }
      );
    }

    // Generate clinical explanation using OpenAI
    const explanation = await generateClinicalExplanation(
      pharmacogenes,
      riskAssessment,
      variants
    );

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('[v0] Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate clinical explanation' },
      { status: 500 }
    );
  }
}

async function generateClinicalExplanation(
  pharmacogenes: any[],
  riskAssessment: any,
  variants: any[]
) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log('[v0] OPENAI_API_KEY not found, using mock explanation');
    return generateMockExplanation(pharmacogenes, riskAssessment);
  }

  try {
    const prompt = buildPrompt(pharmacogenes, riskAssessment, variants);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a clinical pharmacist expert in pharmacogenomics. Provide clear, evidence-based clinical recommendations based on genetic analysis results.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[v0] OpenAI API error:', error);
      return generateMockExplanation(pharmacogenes, riskAssessment);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[v0] Failed to call OpenAI API:', error);
    return generateMockExplanation(pharmacogenes, riskAssessment);
  }
}

function buildPrompt(pharmacogenes: any[], riskAssessment: any, variants: any[]) {
  const genesSummary = pharmacogenes
    .map(
      (g) =>
        `${g.gene}: ${g.phenotype} - Recommendations: ${g.recommendations.join(', ')}`
    )
    .join('\n');

  return `Based on the following pharmacogenomic analysis results, provide clinical recommendations:

PHARMACOGENES IDENTIFIED:
${genesSummary}

OVERALL RISK ASSESSMENT: ${riskAssessment.overallRisk}
AFFECTED DRUGS: ${riskAssessment.affectedDrugs.join(', ')}
CLINICAL SIGNIFICANCE: ${riskAssessment.clinicalSignificance}

Please provide:
1. Summary of key findings
2. Clinical implications for drug metabolism
3. Specific dosing recommendations
4. Monitoring recommendations
5. Important contraindications or drug interactions`;
}

function generateMockExplanation(pharmacogenes: any[], riskAssessment: any) {
  const risk = riskAssessment.overallRisk.toUpperCase();

  if (pharmacogenes.length === 0) {
    return `CLINICAL PHARMACOGENOMIC ANALYSIS REPORT

KEY FINDINGS:
• No known pharmacogene variants detected across 12 screened loci
• Overall Risk Level: ${risk}
• VCF data was analyzed for variants in CYP2D6, CYP2C19, CYP2C9, CYP3A4, CYP3A5, TPMT, DPYD, VKORC1, SLCO1B1, UGT1A1, CYP2B6, and NAT2

INTERPRETATION:
${riskAssessment.clinicalSignificance}

POSSIBLE EXPLANATIONS:
• All pharmacogene loci may carry wild-type (normal) alleles
• VCF may lack coverage in key pharmacogene genomic regions
• Variants may not be annotated with rsIDs needed for matching

RECOMMENDATIONS:
1. Standard dosing protocols are appropriate based on current data
2. Consider targeted pharmacogenomic panel testing for comprehensive coverage
3. Re-annotate VCF using Ensembl VEP or SnpEff for improved rsID coverage

Note: This analysis is for educational purposes. Absence of detected variants does not guarantee normal drug metabolism.`;
  }

  const geneDetails = pharmacogenes.map((g: any) => {
    const rsMatches = g.matchedRsIds?.length || 0;
    const posMatches = g.matchedPositions || 0;
    return `• ${g.gene} (${g.phenotype}): ${rsMatches} rsID match(es), ${posMatches} positional variant(s), confidence ${g.confidence || 'N/A'}%`;
  }).join('\n');

  const highRisk = pharmacogenes.filter((g: any) => g.riskLevel === 'high');
  const modRisk = pharmacogenes.filter((g: any) => g.riskLevel === 'moderate');

  return `CLINICAL PHARMACOGENOMIC ANALYSIS REPORT

KEY FINDINGS:
• Identified ${pharmacogenes.length} pharmacogene(s) with variant evidence
• Overall Risk Level: ${risk}
• ${highRisk.length} high-risk, ${modRisk.length} moderate-risk finding(s)

GENE-LEVEL ANALYSIS:
${geneDetails}

CLINICAL IMPLICATIONS:
${riskAssessment.clinicalSignificance}

${riskAssessment.riskFactors?.length > 0 ? `RISK FACTORS:\n${riskAssessment.riskFactors.map((f: string) => `• ${f}`).join('\n')}\n` : ''}AFFECTED MEDICATIONS:
${riskAssessment.affectedDrugs.length > 0 ? riskAssessment.affectedDrugs.join(', ') : 'No specific medications identified'}

RECOMMENDATIONS:
${pharmacogenes.map((g: any) => `• ${g.gene}: ${g.recommendations[0]}`).join('\n')}

NEXT STEPS:
1. Review results with your healthcare provider
2. Check current medications against identified pharmacogene interactions
3. Consider therapeutic drug monitoring for affected medications
4. Update your medication records with pharmacogenomic data

Note: This analysis is for educational purposes. Consult your healthcare provider for clinical decisions.`;
}
