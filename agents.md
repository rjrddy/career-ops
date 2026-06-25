# agents.md — Raj Reddy Career-Ops Context

> This file is the single source of truth for any AI agent picking up this session on any machine.
> Read this first. Then read `CLAUDE.md` for system mechanics.

---

## Who I Am

**Name:** Raj Reddy  
**Email:** shrirajreddy20@gmail.com | rajreddy23@outlook.com  
**Phone:** (352) 530-3397  
**GitHub:** github.com/rjrddy  
**LinkedIn:** linkedin.com/in/raj-reddy-1  
**Portfolio:** raj-reddy.com

**Degree:** B.S. Computer Science — University of Utah (Aug 2020 – May 2025)

---

## My Work History (canonical — matches cv.tex and cv.md)

### L3Harris Technologies — Greenville, TX
*Associate Software Engineer | June 2025 – Present*
- Signal processing modules in Python and C++ on embedded systems, collaborating with hardware teams
- Microservices for high-frequency data ingestion/processing/storage using Podman and serverless
- Automated CI/CD pipelines with static code analysis and integration testing

### Doxy.me — Charleston, SC
*Software Engineering Intern | August 2024 – May 2025*
- Built transformer-based models with PyTorch and Llama, integrating WebRTC for real-time video streaming
- Deployed inference pipelines on SageMaker & Fargate, improving diagnostic accuracy with reinforcement learning
- Authored YAML-based config files for CI/CD pipelines, cloud infrastructure, and application deployments

### University of Utah — FuTURES Lab
*Undergraduate Research Assistant | May 2024 – June 2025*
- Analyzed and optimized large-scale datasets; enhanced software config testing with gcov and CMake
- Increased code coverage by 30% on real-world APIs (Libpng, PyTorch)
- Expanded OSS-Fuzz testing coverage using compile-time options

### HEXstream — Chicago, IL
*Software Engineering Intern | May 2022 – August 2022*
- Engineered backend ETL pipelines integrating data from 25+ enterprise sources into Azure SQL and Azure Data Lake
- Developed automated workflows for ingestion, cleansing, and aggregation

---

## My Stack

**Languages:** Python, Java, C++, C#, SQL, TypeScript  
**Software:** PyTorch, Pandas, NumPy, React, Node.js, AWS, SageMaker, Fargate, Azure, Docker, Podman, REST, Django, MongoDB, Linux

---

## Built Projects (eligible for CVs)

| ID | Title | Key Tags |
|----|-------|----------|
| `course-platform` | University Course Planning/Review Platform | fullstack, react, tailwind, python, etl, data, postgresql, dashboard, search, api |
| `config-fuzzer` | Configuration Fuzzer | systems, testing, fuzzing, research, c++, oss, ci-cd, coverage |
| `ray-tracer` | Ray Tracing Engine | graphics, javascript, webgl, rendering, frontend, interactive |

---

## Project Ideas (NOT yet built — flip `status: 'idea'` → `'built'` in data/bank.mjs when done)

| ID | Title | Why Build It |
|----|-------|-------------|
| `rag-pipeline` | RAG Pipeline | Broadest impact — unlocks Hebbia, Rogo, EliseAI, Anterior, Centralize, 10+ ML roles |
| `ts-api-gateway` | TypeScript API Gateway | Unlocks Rollstack, Superblocks, Harvey, GPTZero fullstack roles |
| `streaming-etl` | Streaming ETL Pipeline | Unlocks Dataminr, Perplexity, data engineering roles |
| `llm-eval-harness` | LLM Evaluation Harness | Unlocks Reflexivity, Quora, Centralize, Fastino |
| `collab-whiteboard` | Real-Time Collaborative Whiteboard | Unlocks Airtable, Julius AI, Continue |
| `k8s-operator` | Kubernetes Operator | Unlocks Domino Data Lab, TensorWave, platform roles |
| `integration-framework` | Customer Integration Framework | Unlocks OpenAI FDE, LangChain, Northslope, Firecrawl |
| `ai-workflow-demo` | AI Workflow Automation | Unlocks Sierra, Decagon, Clera, agentic AI roles |
| `dbt-analytics` | dbt + DuckDB Analytics Stack | Unlocks dbt Labs, Tinybird, Hightouch |

**Build order recommendation:** `rag-pipeline` → `ts-api-gateway` → `streaming-etl`

---

## LaTeX CV System

### How it works
- `cv.tex` — canonical CV source (lato 11pt, 0.3in margins). Compile locally with MacTeX.
- `cv.md` — Markdown mirror, used by evaluation modes.
- `data/bank.mjs` — master pool of projects/experiences. `status: 'built'` = eligible for CVs.
- `generate-latex-cvs.mjs` — generates all CVs. Run: `node generate-latex-cvs.mjs`
- `output/` — compiled PDFs (Charter 11pt, 0.22in margins — 1-page guaranteed)
- `output/tex/` — canonical .tex files (lato, for local MacTeX compile)

### Formatting rules (enforced)
- Font: lato 11pt in .tex; Charter 11pt in sandbox PDFs
- Margins: 0.3in in .tex; 0.22in in sandbox (guarantees 1-page at 11pt)
- Structure: Header → Education → Skills → Experience → Projects
- `\vspace{\stretch{1}}` between sections for full-page fill
- `\vspace{-1em}` before each `\subsection*`, `\parskip=0.1em` inside itemize blocks

### Generating a new one-off CV
1. Paste the JD and say "make a tailored CV"
2. Or add to `JOBS` array in `generate-latex-cvs.mjs` with appropriate `slug`, `skills`, `experience`, `tags`
3. Run `node generate-latex-cvs.mjs` — all CVs regenerate

### Tag-based project selection
Tags in the `JOBS` array drive which projects from `data/bank.mjs` appear on each CV.
`selectProjects(job.tags, n=3)` scores built projects by tag overlap and picks the top N.

---

## Current CV Inventory (27 total as of June 2026)

### Pre-existing (17 from generate-latex-cvs.mjs + 2 one-offs)
| Slug | Company | Role |
|------|---------|------|
| `openai-fde-nyc` | OpenAI | Forward Deployed SWE |
| `mistral-backend-nyc` | Mistral AI | SWE Backend |
| `modal-fde-ml` | Modal | FDE ML |
| `harvey-swe-new-grad` | Harvey | SWE New Grad |
| `airtable-swe-new-grad` | Airtable | SWE New Grad 2026 |
| `perplexity-data-platform` | Perplexity | SWE Data Platform |
| `gptzero-fullstack-nyc` | GPTZero | Fullstack Engineer |
| `centralize-applied-ai` | Centralize | SWE Applied AI |
| `brainco-early-career-ai` | Brain Co. | Early Career AI/ML |
| `julius-ai-new-grad` | Julius AI | SWE Product New Grad |
| `reflexivity-ml-nyc` | Reflexivity | ML & AI Engineer |
| `ema-ml-swe` | Ema | SWE Machine Learning |
| `continue-swe-new-grad` | Continue | SWE New Grad |
| `northslope-fde-new-grad` | Northslope | FDSWE New Grad |
| `talos-swe-nyc` | Talos | Software Engineer |
| `breeze-fullstack-nyc` | Breeze | Fullstack SWE |
| `usmobile-ml-nyc` | US Mobile | AI/ML Engineer |
| `cassidy-fullstack-nyc` | Cassidy | Fullstack SWE |
| `sea12-fde` | SEA12 | FDE |

### NYC Scout additions (June 2026)
| Slug | Company | Role | Fit |
|------|---------|------|-----|
| `rollstack-swe-yc` | Rollstack | SWE Fullstack (YC) | 4.3/5 |
| `rogo-ml-eng` | Rogo | AI/ML Engineer | 4.2/5 |
| `dataminr-swe-ml` | Dataminr | ML/SWE | 4.2/5 |
| `hebbia-ml-eng` | Hebbia | ML Engineer | 4.0/5 |
| `eliseai-ml-backend` | EliseAI | ML/Backend Engineer | 4.0/5 |
| `domino-ml-eng` | Domino Data Lab | ML/Platform Engineer | 4.1/5 |
| `superblocks-fde` | Superblocks | FDE / SWE | 4.2/5 |
| `maywood-swe-yc` | Maywood | SWE/ML (YC) | 4.0/5 |

---

## NYC Startup Scout Results (June 2026)

Full report: `reports/nyc-startup-scout-2026.md`

### Top Hiring Targets (apply now, 4.2+/5)
| Company | Role | Score | Notes |
|---------|------|-------|-------|
| Northslope Technologies | FDE New Grad | 4.5/5 | Palantir alumni, defense AI. L3Harris background = direct sell. |
| OpenAI (NYC) | Forward Deployed SWE | 4.3/5 | Doxy.me ML work is the hook. FDE role. |
| Rollstack | SWE Fullstack | 4.3/5 | YC-backed, React/Python, SoFi/Zillow customers. |
| Rogo | AI/ML Engineer | 4.2/5 | Sequoia/Khosla Series C, finance AI workflows. |
| Superblocks | FDE / SWE | 4.2/5 | Internal tools, FDE role in NYC, React+Node+ML. |
| Dataminr | ML/SWE | 4.2/5 | Real-time AI from public data. ETL depth + ML = strong combo. |

### Cold Outreach Targets (recently funded, pre-hiring)
| Company | Round | Amount | Fit |
|---------|-------|--------|-----|
| Loop AI | Venture | $100M | 4.1/5 — enterprise AI lab, ML roles expected |
| Protege | Series A (a16z) | $30M | 4.0/5 — AI training data platform, data eng match |
| Pace | Seed (Sequoia) | $10M | 4.0/5 — insurance AI, ML/SWE roles, move fast |
| Brandlight | Series A | $30M | 4.0/5 — brand in AI search, SWE + AI |
| F2 | Venture (NFX/YC) | Undisclosed | 4.0/5 — private markets AI, ML engineers |

### Cold outreach message templates
See `reports/nyc-startup-scout-2026.md` Part 3 for full templates (ML Engineer, SWE/Fullstack, FDE).

---

## Preferences and Constraints

- **Location:** NYC or remote — targeting NYC startups specifically
- **Role types:** ML Engineer, SWE (full-stack/backend), Forward Deployed Engineer, Data/Platform Engineer
- **Comp:** Not specified — market rate for NYC startup (infer from role level)
- **CV format:** Always LaTeX, always 1 page, Charter in sandbox, lato locally
- **Style preference:** Concise, no bullet points in responses, direct

---

## Workflow for New Job Evaluation

When Raj pastes a job URL or JD, the agent should:
1. Evaluate fit against this profile (score /5)
2. If ≥ 4.0/5: generate a tailored CV using `generate-latex-cvs.mjs` (add to JOBS array or use gen-*.mjs one-off)
3. If < 4.0/5: recommend not applying, optionally suggest which project from bank would close the gap
4. Save evaluation report to `reports/` as `{###}-{company-slug}-{YYYY-MM-DD}.md`
5. Add tracker entry to `data/applications.md` via TSV in `batch/tracker-additions/`

## Cross-Machine Setup Notes

This repo runs on Node.js. On a new machine:
```bash
cd career-ops
npm install
node generate-latex-cvs.mjs   # requires pdflatex in PATH (texlive-full)
```

For PDF compilation, install TeX Live:
- **macOS:** MacTeX (`brew install --cask mactex`) — gives lato + fontawesome for .tex source
- **Linux/WSL:** `apt install texlive-full texlive-fonts-extra`
- **Sandbox/CI:** Charter font works out of the box with `texlive-latex-extra`

The sandbox in Cowork (Linux) uses Charter at 0.22in margins. Local MacTeX uses lato at 0.3in.
Both produce identical 1-page CVs — different font, same structure and content.
