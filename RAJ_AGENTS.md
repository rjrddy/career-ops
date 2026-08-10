# Raj Reddy — CV Generation Context & Rules

> **META-RULE:** This file must be updated whenever a new permanent rule is established, a new CV slug is added, or any convention in `generate-latex-cvs.mjs` changes. Keep it the single source of truth for Raj's CV pipeline.

---

## Permanent Rules (apply to every CV, no exceptions)

### 1. Doxy.me Always Included
Every CV must include a Doxy.me experience block. If the experience section is too long to fit on 1 page, drop HEXstream first (or shorten it to 1 bullet). Never remove Doxy.me to make room.

### 2. Experience Order
Always: **L3Harris → Doxy.me → then whatever else fits** (FuTURES, HEXstream).
Never reorder the top two. Never put HEXstream or FuTURES before either of them.

### 3. Skills Section Fixed — Never Customize Per Role
Always use `SKILLS_CANONICAL`. Never write an inline `skillsSection()` call for a new job entry. Do not reorder languages or swap tools to mirror a specific JD.

Current canonical skills:
- **Languages:** Python, TypeScript, C++, SQL, Java
- **Software:** Pandas, NumPy, React, Node.js, AWS, Azure, Docker, Next.js, .NET, REST, Django, MongoDB, Linux

### 4. Doxy.me Title
Always "Software Engineer" — never "Software Engineering Intern" or any other title.

### 5. HEXstream Title
Always "Software Engineering Intern" — never anything else.

### 6. TypeScript and WebRTC in All Doxy.me Blocks
Every Doxy.me experience block must mention TypeScript and WebRTC.

### 7. 1-Page Constraint
All CVs must compile to exactly 1 page. Verify with:
```bash
pdfinfo output/{city}/{slug}.pdf | grep Pages
```
If 2 pages: drop HEXstream first. If still 2 pages: shorten the FuTURES block.

### 8. No Dashes Rule
No dashes anywhere — CVs or free response answers. Rewrite prose to avoid dashes as punctuation. Use commas or restructure sentences instead.

### 9. Google X, Y, Z Bullet Format
Every bullet point must follow: **Accomplished [X] as measured by [Y], by doing [Z].**
Lead with the outcome/impact, then the measure (quantitative or qualitative), then the method.
Example: "Increased code coverage by 30% on Libpng and PyTorch by expanding OSS-Fuzz testing with compile-time instrumentation using gcov and CMake."

### 10. Cover Letter Enthusiasm
Every cover letter must show genuine fondness for the company, their products, culture, and startup energy — not just skills fit. Emphasize desire for ownership, love for building products people use, and want to work in a startup environment.

### 11. L3Harris Location
Always use **Dallas, TX** for L3Harris location in all CVs. Never use Greenville, TX or any other city.

### 12. Avoid Excess Whitespace — Default to 4 Experience Blocks
Never drop FuTURES or HEXstream preemptively "just in case" of a 2-page overflow. Start every new CV with all 4 experience blocks (L3Harris, Doxy.me, FuTURES, HEXstream). Only drop HEXstream (then shorten FuTURES) if the actual compile comes back at 2 pages. Dropping blocks preemptively leaves large `\vspace{\stretch{1}}` gaps and looks sparse. Confirmed after the Huxley Tokyo CV came back with excess whitespace from only 2 experience blocks.

### 13. Keep This File Updated
Whenever a new rule is added, a new CV is generated, or any convention changes, update `RAJ_AGENTS.md` immediately.

### 14. How Raj Got the Doxy.me Role
Raj cold-emailed the Doxy.me CTO and proposed building a telehealth mental health detection portal. He built it independently: an ML model that predicted likelihood of depression, anxiety, and other mental health conditions based on tone, voice, and visual cues, integrated with WebRTC for real-time video capture. The project led directly to the Software Engineer role. Use this origin story when writing cover letters or outreach for health tech, AI/ML, or startup roles — it demonstrates cold outreach + shipping a real product to land the job.

### 15. NYC Startup Cold Outreach
When Raj is cold outreaching to NYC startups (via LinkedIn or Wellfound), always use `output/nyc/nyc-startup-general.pdf` as the attached CV unless a tailored CV already exists for that company. Use the outreach message templates below, filling in the company name and one specific detail about what they build.

**Every outreach message must convey:**
- Desire to work in a fast-paced, demanding environment where the bar is high
- End-to-end ownership — spotting problems and solving them without waiting to be told
- Self-direction — works well without hand-holding or a roadmap handed down
- Wants to be pushed, to learn while doing, and to see their work land with real users

**LinkedIn Message Template (300 char limit — keep tight):**
> Hi [Name], I came across [Company] and love what you're building. I'm a software engineer with fullstack and ML experience at Doxy.me and L3Harris — I work best owning things end-to-end in fast-moving teams. Open to chatting if anything comes up?

**Wellfound / Email Template (longer form):**
> Hi [Name],
>
> I came across [Company] and wanted to reach out directly. [One sentence on what specifically caught my attention about what they build.]
>
> I'm a software engineer currently in Dallas, more than happy to relocate to NYC with or without relocation support. I'm currently at L3Harris building embedded systems and microservices. Before that, at Doxy.me, I shipped ML inference pipelines in PyTorch and Llama, built React and Node.js full-stack features integrated with WebRTC, and owned CI/CD across the stack. I work best in environments that move fast — I find my own problems, own them end-to-end, and push until they're solved. I'm looking for a role where I can do that and see the impact land with real users.
>
> Attaching my resume. Would love to connect if there's a fit.
>
> Best, Raj

---

## Generator Architecture (`generate-latex-cvs.mjs`)

### Output Directories
- NYC jobs → `output/nyc/`
- Austin jobs → `output/austin/`
- Tokyo jobs → `output/tokyo/`
- Chicago jobs → `output/chicago/`
- Seattle jobs → `output/seattle/`
- SF Bay Area jobs → `output/sf/`
- Remote jobs → `output/remote/`
- Canonical `.tex` files → `output/tex/{city}/`

### CITY_MAP (non-NYC slugs must be listed here)
```js
const CITY_MAP = {
  tokyo:   ['cisco-ce-tokyo', 'applied-intuition-onboard-swe', 'synspective-swe-tokyo',
             'sakana-rd-swe', 'sakana-product-swe', 'paypay-backend-eng', 'paypay-review-backend'],
  austin:  ['pushnami-swe', 'quantiq-swe', 'glimmer-fullstack-austin', 'cloudflare-workers-swe',
             'neuralink-swe', 'snh-ai-swe', 'apptronik-motion-data', 'avride-sim-backend'],
  chicago: ['drw-risk-swe'],
  seattle: ['spacex-factory-swe-starlink'],
  sf:      ['luma-fde-sf'],
  remote:  ['alinia-ml-infra-remote', 'krepling-fullstack-remote'],
};
// Everything else defaults to nyc
```

### Experience Block Constants
| Constant | Description |
|----------|-------------|
| `EXP_L3HARRIS_DEFAULT` | General SWE framing — signal processing, microservices, CI/CD |
| `EXP_L3HARRIS_BACKEND` | Backend/distributed framing — containerized microservices, latency, CI/CD |
| `EXP_L3HARRIS_ML` | ML/data framing — DSP, Python/C++, AWS microservices, pipelines |
| `EXP_DOXYME_DEFAULT` | Standard 3-bullet block — WebRTC, TypeScript, PyTorch, SageMaker, CI/CD |
| `EXP_DOXYME_EXPANDED` | 4-bullet extended block — adds unstructured data processing and deeper ML detail |
| `EXP_FUTURES_DEFAULT` | FuTURES Lab — gcov, CMake, OSS-Fuzz, 30% coverage increase |
| `EXP_HEXSTREAM_DEFAULT` | HEXstream Intern — ETL pipelines, Azure SQL, Azure Data Lake |

For roles requiring PHP mention at HEXstream (e.g. Glimmer), write an inline block replacing `EXP_HEXSTREAM_DEFAULT`.

### Doxy.me Date Variants
- Standard: `August 2024 -- May 2025`
- Extended (2-year, only when user explicitly requests): `June 2023 -- May 2025`
  Currently used in: Forage, Courier Health, Acacia Consulting

---

## All Generated CVs

### NYC (`output/nyc/`)
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
| `brainco-early-career-ai` | Brain Co. | Early Career AI/ML Engineer |
| `julius-ai-new-grad` | Julius AI | SWE Product New Grad |
| `edra-fullstack-swe` | Edra | Full Stack Engineer |
| `edra-ai-eng-nyc` | Edra | AI Engineer |
| `forage-swe-nyc` | Forage | Software Engineer |
| `shaped-swe-nyc` | Shaped | Software Engineer |
| `glg-fullstack-nyc` | GLG | Full Stack Software Engineer |
| `commure-ai-swe` | Commure | Software Engineer, Air AI |
| `commure-fde-nyc` | Commure | Forward Deployed Engineer |
| `fluidstack-swe` | FluidStack | Software Engineer |
| `sesame-backend-swe` | Sesame | Backend Software Engineer |
| `link-logistics-fullstack` | Link Logistics | Full Stack Software Engineer |
| `paramount-ai-tooling` | Paramount | Software Engineer, AI Tooling & QE |
| `courier-health-swe` | Courier Health | Software Engineer |
| `acacia-consulting` | Acacia Consulting | Software Engineer |
| `hdr-swe` | HDR | Software Engineer, Data-Driven Design |
| `narmi-impl-eng-nyc` | Narmi | Implementations Engineer |
| `visa-swe-nyc` | Visa | Software Engineer |
| `trading-infra-swe-nyc` | Trading Firm | Software Engineer, Client Trading Infrastructure |
| `calvis-swe-nyc` | Calvis | Software Engineer |
| `fluidstack-design-infra` | FluidStack | Software Engineer, Design Infrastructure |
| `concourse-platform-eng` | Concourse | Platform Engineer |
| `loop-fullstack-nyc` | Loop | Full Stack Engineer |
| `rippling-data-cloud-nyc` | Rippling | Software Engineer, Data Cloud |
| `outtake-swe-nyc` | Outtake | Software Engineer |
| `adaptive-swe-nyc` | Adaptive | Software Engineer |
| `doc-automation-swe-nyc` | Document Automation Startup | Software Engineer |
| `tennr-backend-eng-nyc` | Tennr | Backend Engineer |
| `haus-science-platform-nyc` | Haus | Software Engineer, Science Platform |
| `neon-fullstack-nyc` | Neon | Software Engineer |
| `traba-fullstack-swe-nyc` | Traba | Software Engineer |
| `mirage-backend-swe-nyc` | Mirage | Backend Software Engineer |
| `clay-fullstack-swe-nyc` | Clay | Software Engineer, Full Stack |
| `compass-swe-ii-nyc` | Compass | Software Engineer II |
| `brellium-backend-swe-nyc` | Brellium | Software Engineer |
| `hedge-fund-swe-nyc` | Hedge Fund | Software Developer |
| `mongodb-query-integration-swe` | MongoDB | Software Engineer, Query Integration |
| `figma-fullstack-swe-nyc` | Figma | Full Stack Software Engineer |
| `rippling-hr-backend-nyc` | Rippling | Software Engineer, HR Product |
| `reality-defender-fullstack-nyc` | Reality Defender | Full Stack Engineer |
| `fab2-fullstack-swe-nyc` | fab2 | Full Stack Software Engineer |
| `stott-may-backend-nyc` | Stott and May (recruiter) | Software Engineer |
| `astronomer-swe-nyc` | Astronomer | Software Engineer |
| `pogo-fullstack-swe-nyc` | Pogo | Full Stack Engineer |
| `auctor-swe-nyc` | Auctor | Software Engineer |
| `partiful-product-eng-nyc` | Partiful | Product Engineer |
| `octus-dataops-swe-nyc` | Octus | Software Engineer, DataOps |
| `moment-platform-swe-nyc` | Moment | Software Engineer, Platform |
| `forus-platform-infra-nyc` | Forus | Software Engineer, Platform & Infrastructure |
| `sourgum-fde-nyc` | Sourgum | Forward Deployed Engineer |
| `ironclad-demo-eng-nyc` | Ironclad | Demo Engineer |
| `google-genai-swe-nyc` | Google | Software Engineer, GenAI |
| `saragossa-hedge-fund-nyc` | Saragossa (Hedge Fund) | Software Engineer, Data & AI |
| `yext-platform-sre-nyc` | Yext | Software Engineer, Systems & Networking |
| `ramp-credit-backend-nyc` | Ramp | Software Engineer, Credit & Banking |
| `zara-backend-swe-remote` | Zara (via Hired) | Software Engineer, E-Commerce |
| `warp-swe-nyc` | Warp | Software Engineer |
| `officehours-fullstack-nyc` | Office Hours | Full Stack Software Engineer |
| `dualentry-special-projects-nyc` | DualEntry | Special Projects Lead |
| `interfere-data-eng-nyc` | Interfere | Data Infrastructure Engineer |
| `tabs-aiml-nyc` | Tabs | Software Engineer, AI/ML |
| `partiful-infra-nyc` | Partiful | App Infrastructure Engineer |
| `fabrik-swe-nyc` | Fabrik | Software Engineer |
| `clerq-backend-nyc` | Clerq | Senior Software Engineer |
| `agree-fullstack-nyc` | Agree.com | Software Engineer |
| `monark-backend-nyc` | Monark Markets | Software Engineer |
| `benjamin-swe-nyc` | Benjamin | Software Engineer |
| `baxus-swe-nyc` | Baxus | Software Engineer |
| `scalestack-fullstack-nyc` | Scalestack | Full Stack Engineer |
| `ellipsis-ai-eng-nyc` | Ellipsis | Founding AI Engineer |
| `coverdash-backend-nyc` | Coverdash | Software Engineer, Backend |
| `carry-fullstack-nyc` | Carry | Senior Software Engineer, Full Stack |
| `fern-swe-nyc` | Fern | Software Engineer, SDK Generalist |
| `hone-health-swe-nyc` | Hone Health | Software Engineer |
| `sixfold-fde-nyc` | Sixfold | Forward Deployed Engineer |
| `thread-ai-eng-nyc` | Thread AI | Applied AI Engineer |
| `daytona-ai-eng-nyc` | Daytona | Senior AI Engineer |
| `scaler-fullstack-nyc` | Scaler | Fullstack Software Engineer |
| `antimetal-backend-nyc` | Antimetal | Backend Engineer |
| `rally-fullstack-nyc` | Rally | Fullstack Software Engineer |
| `dub-backend-nyc` | dub | Backend Developer |
| `agentsmyth-ai-eng-nyc` | AgentSmyth | Software Engineer |
| `houseaccount-fullstack-nyc` | HouseAccount | Fullstack Software Engineer |
| `kasheesh-fullstack-nyc` | Kasheesh | Software Engineer |
| `doorlist-fullstack-nyc` | DoorList | Software Engineer |
| `attention-ai-eng-nyc` | Attention | Software Engineer |
| `flipturn-fullstack-nyc` | Flipturn | Software Engineer |
| `bilt-backend-nyc` | Bilt Rewards | Backend Engineer |
| `slingshot-ai-eng-nyc` | Slingshot AI | Software Engineer, AI/ML |
| `footprint-backend-nyc` | Footprint | Backend Engineer |
| `happyrobot-fde-nyc` | HappyRobot | Forward Deployed Engineer |
| `hyperfold-ai-swe-nyc` | Hyperfold AI | Software Engineer |
| `distyl-ai-backend-swe-nyc` | Distyl AI | Software Engineer, Back End |
| `cozmo-fde-nyc` | Cozmo | Forward Deployed Engineer |
| `ornn-junior-swe-nyc` | Ornn | Junior Software Engineer |
| `charta-health-staff-swe` | Charta Health | Staff Software Engineer |
| `enigma-data-ops-associate-nyc` | Enigma | Data Operations Associate |
| `amplitude-tech-support-eng-nyc` | Amplitude | Technical Support Engineer |
| `kadence-fde-nyc` | Kadence | Founding Forward Deployed Engineer |
| `reflection-ai-training-infra` | Reflection AI | Training Infrastructure Engineer |
| `atomic-fde-nyc` | Atomic | Forward Deployed Engineer |
| `open-insurance-gtm-eng-nyc` | Open Insurance | Founding GTM Engineer |

### Seattle (`output/seattle/`)
| Slug | Company | Role |
|------|---------|------|
| `spacex-factory-swe-starlink` | SpaceX | Factory Software Engineer, Starlink |
| `xai-swe-nyc` | xAI | Software Engineer |

### Chicago (`output/chicago/`)
| Slug | Company | Role |
|------|---------|------|
| `drw-risk-swe` | DRW | Software Engineer, Risk Platform |
| `happyrobot-fde-chicago` | HappyRobot | Forward Deployed Engineer |

### SF Bay Area (`output/sf/`)
| Slug | Company | Role |
|------|---------|------|
| `luma-fde-sf` | Luma AI | Forward Deployed Engineer |
| `happyrobot-fde-sf` | HappyRobot | Forward Deployed Engineer |

### Barcelona (`output/barcelona/`)
| Slug | Company | Role |
|------|---------|------|
| `happyrobot-fde-barcelona` | HappyRobot | Forward Deployed Engineer |

### Remote (`output/remote/`)
| Slug | Company | Role |
|------|---------|------|
| `alinia-ml-infra-remote` | Alinia AI | Machine Learning Engineer, Infra & Deployment |
| `krepling-fullstack-remote` | Krepling | Fullstack Software Engineer |
| `midpage-ai-eng-remote` | midpage | Senior Software Engineer |
| `zovu-fullstack-remote` | ZOVU | Full-Stack Developer |

### Austin (`output/austin/`)
| Slug | Company | Role |
|------|---------|------|
| `pushnami-swe` | Pushnami | Software Engineer |
| `quantiq-swe` | Quantiq | Software Developer |
| `glimmer-fullstack-austin` | Glimmer | Full Stack Software Developer |
| `cloudflare-workers-swe` | Cloudflare | Software Engineer, Workers Deploy & Config |
| `neuralink-swe` | Neuralink | Software Engineer, Brain Interfaces |
| `snh-ai-swe` | SNH AI | Software Engineer |
| `apptronik-motion-data` | Apptronik | Software Engineer, Human Motion Data |
| `avride-sim-backend` | Avride | Simulation Backend Engineer |
| `sts-digital-front-office` | STS Digital | Software Engineer, Front Office |
| `cloudflare-realtime-swe` | Cloudflare | Software Engineer, Realtime Communications |
| `apple-swe-austin` | Apple | Software Engineer (Early Career) |
| `cisco-data-ml-austin` | Cisco | Software Engineer, Data & ML Infrastructure |
| `ibm-security-swe-austin` | IBM | Software Developer |
| `expedia-sde-austin` | Expedia Group | Software Development Engineer II |
| `embedded-cpp-austin` | Semiconductor Test Systems Co. | C++ Software Engineer, Embedded Systems |
| `cerberus-fullstack-nyc` | Cerberus Capital Management | Software Engineer, Full Stack |
| `trading-cpp-swe-nyc2` | Global Financial Services Firm | Software Engineer, Trading Systems |
| `citadel-swe-nyc` | Citadel Securities | Software Engineer |
| `meridian-backend-swe-nyc` | Meridian | Software Engineer |
| `etsy-dev-platform-nyc` | Etsy | Software Engineer, Developer Platform |
| `nyc-startup-general` | NYC Startup (Cold Outreach) | Software Engineer |
| `madhive-swe-nyc` | Madhive | Software Engineer |

### Tokyo (`output/tokyo/`)
| Slug | Company | Role |
|------|---------|------|
| `cisco-ce-tokyo` | Cisco | Customer Experience Engineer |
| `applied-intuition-onboard-swe` | Applied Intuition | Software Engineer, Autonomy Onboard |
| `synspective-swe-tokyo` | Synspective | Software Engineer, Solutions Development |
| `sakana-rd-swe` | Sakana AI | Software Engineer (R&D) |
| `sakana-product-swe` | Sakana AI | Software Engineer (Product) |
| `paypay-backend-eng` | PayPay Card | Backend Engineer |
| `paypay-review-backend` | PayPay Card | Backend Engineer (Review/Billing) |
| `jpmorgan-payments-swe-tokyo` | JPMorgan Chase | Software Engineer I, Japan Payments Technology |
| `bjak-applied-ai-tokyo` | BJAK | Applied AI Engineer |
| `bjak-fullstack-tokyo` | BJAK | Full Stack Engineer |
| `mercari-sre-tokyo` | Mercari | Software Engineer, Site Reliability |
| `yodo-labs-eoi-tokyo` | Yodo Labs | Software Engineer (Expression of Interest) |
| `bloomtech-ai-fde-tokyo` | Listed JP Fintech Group (Bloomtech AI) | AI Software Engineer / Forward Deployed Engineer |
| `treasure-ai-pe-tokyo` | Treasure AI | Productivity Engineer |
| `morgan-stanley-rpe-tokyo` | Morgan Stanley | Associate, Reliability & Production Engineering |
| `huxley-voice-ai-fullstack-tokyo` | Confidential Voice AI Startup (via Huxley) | Full-Stack Engineer |
| `terra-swe-nyc` | Terra | Software Engineer |

---

## Application Question Templates

### Professional Accomplishment (Neuralink / general)
Starting from a cold outreach as a self-directed contributor to Doxy.me's open source codebase, I earned a software engineering role by consistently shipping meaningful work and within months had built transformer-based clinical inference pipelines in production, integrating WebRTC video streaming and reinforcement learning into a system used daily by thousands of healthcare providers. It showed me that initiative and quality of work matter more than a formal pathway in.

### Three Accomplishments (Neuralink format)

**First:** I found Doxy.me's telehealth platform online and started contributing to their WebRTC video layer and backend inference code on my own time. After several months of consistent contributions, the team offered me a software engineering role. I went on to ship transformer-based clinical inference pipelines with PyTorch and Llama, integrate real-time video streaming, and deploy inference infrastructure on SageMaker and Fargate that improved diagnostic accuracy using reinforcement learning.

**Second:** My team built a full-stack course planning platform with Python ETL pipelines processing thousands of course records and a React frontend with dashboards, heatmaps, and calendar visualizations. At the end of the semester, it was selected as the best project in the class, judged on technical depth, product quality, and execution across all competing teams.

**Third:** Entering the University of Utah, I was awarded one of the institution's top merit scholarships covering full tuition, granted to a small number of incoming students based on a 4.0 high school GPA, a 35 ACT score, and consistently taking the most rigorous coursework available. It was the strongest external signal of the academic foundation I brought into my engineering career.

### Why Applied Intuition (~100 words)
Applied Intuition sits at an intersection I find genuinely compelling: the gap between research-grade algorithms and production systems that run on real hardware at speed. The onboard software role is exactly that work, translating autonomy research into C++ that ships on trucks. What draws me specifically is the scale of the problem and the discipline required to get it right, safety-critical, latency-constrained, and cross-functional from day one. I also respect that Applied Intuition has built real commercial traction across automotive and defense rather than staying in simulation indefinitely. That combination of technical rigor and market seriousness is rare and exactly where I want to build.

### Why Forage (~100 words)
What draws me to Forage is the chance to own something that actually matters to people trying to get their first break. I have seen how much access to opportunity varies, and a platform that closes that gap at scale is the kind of product worth pouring energy into. I also want to be somewhere small enough that I can shape what gets built, not just execute tickets. At Forage the engineering team is lean, the problem is real, and the user impact is direct. That combination of genuine ownership and meaningful work is exactly what I am looking for at this stage of my career.

### Doxy.me Project Pride (Courier Health / free response)
Starting from a cold outreach as a self-directed contributor to Doxy.me's open source codebase, I earned a software engineering role by consistently shipping meaningful work and within months had built transformer-based clinical inference pipelines in production, integrating WebRTC video streaming and reinforcement learning into a system used daily by thousands of healthcare providers.

---

### How Do You Use AI?
I use AI constantly as a thinking partner for scaffolding, boilerplate, documentation, and exploring unfamiliar APIs, but I draw a clear line at the reasoning that actually matters. Architecture decisions, subtle production bugs, and security-sensitive code are where I stay heads-down, because those require real understanding and AI output becomes noise more than signal. I verify everything it generates before it ships and will not merge code I cannot explain line by line. The goal is to move faster on the obvious stuff so I can spend more time on the work that actually requires judgment.

---

## Canonical CV (cv.md / cv.tex)
- Doxy.me title: **Software Engineer** (not Intern)
- HEXstream title: **Software Engineering Intern**
- Skills: Python, TypeScript, C++, SQL, Java / Pandas, NumPy, React, Node.js, AWS, Azure, Docker, Next.js, .NET, REST, Django, MongoDB, Linux

## Quantiq Application Asset
`output/austin/reverse_lines.txt` — C++ program reversing every line of a file, minimizing memory (static BSS buffers, no heap) and maximizing speed (64KB setvbuf I/O buffers, in-place std::reverse). Handles `\n` and `\r\n` line endings.
