# Rehan Azim — B.Tech CSE Student

## Physics Wallah Institute of Innovation (B.Tech CSE)

# PharmaGuard: Pharmacogenomic Risk Prediction System

### RIFT 2026 Hackathon — Pharmacogenomics / Explainable AI Track

Multi-city Hackathon • HealthTech • Precision Medicine

---

## 🔗 Live Links (Mandatory Submission)

* 🌐 Live Deployed App: https://v0-json-summary-generation.vercel.app/

* 🎥 LinkedIn Demo Video (2–5 min): [ADD LINKEDIN VIDEO LINK]
* 💻 GitHub Repository: 

Hashtags: #RIFT2026 #PharmaGuard #Pharmacogenomics #AIinHealthcare

---

# 🧬 Problem Overview

Adverse Drug Reactions (ADRs) cause over 100,000 deaths annually, many of which are preventable through pharmacogenomic analysis.
PharmaGuard is an AI-powered web application that analyzes patient genetic data (VCF files) and predicts personalized drug response risks with explainable clinical recommendations aligned with CPIC guidelines.

---

# 🚀 Key Features

* 📁 VCF File Upload (v4.2 compliant)
* 🧬 Pharmacogenomic Variant Detection
* 🤖 LLM-powered Clinical Explanations
* 💊 Drug Risk Prediction (Safe, Toxic, Adjust Dosage, Ineffective, Unknown)
* 📊 Structured JSON Output (RIFT Schema Compliant)
* 🎯 CPIC Guideline-Based Recommendations
* 📥 Downloadable JSON + Copy to Clipboard
* 🛡 Robust Error Handling & Validation

---

# 🧪 Supported Pharmacogenes

* CYP2D6
* CYP2C19
* CYP2C9
* SLCO1B1
* TPMT
* DPYD

---

# 💊 Supported Drugs

* CODEINE
* WARFARIN
* CLOPIDOGREL
* SIMVASTATIN
* AZATHIOPRINE
* FLUOROURACIL
  (Optional: Extensible drug support)

---

# 🗂 Project Folder Structure

```
PharmaGuard/
│
├── app/                        # Next.js App Router
│   ├── api/
│   │   └── analyze/            # VCF analysis API route
│   │       └── route.ts        # POST endpoint for pharmacogenomic analysis
│   ├── dashboard/              # User dashboard page
│   │   └── page.tsx
│   ├── login/                  # Authentication page
│   │   └── page.tsx
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles & Tailwind config
│
├── components/                 # Reusable React Components
│   ├── analysis-results.tsx    # Results display component
│   ├── drug-input.tsx          # Drug selection component
│   ├── file-upload.tsx         # VCF file upload component
│   ├── theme-provider.tsx      # Theme management
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── alert.tsx
│       ├── dialog.tsx
│       ├── badge.tsx
│       └── ... (25+ shadcn components)
│
├── lib/                        # Utility functions & logic
│   ├── vcf-parser.ts           # VCF parsing & pharmacogenomic analysis
│   ├── auth-context.tsx        # Authentication context
│   └── utils.ts                # Helper utilities
│
├── hooks/                      # Custom React Hooks
│   ├── use-mobile.ts           # Mobile detection hook
│   └── use-toast.ts            # Toast notification hook
│
├── public/                     # Static assets
│   ├── apple-icon.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   └── ... (other static files)
│
├── styles/                     # Additional stylesheets
│   └── globals.css
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── components.json             # shadcn/ui configuration
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies
├── pnpm-lock.yaml              # Dependency lock file
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation (this file)
```

---

# 🏗 System Architecture

1. User uploads VCF file + selects drug name
2. Next.js API route (`/api/analyze`) receives the request
3. Backend parses VCF (Variant Call Format v4.2) using `vcf-parser.ts`
4. Detects variants in pharmacogenes (CYP2D6, CYP2C19, etc.)
5. Maps variants to diplotype & phenotype
6. Applies CPIC-aligned risk rules
7. Generates explainable clinical summary via LLM
8. Returns structured JSON (RIFT Schema compliant)
9. Frontend displays visual risk dashboard & downloadable results

---

# 🧠 Tech Stack

### Frontend

* **Next.js 16.1.6** - React framework with App Router
* **React 19.2.4** - UI library
* **TypeScript 5.7.3** - Type safety
* **Tailwind CSS 4.1.9** - Utility-first CSS
* **shadcn/ui** - High-quality UI components
* **Recharts 2.15.0** - Data visualization
* **React Hook Form** - Form management
* **Sonner** - Toast notifications

### Backend

* **Next.js API Routes** - Serverless functions
* **TypeScript** - Type-safe API endpoints
* **VCF Parser Logic** - Custom VCF parsing (vcf-parser.ts)

### Data & AI

* **LLM Integration** - Explainable AI for clinical recommendations
* **CPIC Guideline Mapping** - Evidence-based dosing rules
* **JSON Schema** - Standardized output format

### Deployment

* **Vercel** - Recommended for Next.js deployment
* **Alternative:** AWS, Google Cloud, Azure, Heroku

---

# 📥 Installation & Local Setup

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **pnpm** (package manager - recommended) or **npm**
- **Git**

## Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/PharmaGuard.git
cd PharmaGuard
```

## Step 2: Install Dependencies

Using **pnpm** (recommended):
```bash
pnpm install
```

Or using **npm**:
```bash
npm install
```

## Step 3: Setup Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:
```env
# Example environment variables
NEXT_PUBLIC_API_URL=http://localhost:3000
# Add other required API keys here
```

## Step 4: Run the Development Server

Using **pnpm**:
```bash
pnpm dev
```

Or using **npm**:
```bash
npm run dev
```

The application will start at:
```
http://localhost:3000
```

## Step 5: Open in Browser

Open your web browser and navigate to:
```
http://localhost:3000
```

You should see the PharmaGuard home page with:
- VCF file upload area
- Drug selection dropdown
- Analysis results dashboard

---

# 🏗 Available Scripts

```bash
# Development server with hot reload
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint
```

---

# 📄 API Documentation

## POST /api/analyze

Analyzes VCF file and predicts drug-gene interactions

### Request Headers
```
Content-Type: multipart/form-data
```

### Request Body
```
{
  "vcfFile": File,          // VCF file (.vcf format)
  "drug": "CODEINE"         // Drug name (string)
}
```

### Response
```json
{
  "patient_id": "PATIENT_001",
  "drug": "CODEINE",
  "timestamp": "2024-02-20T10:30:00Z",
  "risk_assessment": {
    "risk_label": "Adjust Dosage",
    "confidence_score": 0.92,
    "severity": "moderate"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2D6",
    "diplotype": "*4/*4",
    "phenotype": "PM",
    "detected_variants": [
      {
        "rsid": "rs3892097",
        "chromosome": "22",
        "position": 42130000
      }
    ]
  },
  "clinical_recommendation": {
    "dosage_adjustment": true,
    "monitoring_required": true,
    "monitoring_type": "Therapeutic Drug Monitoring (TDM)",
    "contraindicated": false,
    "notes": "CYP2D6: Poor Metabolizer - avoid codeine"
  },
  "llm_generated_explanation": {
    "summary": "Patient has CYP2D6 poor metabolizer phenotype leading to reduced conversion of codeine to morphine.",
    "clinical_implications": "CYP2D6 Poor Metabolizer (PM) may affect codeine pharmacokinetics",
    "dosing_recommendations": "Consider dose adjustment based on CYP2D6 phenotype",
    "monitoring_recommendations": "Therapeutic drug monitoring recommended"
  },
  "quality_metrics": {
    "vcf_parsing_success": true,
    "total_variants": 450,
    "passed_variants": 445,
    "average_quality": 85.5,
    "median_quality": 88.0,
    "snp_count": 425,
    "indel_count": 20,
    "confidence_score": 0.89
  }
}
```

---

# 🛡 Error Handling

The application handles the following error scenarios:

* ❌ Invalid VCF format detection
* ❌ Missing INFO tags handling (GENE, STAR, RS)
* ❌ Unsupported drug warnings
* ❌ File size validation (≤ 5MB)
* ❌ Graceful fallback for unknown variants
* ❌ Network error handling with retry logic
* ❌ Form validation for required fields

---

# 🧬 Explainable AI Approach

Our system ensures clinical transparency through:

* **Variant-level citation** - Links to genetic databases (dbSNP, ClinVar)
* **Biological mechanism explanation** - How variants affect drug metabolism
* **CPIC evidence-based dosing** - Guidelines from Clinical Pharmacogenetics Implementation Consortium
* **LLM-generated summaries** - Patient-friendly clinical explanations
* **Confidence scoring** - Indicates reliability of predictions

---

# 🧪 Test Cases

Sample VCF files are included for validation:

```
public/sample-data/           # Sample test files
├── sample_1.vcf
├── sample_2.vcf
└── sample_3.vcf
```

These are used for validating:
* Schema compliance
* Variant detection accuracy
* Risk classification correctness
* JSON output format

---

# 📹 Demo Video (Mandatory)

The demo video includes:

* Architecture walkthrough
* Live VCF upload functionality
* Risk prediction demonstration
* JSON output validation
* Explainable AI explanations
* Dashboard navigation

(Link to LinkedIn Public Video Above)

---

# 👥 Team

**Rehan Azim**
- B.Tech CSE Student
- Physics Wallah Institute of Innovation
- Role: Full Stack Developer + AI/ML + Pharmacogenomics System Design

---

# 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

# 📜 License

MIT License — For Educational & Research Use

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute, subject to the following
conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

# ⚠ Hackathon Compliance Checklist

* ✅ Live Deployed Web App (Next.js on Vercel)
* ✅ Public GitHub Repository
* ✅ LinkedIn Demo Video (Tagged #RIFT2026)
* ✅ VCF Upload Functional
* ✅ Exact JSON Schema Output
* ✅ README with Architecture & Documentation
* ✅ Pharmacogenomic Risk Prediction Engine
* ✅ CPIC Guideline Integration
* ✅ Explainable AI Explanations
* ✅ Responsive UI Design

---

# 🌟 Vision

PharmaGuard aims to reduce preventable adverse drug reactions (ADRs) using precision medicine, explainable AI, and pharmacogenomics — bringing personalized healthcare to the next generation of clinical decision systems.

By democratizing access to pharmacogenomic analysis, we empower healthcare providers and patients to make informed, data-driven medication choices that prioritize safety and efficacy.

— Built for RIFT 2026 Hackathon 🚀

---

# 📞 Support

For issues, questions, or feedback:
- 📧 Email: [your-email@example.com]
- 🐛 GitHub Issues: [Repository Issues Link]
- 💬 LinkedIn: [Your LinkedIn Profile]

---

**Last Updated:** February 2026
**Version:** 1.0.0
