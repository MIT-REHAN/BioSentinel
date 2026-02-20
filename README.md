# Rehan Azim — B.Tech CSE Student

## Physics Wallah Institute of Innovation (B.Tech CSE)

# BioSentinel: Pharmacogenomic Intelligence Platform

### RIFT 2026 Hackathon — Pharmacogenomics / Explainable AI Track

Multi-city Hackathon • HealthTech • Precision Medicine

---

## 🔗 Live Links (Mandatory Submission)

* 🌐 Live Deployed App: https://v0-json-summary-generation.vercel.app/

* 🎥 LinkedIn Demo Video (2–5 min): https://www.linkedin.com/posts/rehan-azim-64602a224_rift2026-biosentinel-pharmacogenomics-activity-7430412799207579648-job8?utm_source=share&utm_medium=member_desktop&rcm=ACoAADg-qRYBgzQ7naszArSq2LwNRtFlE864KT0
*  Youtube Demo Video (2–5 min): https://youtu.be/617Hav78p2s
* 💻 GitHub Repository: https://github.com/MIT-REHAN/BioSentinel/

Hashtags: #RIFT2026 #BioSentinel #Pharmacogenomics #AIinHealthcare

---

# 🧬 Problem Overview

Adverse Drug Reactions (ADRs) cause over 100,000 deaths annually, many of which are preventable through pharmacogenomic analysis.  
BioSentinel is an AI-powered web application that analyzes patient genetic data (VCF files) and predicts personalized drug response risks with explainable clinical recommendations aligned with CPIC guidelines.

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
BioSentinel/
│
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # API route for VCF analysis & risk prediction
│   │
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard UI for results visualization
│   │
│   ├── login/
│   │   └── page.tsx              # Authentication / login page
│   │
│   ├── layout.tsx                # Root layout configuration
│   ├── page.tsx                  # Landing / Home page
│   └── globals.css               # Global styles (App-level)
│
├── components/                   # Reusable UI & feature components
│   ├── analysis-results.tsx      # Displays pharmacogenomic risk output
│   ├── drug-input.tsx            # Drug name input (multi-drug support)
│   ├── file-upload.tsx           # VCF file upload & validation component
│   ├── theme-provider.tsx        # Theme and UI provider
│   │
│   └── ui/                       # ShadCN / UI primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── alert.tsx
│       ├── dialog.tsx
│       ├── badge.tsx
│       └── ...                   # Other reusable UI components
│
├── lib/                          # Core logic & utilities
│   ├── vcf-parser.ts             # VCF parsing & variant extraction logic
│   ├── auth-context.tsx          # Authentication context provider
│   └── utils.ts                  # Helper utility functions
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Responsive/mobile detection hook
│   └── use-toast.ts              # Toast notification hook
│
├── public/                       # Static assets
│   ├── apple-icon.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   └── ...                       # Other static images/icons
│
├── styles/                       # Additional styling configs
│   └── globals.css               # Global stylesheet (extra styles)
│
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── components.json               # UI component configuration
├── next.config.mjs               # Next.js configuration
├── package.json                  # Project dependencies & scripts
├── pnpm-lock.yaml                # Lock file (pnpm)
├── postcss.config.mjs            # PostCSS configuration (Tailwind support)
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation


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
- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Git

## Step 1: Clone the Repository
```bash
git clone https://github.com/MIT-REHAN/BioSentinel.git
cd BioSentinel

Step 2: Install Dependencies
pnpm install
# or
npm install

Step 3: Setup Environment Variables
cp .env.example .env.local

NEXT_PUBLIC_API_URL=http://localhost:3000
# Add other required API keys here

Step 4: Run the Development Server
pnpm dev
# or
npm run dev


Application runs at:

http://localhost:3000

📄 API Documentation
POST /api/analyze

Analyzes VCF file and predicts drug-gene interactions

Request Headers
Content-Type: multipart/form-data

Request Body
{
  "vcfFile": File,
  "drug": "CODEINE"
}

Response
{
  "patient_id": "PATIENT_001",
  "drug": "CODEINE",
  "timestamp": "2024-02-20T10:30:00Z",
  "risk_assessment": {
    "risk_label": "Adjust Dosage",
    "confidence_score": 0.92,
    "severity": "moderate"
  }
}

🛡 Error Handling

❌ Invalid VCF format detection

❌ Missing INFO tags handling (GENE, STAR, RS)

❌ Unsupported drug warnings

❌ File size validation (≤ 5MB)

❌ Graceful fallback for unknown variants

❌ Network error handling with retry logic

❌ Form validation for required fields

🧬 Explainable AI Approach

Variant-level citation (dbSNP, ClinVar)

Biological mechanism explanation

CPIC evidence-based dosing

LLM-generated patient-friendly summaries

Confidence scoring for reliability

🧪 Test Cases
public/sample-data/
├── sample_1.vcf
├── sample_2.vcf
└── sample_3.vcf


Used for:

Schema compliance

Variant detection accuracy

Risk classification correctness

JSON output validation

👥 Team

Rehan Azim

B.Tech CSE Student

Physics Wallah Institute of Innovation

🌟 Vision

BioSentinel aims to reduce preventable adverse drug reactions (ADRs) using precision medicine, explainable AI, and pharmacogenomics — bringing personalized healthcare to the next generation of clinical decision systems.

By democratizing access to pharmacogenomic analysis, we empower healthcare providers and patients to make informed, data-driven medication choices that prioritize safety and efficacy.

— Built for RIFT 2026 Hackathon 🚀

📞 Support

📧 Email: rehan5.azim@gmail.com

🐛 GitHub Issues:

💬 LinkedIn: https://www.linkedin.com/in/rehan-azim-64602a224/




Current Name: BioSentinel 

This rename reflects the evolution of the project from a pharmacogenomic risk predictor to a broader precision health intelligence platform while keeping all core features, architecture, and hackathon scope unchanged.

🧬 BioSentinel: Pharmacogenomic Intelligence Platform
The World's Most Trusted Platform for Precision Health

Last Updated: February 2026
Version: 1.1.0 
