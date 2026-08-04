#!/usr/bin/env node
/**
 * generate-latex-cvs.mjs
 * Generates 17 tailored LaTeX CVs for Raj Reddy — NYC startup applications.
 * Saves both .tex (with lato/fontawesome for local compile) and compiles
 * PDFs in-sandbox using helvet as a font substitute.
 */

import { execSync } from 'child_process';
import { writeFile, mkdir, rm } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { selectProjects } from './data/bank.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, 'output');
const TEX_DIR = resolve(__dirname, 'output/tex');

await mkdir(OUTPUT_DIR, { recursive: true });
await mkdir(TEX_DIR, { recursive: true });

// ─── LaTeX preamble (two variants) ──────────────────────────────────────────

// Canonical version (lato + fontawesome) — for user's local compile
function preambleFull() {
  return String.raw`\documentclass[11pt,letterpaper]{article}
\usepackage[letterpaper,margin=0.3in]{geometry}
\usepackage[utf8]{inputenc}
\usepackage{mdwlist}
\usepackage[default]{lato}
\usepackage[T1]{fontenc}
\usepackage{textcomp}
\usepackage{fontawesome}
\usepackage{enumitem}
\DeclareFontFamily{U}{fontawesomeOne}{}
\DeclareFontShape{U}{fontawesomeOne}{m}{n}
{<-> FontAwesome--fontawesomeone}{}
\DeclareRobustCommand\FAone{\fontencoding{U}\fontfamily{fontawesomeOne}\selectfont}
\pagestyle{empty}
\setlength{\tabcolsep}{0em}`;
}

// Sandbox compile version (charter, 11pt, slightly tighter margins to guarantee 1 page)
function preambleSandbox() {
  return String.raw`\documentclass[11pt,letterpaper]{article}
\usepackage[letterpaper,margin=0.22in]{geometry}
\usepackage[utf8]{inputenc}
\usepackage{mdwlist}
\usepackage{charter}
\usepackage[T1]{fontenc}
\usepackage{textcomp}
\usepackage{enumitem}
\pagestyle{empty}
\setlength{\tabcolsep}{0em}`;
}

// ─── Shared macros + environments ────────────────────────────────────────────

const MACROS = String.raw`
\newenvironment{indentsection}[1]%
{\begin{list}{}%
{\setlength{\leftmargin}{#1}}%
     \item[]
}
{\end{list}}
\newenvironment{unindentsection}[1]%
{\begin{list}{}%
{\setlength{\leftmargin}{-0.5#1}}%
\item[]%
}
{\end{list}}
\newcommand{\headerrow}[2]
{\begin{tabular*}{\linewidth}{l@{\extracolsep{\fill}}r}
#1 &
#2 \\
\end{tabular*}}
\newcommand{\CPP}
{C\nolinebreak[4]\hspace{-.05em}\raisebox{.22ex}{\footnotesize\bf ++}}`;

// ─── Fixed sections ───────────────────────────────────────────────────────────

const HEADER = String.raw`
\begin{center}
	{\LARGE \textbf{Raj Reddy}}\\
	\vspace{0.05cm}
	(352) 530-3397
    \hfill rajreddy23@outlook.com
    \hfill github.com/rjrddy
    \hfill linkedin.com/in/raj-reddy-1
    \hfill raj-reddy.com
\end{center}
\hrule`;

const EDUCATION = String.raw`
\vspace{-1em}
\subsection*{\Large Education}
\renewcommand\labelitemi{}
\begin{itemize}[leftmargin=1em]
	\parskip=0.1em
	\item
	      \headerrow
	      {\textbf{University of Utah}}
	      {\textbf{Salt Lake City, UT}}
	      \headerrow
	      {\emph{B.S. Computer Science}}
	      {\emph{August 2020 -- May 2025}}
	      \item \textbf{Relevant Coursework:} Computer Systems, Machine Learning, Computer Graphics, Algorithms, Software Practice I \& II, Database Systems, Computer Networks, Foundations of Data Analysis, Models of Computation, and Linear Algebra.
\end{itemize}
\hrule`;

// ─── Skill sets per role type ─────────────────────────────────────────────────

function skillsSection(languages, software) {
  return String.raw`
\vspace{-1em}
\subsection*{\Large Skills}
\hyphenpenalty=1000
\begin{itemize}[leftmargin=1em]
    \parskip=0.1em
	\item \textbf{Languages:} ${languages}
	\item \textbf{Software:} ${software}
\end{itemize}
\hrule`;
}

// Single canonical skills section — used for ALL CVs, never customized per role.
const SKILLS_CANONICAL = skillsSection(
  'Python, TypeScript, C++, SQL, Java',
  'Pandas, NumPy, React, Node.js, AWS, Azure, Docker, Next.js, .NET, REST, Django, MongoDB, Linux'
);

const SKILLS = {
  fde:      SKILLS_CANONICAL,
  ml:       SKILLS_CANONICAL,
  backend:  SKILLS_CANONICAL,
  fullstack: SKILLS_CANONICAL,
  data:     SKILLS_CANONICAL,
  systems:  SKILLS_CANONICAL,
};

// ─── Experience blocks ────────────────────────────────────────────────────────

const EXP_L3HARRIS_DEFAULT = String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Developed signal processing modules in Python and \CPP{} on embedded systems, collaborating with hardware teams to optimize performance and resource utilization.
	      	\item Built microservices for high-frequency data ingestion, processing, and storage, leveraging Podman and serverless functions.
	      	\item Automated CI/CD testing with pipelines, integrating static code analysis and integration testing.
	      \end{itemize*}`;

const EXP_L3HARRIS_BACKEND = String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Built containerized microservices for high-frequency data ingestion, processing, and storage using Podman and serverless architecture on defense sensor streams.
	      	\item Developed signal processing algorithms in Python and \CPP{} on embedded systems, meeting strict latency and resource constraints in collaboration with hardware teams.
	      	\item Automated CI/CD pipelines with static code analysis and integration testing, reducing deployment friction across engineering teams.
	      \end{itemize*}`;

const EXP_L3HARRIS_ML = String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Developed real-time signal processing algorithms in Python and \CPP{} on embedded systems, applying DSP techniques for defense sensor data streams.
	      	\item Built microservices for high-frequency data ingestion and storage, leveraging Podman and serverless infrastructure on AWS.
	      	\item Automated CI/CD pipelines with static code analysis and integration testing.
	      \end{itemize*}`;

const EXP_FUTURES_DEFAULT = String.raw`
	\item
	      \headerrow
	      {\textbf{University of Utah}}
	      {\textbf{Salt Lake City, UT}}
	      \headerrow
	      {\emph{Undergraduate Research Assistant -- FuTURES Lab}}
	      {\emph{May 2024 -- Jun 2025}}
	      \begin{itemize*}
	      	\item Analyzed and optimized large-scale datasets, enhancing software configuration testing with gcov and CMake, increasing code coverage by 30\% on real-world APIs (Libpng, PyTorch).
	      	\item Expanded OSS-Fuzz testing coverage using compile-time options to improve the robustness of full-stack libraries.
	      \end{itemize*}`;

const EXP_DOXYME_DEFAULT = String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built a real-time mental health inference system for Doxy.me's telehealth platform, fine-tuning Llama models to predict depression risk, anxiety, and mood indicators from tone, voice, and facial cues captured over live WebRTC sessions, served via SageMaker and Fargate.
	      	\item Improved prediction accuracy of the mental health inference system by applying RL feedback loops over structured clinical signals and physician-validated outcomes from live video consultations.
	      	\item Eliminated environment drift and enabled zero-downtime releases by standardizing CI/CD configuration with YAML-based pipelines across the ML stack.
	      \end{itemize*}`;

const EXP_DOXYME_EXPANDED = String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built a real-time mental health inference system for Doxy.me's telehealth platform, fine-tuning Llama models to predict depression risk, anxiety, and mood indicators from tone, voice, and facial cues captured over live WebRTC sessions, served via SageMaker and Fargate.
	      	\item Improved prediction accuracy of the mental health inference system by applying RL feedback loops over structured clinical signals and physician-validated outcomes from live video consultations.
	      	\item Shortened the gap between model output and clinician action by developing TypeScript frontend components embedded within the video consultation interface, surfacing AI-generated insights directly at the point of care.
	      	\item Eliminated environment drift and enabled zero-downtime releases by standardizing CI/CD configuration with YAML-based pipelines across the ML stack.
	      \end{itemize*}`;

const EXP_HEXSTREAM_DEFAULT = String.raw`
	\item
	      \headerrow
	      {\textbf{HEXstream}}
	      {\textbf{Chicago, IL}}
	      \headerrow
	      {\emph{Software Engineering Intern}}
	      {\emph{May 2022 -- Aug 2022}}
	      \begin{itemize*}
	      	\item Engineered backend ETL pipelines integrating data from 25+ enterprise sources into Azure SQL and Azure Data Lake.
	      	\item Developed automated workflows for ingestion, cleansing, and aggregation, supporting distributed analytics systems.
	      \end{itemize*}`;

// ─── Projects ─────────────────────────────────────────────────────────────────

const PROJ_COURSE = String.raw`\item \textbf{University Course Planning/Review Platform:} Built a multi-service data platform enabling student schedule matching, course overlap detection, and behavioral insights. Developed ETL pipelines in Python to process thousands of course records, user preferences, and time-series activity logs. Built a responsive frontend using React + Tailwind, including interactive dashboards, heatmaps, calendar visualizations, and search interfaces.`;

const PROJ_RAYTRACER = String.raw`\item \textbf{Ray Tracing Engine:} Created an interactive WebGL-based ray tracing engine in JavaScript, featuring realistic reflections, dynamic lighting, and customizable environment maps. Implemented shaders and user controls for rendering techniques, scene adjustments, and interactivity.`;

const PROJ_FUZZER = String.raw`\item \textbf{Configuration Fuzzer:} Developed a configuration fuzzing tool for OSS-Fuzz, automating build generation to identify critical compile-time configurations and improve code coverage, uncovering previously untested code paths and increasing bug detection effectiveness.`;

function projectsSection(ordered) {
  return String.raw`
\vspace{-1em}
\subsection*{\Large Projects}
\hyphenpenalty=1000
\begin{itemize}[leftmargin=1em,noitemsep]
${ordered.join('\n')}
\end{itemize}`;
}

// ─── Experience section wrapper ───────────────────────────────────────────────

function experienceSection(jobs) {
  return String.raw`
\vspace{-1em}
\subsection*{\Large Experience}
\renewcommand\labelitemi{}
\renewcommand\labelitemii{$\bullet$}
\begin{itemize}[leftmargin=1em]
	\parskip=0.1em
${jobs.join('\n')}
\end{itemize}
\hrule`;
}

// ─── Build full document ──────────────────────────────────────────────────────

function buildTex(skills, experience, projects, useFull = true) {
  const preamble = useFull ? preambleFull() : preambleSandbox();
  const S = '\\vspace{\\stretch{1}}';
  return `${preamble}
${MACROS}
\\begin{document}
${HEADER}
${S}
${EDUCATION}
${S}
${skills}
${S}
${experience}
${S}
${projects}
${S}
\\end{document}
`;
}

// ─── Job definitions ──────────────────────────────────────────────────────────
// tags: drive project selection from data/bank.mjs — add keywords that match
//       the role's core themes. Built projects with the most matching tags win.

const JOBS = [
  {
    slug: 'openai-fde-nyc',
    company: 'OpenAI',
    role: 'Forward Deployed SWE',
    skills: SKILLS.fde,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['llm', 'api', 'python', 'react', 'deployed', 'integration', 'fullstack'],
  },
  {
    slug: 'mistral-backend-nyc',
    company: 'Mistral AI',
    role: 'SWE Backend',
    skills: SKILLS.backend,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['backend', 'api', 'python', 'systems', 'microservices', 'ci-cd'],
  },
  {
    slug: 'modal-fde-ml',
    company: 'Modal',
    role: 'FDE ML',
    skills: SKILLS.fde,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['llm', 'ml', 'inference', 'api', 'deployed', 'python', 'integration'],
  },
  {
    slug: 'harvey-swe-new-grad',
    company: 'Harvey',
    role: 'SWE New Grad',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'postgresql', 'api', 'llm'],
  },
  {
    slug: 'airtable-swe-new-grad',
    company: 'Airtable',
    role: 'SWE New Grad 2026',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'api', 'data', 'dashboard', 'postgresql'],
  },
  {
    slug: 'perplexity-data-platform',
    company: 'Perplexity',
    role: 'SWE Data Platform',
    skills: SKILLS.data,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['data', 'etl', 'pipeline', 'backend', 'api', 'search', 'analytics', 'postgresql'],
  },
  {
    slug: 'gptzero-fullstack-nyc',
    company: 'GPTZero',
    role: 'Fullstack Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'ai', 'llm', 'dashboard'],
  },
  {
    slug: 'centralize-applied-ai',
    company: 'Centralize',
    role: 'SWE Applied AI',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['llm', 'rag', 'ai', 'python', 'ml', 'inference', 'search'],
  },
  {
    slug: 'brainco-early-career-ai',
    company: 'Brain Co.',
    role: 'Early Career AI/ML Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'research', 'inference', 'embeddings'],
  },
  {
    slug: 'julius-ai-new-grad',
    company: 'Julius AI',
    role: 'SWE Product New Grad',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'ai', 'dashboard', 'data', 'api', 'node'],
  },
  {
    slug: 'reflexivity-ml-nyc',
    company: 'Reflexivity',
    role: 'ML & AI Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'research', 'data', 'analytics', 'inference'],
  },
  {
    slug: 'ema-ml-swe',
    company: 'Ema',
    role: 'SWE Machine Learning',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['llm', 'ml', 'ai', 'python', 'inference', 'automation', 'api'],
  },
  {
    slug: 'continue-swe-new-grad',
    company: 'Continue',
    role: 'SWE New Grad',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'llm', 'typescript', 'api', 'ci-cd'],
  },
  {
    slug: 'northslope-fde-new-grad',
    company: 'Northslope',
    role: 'FDSWE New Grad',
    skills: SKILLS.fde,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['deployed', 'integration', 'api', 'python', 'systems', 'webhook'],
  },
  {
    slug: 'talos-swe-nyc',
    company: 'Talos',
    role: 'Software Engineer',
    skills: SKILLS.systems,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['systems', 'backend', 'api', 'python', 'data', 'testing', 'c++'],
  },
  {
    slug: 'breeze-fullstack-nyc',
    company: 'Breeze',
    role: 'Fullstack SWE',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'dashboard', 'api', 'real-time'],
  },
  {
    slug: 'usmobile-ml-nyc',
    company: 'US Mobile',
    role: 'AI/ML Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['ml', 'ai', 'llm', 'inference', 'python', 'api', 'backend'],
  },

  // ── NYC Scout additions (June 2026) ──────────────────────────────────────

  {
    slug: 'rollstack-swe-yc',
    company: 'Rollstack',
    role: 'SWE Fullstack (YC)',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['fullstack', 'react', 'python', 'data', 'dashboard', 'api', 'node', 'typescript'],
  },
  {
    slug: 'rogo-ml-eng',
    company: 'Rogo',
    role: 'AI/ML Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'llm', 'inference', 'api', 'data', 'etl'],
  },
  {
    slug: 'dataminr-swe-ml',
    company: 'Dataminr',
    role: 'ML/SWE',
    skills: SKILLS.data,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['data', 'etl', 'pipeline', 'backend', 'python', 'api', 'systems', 'real-time'],
  },
  {
    slug: 'hebbia-ml-eng',
    company: 'Hebbia',
    role: 'ML Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'research', 'llm', 'inference', 'search'],
  },
  {
    slug: 'eliseai-ml-backend',
    company: 'EliseAI',
    role: 'ML/Backend Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'llm', 'inference', 'react', 'fullstack', 'backend'],
  },
  {
    slug: 'domino-ml-eng',
    company: 'Domino Data Lab',
    role: 'ML/Platform Engineer',
    skills: SKILLS.data,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['ml', 'python', 'data', 'etl', 'api', 'systems', 'ci-cd', 'backend'],
  },
  {
    slug: 'superblocks-fde',
    company: 'Superblocks',
    role: 'FDE / SWE',
    skills: SKILLS.fde,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'deployed', 'integration', 'webhook'],
  },
  {
    slug: 'maywood-swe-yc',
    company: 'Maywood',
    role: 'SWE/ML (YC)',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'fullstack', 'react', 'api', 'dashboard', 'data'],
  },
  {
    slug: 'giga-ml-fde',
    company: 'Giga ML',
    role: 'Forward Deployed Engineer',
    skills: SKILLS.fde,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['deployed', 'integration', 'api', 'python', 'systems', 'ml', 'inference', 'ci-cd'],
  },
  {
    slug: 'edra-fullstack-swe',
    company: 'Edra',
    role: 'Full Stack Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_EXPANDED, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'python', 'typescript', 'api', 'integration', 'etl', 'data'],
  },
  {
    slug: 'confido-swe',
    company: 'Confido',
    role: 'Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_EXPANDED, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'python', 'api', 'data', 'etl', 'dashboard', 'ai', 'react'],
  },
  {
    slug: 'merge-backend-swe',
    company: 'Merge',
    role: 'Backend / Full Stack Engineer',
    skills: SKILLS.backend,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['backend', 'api', 'python', 'integration', 'etl', 'systems', 'microservices', 'ci-cd'],
  },
  {
    slug: 'sierra-swe-agent',
    company: 'Sierra',
    role: 'Software Engineer, Agent (New Grad)',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['llm', 'ml', 'ai', 'python', 'inference', 'api', 'deployed', 'automation'],
  },
  {
    slug: 'superblocks-infra-sre',
    company: 'Superblocks',
    role: 'Infrastructure Engineer & SRE',
    skills: SKILLS.systems,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['systems', 'backend', 'ci-cd', 'deployed', 'python', 'containers', 'microservices', 'real-time'],
  },
  // ── Applied Intuition (Tokyo, AV onboard SW / real-time C++ systems) ─────────
  {
    slug: 'applied-intuition-onboard-swe',
    company: 'Applied Intuition',
    role: 'Software Engineer, Autonomy Onboard',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Improved sensor data throughput and latency on defense embedded platforms by developing real-time signal processing algorithms in modern \CPP{} on embedded Linux, applying system-level profiling and deterministic scheduling to meet strict hardware-in-the-loop constraints.
	      	\item Reduced deployment risk across multiple production targets by building CI/CD pipelines with static analysis, integration testing, and automated validation, enabling reliable releases to embedded compute platforms in collaboration with hardware and firmware teams.
	      	\item Increased data pipeline reliability for high-frequency sensor ingestion by engineering containerized microservices with fault isolation and recovery patterns, sustaining throughput under resource-constrained production conditions.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Improved clinical diagnostic accuracy by building and deploying end-to-end ML inference pipelines in Python and TypeScript on AWS SageMaker and Fargate, owning observability, latency optimization, and reinforcement learning feedback loops across production services.
	      	\item Reduced integration latency for real-time video workflows by integrating WebRTC streaming directly into the inference loop, enabling low-latency data flow from live clinical sessions to model consumers.
	      	\item Enabled zero-downtime releases across multiple production environments by owning YAML-based CI/CD configuration and containerized infrastructure, cutting environment drift and release cycle time.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['systems', 'c++', 'python', 'linux', 'embedded', 'real-time', 'testing', 'ci-cd', 'hardware', 'pipeline', 'sensors'],
  },

  // ── Cisco (Tokyo, customer experience / software integration & automation) ────
  {
    slug: 'cisco-ce-tokyo',
    company: 'Cisco',
    role: 'Customer Experience Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Reduced deployment friction across engineering and hardware teams by building automated CI/CD pipelines with static analysis and integration testing, enabling consistent, validated releases to embedded production targets.
	      	\item Improved cross-functional delivery by collaborating daily with hardware, firmware, and systems engineers to translate technical requirements into software specifications, managing expectations and communicating progress across a highly matrixed organization.
	      	\item Increased reliability of high-frequency data ingestion microservices by designing fault-tolerant Python and \CPP{} service architectures on AWS, applying modular patterns that simplified future integration and maintenance.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Reduced manual integration overhead for clinical partners by building RESTful Python and TypeScript APIs with well-documented contracts, enabling third-party systems to onboard and interoperate with the platform reliably and without white-glove support.
	      	\item Accelerated customer-facing feature delivery by owning end-to-end CI/CD configuration and AWS infrastructure automation, maintaining zero-downtime releases and reproducible environments across multiple production deployments.
	      	\item Improved platform trust with clinical users by integrating WebRTC and LLM-based inference pipelines (PyTorch, Llama) into live workflows on SageMaker and Fargate, and documenting integration patterns and deployment procedures for long-term maintainability.
	      \end{itemize*}`,
    ]),
    tags: ['fde', 'integration', 'api', 'backend', 'python', 'typescript', 'ci-cd', 'microservices', 'cloud', 'aws', 'deployed', 'fullstack'],
  },

  // ── Synspective (Tokyo, geoscience data pipelines / cloud-native) ────────────
  {
    slug: 'synspective-swe-tokyo',
    company: 'Synspective',
    role: 'Software Engineer, Solutions Development',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Reduced deployment friction across three production services by building containerized microservices in Python and \CPP{} using Podman on AWS, standardizing CI/CD pipelines with static analysis and integration testing via GitHub Actions.
	      	\item Improved data throughput for high-frequency sensor ingestion pipelines by applying system-level profiling and low-level optimization on embedded Linux systems, meeting strict latency constraints in collaboration with hardware teams.
	      	\item Accelerated release confidence by automating validation pipelines with integrated testing and infrastructure-as-code tooling, enabling consistent multi-environment deployments across production.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Reduced manual clinical review overhead by building end-to-end ML data pipelines in Python and TypeScript that processed unstructured WebRTC video streams through PyTorch and Llama inference, surfacing structured outputs to physicians via SageMaker and Fargate.
	      	\item Improved diagnostic accuracy by implementing reinforcement learning feedback loops that closed the gap between live production signals and model behavior across deployed inference services.
	      	\item Enabled zero-downtime releases across multiple production environments by owning YAML-based CI/CD configuration and containerized AWS infrastructure, reducing deployment time and environment drift.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'python', 'microservices', 'cloud', 'containers', 'ci-cd', 'linux', 'data', 'pipeline', 'ml', 'api', 'react'],
  },

  {
    slug: 'sakana-rd-swe',
    company: 'Sakana AI',
    role: 'Software Engineer (R&D)',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT]),
    tags: ['llm', 'ml', 'python', 'react', 'fullstack', 'data', 'etl', 'research', 'benchmark', 'api', 'deployed'],
  },
  {
    slug: 'paypay-backend-eng',
    company: 'PayPay Card',
    role: 'Backend Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Built containerized microservices in Java and Python for high-frequency data ingestion and storage on defense sensor streams, applying Spring Boot patterns for service layer design and Podman for orchestration.
	      	\item Developed signal processing algorithms in Python and \CPP{} on embedded systems, meeting strict latency and resource constraints in collaboration with hardware teams.
	      	\item Automated CI/CD pipelines with static code analysis and integration testing, reducing deployment friction across engineering teams.
	      \end{itemize*}`,
      EXP_DOXYME_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'api', 'microservices', 'ci-cd', 'systems', 'data', 'etl', 'containers', 'rest', 'integration', 'deployed'],
  },
  {
    slug: 'paypay-review-backend',
    company: 'PayPay Card',
    role: 'Backend Engineer (Review/Billing)',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Built containerized Java and Python microservices using Spring Boot for high-frequency data ingestion and storage on defense sensor streams, enforcing strict transaction integrity and reliability under latency constraints.
	      	\item Developed signal processing algorithms in Python and \CPP{} on embedded systems, meeting strict latency and resource constraints in collaboration with hardware teams.
	      	\item Automated CI/CD pipelines with static code analysis and integration testing, reducing deployment friction across engineering teams.
	      \end{itemize*}`,
      EXP_DOXYME_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'api', 'microservices', 'ci-cd', 'systems', 'data', 'etl', 'containers', 'rest', 'integration', 'deployed'],
  },
  // ── Quantiq (Austin, HFT systems, C++/Python performance) ──────────────────
  {
    slug: 'quantiq-swe',
    company: 'Quantiq',
    role: 'Software Developer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Developed real-time signal processing algorithms in C++ and Python for defense sensor systems, engineering against strict latency and throughput constraints on embedded Linux hardware.
	      	\item Built high-frequency data ingestion microservices processing live sensor streams, applying system-level profiling and low-level optimization to maximize throughput and minimize latency under production load.
	      	\item Automated CI/CD pipelines with static code analysis and integration testing, maintaining build stability and code quality across multiple production deployments.
	      \end{itemize*}`,
      EXP_DOXYME_DEFAULT,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['systems', 'backend', 'c++', 'python', 'data', 'testing', 'research', 'real-time', 'ci-cd', 'pipeline'],
  },

  // ── Pushnami (Austin, high-throughput microservices + AI) ───────────────────
  {
    slug: 'pushnami-swe',
    company: 'Pushnami',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built Python and TypeScript backend services for real-time AI inference, consuming WebRTC video and audio streams through scoring and classification pipelines on AWS (SageMaker, Fargate) under strict latency requirements.
	      	\item Designed AI-powered automation workflows to extract and structure clinical data from unstructured inputs, replacing manual operational overhead with intelligent, self-directing pipelines.
	      	\item Owned CI/CD configuration and AWS infrastructure deployment, enabling zero-downtime releases and reproducible environments across multiple production microservices.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'systems', 'python', 'api', 'microservices', 'ci-cd', 'deployed', 'real-time', 'ml', 'ai', 'data', 'pipeline'],
  },

  // ── HDR (fullstack + data-driven design) ────────────────────────────────────
  {
    slug: 'hdr-swe',
    company: 'HDR',
    role: 'Software Engineer, Data-Driven Design',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built React and TypeScript frontends for patient-facing clinical tools, integrating WebRTC for real-time video and translating complex stakeholder requirements into responsive, well-engineered interfaces.
	      	\item Developed and maintained RESTful Python backend services and APIs supporting structured data workflows, integrating AI inference pipelines (PyTorch, Llama) deployed on AWS.
	      	\item Owned CI/CD configuration and cloud infrastructure deployment on AWS, writing unit tests and maintaining build stability across multiple production services.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'node', 'api', 'data', 'etl', 'ci-cd', 'deployed', 'dashboard', 'postgresql'],
  },

  // ── Acacia Consulting (NYC early-stage startup) ──────────────────────────────
  {
    slug: 'acacia-consulting',
    company: 'Acacia Consulting',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{June 2023 -- May 2025}}
	      \begin{itemize*}
	      	\item Built React and TypeScript frontends for patient-facing clinical tools, integrating WebRTC for real-time video and shipping features end to end in close collaboration with product managers and designers.
	      	\item Developed RESTful Python backend services and integrated LLM-based inference pipelines (PyTorch and Llama) into live clinical workflows, delivering AI-powered insights to treating physicians via SageMaker and Fargate.
	      	\item Owned CI/CD configuration and AWS infrastructure deployment, enabling reproducible environments and zero-downtime releases across multiple production services.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'node', 'postgresql', 'api', 'dashboard', 'ci-cd', 'deployed'],
  },

  // ── Courier Health (NYC healthtech fullstack) ────────────────────────────────
  {
    slug: 'courier-health-swe',
    company: 'Courier Health',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{June 2023 -- May 2025}}
	      \begin{itemize*}
	      	\item Built React and TypeScript frontends for patient-facing telehealth tools, integrating WebRTC for real-time video and shipping features end to end in close collaboration with product managers and designers.
	      	\item Developed RESTful Python backend services and integrated LLM-based inference pipelines (PyTorch and Llama) into live clinical workflows, delivering AI-powered insights to treating physicians via SageMaker and Fargate.
	      	\item Owned CI/CD configuration and AWS infrastructure deployment, enabling reproducible environments and zero-downtime releases across multiple production services.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'python', 'llm', 'ai', 'api', 'backend', 'ci-cd', 'deployed', 'real-time'],
  },

  // ── Paramount (AI tooling + QE platform) ────────────────────────────────────
  {
    slug: 'paramount-ai-tooling',
    company: 'Paramount',
    role: 'Software Engineer, AI Tooling & QE Platforms',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built and deployed LLM-powered pipelines (PyTorch, Llama, TypeScript) that analyzed and structured unstructured clinical session data captured via WebRTC, surfacing automated insights to treating physicians via SageMaker and Fargate.
	      	\item Developed AI document processing workflows that extracted and classified clinical data from heterogeneous unstructured inputs, enabling downstream analytics and reducing manual review overhead.
	      	\item Authored CI/CD configuration across cloud infrastructure and application deployments on AWS, integrating automated testing into the delivery pipeline and enabling reproducible, zero-downtime releases.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['llm', 'rag', 'ai', 'python', 'backend', 'api', 'ci-cd', 'testing', 'research', 'deployed', 'ml', 'inference'],
  },

  // ── Link Logistics (fullstack analytics + LLM) ──────────────────────────────
  {
    slug: 'link-logistics-fullstack',
    company: 'Link Logistics',
    role: 'Full Stack Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built React and TypeScript frontends for patient-facing clinical tools, integrating WebRTC for real-time video and shipping features end to end from design review through production without a dedicated PM or designer translating requirements.
	      	\item Developed Python RESTful backend services and integrated LLM-based inference pipelines (PyTorch and Llama) directly into user-facing clinical workflows, owning both the ML integration layer and the APIs downstream services depended on.
	      	\item Deployed services on AWS (SageMaker, Fargate) and owned CI/CD pipeline configuration, enabling zero-downtime releases and reproducible environments across multiple production services.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'python', 'llm', 'api', 'data', 'etl', 'dashboard', 'ci-cd', 'deployed'],
  },

  // ── Sesame (backend, real-time + ML) ────────────────────────────────────────
  {
    slug: 'sesame-backend-swe',
    company: 'Sesame',
    role: 'Backend Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built real-time ML inference pipelines processing WebRTC audio and video streams from live telehealth sessions, integrating PyTorch and Llama models into low-latency TypeScript and Python streaming workflows deployed on SageMaker and Fargate.
	      	\item Designed and operated Python backend services handling real-time clinical data flows, owning REST APIs, async processing pipelines, and the data models the product depended on end to end.
	      	\item Owned CI/CD configuration and AWS infrastructure deployment using YAML-based pipelines, enabling zero-downtime releases and reproducible environments across multiple production services.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'systems', 'python', 'ml', 'inference', 'real-time', 'api', 'ci-cd', 'deployed', 'data', 'pipeline'],
  },

  // ── FluidStack (systems + AI infra) ─────────────────────────────────────────
  {
    slug: 'fluidstack-swe',
    company: 'FluidStack',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built an LLM-powered pipeline in Python and TypeScript to extract and structure clinical insights from unstructured telehealth session data captured via WebRTC (video, audio, transcripts), surfacing structured outputs to treating physicians via SageMaker and Fargate.
	      	\item Designed document processing workflows that parsed and structured clinical data from heterogeneous unstructured inputs, enabling downstream analytics and reducing manual clinical review overhead.
	      	\item Owned end-to-end CI/CD configuration and AWS infrastructure deployment using YAML-based pipelines, enabling reproducible environments and zero-downtime releases across multiple services.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['systems', 'backend', 'python', 'ml', 'llm', 'ai', 'data', 'etl', 'pipeline', 'api', 'ci-cd', 'deployed'],
  },

  // ── Commure (NYC healthcare AI) ─────────────────────────────────────────────
  {
    slug: 'commure-ai-swe',
    company: 'Commure',
    role: 'Software Engineer, Air AI',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_HEXSTREAM_DEFAULT, ]),
    tags: ['ml', 'llm', 'ai', 'python', 'react', 'typescript', 'fullstack', 'backend', 'api', 'deployed', 'ci-cd', 'real-time', 'inference'],
  },

  // ── GLG (NYC fullstack) ─────────────────────────────────────────────────────
  {
    slug: 'glg-fullstack-nyc',
    company: 'GLG',
    role: 'Full Stack Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built and maintained React and TypeScript frontends for patient-facing clinical tools, integrating WebRTC for real-time video and shipping features across the full product lifecycle in collaboration with product managers and designers.
	      	\item Developed RESTful Python backend services powering real-time clinical workflows, maintaining clean API contracts and integrating third-party services used daily by healthcare providers.
	      	\item Deployed and operated services on AWS (SageMaker, Fargate) and owned CI/CD pipeline configuration, enabling reproducible environments and zero-downtime releases across multiple services.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'node', 'api', 'postgresql', 'dashboard', 'ci-cd', 'deployed'],
  },

  // ── Shaped (NYC search/recs YC) ────────────────────────────────────────────
  {
    slug: 'shaped-swe-nyc',
    company: 'Shaped',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_EXPANDED, EXP_HEXSTREAM_DEFAULT]),
    tags: ['backend', 'systems', 'python', 'api', 'data', 'etl', 'pipeline', 'ml', 'ci-cd', 'real-time', 'deployed'],
  },

  // ── Forage (NYC fintech) ────────────────────────────────────────────────────
  {
    slug: 'forage-swe-nyc',
    company: 'Forage',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{June 2023 -- May 2025}}
	      \begin{itemize*}
	      	\item Built and maintained RESTful Python backend services powering real-time telehealth workflows, integrating WebRTC for live video streaming and clinical data APIs used by thousands of providers daily.
	      	\item Developed React and TypeScript frontends for patient-facing and provider-facing clinical tools, shipping features across the full product development lifecycle from design review through production release.
	      	\item Deployed and operated inference pipelines on AWS (SageMaker, Fargate) for an AI diagnostic system, owning monitoring, post-processing, and iterative model improvement using reinforcement learning.
	      	\item Owned CI/CD configuration across cloud infrastructure and application deployments using YAML-based pipelines, enabling reproducible environments and zero-downtime releases.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'python', 'typescript', 'api', 'backend', 'ci-cd', 'deployed', 'aws', 'postgresql'],
  },

  // ── Cloudflare (Austin/NYC/DC, distributed systems / Workers control plane) ──
  {
    slug: 'cloudflare-workers-swe',
    company: 'Cloudflare',
    role: 'Software Engineer, Workers Deploy & Config',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Built containerized microservices for high-frequency sensor data ingestion and storage using Podman and serverless infrastructure, engineering for strict latency and throughput constraints in production environments.
	      	\item Developed signal processing algorithms in Python and \CPP{} on embedded Linux systems, applying low-level optimization and profiling to maximize performance under resource constraints.
	      	\item Automated CI/CD pipelines with static code analysis and integration testing, maintaining deployment reliability across multiple production services.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Deployed and operated distributed ML inference pipelines on AWS SageMaker and Fargate, owning reliability, observability, and zero-downtime releases across multiple production services.
	      	\item Built TypeScript APIs and WebRTC integrations powering real-time clinical video workflows, designing data models and API contracts consumed by thousands of active providers.
	      	\item Owned YAML-based CI/CD configuration and cloud infrastructure deployments, enabling reproducible environments and fast, confident releases across the stack.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'distributed', 'systems', 'api', 'typescript', 'ci-cd', 'cloud', 'microservices', 'data', 'pipeline'],
  },

  // ── Cloudflare Realtime (Austin/NYC, WebRTC / MoQ / distributed real-time) ──
  {
    slug: 'cloudflare-realtime-swe',
    company: 'Cloudflare',
    role: 'Software Engineer, Realtime Communications',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Engineered WebRTC-based real-time video infrastructure serving thousands of concurrent clinical sessions, implementing signaling, TURN relay integration, and adaptive bitrate logic to sustain reliable connections across varied network conditions.
	      	\item Instrumented distributed TypeScript services with structured logging, metrics collection, and operational dashboards, enabling rapid diagnosis of latency spikes and connection failures in production.
	      	\item Deployed and operated inference pipelines on AWS Fargate and SageMaker integrating with real-time video streams, maintaining zero-downtime releases across multiple interdependent production services.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['webrtc', 'real-time', 'distributed', 'backend', 'typescript', 'systems', 'media', 'streaming', 'cloud', 'aws', 'observability'],
  },

  // ── Neuralink (Austin, embedded/systems/testing SW) ─────────────────────────
  {
    slug: 'neuralink-swe',
    company: 'Neuralink',
    role: 'Software Engineer, Brain Interfaces',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Developed signal processing algorithms in \CPP{} and Python for defense sensor systems running on embedded Linux hardware, collaborating directly with electrical and firmware engineers to meet strict latency, throughput, and resource constraints.
	      	\item Built and maintained CI/CD build infrastructure including static analysis, integration testing, and automated validation pipelines, ensuring production-grade reliability across multiple deployed systems.
	      	\item Engineered containerized microservices for high-frequency data ingestion and storage, applying system-level profiling to maximize throughput and minimize latency under production load.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built and deployed ML inference pipelines on AWS SageMaker and Fargate using Python and PyTorch, owning the full lifecycle from model integration to production reliability and monitoring.
	      	\item Developed TypeScript APIs and WebRTC video integrations for real-time clinical workflows, designing data models and service contracts used daily by thousands of providers.
	      	\item Owned YAML-based CI/CD configuration and cloud infrastructure deployments, enabling reproducible environments and zero-downtime releases across the stack.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{University of Utah -- FuTURES Lab}}
	      {\textbf{Salt Lake City, UT}}
	      \headerrow
	      {\emph{Undergraduate Research Assistant}}
	      {\emph{May 2024 -- Jun 2025}}
	      \begin{itemize*}
	      	\item Built automated testing and build infrastructure using gcov, CMake, and OSS-Fuzz to instrument and validate real-world C/\CPP{} libraries (Libpng, PyTorch), increasing code coverage by 30\%.
	      	\item Developed configuration fuzzing tooling to systematically explore compile-time build options and surface untested code paths across large open-source codebases.
	      \end{itemize*}`,
    ]),
    tags: ['systems', 'c++', 'python', 'linux', 'embedded', 'testing', 'ci-cd', 'build', 'hardware', 'research'],
  },

  // ── Client Trading Infrastructure (NYC, low-latency Java/C++ fintech) ────────
  {
    slug: 'trading-infra-swe-nyc',
    company: 'Trading Firm',
    role: 'Software Engineer, Client Trading Infrastructure',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Improved throughput and reduced latency for high-frequency defense sensor data pipelines by engineering containerized microservices in \CPP{} and Python on embedded Linux, applying system-level profiling and deterministic scheduling to meet production-grade performance constraints.
	      	\item Increased deployment reliability across multiple production targets by building automated CI/CD infrastructure with static analysis and integration testing, enabling consistent validated releases under strict engineering standards.
	      	\item Reduced operational overhead for distributed data ingestion by designing fault-tolerant microservice architectures with modular, reusable components that supported rapid scaling across new hardware configurations.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{June 2023 -- May 2025}}
	      \begin{itemize*}
	      	\item Reduced clinical review latency by building high-throughput Python and TypeScript backend services processing real-time WebRTC data streams through low-latency inference pipelines deployed on AWS SageMaker and Fargate, sustaining throughput across thousands of concurrent provider sessions.
	      	\item Improved system scalability by designing RESTful API contracts and data models that decoupled frontend clients from backend inference infrastructure, enabling independent scaling of each layer under variable load.
	      	\item Increased release confidence by owning YAML-based CI/CD configuration and containerized AWS infrastructure automation, achieving zero-downtime deployments across multiple production environments.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'systems', 'c++', 'python', 'java', 'microservices', 'distributed', 'real-time', 'api', 'ci-cd', 'deployed', 'data'],
  },

  // ── FluidStack Design Infra (NYC, engineering data / generative tooling) ─────
  {
    slug: 'fluidstack-design-infra',
    company: 'FluidStack',
    role: 'Software Engineer, Design Infrastructure',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Reduced manual validation overhead for defense sensor hardware by building automated CI/CD pipelines in Python and \CPP{} with static analysis and integration testing, enabling engineers to ship to embedded targets with confidence across multiple production configurations.
	      	\item Improved data pipeline reliability for high-frequency sensor ingestion by designing modular, fault-tolerant microservice architectures on AWS, making engineering data programmable and queryable across hardware variants rather than buried in one-off scripts.
	      	\item Embedded directly with hardware and firmware engineers as their primary software counterpart, translating messy hardware constraints and vendor interfaces into clean service abstractions the broader team could depend on.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Replaced manual clinical data workflows by building LLM-powered Python and TypeScript pipelines that automatically extracted and structured data from unstructured inputs, reducing review overhead and enabling downstream analytics at scale.
	      	\item Integrated multiple complex vendor APIs including WebRTC for real-time video streaming and AWS SageMaker for managed inference, writing production-grade adapters that normalized messy vendor interfaces into a consistent internal data layer.
	      	\item Improved data versioning and deployment reproducibility across production environments by owning YAML-based CI/CD configuration and infrastructure automation, ensuring every release was validated, traceable, and rollback-safe.
	      \end{itemize*}`,
    ]),
    tags: ['backend', 'systems', 'python', 'api', 'data', 'pipeline', 'ci-cd', 'automation', 'microservices', 'cloud', 'deployed', 'engineering'],
  },

  // ── Concourse (NYC, govtech platform / AI workflow infra) ────────────────────
  {
    slug: 'concourse-platform-eng',
    company: 'Concourse',
    role: 'Platform Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Improved data pipeline reliability for defense sensor ingestion by engineering containerized Python and \CPP{} microservices on AWS that normalized high-frequency data from heterogeneous hardware sources into a consistent, queryable foundation across multiple production deployments.
	      	\item Reduced deployment risk across embedded government systems by building automated CI/CD infrastructure with static analysis, integration testing, and audit trails, enabling validated releases under strict defense compliance requirements.
	      	\item Increased engineering velocity for cross-functional teams by designing modular service abstractions that decoupled hardware-specific logic from shared infrastructure, allowing hardware and firmware teams to iterate independently without breaking upstream consumers.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built production AI workflow infrastructure in Python and TypeScript on AWS SageMaker and Fargate, implementing multi-step inference pipelines with confidence-based human-in-the-loop routing that determined when to surface model output versus escalate to a clinician, meeting HIPAA-compliant data handling requirements throughout.
	      	\item Replaced manual clinical data workflows by building LLM pipelines (PyTorch, Llama) and WebRTC integrations that ingested unstructured session data and produced structured, auditable outputs consumed by downstream analytics and provider-facing dashboards.
	      	\item Enabled reproducible, zero-downtime releases across multiple production environments by owning YAML-based CI/CD configuration and cloud infrastructure automation, maintaining full deployment auditability required for regulated healthcare workloads.
	      \end{itemize*}`,
    ]),
    tags: ['backend', 'python', 'api', 'data', 'pipeline', 'llm', 'agents', 'ci-cd', 'microservices', 'cloud', 'deployed', 'compliance', 'infrastructure'],
  },

  // ── Loop (NYC, logistics data platform / fullstack TypeScript) ───────────────
  {
    slug: 'loop-fullstack-nyc',
    company: 'Loop',
    role: 'Full Stack Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped patient-facing and provider-facing clinical products end to end on a small startup team, owning React and TypeScript frontends, Node.js backend services on AWS Fargate, and WebRTC real-time video integrations from design through production with no dedicated PM.
	      	\item Improved data throughput and diagnostic accuracy by building Python and TypeScript pipelines that ingested unstructured session data, ran LLM inference (PyTorch, Llama) on SageMaker, and persisted structured outputs to downstream PostgreSQL analytics tables used daily by clinical teams.
	      	\item Reduced deployment overhead and environment drift by owning YAML-based CI/CD configuration and Fargate infrastructure automation, enabling zero-downtime releases across multiple production services at startup velocity.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'node', 'api', 'postgresql', 'data', 'etl', 'ci-cd', 'deployed', 'aws', 'startup'],
  },

  // ── Rippling (NYC, Data Cloud / distributed backend Python) ─────────────────
  {
    slug: 'rippling-data-cloud-nyc',
    company: 'Rippling',
    role: 'Software Engineer, Data Cloud',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Improved throughput and reliability for high-frequency defense sensor data pipelines by engineering distributed Python and \CPP{} microservices on AWS, designing storage schemas and retrieval patterns optimized for high-volume, low-latency production workloads.
	      	\item Reduced data inconsistency across distributed ingestion services by applying rigorous data modeling and fault-isolation patterns, ensuring integrity and queryability of sensor data across multiple heterogeneous hardware sources.
	      	\item Increased deployment confidence across production targets by building automated CI/CD infrastructure with static analysis, integration testing, and infrastructure-as-code tooling that enforced consistency at scale.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Improved clinical data completeness and downstream analytics accuracy by designing and operating Python and TypeScript data pipelines on AWS SageMaker and Fargate that ingested unstructured WebRTC session data, ran LLM inference, and persisted structured outputs to PostgreSQL with full lineage and auditability.
	      	\item Reduced manual data preparation overhead by building automated ingestion and transformation workflows that normalized heterogeneous clinical inputs into a consistent, queryable data model consumed by provider-facing dashboards and AI downstream systems.
	      	\item Enabled zero-downtime releases and reproducible data environments by owning YAML-based CI/CD configuration and containerized AWS infrastructure, maintaining data integrity across production deployments.
	      \end{itemize*}`,
    ]),
    tags: ['backend', 'python', 'distributed', 'data', 'pipeline', 'etl', 'postgresql', 'api', 'cloud', 'aws', 'ci-cd', 'analytics', 'microservices'],
  },

  // ── Outtake (NYC Brooklyn, agentic AI trust platform / fullstack startup) ────
  {
    slug: 'outtake-swe-nyc',
    company: 'Outtake',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped patient-facing and provider-facing clinical products end to end on a small startup team, owning React and TypeScript frontends, Python and Node.js backend services, and WebRTC real-time integrations from v0 to production with full autonomy over architecture and delivery decisions.
	      	\item Improved diagnostic accuracy and reduced manual clinical overhead by building LLM-powered agent pipelines (PyTorch, Llama) that automatically detected, extracted, and structured insights from unstructured session data, deploying on AWS SageMaker and Fargate with confidence-based human-in-the-loop routing.
	      	\item Enabled faster iteration and zero-downtime releases across multiple production services by owning CI/CD configuration and cloud infrastructure automation, giving the team the velocity to ship multiple features per week without operational overhead.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'node', 'llm', 'agents', 'ai', 'api', 'deployed', 'ci-cd', 'startup', 'real-time'],
  },

  // ── Adaptive (NYC, cybersecurity AI / distributed fullstack) ────────────────
  {
    slug: 'adaptive-swe-nyc',
    company: 'Adaptive',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Improved data throughput and model accuracy for a customer-facing clinical platform by building distributed Python and TypeScript pipelines on AWS SageMaker and Fargate, designing relational schemas in PostgreSQL that normalized high-volume session data into a queryable, auditable foundation.
	      	\item Shipped React and TypeScript frontends and Node.js backend APIs end to end on a small startup team, writing clean, well-documented code with testable abstractions that let new engineers ramp up quickly without requiring tribal knowledge.
	      	\item Reduced deployment overhead and environment drift across production by owning YAML-based CI/CD configuration and cloud infrastructure automation on AWS, enabling the team to ship reliably and frequently in a fast-paced environment.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['fullstack', 'typescript', 'react', 'python', 'backend', 'distributed', 'api', 'postgresql', 'aws', 'ci-cd', 'deployed', 'startup'],
  },

  // ── Doc Automation Platform (NYC, AI doc extraction / fullstack startup) ─────
  {
    slug: 'doc-automation-swe-nyc',
    company: 'Document Automation Startup',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Reduced manual clinical data processing overhead by building LLM-powered document extraction pipelines (PyTorch, Llama) in Python and TypeScript that ingested unstructured inputs from WebRTC sessions, extracted and structured key information, and persisted normalized outputs to downstream analytics and provider dashboards on AWS SageMaker and Fargate.
	      	\item Accelerated third-party integration delivery by building RESTful APIs and service adapters that connected external clinical systems to the platform reliably, normalizing heterogeneous data formats into a consistent internal schema used across the product.
	      	\item Enabled faster releases and reduced environment drift by owning CI/CD configuration, infrastructure automation, and developer tooling on AWS, giving the team confidence to ship multiple features per week without operational overhead.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'python', 'typescript', 'react', 'llm', 'data', 'etl', 'pipeline', 'api', 'integration', 'ci-cd', 'deployed', 'startup'],
  },

  // ── DRW (Chicago, risk platform / distributed services / C++ Python) ─────────
  {
    slug: 'drw-risk-swe',
    company: 'DRW',
    role: 'Software Engineer, Risk Platform',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Reduced clinical inference latency by building distributed Python and TypeScript service APIs that orchestrated real-time data ingestion from WebRTC video sessions, model execution with PyTorch and Llama, and result delivery to downstream provider dashboards on AWS Fargate and SageMaker.
	      	\item Improved service reliability by containerizing inference workloads with Docker and automating deployment, environment configuration, and integration testing through CI/CD pipelines on AWS.
	      	\item Accelerated external system connectivity by designing RESTful service adapters that normalized heterogeneous input schemas from third-party clinical platforms into a consistent internal API contract.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'python', 'cpp', 'distributed', 'api', 'docker', 'kubernetes', 'ci-cd', 'systems', 'data', 'pipeline', 'research'],
  },

  // ── xAI (SF/remote, AI/ML / systems / research / exceptional engineering) ─────────
  {
    slug: 'xai-swe-nyc',
    company: 'xAI',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      EXP_DOXYME_EXPANDED,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['ml', 'ai', 'python', 'cpp', 'systems', 'research', 'inference', 'pipeline', 'pytorch', 'deployed', 'oss', 'testing'],
  },

  // ── Zara via Hired/micro1 (remote, backend / distributed / Go+Python / e-commerce) ──
  {
    slug: 'zara-backend-swe-remote',
    company: 'Zara (via Hired)',
    role: 'Software Engineer, E-Commerce',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['backend', 'distributed', 'microservices', 'python', 'api', 'ci-cd', 'cloud', 'systems', 'performance', 'deployed', 'ecommerce'],
  },

  // ── Etsy (NYC, Developer Platform / CI/CD / DevEx / tooling / SDLC) ──────────
  {
    slug: 'etsy-dev-platform-nyc',
    company: 'Etsy',
    role: 'Software Engineer, Developer Platform',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Owned YAML-based CI/CD pipeline configuration across cloud infrastructure and application deployments, enabling reproducible environments, automated testing gates, and zero-downtime releases across the engineering stack.
	      	\item Built internal developer tooling and automation that reduced manual operational workflows, proactively identifying friction points in the development lifecycle and shipping solutions without waiting for formal specifications.
	      	\item Collaborated with cross-functional teams to define deployment standards, maintain AWS infrastructure (ECS, Fargate) with TypeScript and WebRTC service integrations, and support engineers across the stack during on-call incidents.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['ci-cd', 'devex', 'platform', 'tooling', 'aws', 'docker', 'typescript', 'python', 'sdlc', 'infrastructure', 'automation', 'developer-tools', 'on-call'],
  },

  // ── NYC Startup Cold Outreach (general / fullstack+AI / NYC) ─────────────────
  {
    slug: 'nyc-startup-general',
    company: 'NYC Startup',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'backend', 'react', 'typescript', 'python', 'api', 'ml', 'aws', 'docker', 'ci-cd', 'deployed', 'data'],
  },

  // ── Madhive (NYC, SWE / React+JS / ad-tech / CI/CD / local media) ────────────
  {
    slug: 'madhive-swe-nyc',
    company: 'Madhive',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['frontend', 'react', 'typescript', 'javascript', 'ci-cd', 'api', 'backend', 'cloud', 'deployed', 'fullstack'],
  },

  // ── Trading Firm C++ (NYC, SWE / C++ / Linux / low-latency / financial services) ──
  {
    slug: 'trading-cpp-swe-nyc2',
    company: 'Global Financial Services Firm',
    role: 'Software Engineer, Trading Systems',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Developed real-time signal processing applications in \CPP{} on embedded Linux platforms, applying low-level optimization, multithreading, and profiling to meet strict latency and throughput constraints in production defense systems.
	      	\item Built containerized microservices for high-frequency data ingestion and storage, applying event-driven architecture patterns and CI/CD pipelines with static analysis and integration testing across multiple production services.
	      	\item Collaborated with cross-functional engineering teams in an Agile environment, participating in design reviews, code reviews, and production support for live systems.
	      \end{itemize*}`,
      EXP_DOXYME_DEFAULT,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['cpp', 'c++', 'linux', 'low-latency', 'systems', 'trading', 'finance', 'distributed', 'ci-cd', 'performance', 'event-driven', 'microservices', 'aws'],
  },

  // ── Cerberus Capital (NYC, fullstack / React+TS+Node / Azure / SQL / finance) ─
  {
    slug: 'cerberus-fullstack-nyc',
    company: 'Cerberus Capital Management',
    role: 'Software Engineer, Full Stack',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'typescript', 'node', 'azure', 'sql', 'api', 'ci-cd', 'distributed', 'cloud', 'finance', 'security', 'deployed'],
  },

  // ── Citadel Securities (NYC, SWE / C++ / low-latency / trading infra) ────────
  {
    slug: 'citadel-swe-nyc',
    company: 'Citadel Securities',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Developed real-time signal processing algorithms in \CPP{} for high-frequency defense sensor data streams, applying multithreading and concurrency techniques to meet strict sub-millisecond latency and throughput constraints in production systems.
	      	\item Built containerized microservices for high-frequency data ingestion and storage on embedded Linux, profiling and optimizing critical code paths to maximize throughput under resource constraints.
	      	\item Automated CI/CD pipelines with static analysis and integration testing, maintaining deployment reliability across multiple production services running on live hardware.
	      \end{itemize*}`,
      EXP_DOXYME_DEFAULT,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['cpp', 'c++', 'low-latency', 'performance', 'systems', 'multithreading', 'distributed', 'trading', 'finance', 'embedded', 'linux', 'ci-cd'],
  },

  // ── Meridian (NYC, backend SWE / AI agents / Python+TypeScript / supply chain) ──
  {
    slug: 'meridian-backend-swe-nyc',
    company: 'Meridian',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['backend', 'python', 'typescript', 'api', 'ai', 'ml', 'agents', 'distributed', 'cloud', 'aws', 'deployed', 'data'],
  },

  // ── Cisco (Austin, data+ML SWE / Python / PyTorch / Docker+K8s / pipelines) ──
  {
    slug: 'cisco-data-ml-austin',
    company: 'Cisco',
    role: 'Software Engineer, Data & ML Infrastructure',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT]),
    tags: ['ml', 'python', 'pytorch', 'data', 'pipeline', 'docker', 'kubernetes', 'aws', 'distributed', 'inference', 'sagemaker', 'ci-cd', 'cloud'],
  },

  // ── Embedded C++ (Austin, C++ / embedded Linux / hardware integration / test systems) ──
  {
    slug: 'embedded-cpp-austin',
    company: 'Semiconductor Test Systems Co.',
    role: 'C++ Software Engineer, Embedded Systems',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Developed and maintained real-time signal processing software in \CPP{} on embedded Linux platforms, working directly alongside electrical and hardware engineers to integrate software with custom hardware designs and meet strict timing and resource constraints.
	      	\item Modified and extended an established \CPP{} codebase for defense sensor systems, exercising judgment on when to modernize versus preserve existing behavior, and exposing clean Python-accessible APIs for test and automation workflows.
	      	\item Debugged production issues in closed embedded environments using structured logging and systematic analysis, collaborating in a flat, cross-functional team to bring up new hardware and resolve integration failures without interactive debugging tools.
	      \end{itemize*}`,
      EXP_DOXYME_DEFAULT,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['cpp', 'c++', 'embedded', 'linux', 'hardware', 'systems', 'python', 'low-level', 'performance', 'ci-cd', 'testing', 'semiconductor'],
  },

  // ── Expedia (Austin, SDE II / Node+React / fullstack / AI+ML / servicing) ────
  {
    slug: 'expedia-sde-austin',
    company: 'Expedia Group',
    role: 'Software Development Engineer II',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'backend', 'frontend', 'ai', 'ml', 'deployed', 'ci-cd', 'cloud', 'aws'],
  },

  // ── IBM (Austin, SWE / JS+HTML+CSS / ServiceNow / security / Agile) ──────────
  {
    slug: 'ibm-security-swe-austin',
    company: 'IBM',
    role: 'Software Developer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['javascript', 'typescript', 'react', 'html', 'css', 'api', 'rest', 'ci-cd', 'agile', 'github', 'backend', 'frontend', 'deployed', 'security'],
  },

  // ── Apple (Austin, early career SWE / Java / APIs / distributed systems) ────
  {
    slug: 'apple-swe-austin',
    company: 'Apple',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Built containerized Java and Python microservices for high-frequency sensor data ingestion and storage, engineering for strict latency and throughput constraints in production distributed systems.
	      	\item Developed signal processing algorithms in Python and \CPP{} on embedded Linux systems, applying low-level optimization and profiling to maximize performance under resource constraints.
	      	\item Automated CI/CD pipelines with static code analysis and integration testing, maintaining deployment reliability across multiple production services.
	      \end{itemize*}`,
      EXP_DOXYME_DEFAULT,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'java', 'api', 'distributed', 'cloud', 'microservices', 'ci-cd', 'python', 'aws', 'systems', 'deployed'],
  },

  // ── STS Digital (remote, front office / React+Python / trading tools / AWS) ───────
  {
    slug: 'sts-digital-front-office',
    company: 'STS Digital',
    role: 'Software Engineer, Front Office',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped real-time operational dashboards by building React frontends and Python backend APIs that surfaced live data from WebRTC streaming sessions to clinical users, translating non-technical stakeholder requirements into working software with fast iteration cycles.
	      	\item Built production-grade internal tooling and automation that reduced manual workflows for clinical and operational teams, proactively identifying friction points and shipping solutions without waiting for formal specifications.
	      	\item Maintained reliable deployments by owning CI/CD pipelines, AWS infrastructure automation (ECS, Fargate), and incident response, ensuring real-time systems remained stable under production load.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['frontend', 'react', 'python', 'typescript', 'real-time', 'dashboard', 'internal-tools', 'aws', 'ci-cd', 'trading', 'finance', 'deployed'],
  },

  // ── SpaceX Starlink (Seattle, factory SWE / Python+C++ / CI/CD / clearance) ──────
  {
    slug: 'spacex-factory-swe-starlink',
    company: 'SpaceX',
    role: 'Factory Software Engineer, Starlink',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer, Secret Clearance (Active)}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Developed signal processing modules in Python and \CPP{} on embedded systems for defense applications, collaborating with hardware teams to meet strict latency and resource constraints in a classified environment.
	      	\item Built and maintained containerized microservices for high-frequency data ingestion and processing using Podman and serverless architecture, ensuring fault-tolerant operation over extended periods with minimal intervention.
	      	\item Automated CI/CD pipelines with static code analysis and integration testing across multiple deployment environments, reducing downtime and enabling reliable software delivery to production hardware systems.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Designed and deployed highly available Python and TypeScript backend services on AWS Fargate and SageMaker, orchestrating real-time data ingestion from WebRTC video pipelines and LLM-based inference (PyTorch, Llama) across distributed systems running with minimal operator intervention.
	      	\item Built CI/CD automation and infrastructure-as-code tooling that enabled reliable, frequent software deployment to production systems with minimal downtime, supporting multiple weekly releases across cloud and containerized environments.
	      	\item Developed test execution infrastructure covering unit, integration, and end-to-end scenarios across virtualized and live service environments, significantly improving release confidence and reducing production defect rates.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['systems', 'python', 'cpp', 'ci-cd', 'factory', 'embedded', 'distributed', 'testing', 'hardware', 'clearance', 'deployed', 'aws'],
  },

  // ── Yext (NYC, SRE / platform / Kubernetes / AWS / monitoring / automation) ──────
  {
    slug: 'yext-platform-sre-nyc',
    company: 'Yext',
    role: 'Software Engineer, Systems & Networking',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Improved infrastructure reliability by automating CI/CD configuration, container orchestration on AWS ECS and Fargate, and environment provisioning for Python and TypeScript services, enabling product teams to ship and operate WebRTC video and ML inference workloads independently.
	      	\item Built monitoring and alerting standards across distributed backend services, instrumenting structured logging and defining alerting thresholds on AWS that reduced mean time to detection and resolution for production incidents.
	      	\item Designed self-service deployment tooling and shared infrastructure automation that increased engineering velocity, removing wait times and letting teams provision and iterate on services without platform team involvement.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['platform', 'sre', 'devops', 'aws', 'kubernetes', 'docker', 'ci-cd', 'monitoring', 'automation', 'python', 'distributed', 'linux', 'deployed'],
  },

  // ── Saragossa Hedge Fund (NYC, Python+SQL / AI data platform / trading) ──────────
  {
    slug: 'saragossa-hedge-fund-nyc',
    company: 'Saragossa (Hedge Fund)',
    role: 'Software Engineer, Data & AI',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built AI data platforms and internal tooling in Python and TypeScript, orchestrating LLM-powered inference pipelines (PyTorch, Llama) that processed high-volume clinical data from WebRTC sessions and surfaced structured outputs to internal and external-facing dashboards on AWS SageMaker and Fargate.
	      	\item Improved data quality and reliability by designing SQL-backed data models and REST APIs that normalized inputs from disparate clinical systems into consistent schemas, enabling accurate downstream analytics and reporting for clinical and operational teams.
	      	\item Identified and drove platform improvements end-to-end without a ticket queue, owning architecture decisions, CI/CD configuration, and observability tooling on AWS to keep systems reliable as the product scaled.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'python', 'sql', 'ai', 'data-platform', 'llm', 'pipeline', 'aws', 'internal-tools', 'finance', 'deployed', 'ownership'],
  },

  // ── Google (NYC/MTV, GenAI / ML infra / model deployment / shopping features) ────
  {
    slug: 'google-genai-swe-nyc',
    company: 'Google',
    role: 'Software Engineer, GenAI',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Deployed and optimized transformer-based GenAI models (PyTorch, Llama) to production on AWS SageMaker and Fargate, implementing inference pipelines that processed multimodal inputs from WebRTC video sessions and delivered structured clinical outputs at scale.
	      	\item Improved model accuracy and reliability by integrating reinforcement learning into the clinical inference loop, evaluating model performance across diverse input distributions, and iterating on data processing and post-processing pipelines to reduce error rates in production.
	      	\item Built TypeScript service APIs and CI/CD automation that connected ML infrastructure to user-facing provider dashboards, enabling end-to-end model deployment from training through production monitoring with structured observability.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['ml', 'genai', 'python', 'pytorch', 'model-deployment', 'inference', 'data-processing', 'cpp', 'research', 'ci-cd', 'deployed', 'optimization'],
  },

  // ── Ironclad (SF/remote, demo eng / TypeScript+Node / LLM / internal tooling) ────
  {
    slug: 'ironclad-demo-eng-nyc',
    company: 'Ironclad',
    role: 'Demo Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Owned internal tooling and product features end-to-end in TypeScript, React, and Node.js, building async job workflows and REST API integrations that orchestrated LLM-powered clinical inference (PyTorch, Llama) over WebRTC session inputs and published structured outputs to downstream services on AWS Fargate and SageMaker.
	      	\item Built self-serve interfaces for non-technical clinical users by translating complex backend inference pipelines into accessible React dashboards, enabling providers to interact with AI outputs without requiring technical knowledge of the underlying system.
	      	\item Maintained production platform operations by owning structured logging, monitoring, CI/CD configuration, and incident response on AWS, ensuring auditability and reliability across all services in a regulated healthcare environment.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'typescript', 'node', 'react', 'llm', 'api', 'async', 'internal-tools', 'aws', 'ci-cd', 'deployed', 'startup'],
  },

  // ── Sourgum (NYC, forward deployed / Python / production systems / waste+recycling)
  {
    slug: 'sourgum-fde-nyc',
    company: 'Sourgum',
    role: 'Forward Deployed Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Drove production outcomes end-to-end by partnering directly with clinical users to translate real-world operational challenges into Python and TypeScript systems, owning problem definition, architecture, deployment, and iteration for features used daily across thousands of healthcare sessions.
	      	\item Designed and shipped scalable backend services and REST APIs on AWS SageMaker and Fargate that integrated LLM-powered inference (PyTorch, Llama) with WebRTC video workflows, turning ambiguous clinical requirements into reliable, production-grade solutions.
	      	\item Accelerated time to deployment by building CI/CD pipelines, infrastructure automation, and monitoring tooling on AWS, enabling rapid iteration on customer feedback with minimal operational overhead.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fde', 'backend', 'python', 'typescript', 'api', 'production', 'aws', 'startup', 'customer-facing', 'ci-cd', 'deployed', 'cross-functional'],
  },

  // ── Forus (NYC, platform+infra / EKS / AWS / Postgres / HIPAA healthcare) ────────
  {
    slug: 'forus-platform-infra-nyc',
    company: 'Forus',
    role: 'Software Engineer, Platform & Infrastructure',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Owned AWS cloud infrastructure for a HIPAA-regulated healthcare platform, managing container orchestration on ECS and Fargate, SageMaker inference clusters, and Lambda functions while reducing deployment risk through infrastructure-as-code automation and rigorous environment parity.
	      	\item Improved platform reliability by defining observability standards across distributed Python and TypeScript services, including structured logging, alerting thresholds, and incident response runbooks, reducing mean time to resolution for production failures.
	      	\item Built self-serve CI/CD primitives and shared deployment tooling that allowed product engineers to provision and ship new features to the healthcare platform independently, reducing infrastructure wait time and increasing weekly release cadence.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['platform', 'infrastructure', 'aws', 'kubernetes', 'docker', 'ci-cd', 'observability', 'hipaa', 'healthcare', 'python', 'typescript', 'deployed'],
  },

  // ── Moment (NYC, platform / AWS infra / Go backend / DevEx / investment mgmt) ───
  {
    slug: 'moment-platform-swe-nyc',
    company: 'Moment',
    role: 'Software Engineer, Platform',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Increased engineering leverage by owning CI/CD configuration, AWS infrastructure automation (ECS, Fargate, SageMaker, Lambda), and shared deployment tooling, giving the team a reliable golden path for shipping Python and TypeScript services to production multiple times per week.
	      	\item Elevated system observability by instrumenting distributed backend services with structured logging, alerting, and tracing across AWS, enabling fast incident detection and reducing mean time to resolution for production failures.
	      	\item Built and maintained the WebRTC video infrastructure and REST API layer used by thousands of daily clinical sessions, taking full ownership from architecture through on-call support across a tightly integrated distributed system.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['platform', 'backend', 'aws', 'infrastructure', 'devex', 'ci-cd', 'observability', 'distributed', 'python', 'typescript', 'systems', 'deployed'],
  },

  // ── Octus (NYC, fullstack / Django+Python / VueJS / DataOps / finance) ──────────
  {
    slug: 'octus-dataops-swe-nyc',
    company: 'Octus',
    role: 'Software Engineer, DataOps',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built data-intensive internal applications using Python backend APIs and TypeScript frontend components, integrating real-time clinical data ingested from WebRTC video sessions with LLM-powered extraction pipelines (PyTorch, Llama) deployed on AWS SageMaker and Fargate.
	      	\item Improved data reliability by designing REST API services backed by relational data models, normalizing heterogeneous inputs from third-party clinical systems into consistent schemas and persisting structured outputs for downstream analytics and reporting.
	      	\item Maintained high test coverage by authoring unit and integration tests across backend services and frontend workflows, participating in code reviews, and owning CI/CD configuration on AWS to ensure stable, reproducible deployments.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'python', 'django', 'typescript', 'data', 'etl', 'pipeline', 'api', 'aws', 'testing', 'ci-cd', 'deployed', 'finance'],
  },

  // ── Partiful (NYC, product eng / React Native+TypeScript+Node / consumer social) ──
  {
    slug: 'partiful-product-eng-nyc',
    company: 'Partiful',
    role: 'Product Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Owned product features end-to-end across web and mobile surfaces, building React and TypeScript frontend components with Node.js backend APIs that powered real-time clinical video sessions via WebRTC for thousands of daily users, from design through production.
	      	\item Improved user experience quality by iterating directly with clinical teams to translate real usage feedback into polished, intuitive interfaces, shortening the loop between user signal and shipped improvements.
	      	\item Accelerated release velocity by maintaining CI/CD pipelines and AWS infrastructure automation, enabling the team to ship high-quality product updates multiple times per week without stability tradeoffs.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'node', 'mobile', 'product', 'consumer', 'frontend', 'api', 'ci-cd', 'deployed', 'startup'],
  },

  // ── Auctor (NYC, fullstack / agentic AI / Python+TypeScript / unstructured data) ─
  {
    slug: 'auctor-swe-nyc',
    company: 'Auctor',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built agentic LLM workflows in Python and TypeScript (PyTorch, Llama) that retrieved, extracted, and structured clinical information from large corpora of unstructured WebRTC session inputs, delivering actionable outputs to provider-facing interfaces on AWS SageMaker and Fargate.
	      	\item Designed full-stack infrastructure for high-performance clinical applications, building Next.js frontend components and Python REST APIs that surfaced real-time inference results to thousands of daily enterprise users.
	      	\item Evaluated and iterated on LLM configurations across multiple application-layer use cases, tuning model prompting, retrieval pipelines, and output schemas to optimize accuracy and reliability in production.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'python', 'typescript', 'nextjs', 'llm', 'agents', 'rag', 'unstructured-data', 'api', 'aws', 'startup', 'deployed'],
  },

  // ── Pogo (NYC, fullstack / AI agents / React+TypeScript / fast shipping startup) ─
  {
    slug: 'pogo-fullstack-swe-nyc',
    company: 'Pogo',
    role: 'Full Stack Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped AI-powered product features end-to-end at an early-stage startup, building React and TypeScript frontends alongside Python backend APIs and LLM-based inference agents (PyTorch, Llama) integrated with WebRTC video pipelines and deployed on AWS SageMaker and Fargate.
	      	\item Delivered internal tooling that automated manual clinical workflows, working cross-functionally with clinical and ops teams to identify high-impact friction points and ship solutions within days of scoping.
	      	\item Maintained fast iteration cycles by owning CI/CD pipelines, AWS infrastructure, and observability tooling, enabling the team to ship multiple production releases per week without stability tradeoffs.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'python', 'llm', 'agents', 'ai', 'api', 'internal-tools', 'startup', 'ci-cd', 'deployed'],
  },

  // ── Astronomer (NYC, fullstack / React+TypeScript+Go / Airflow / DataOps) ───────
  {
    slug: 'astronomer-swe-nyc',
    company: 'Astronomer',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped production features across the full stack by building React and TypeScript frontend components alongside Python and TypeScript backend APIs, integrating WebRTC video workflows and LLM-powered inference pipelines (PyTorch, Llama) deployed on AWS SageMaker and Fargate.
	      	\item Improved data reliability by designing REST API services and workflow automation that orchestrated clinical data ingestion, normalization, and downstream delivery across distributed backend services used by thousands of providers daily.
	      	\item Maintained production quality by writing unit and integration tests, participating in code reviews, and owning CI/CD configuration and observability tooling on AWS that kept deployments stable across multiple weekly releases.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'python', 'api', 'workflow', 'data', 'etl', 'pipeline', 'ci-cd', 'aws', 'deployed', 'testing'],
  },

  // ── Stott and May (NYC, backend-leaning / TypeScript+React / early-stage AI) ────
  {
    slug: 'stott-may-backend-nyc',
    company: 'Stott and May',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Owned major product features end-to-end at an early-stage startup, building TypeScript and React frontend components alongside Python backend APIs and infrastructure, shipping directly to thousands of daily users with no intermediary product layer.
	      	\item Shipped LLM-powered clinical inference features (PyTorch, Llama) from concept through production on AWS SageMaker and Fargate, collaborating directly with the founding team and clinical users to rapidly iterate on requirements and implementation.
	      	\item Reduced deployment friction by owning CI/CD configuration, infrastructure automation on AWS, and WebRTC video integration, enabling fast iteration and reliable delivery in a small, high-output engineering team.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'typescript', 'react', 'fullstack', 'startup', 'llm', 'api', 'aws', 'ci-cd', 'deployed', 'ownership'],
  },

  // ── fab2 (NYC, fullstack / React+TypeScript / real-time UI / chip fab software) ─
  {
    slug: 'fab2-fullstack-swe-nyc',
    company: 'fab2',
    role: 'Full Stack Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Improved provider situational awareness by building React and TypeScript real-time dashboards that surfaced live clinical session data from WebRTC video streams, giving providers an intuitive, high-density view of patient interactions and model inference outputs.
	      	\item Owned features end-to-end across the stack, designing backend Python APIs on AWS SageMaker and Fargate that powered LLM-based inference (PyTorch, Llama) and delivering the data through clean, responsive frontend interfaces built for technical clinical users.
	      	\item Reduced workflow complexity for internal users by iterating directly with the clinical team to translate dense operational requirements into fast, reliable interfaces that streamlined daily session management and data review.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'real-time', 'frontend', 'backend', 'api', 'data-viz', 'python', 'aws', 'startup', 'deployed'],
  },

  // ── Reality Defender (NYC, fullstack / deepfake detection / React+Python / AWS) ──
  {
    slug: 'reality-defender-fullstack-nyc',
    company: 'Reality Defender',
    role: 'Full Stack Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{June 2023 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped end-to-end clinical AI features by building React and TypeScript dashboards that surfaced real-time inference results to providers, backed by Python APIs orchestrating transformer-based model execution (PyTorch, Llama) over WebRTC video session inputs on AWS SageMaker and Fargate.
	      	\item Improved detection reliability by collaborating directly with ML engineers to integrate model outputs into production REST APIs, normalizing heterogeneous inference results into structured schemas consumed by frontend workflows.
	      	\item Accelerated delivery by owning CI/CD configuration, AWS infrastructure automation, and observability tooling, enabling the team to ship full-stack features from design to production multiple times per week.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'python', 'ml', 'inference', 'api', 'aws', 'real-time', 'ci-cd', 'deployed', 'startup'],
  },

  // ── Rippling HR (NYC, backend / Python / API design / data modeling / scale) ────
  {
    slug: 'rippling-hr-backend-nyc',
    company: 'Rippling',
    role: 'Software Engineer, HR Product',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Improved platform reliability by designing and building Python and TypeScript backend APIs that handled real-time clinical data from WebRTC video sessions, modeled complex provider and patient relationships across relational schemas, and routed structured outputs to downstream services on AWS SageMaker and Fargate.
	      	\item Reduced integration errors by building event-driven service adapters that normalized heterogeneous data from third-party clinical systems into consistent internal schemas, ensuring reliable and auditable data flow across the platform.
	      	\item Owned the full development lifecycle for backend services from design through production, including monitoring, incident response, and iterative improvement, without reliance on external specifications.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'python', 'api', 'data-modeling', 'event-driven', 'distributed', 'typescript', 'aws', 'ci-cd', 'deployed', 'scale'],
  },

  // ── Figma (NYC/remote, fullstack / React+TypeScript / C++ / real-time collab) ───
  {
    slug: 'figma-fullstack-swe-nyc',
    company: 'Figma',
    role: 'Full Stack Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped real-time collaborative clinical features by building React and TypeScript frontend components integrated with a WebRTC streaming layer, enabling thousands of providers and patients to interact live across a shared session interface.
	      	\item Improved product quality end-to-end by owning features from technical design through implementation, testing, and deployment, integrating LLM-powered inference (PyTorch, Llama) into provider-facing workflows via Python backend APIs on AWS SageMaker and Fargate.
	      	\item Accelerated team delivery by maintaining CI/CD pipelines, infrastructure automation, and developer tooling on AWS, reducing deployment friction and enabling multiple production releases per week.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'python', 'cpp', 'real-time', 'frontend', 'backend', 'api', 'product', 'ci-cd', 'deployed'],
  },

  // ── MongoDB (remote, C++ query engine / Python testing / database internals) ────
  {
    slug: 'mongodb-query-integration-swe',
    company: 'MongoDB',
    role: 'Software Engineer, Query Integration',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{June 2023 -- May 2025}}
	      \begin{itemize*}
	      	\item Improved clinical inference quality by building and fine-tuning transformer-based models (PyTorch, Llama) in Python and TypeScript, integrating outputs with WebRTC video pipelines and deploying end-to-end inference infrastructure on AWS SageMaker and Fargate.
	      	\item Strengthened system correctness by authoring comprehensive Python test suites covering data ingestion, model execution, and API response validation, catching regressions before they reached production.
	      	\item Reduced deployment errors by owning CI/CD configuration and infrastructure automation on AWS, enabling reproducible builds and reliable delivery of backend services across multiple environments.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['cpp', 'python', 'systems', 'testing', 'database', 'research', 'algorithms', 'oss', 'performance', 'ci-cd', 'deployed'],
  },

  // ── Hedge Fund (NYC, backend / real-time data / distributed / Python+C#) ────────
  {
    slug: 'hedge-fund-swe-nyc',
    company: 'Hedge Fund',
    role: 'Software Developer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Reduced processing latency for real-time clinical data by building high-throughput Python and TypeScript event-driven pipelines that ingested streaming inputs from WebRTC video sessions, applied inference with PyTorch and Llama, and published structured outputs to downstream consumer services on AWS SageMaker and Fargate.
	      	\item Improved system reliability by designing distributed service adapters with strict data contracts, structured logging, and alerting across AWS infrastructure, enabling rapid detection and resolution of production incidents.
	      	\item Owned the full development lifecycle for backend services end-to-end, from architecture and implementation through deployment and on-call support, without reliance on external product specifications.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'python', 'distributed', 'real-time', 'low-latency', 'pipeline', 'event-driven', 'systems', 'ci-cd', 'deployed', 'finance'],
  },

  // ── Brellium (NYC, backend / healthcare AI / LLMs / Python+TypeScript) ─────────
  {
    slug: 'brellium-backend-swe-nyc',
    company: 'Brellium',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Reduced clinical documentation errors by integrating LLM-powered review pipelines (PyTorch, Llama) in Python and TypeScript that ingested unstructured inputs from WebRTC video sessions, extracted structured clinical data, and surfaced compliance risks to providers in real time on AWS SageMaker and Fargate.
	      	\item Improved data reliability by designing end-to-end SQL-backed data workflows that aggregated, normalized, and persisted patient session records across relational databases, enabling accurate downstream analytics and audit trails.
	      	\item Accelerated feature delivery by owning CI/CD configuration, AWS infrastructure automation, and developer tooling, giving the team confidence to ship high-quality backend and frontend features multiple times per week.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'python', 'typescript', 'llm', 'healthcare', 'ai', 'pipeline', 'sql', 'aws', 'react', 'ci-cd', 'deployed', 'startup'],
  },

  // ── Ramp (NYC, backend / credit systems / distributed / Python / fintech) ──────
  {
    slug: 'ramp-credit-backend-nyc',
    company: 'Ramp',
    role: 'Software Engineer, Credit',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Improved clinical decision throughput by building high-volume Python and TypeScript backend services that processed real-time inputs from WebRTC video sessions, ran async inference pipelines on AWS SageMaker and Fargate, and delivered structured outputs with strict correctness guarantees to downstream provider systems.
	      	\item Strengthened system observability by instrumenting distributed services with structured logging, alerting, and tracing on AWS, enabling rapid incident detection and reducing mean time to resolution across production pipelines.
	      	\item Reduced integration errors by designing RESTful service adapters that enforced consistent data contracts across third-party clinical systems, ensuring reliable and auditable data flow through the platform.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'python', 'distributed', 'async', 'pipeline', 'observability', 'correctness', 'api', 'ml', 'ci-cd', 'deployed', 'fintech'],
  },

  // ── Compass (NYC, backend / distributed microservices / event-driven / AWS) ────
  {
    slug: 'compass-swe-ii-nyc',
    company: 'Compass',
    role: 'Software Engineer II',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Improved platform reliability by designing and building distributed Python and TypeScript microservices that orchestrated real-time clinical data ingestion from WebRTC video sessions, model inference on AWS SageMaker and Fargate, and result delivery to provider-facing REST APIs.
	      	\item Reduced integration overhead by building event-driven service adapters that normalized heterogeneous data from third-party clinical systems into a consistent internal schema, enabling reliable downstream processing across the platform.
	      	\item Accelerated release velocity by owning CI/CD configuration, container orchestration on AWS ECS, and observability tooling, reducing deployment friction and enabling multiple production releases per week.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'microservices', 'event-driven', 'distributed', 'python', 'typescript', 'aws', 'docker', 'ci-cd', 'api', 'deployed'],
  },

  // ── Clay (NYC, fullstack / React+TypeScript+Python / AWS / product eng) ────────
  {
    slug: 'clay-fullstack-swe-nyc',
    company: 'Clay',
    role: 'Software Engineer, Full Stack',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Owned features end-to-end by building React and TypeScript frontend components alongside Python backend APIs, integrating WebRTC video infrastructure and shipping to thousands of daily healthcare provider sessions on AWS Fargate and Lambda.
	      	\item Improved clinical outcomes by shipping LLM-powered inference pipelines (PyTorch, Llama) that processed unstructured session data and surfaced structured insights through provider-facing dashboards and REST APIs.
	      	\item Reduced deployment friction by owning CI/CD configuration, container orchestration on AWS ECS, and observability tooling, enabling the team to ship and iterate on full-stack features multiple times per week.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'python', 'node', 'aws', 'fargate', 'api', 'product', 'ci-cd', 'startup', 'deployed'],
  },

  // ── Mirage (NYC, backend / generative AI / ML pipelines / video platform) ─────
  {
    slug: 'mirage-backend-swe-nyc',
    company: 'Mirage',
    role: 'Backend Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Deployed transformer-based inference systems (PyTorch, Llama) into production on AWS SageMaker and Fargate, integrating generative model outputs with TypeScript service APIs and WebRTC video pipelines serving thousands of daily healthcare sessions.
	      	\item Improved diagnostic accuracy by building end-to-end ML data pipelines that ingested unstructured session inputs, ran model inference, and persisted structured outputs to downstream analytics and provider dashboards.
	      	\item Reduced operational overhead by owning CI/CD configuration, infrastructure automation, and observability on AWS, enabling the team to ship and iterate on backend systems multiple times per week.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'ml', 'llm', 'generative', 'pipeline', 'python', 'typescript', 'distributed', 'api', 'infrastructure', 'deployed', 'startup'],
  },

  // ── Traba (NYC, fullstack / LLM agents / React+TypeScript / supply chain) ─────
  {
    slug: 'traba-fullstack-swe-nyc',
    company: 'Traba',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped real-time clinical video features by building React and TypeScript frontend components integrated with a WebRTC streaming layer, delivering a polished provider experience used daily across thousands of healthcare sessions.
	      	\item Wired LLM-powered inference (PyTorch, Llama) into the product stack through Node.js service APIs, connecting model outputs to provider dashboards and automating clinical data extraction from unstructured session inputs on AWS SageMaker and Fargate.
	      	\item Accelerated third-party integrations by building REST adapters that normalized data from external clinical platforms into a consistent internal schema, enabling faster onboarding for new partners.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'node', 'llm', 'agents', 'api', 'frontend', 'startup', 'deployed'],
  },

  // ── Neon (NYC, fullstack / React+TypeScript / gaming payments startup) ────────
  {
    slug: 'neon-fullstack-nyc',
    company: 'Neon',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Increased provider engagement by building React and TypeScript frontend components for real-time clinical video sessions powered by WebRTC, delivering a fast and reliable interface used daily by thousands of healthcare providers.
	      	\item Improved diagnostic accuracy by integrating transformer-based inference models (PyTorch, Llama) into the product, connecting backend ML pipelines on AWS SageMaker and Fargate to the frontend through well-defined REST APIs.
	      	\item Sped up release cycles by owning CI/CD configuration and infrastructure automation on AWS, enabling the team to ship multiple features per week with confidence.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'frontend', 'backend', 'api', 'startup', 'deployed', 'ci-cd'],
  },

  // ── Haus (NYC, science platform / ML pipeline / causal inference) ────────────
  {
    slug: 'haus-science-platform-nyc',
    company: 'Haus',
    role: 'Software Engineer, Science Platform',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Improved diagnostic throughput by building end-to-end ML inference pipelines in Python and TypeScript, orchestrating model execution with PyTorch and Llama over unstructured clinical data ingested from WebRTC video sessions, with results persisted to downstream analytics on AWS SageMaker and Fargate.
	      	\item Reduced data processing latency by designing and optimizing ETL workflows that aggregated and normalized high-volume clinical records across multiple input schemas, enabling reliable daily pipeline execution at scale.
	      	\item Increased release cadence by owning CI/CD configuration, cloud infrastructure automation, and observability tooling on AWS, giving the team confidence to ship multiple features per week without operational overhead.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'python', 'ml', 'pipeline', 'data', 'etl', 'orchestration', 'statistics', 'research', 'ci-cd', 'deployed', 'startup'],
  },

  // ── Tennr (NYC, healthcare backend / ML workflow orchestration) ──────────────
  {
    slug: 'tennr-backend-eng-nyc',
    company: 'Tennr',
    role: 'Backend Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{June 2023 -- May 2025}}
	      \begin{itemize*}
	      	\item Reduced clinical documentation delays by building high-volume ML workflow pipelines in Python and TypeScript that orchestrated LLM-powered extraction (PyTorch, Llama) over unstructured inputs from WebRTC sessions, processing thousands of records with SageMaker and Fargate.
	      	\item Accelerated third-party integration delivery by designing RESTful APIs and event-driven service adapters that normalized heterogeneous data from external clinical systems into a consistent schema used across the product.
	      	\item Improved system reliability by owning CI/CD configuration, cloud infrastructure automation on AWS, and backend performance optimization, reducing deployment errors and enabling faster iteration.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'python', 'typescript', 'ml', 'llm', 'pipeline', 'data', 'etl', 'api', 'event-driven', 'ci-cd', 'deployed', 'startup', 'healthcare'],
  },

  // ── Calvis (NYC, physical security AI / full-stack startup) ─────────────────
  {
    slug: 'calvis-swe-nyc',
    company: 'Calvis',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped patient-facing and provider-facing clinical products end to end on a small startup team, owning React and TypeScript frontends, Python backend services, and WebRTC real-time video integrations from design through production with no dedicated PM or designer.
	      	\item Improved diagnostic accuracy by integrating PyTorch and Llama inference pipelines directly into live provider workflows on AWS SageMaker and Fargate, iterating rapidly against real user behavior and production feedback to close the loop between model output and clinical outcomes.
	      	\item Reduced release cycle time and environment drift by owning CI/CD configuration and cloud infrastructure automation across multiple production services, enabling the team to ship confidently and frequently without operational overhead.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'python', 'node', 'api', 'agents', 'llm', 'deployed', 'ci-cd', 'real-time', 'startup'],
  },

  // ── Edra (NYC, production LLM / agentic systems, Series A Sequoia) ──────────
  {
    slug: 'edra-ai-eng-nyc',
    company: 'Edra',
    role: 'AI Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built production LLM inference pipelines using PyTorch and Llama, processing unstructured clinical session data captured via WebRTC into structured outputs consumed by treating physicians, with confidence-based routing logic to determine when to surface model output vs.\ escalate to human review.
	      	\item Implemented reinforcement learning feedback loops to iteratively improve diagnostic model accuracy from live production signals, closing the loop between human corrections and model behavior.
	      	\item Deployed and operated the full agentic stack on AWS SageMaker and Fargate, owning observability, latency optimization, and zero-downtime releases across multiple production services with TypeScript APIs at the interface layer.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['llm', 'rag', 'ai', 'python', 'inference', 'agents', 'ml', 'real-time', 'backend', 'api', 'deployed', 'research'],
  },

  // ── Commure FDE (NYC, forward deployed / healthcare AI) ─────────────────────
  {
    slug: 'commure-fde-nyc',
    company: 'Commure',
    role: 'Forward Deployed Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built and shipped patient-facing and provider-facing clinical tools end to end on a small healthcare startup team, owning React and TypeScript frontends, Python backend services, and WebRTC video integrations used daily by thousands of providers.
	      	\item Integrated LLM-based inference pipelines (PyTorch, Llama) directly into live clinical workflows, translating care team requirements into production features and iterating quickly based on feedback from practicing physicians.
	      	\item Owned CI/CD configuration and AWS infrastructure deployment, enabling reproducible environments and zero-downtime releases while maintaining compliance with healthcare data handling requirements.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['fde', 'fullstack', 'react', 'python', 'typescript', 'api', 'deployed', 'integration', 'llm', 'healthcare', 'ci-cd'],
  },

  // ── Narmi (NYC, implementations engineering / fintech integrations) ──────────
  {
    slug: 'narmi-impl-eng-nyc',
    company: 'Narmi',
    role: 'Implementations Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Accelerated provider onboarding and integration delivery by building RESTful Python backend services and TypeScript APIs that connected third-party clinical systems to live telehealth workflows, reducing manual configuration overhead across multiple customer deployments.
	      	\item Improved diagnostic accuracy and reduced manual clinical review by integrating LLM-based inference pipelines (PyTorch, Llama) directly into provider-facing workflows via WebRTC, owning the full lifecycle from data ingestion to structured output on AWS SageMaker and Fargate.
	      	\item Enabled faster, more reliable releases across production environments by owning YAML-based CI/CD configuration and cloud infrastructure automation, cutting environment drift and deployment cycle time.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'python', 'typescript', 'api', 'integration', 'fde', 'deployed', 'ci-cd', 'data', 'backend'],
  },

  // ── Visa (NYC, fullstack SWE) ────────────────────────────────────────────────
  {
    slug: 'visa-swe-nyc',
    company: 'Visa',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'backend', 'react', 'api', 'data', 'sql', 'postgresql', 'ci-cd', 'deployed', 'microservices'],
  },

  // ── Apptronik (Austin, humanoid robotics / motion data pipelines) ────────────
  {
    slug: 'apptronik-motion-data',
    company: 'Apptronik',
    role: 'Software Engineer, Human Motion Data',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Developed real-time signal processing algorithms in \CPP{} and Python for defense sensor systems on embedded Linux hardware, applying coordinate transforms and DSP techniques to translate raw sensor streams into structured, actionable data.
	      	\item Built high-throughput data ingestion and processing microservices handling live sensor data under strict latency constraints, collaborating directly with electrical and firmware engineers to validate output against hardware behavior.
	      	\item Maintained automated CI/CD build infrastructure with static analysis and integration testing across multiple production deployments.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built end-to-end ML data pipelines in Python using PyTorch and Llama to process, structure, and run inference over large volumes of unstructured clinical data captured via WebRTC video and audio streams.
	      	\item Deployed and operated inference infrastructure on AWS SageMaker and Fargate, iterating on model accuracy using reinforcement learning and owning the full pipeline from raw input to structured output.
	      	\item Authored YAML-based CI/CD configuration and cloud infrastructure automation, enabling reproducible environments and zero-downtime releases across multiple production services.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['systems', 'c++', 'python', 'data', 'pipeline', 'ml', 'research', 'embedded', 'hardware', 'ci-cd', 'real-time'],
  },

  // ── Avride (Austin, autonomous vehicles / simulation backend) ───────────────
  {
    slug: 'avride-sim-backend',
    company: 'Avride',
    role: 'Simulation Backend Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Built containerized microservices for high-frequency sensor data ingestion and processing using Podman and serverless infrastructure on AWS, designing storage schemas and retrieval patterns optimized for high-throughput distributed workloads.
	      	\item Developed Python and \CPP{} signal processing pipelines on embedded Linux systems, applying distributed data flow patterns to route, transform, and persist live sensor streams under strict latency and reliability constraints.
	      	\item Automated CI/CD infrastructure with static analysis and integration testing, maintaining deployment reliability across multiple production services using infrastructure-as-code tooling.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Designed and operated distributed ML inference pipelines on AWS SageMaker and Fargate, building event-driven data flows that ingested WebRTC video streams, processed them through TypeScript and Python services, and persisted structured outputs for downstream analytics.
	      	\item Owned cloud infrastructure configuration and deployment automation using YAML-based pipelines, managing containerized services across multiple production environments with zero-downtime release strategies.
	      	\item Built observability into production pipelines, monitoring latency and throughput across distributed services and iterating on model accuracy using reinforcement learning feedback loops.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['backend', 'distributed', 'systems', 'data', 'pipeline', 'cloud', 'aws', 'microservices', 'ci-cd', 'python', 'containers'],
  },

  // ── SNH AI (Austin, LLM backend / autonomous AI startup) ────────────────────
  {
    slug: 'snh-ai-swe',
    company: 'SNH AI',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Integrated Llama and GPT-family models into production clinical workflows using PyTorch, implementing structured JSON outputs, function calling, and streaming endpoints consumed by real-time TypeScript and WebRTC-based frontends.
	      	\item Built and operated end-to-end LLM inference pipelines on AWS SageMaker and Fargate, owning schema design, cost and latency optimization, observability, and rollback plans across multiple production services.
	      	\item Shipped features across the full stack in a small startup team, from CI/CD configuration and cloud infrastructure to provider-facing APIs, moving quickly from idea to production with minimal process overhead.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['llm', 'ai', 'backend', 'typescript', 'python', 'node', 'api', 'streaming', 'inference', 'ci-cd', 'deployed', 'real-time'],
  },

  // ── Glimmer (Austin, creator economy fullstack) ─────────────────────────────
  {
    slug: 'glimmer-fullstack-austin',
    company: 'Glimmer',
    role: 'Full Stack Software Developer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built React and TypeScript frontends for patient-facing clinical tools, integrating WebRTC for real-time video and shipping features end to end across the full product lifecycle on a small, fast-moving team.
	      	\item Developed and maintained RESTful Python backend services powering live clinical workflows, owning data models, API contracts, and integrations with third-party services used daily by providers.
	      	\item Owned CI/CD configuration and AWS infrastructure deployment using YAML-based pipelines, enabling reproducible environments and zero-downtime releases across multiple production services.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{HEXstream}}
	      {\textbf{Chicago, IL}}
	      \headerrow
	      {\emph{Software Engineering Intern}}
	      {\emph{May 2022 -- Aug 2022}}
	      \begin{itemize*}
	      	\item Engineered PHP-based backend ETL pipelines integrating data from 25+ enterprise sources into Azure SQL and Azure Data Lake.
	      	\item Developed automated workflows for ingestion, cleansing, and aggregation, supporting distributed analytics systems.
	      \end{itemize*}`,
    ]),
    tags: ['fullstack', 'react', 'typescript', 'node', 'api', 'dashboard', 'postgresql', 'ci-cd', 'deployed'],
  },

  {
    slug: 'sakana-product-swe',
    company: 'Sakana AI',
    role: 'Software Engineer (Product)',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_EXPANDED, EXP_HEXSTREAM_DEFAULT].map((e, i) => i === 1 ? String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built and shipped a full-stack AI telehealth product end-to-end: React/Next.js and TypeScript frontend with WebRTC video integration, Python backend APIs, and PyTorch/Llama-based inference integrated directly into user-facing clinical workflows.
	      	\item Integrated ML models into the live product, deploying inference pipelines on SageMaker and Fargate with monitoring and post-processing; improved diagnostic accuracy using reinforcement learning.
	      	\item Rapidly prototyped AI-powered document processing workflows to extract and structure clinical data from unstructured inputs, iterating from hypothesis to validated feature.
	      	\item Owned CI/CD configuration across cloud infrastructure and application deployments using YAML-based pipelines, enabling reproducible environments and zero-downtime releases.
	      \end{itemize*}` : e)),
    tags: ['fullstack', 'react', 'python', 'typescript', 'api', 'ml', 'inference', 'deployed', 'ci-cd', 'data', 'dashboard'],
  },
  // ── Mercari (Tokyo, SRE / GCP+K8s / observability / developer enabling) ─────
  {
    slug: 'mercari-sre-tokyo',
    company: 'Mercari',
    role: 'Software Engineer, Site Reliability',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Owned CI/CD pipeline infrastructure with static analysis, integration testing, and automated validation across multiple production services, reducing deployment friction and maintaining reliability through continuous delivery.
	      	\item Built containerized microservices for high-frequency sensor data ingestion using Podman orchestration, engineering for strict latency and throughput constraints in production environments.
	      	\item Collaborated cross-functionally with hardware and firmware engineers to define reliability requirements and implement preventive measures, applying post-incident analysis to drive infrastructure improvements.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Deployed and operated production inference services on GCP and AWS using Kubernetes and Fargate, owning observability (structured logging, metrics, distributed tracing), zero-downtime releases, and incident response for systems serving thousands of concurrent clinical users.
	      	\item Built and maintained CI/CD pipelines and developer tooling integrating TypeScript and WebRTC services, reducing friction in the engineering workflow and enabling faster, safer delivery across the stack.
	      	\item Applied AI-assisted automation to eliminate manual operational toil, building internal tooling that improved engineering productivity and reduced time-to-debug for production incidents.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['sre', 'gcp', 'kubernetes', 'observability', 'ci-cd', 'reliability', 'cloud', 'docker', 'aws', 'typescript', 'python', 'incident-response', 'developer-tooling', 'ai'],
  },

  // ── JP Fintech AI/FDE (Tokyo remote, AI SWE / FDE / Python+TS / AWS / LLM) ──
  {
    slug: 'bloomtech-ai-fde-tokyo',
    company: 'Listed JP Fintech Group',
    role: 'AI Software Engineer / Forward Deployed Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT]),
    tags: ['ai', 'llm', 'python', 'typescript', 'react', 'aws', 'docker', 'api', 'backend', 'deployed', 'inference', 'agents', 'mcp', 'fastapi', 'fintech'],
  },

  // ── Treasure AI (Tokyo, Productivity Engineer / AI automation / Python+TS / LLM) ──
  {
    slug: 'treasure-ai-pe-tokyo',
    company: 'Treasure AI',
    role: 'Productivity Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['python', 'typescript', 'automation', 'llm', 'agents', 'api', 'ci-cd', 'internal-tools', 'ai', 'deployed', 'pipeline', 'workflow'],
  },

  // ── Yodo Labs (Tokyo, EOI / spatial AI / CV / ML inference / edge) ──────────
  {
    slug: 'yodo-labs-eoi-tokyo',
    company: 'Yodo Labs',
    role: 'Software Engineer (Expression of Interest)',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      EXP_DOXYME_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{University of Utah -- VAAST Lab}}
	      {\textbf{Salt Lake City, UT}}
	      \headerrow
	      {\emph{Undergraduate Research Assistant}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Integrated photorealistic nature environments into head-mounted displays using Unity, building scene loading pipelines, asset configuration, and rendering setups for spatial perception experiments run with human participants.
	      	\item Implemented continuous 6DOF head tracking in Unity to capture participant gaze and orientation in X, Y, Z coordinates throughout immersive VR sessions, enabling researchers to reconstruct full spatial trajectories for cognitive analysis.
	      	\item Collaborated with psychology PhD researchers to translate experimental design requirements into working VR software, bridging the gap between research intent and technical implementation across mixed-reality environments.
	      \end{itemize*}`,
    ]),
    tags: ['ml', 'python', 'inference', 'ai', 'pytorch', 'unity', 'xr', 'vr', 'spatial', 'tracking', 'cv', 'deployed', 'sagemaker', 'data'],
  },

  // ── BJAK Fullstack (Tokyo, fullstack / React+Next.js / payments / neobank) ──
  {
    slug: 'bjak-fullstack-tokyo',
    company: 'BJAK',
    role: 'Full Stack Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped full-stack product features end-to-end across a React and Next.js frontend and Python backend APIs, integrating WebRTC real-time video and TypeScript components into customer-facing clinical workflows used daily by thousands of providers.
	      	\item Built internal tooling and automation that reduced manual operational workflows for clinical teams, translating ambiguous requirements into working systems with fast iteration cycles.
	      	\item Owned production reliability through CI/CD pipeline maintenance, AWS infrastructure automation (ECS, Fargate), and incident response, monitoring and debugging live systems beyond initial release.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['fullstack', 'react', 'nextjs', 'typescript', 'python', 'api', 'frontend', 'backend', 'ci-cd', 'deployed', 'internal-tools', 'fintech', 'payments'],
  },

  // ── BJAK (Tokyo, Applied AI / LLM agents / fintech automation) ─────────────
  {
    slug: 'bjak-applied-ai-tokyo',
    company: 'BJAK',
    role: 'Applied AI Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT]),
    tags: ['llm', 'rag', 'agents', 'python', 'typescript', 'ml', 'inference', 'ai', 'automation', 'deployed', 'fintech', 'document', 'sagemaker'],
  },

  // ── JPMorgan Chase (Tokyo, Japan Payments Technology / Java / Spring / React) ──
  {
    slug: 'jpmorgan-payments-swe-tokyo',
    company: 'JPMorgan Chase',
    role: 'Software Engineer I, Japan Payments Technology',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Built containerized Java and Python microservices for high-frequency defense sensor data ingestion and storage using Spring Boot patterns, applying strict transaction integrity and reliability under latency constraints.
	      	\item Developed signal processing algorithms in Python and \CPP{} on embedded Linux systems, meeting strict resource constraints through low-level profiling and optimization in collaboration with hardware teams.
	      	\item Automated CI/CD pipelines with static code analysis and integration testing using Jenkins-style build tooling, reducing deployment friction across multiple production services.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Shipped full-stack features across a React and TypeScript frontend and Python backend APIs, integrating WebRTC real-time video into user-facing clinical workflows and deploying to AWS with zero-downtime CI/CD pipelines.
	      	\item Built and deployed ML inference pipelines on AWS SageMaker and Fargate, owning reliability, observability, and incident response across multiple production services used daily by thousands of healthcare providers.
	      	\item Automated development workflows and testing infrastructure, applying tooling improvements that reduced manual toil across the engineering team's software delivery lifecycle.
	      \end{itemize*}`,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'java', 'spring', 'react', 'fullstack', 'payments', 'api', 'microservices', 'ci-cd', 'cloud', 'etl', 'data', 'deployed'],
  },

  // ── Warp (AI-native HRIS, fullstack SWE working directly with CEO/CTO) ────────
  {
    slug: 'warp-swe-nyc',
    company: 'Warp',
    role: 'Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'python', 'ml', 'ai', 'llm', 'api', 'backend', 'dashboard', 'ci-cd'],
  },

  // ── Daytona (AI sandbox infra, Senior AI Engineer / DevEx Engineer) ──────────
  {
    slug: 'daytona-ai-eng-nyc',
    company: 'Daytona',
    role: 'Senior AI Engineer',
    skills: SKILLS.backend,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['backend', 'python', 'ci-cd', 'systems', 'containers', 'api', 'llm', 'ai', 'deployed', 'microservices'],
  },

  // ── Thread AI (Applied AI Engineer, enterprise workflow orchestration) ────────
  {
    slug: 'thread-ai-eng-nyc',
    company: 'Thread AI',
    role: 'Applied AI Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['llm', 'ml', 'ai', 'python', 'inference', 'api', 'deployed', 'integration', 'automation'],
  },

  // ── Sixfold (Forward Deployed Engineer, AI underwriting) ──────────────────────
  {
    slug: 'sixfold-fde-nyc',
    company: 'Sixfold',
    role: 'Forward Deployed Engineer',
    skills: SKILLS.fde,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['deployed', 'integration', 'api', 'python', 'systems', 'ml', 'ai', 'webhook'],
  },

  // ── Hone Health (telehealth parallel to Doxy.me, fullstack + ML) ─────────────
  {
    slug: 'hone-health-swe-nyc',
    company: 'Hone Health',
    role: 'Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'fullstack', 'react', 'api', 'data', 'inference'],
  },

  // ── Fern (SDK Generalist, TypeScript/Python/Go, OpenAPI) ─────────────────────
  {
    slug: 'fern-swe-nyc',
    company: 'Fern',
    role: 'Software Engineer, SDK Generalist',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['typescript', 'python', 'api', 'backend', 'fullstack', 'node', 'react', 'ci-cd', 'integration'],
  },

  // ── Carry (Senior Full Stack, TypeScript/NestJS/Django/AWS) ──────────────────
  {
    slug: 'carry-fullstack-nyc',
    company: 'Carry',
    role: 'Senior Software Engineer, Full Stack',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'python', 'api', 'data', 'dashboard', 'postgresql'],
  },

  // ── Coverdash (Backend SWE, Java/Spring/microservices, insurance API) ─────────
  {
    slug: 'coverdash-backend-nyc',
    company: 'Coverdash',
    role: 'Software Engineer, Backend',
    skills: SKILLS.backend,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['backend', 'api', 'microservices', 'python', 'ci-cd', 'systems', 'data', 'etl'],
  },

  // ── Ellipsis (Founding AI Engineer, LLM agents, Python/FastAPI/Next.js) ───────
  {
    slug: 'ellipsis-ai-eng-nyc',
    company: 'Ellipsis',
    role: 'Founding AI Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_L3HARRIS_ML, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['llm', 'ml', 'ai', 'python', 'inference', 'react', 'fullstack', 'api', 'backend', 'deployed'],
  },

  // ── Scalestack (Full Stack Backend, Python/FastAPI/React/LangGraph) ───────────
  {
    slug: 'scalestack-fullstack-nyc',
    company: 'Scalestack',
    role: 'Full Stack Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'python', 'api', 'data', 'llm', 'automation', 'deployed', 'real-time'],
  },

  // ── Baxus (no open roles; blockchain + ML, React Native/NestJS/Solana) ────────
  {
    slug: 'baxus-swe-nyc',
    company: 'Baxus',
    role: 'Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'backend', 'data', 'dashboard'],
  },

  // ── Benjamin (consumer fintech, mobile + rewards) ─────────────────────────────
  {
    slug: 'benjamin-swe-nyc',
    company: 'Benjamin',
    role: 'Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'data', 'dashboard', 'real-time'],
  },

  // ── Monark Markets (private markets API, backend/data) ────────────────────────
  {
    slug: 'monark-backend-nyc',
    company: 'Monark Markets',
    role: 'Software Engineer',
    skills: SKILLS.backend,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['backend', 'api', 'data', 'etl', 'postgresql', 'python', 'systems', 'microservices'],
  },

  // ── Agree.com (e-signature + payments, fullstack) ─────────────────────────────
  {
    slug: 'agree-fullstack-nyc',
    company: 'Agree.com',
    role: 'Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'integration', 'backend', 'deployed'],
  },

  // ── Clerq (Senior/Staff SWE, Python/Django/Temporal/React/AWS) ───────────────
  {
    slug: 'clerq-backend-nyc',
    company: 'Clerq',
    role: 'Senior Software Engineer',
    skills: SKILLS.backend,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['backend', 'python', 'api', 'postgresql', 'react', 'microservices', 'ci-cd', 'deployed', 'real-time'],
  },

  // ── Partiful (App Infrastructure, React Native/Expo/TypeScript) ───────────────
  {
    slug: 'partiful-infra-nyc',
    company: 'Partiful',
    role: 'App Infrastructure Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'typescript', 'node', 'api', 'real-time', 'dashboard', 'deployed'],
  },

  // ── Fabrik (consumer social/events, no open roles) ────────────────────────────
  {
    slug: 'fabrik-swe-nyc',
    company: 'Fabrik',
    role: 'Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'real-time', 'dashboard'],
  },

  // ── Tabs (SWE AI/ML, TypeScript/NestJS/React/Postgres/Temporal) ──────────────
  {
    slug: 'tabs-aiml-nyc',
    company: 'Tabs',
    role: 'Software Engineer, AI/ML',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'python', 'ml', 'ai', 'llm', 'api', 'backend', 'postgresql'],
  },

  // ── Office Hours (fullstack, React + Node, marketplace) ─────────────────────
  {
    slug: 'officehours-fullstack-nyc',
    company: 'Office Hours',
    role: 'Full Stack Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'next', 'api', 'backend', 'postgresql', 'mongodb', 'aws', 'docker', 'deployed'],
  },

  // ── DualEntry (NYC, Special Projects Lead / AI-native ERP, co-founder adjacent) ──
  {
    slug: 'dualentry-special-projects-nyc',
    company: 'DualEntry',
    role: 'Special Projects Lead',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Built microservices and automation tooling from scratch for high-frequency defense sensor data ingestion, owning the full lifecycle from architecture through deployment and production support with no prior template to follow.
	      	\item Identified and closed gaps in CI/CD and testing coverage on my own initiative, shipping pipeline automation that reduced manual effort and improved release reliability across engineering teams.
	      	\item Collaborated directly with hardware and firmware engineers to translate ambiguous system requirements into working software, operating without a product manager or detailed spec.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built a real-time mental health inference system from scratch for Doxy.me's telehealth platform, fine-tuning Llama models to predict depression risk and mood indicators from tone, voice, and facial cues over live WebRTC sessions -- owned the problem end to end from model selection through SageMaker and Fargate deployment.
	      	\item Improved diagnostic accuracy by designing and closing a reinforcement learning feedback loop over physician-validated outcomes, shipping iterative improvements to production without a dedicated ML research team.
	      	\item Shortened the gap between model output and clinician action by building TypeScript frontend components embedded in the video consultation interface, surfacing AI-generated insights directly at the point of care.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['ai', 'llm', 'python', 'fullstack', 'react', 'api', 'internal-tools', 'automation', 'deployed', 'startup', 'ownership', 'data'],
  },

  // ── Interfere (data infra, real-time ingestion, observability) ───────────────
  {
    slug: 'interfere-data-eng-nyc',
    company: 'Interfere',
    role: 'Data Infrastructure Engineer',
    skills: SKILLS.data,
    experience: experienceSection([
      EXP_L3HARRIS_DEFAULT,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built a real-time data ingestion pipeline streaming live WebRTC session data (audio, video, transcripts) into ML inference infrastructure on SageMaker and Fargate, supporting sub-second predictions at production scale.
	      	\item Designed the schema and processing layer for structured clinical signal extraction, applying RL feedback loops over physician-validated outcomes to continuously refine model accuracy.
	      	\item Standardized CI/CD and deployment pipelines across the ML stack, enabling reproducible infrastructure provisioning and zero-downtime releases.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['data', 'etl', 'backend', 'systems', 'real-time', 'ingestion', 'distributed', 'streaming', 'pipeline', 'python', 'sql'],
  },

  // ── Luma AI (SF Bay Area, Forward Deployed Engineer, customer-embedded ownership) ──
  {
    slug: 'luma-fde-sf',
    company: 'Luma AI',
    role: 'Forward Deployed Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Dallas, TX}}
	      \headerrow
	      {\emph{Associate Software Engineer}}
	      {\emph{June 2025 -- Present}}
	      \begin{itemize*}
	      	\item Owned signal processing modules end to end on embedded defense systems, from problem definition through deployment, working directly with hardware and firmware engineers to translate ambiguous constraints into working software with no formal spec.
	      	\item Built microservices and automation tooling from scratch for high-frequency sensor data ingestion, identifying and closing gaps in CI/CD and testing coverage on my own initiative.
	      	\item Delivered production releases under strict latency and resource constraints, communicating tradeoffs directly to hardware stakeholders throughout each ambiguous, fast-moving project.
	      \end{itemize*}`,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Owned a real-time mental health inference system end to end, from problem definition through production, fine-tuning Llama models and deploying via SageMaker and Fargate over live WebRTC clinical sessions with no existing template to build from.
	      	\item Restructured the inference pipeline mid-build to absorb a new clinical requirement without a rewrite, keeping delivery on schedule.
	      	\item Closed the loop between model output and clinician action by building the TypeScript frontend surfacing AI-generated insights at the point of care, owning the full stack from model to UI.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['ai', 'llm', 'ml', 'python', 'inference', 'deployed', 'fullstack', 'react', 'integration', 'ownership', 'startup', 'automation'],
  },

  // ── Alinia AI (Remote, GenAI evaluation/guardrails platform, LLM validation) ──
  {
    slug: 'alinia-ml-infra-remote',
    company: 'Alinia AI',
    role: 'Machine Learning Engineer, Infra & Deployment',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built and validated a real-time mental health inference system for Doxy.me's telehealth platform, fine-tuning Llama models to predict depression risk, anxiety, and mood indicators from tone, voice, and facial cues over live WebRTC sessions, served via SageMaker and Fargate.
	      	\item Closed the gap between model output and ground truth by designing an evaluation and RL feedback loop over physician-validated clinical outcomes, catching and correcting unreliable predictions before they reached the point of care.
	      	\item Eliminated environment drift and enabled zero-downtime releases by standardizing CI/CD configuration with YAML-based pipelines across the ML stack.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['llm', 'rag', 'ai', 'python', 'ml', 'inference', 'research', 'deployed'],
  },

  // ── Scaler (Amsterdam/NYC, ESG data platform for real estate) ────────────────
  {
    slug: 'scaler-fullstack-nyc',
    company: 'Scaler',
    role: 'Fullstack Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built a real-time data pipeline that transformed unstructured clinical signals (audio, video, transcripts) into structured, actionable risk scores for physicians, powering decisions in live telehealth sessions.
	      	\item Improved output reliability by applying RL feedback loops over physician-validated outcomes, closing the loop between raw data and decisions clinicians could act on.
	      	\item Built the TypeScript frontend surfacing those risk scores directly inside the video consultation interface, and standardized CI/CD across the ML stack for zero-downtime releases.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['data', 'etl', 'dashboard', 'analytics', 'fullstack', 'react', 'backend', 'python', 'sql', 'ml'],
  },

  // ── Antimetal (NYC, AI-powered cloud/infra management) ───────────────────────
  {
    slug: 'antimetal-backend-nyc',
    company: 'Antimetal',
    role: 'Backend Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Owned AWS infrastructure end to end for a production ML inference system, deploying and managing SageMaker and Fargate services under strict cost and latency constraints for a small engineering team.
	      	\item Eliminated environment drift and enabled zero-downtime releases by standardizing CI/CD configuration with YAML-based pipelines across the ML stack.
	      	\item Reduced operational overhead by building automated deployment tooling that removed manual steps from the release process, freeing the team to focus on product work.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
    ]),
    tags: ['systems', 'backend', 'cloud', 'aws', 'ci-cd', 'containers', 'deployed', 'infrastructure', 'python'],
  },

  // ── Rally UXR (user research CRM, YC W22) ─────────────────────────────────────
  {
    slug: 'rally-fullstack-nyc',
    company: 'Rally',
    role: 'Fullstack Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'automation', 'api', 'dashboard', 'crm'],
  },

  // ── Krepling (remote-first, e-commerce enablement / no-code builder) ─────────
  {
    slug: 'krepling-fullstack-remote',
    company: 'Krepling',
    role: 'Fullstack Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'integration', 'data', 'dashboard'],
  },

  // ── dub (NYC, regulated copy-trading / social investing platform) ────────────
  {
    slug: 'dub-backend-nyc',
    company: 'dub',
    role: 'Backend Developer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_BACKEND,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built backend services processing real-time, regulation-sensitive clinical data from live WebRTC sessions, meeting strict reliability and data-integrity requirements for a healthcare platform.
	      	\item Improved output accuracy by applying RL feedback loops over physician-validated outcomes, ensuring automated decisions held up against expert review before reaching production.
	      	\item Standardized CI/CD configuration across the ML stack, enabling zero-downtime releases and consistent, auditable deployments.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['backend', 'systems', 'python', 'api', 'fintech', 'compliance', 'real-time', 'deployed', 'ci-cd'],
  },

  // ── AgentSmyth (NYC, AI agents for financial analysis/decision-making) ───────
  {
    slug: 'agentsmyth-ai-eng-nyc',
    company: 'AgentSmyth',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built an LLM-driven decision support system for Doxy.me's telehealth platform, fine-tuning Llama models to turn unstructured clinical signals into context-sensitive, action-oriented risk assessments for physicians in live sessions.
	      	\item Improved decision accuracy by designing an RL feedback loop over physician-validated outcomes, closing the gap between model output and expert judgment.
	      	\item Deployed and served the system on SageMaker and Fargate, standardizing CI/CD across the ML stack for zero-downtime releases.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['llm', 'ml', 'ai', 'python', 'inference', 'agent', 'automation', 'api', 'deployed', 'fintech'],
  },

  // ── HouseAccount (NYC, home services marketplace) ─────────────────────────────
  {
    slug: 'houseaccount-fullstack-nyc',
    company: 'HouseAccount',
    role: 'Fullstack Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'marketplace', 'dashboard', 'integration'],
  },

  // ── Kasheesh (NYC, split-payment fintech app) ─────────────────────────────────
  {
    slug: 'kasheesh-fullstack-nyc',
    company: 'Kasheesh',
    role: 'Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'fintech', 'payments', 'deployed'],
  },

  // ── midpage (NYC/remote, generative AI legal research/drafting platform) ─────
  {
    slug: 'midpage-ai-eng-remote',
    company: 'midpage',
    role: 'Senior Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built a document-grounded question-answering system for Doxy.me's telehealth platform, fine-tuning Llama models to extract and summarize structured clinical signals from unstructured session data, served via SageMaker and Fargate.
	      	\item Improved answer accuracy by designing an RL feedback loop over physician-validated outcomes, closing the gap between retrieved evidence and the model's conclusions.
	      	\item Standardized CI/CD configuration across the ML stack, enabling reliable, zero-downtime releases for a small engineering team.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['llm', 'rag', 'ai', 'python', 'ml', 'inference', 'research', 'search', 'deployed'],
  },

  // ── DoorList (NYC, QR-code event management/social app) ──────────────────────
  {
    slug: 'doorlist-fullstack-nyc',
    company: 'DoorList',
    role: 'Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'real-time', 'consumer', 'mobile'],
  },

  // ── Attention (NYC, AI sales intelligence/coaching platform) ─────────────────
  {
    slug: 'attention-ai-eng-nyc',
    company: 'Attention',
    role: 'Software Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built a real-time coaching and automation system for Doxy.me's telehealth platform, fine-tuning Llama models to extract structured, actionable insights from live conversation data over WebRTC sessions.
	      	\item Improved insight accuracy by designing an RL feedback loop over physician-validated outcomes, closing the gap between raw conversation signals and the actions clinicians took.
	      	\item Deployed and served the system on SageMaker and Fargate, standardizing CI/CD across the ML stack for zero-downtime releases.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['llm', 'ml', 'ai', 'python', 'inference', 'automation', 'real-time', 'api', 'deployed'],
  },

  // ── Flipturn (NYC/remote, EV fleet charging management software) ─────────────
  {
    slug: 'flipturn-fullstack-nyc',
    company: 'Flipturn',
    role: 'Software Engineer',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_L3HARRIS_DEFAULT, EXP_DOXYME_EXPANDED, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'dashboard', 'real-time', 'deployed'],
  },

  // ── Bilt Rewards (NYC, rewards/fintech, Series B-D range) ─────────────────────
  {
    slug: 'bilt-backend-nyc',
    company: 'Bilt Rewards',
    role: 'Backend Engineer',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['backend', 'api', 'integration', 'microservices', 'systems', 'python', 'deployed', 'fintech'],
  },

  // ── Slingshot AI (NYC/London, LLMs for mental healthcare) ─────────────────────
  {
    slug: 'slingshot-ai-eng-nyc',
    company: 'Slingshot AI',
    role: 'Software Engineer, AI/ML',
    skills: SKILLS_CANONICAL,
    experience: experienceSection([
      EXP_L3HARRIS_ML,
      String.raw`
	\item
	      \headerrow
	      {\textbf{Doxy.me}}
	      {\textbf{Charleston, SC}}
	      \headerrow
	      {\emph{Software Engineer}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built a real-time mental health inference system for Doxy.me's telehealth platform, fine-tuning Llama models to predict depression risk, anxiety, and mood indicators from tone, voice, and facial cues captured over live WebRTC sessions, served via SageMaker and Fargate.
	      	\item Improved prediction accuracy by applying RL feedback loops over structured clinical signals and physician-validated outcomes from live video consultations, directly modeling the nuances of patient psychological state.
	      	\item Shortened the gap between model output and clinician action by building TypeScript frontend components embedded within the video consultation interface, surfacing AI-generated insights directly at the point of care.
	      \end{itemize*}`,
      EXP_FUTURES_DEFAULT,
      EXP_HEXSTREAM_DEFAULT,
    ]),
    tags: ['llm', 'ml', 'ai', 'python', 'inference', 'mental-health', 'research', 'deployed'],
  },

  // ── Footprint (NYC/remote, identity verification/onboarding infra) ───────────
  {
    slug: 'footprint-backend-nyc',
    company: 'Footprint',
    role: 'Backend Engineer',
    skills: SKILLS.backend,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['backend', 'api', 'security', 'systems', 'integration', 'python', 'deployed', 'microservices'],
  },
];

// ─── City mapping ─────────────────────────────────────────────────────────────
// List non-NYC slugs here. Everything else defaults to 'nyc'.

const CITY_MAP = {
  tokyo:   ['cisco-ce-tokyo', 'applied-intuition-onboard-swe', 'synspective-swe-tokyo', 'sakana-rd-swe', 'sakana-product-swe', 'paypay-backend-eng', 'paypay-review-backend', 'jpmorgan-payments-swe-tokyo', 'bjak-applied-ai-tokyo', 'bjak-fullstack-tokyo', 'mercari-sre-tokyo', 'yodo-labs-eoi-tokyo', 'bloomtech-ai-fde-tokyo', 'treasure-ai-pe-tokyo'],
  austin:  ['pushnami-swe', 'quantiq-swe', 'glimmer-fullstack-austin', 'cloudflare-workers-swe', 'cloudflare-realtime-swe', 'neuralink-swe', 'snh-ai-swe', 'apptronik-motion-data', 'avride-sim-backend', 'sts-digital-front-office', 'apple-swe-austin', 'cisco-data-ml-austin', 'ibm-security-swe-austin', 'expedia-sde-austin', 'embedded-cpp-austin'],
  chicago: ['drw-risk-swe'],
  seattle: ['spacex-factory-swe-starlink'],
  sf:      ['luma-fde-sf'],
  remote:  ['alinia-ml-infra-remote', 'krepling-fullstack-remote', 'midpage-ai-eng-remote'],
  // doorlist-fullstack-nyc uses the default nyc bucket
};

function cityFor(slug) {
  for (const [city, slugs] of Object.entries(CITY_MAP)) {
    if (slugs.includes(slug)) return city;
  }
  return 'nyc';
}

// ─── Generate + compile ───────────────────────────────────────────────────────

console.log(`\nGenerating ${JOBS.length} LaTeX CVs...\n`);

const results = [];

for (const job of JOBS) {
  const city = cityFor(job.slug);
  const cityDir    = resolve(OUTPUT_DIR, city);
  const cityTexDir = resolve(TEX_DIR, city);
  await mkdir(cityDir,    { recursive: true });
  await mkdir(cityTexDir, { recursive: true });

  const projects = projectsSection(selectProjects(job.tags));
  const texFull = buildTex(job.skills, job.experience, projects, true);
  const texSandbox = buildTex(job.skills, job.experience, projects, false);

  // Save canonical .tex (lato) for user's local compile
  const texPath = resolve(cityTexDir, `${job.slug}.tex`);
  await writeFile(texPath, texFull, 'utf8');

  // Compile sandbox version
  const tmpTex = resolve(cityTexDir, `${job.slug}-sandbox.tex`);
  await writeFile(tmpTex, texSandbox, 'utf8');

  try {
    execSync(
      `pdflatex -interaction=nonstopmode -output-directory="${cityDir}" "${tmpTex}"`,
      { stdio: 'pipe' }
    );

    // Rename output to clean slug (pdflatex uses the tex filename)
    execSync(
      `mv "${cityDir}/${job.slug}-sandbox.pdf" "${cityDir}/${job.slug}.pdf" 2>/dev/null || true`
    );

    console.log(`✅  [${city}] ${job.company} — ${job.role}`);
    results.push({ ...job, city, status: 'ok' });
  } catch (err) {
    const log = err.stdout?.toString() || err.stderr?.toString() || err.message;
    console.error(`❌  ${job.company}: ${log.split('\n').filter(l => l.startsWith('!')).slice(0,2).join(' | ')}`);
    results.push({ ...job, city, status: 'error', error: log });
  }

  // Clean up aux files
  execSync(`rm -f "${cityDir}/${job.slug}-sandbox.aux" "${cityDir}/${job.slug}-sandbox.log" 2>/dev/null || true`);
}

const ok = results.filter(r => r.status === 'ok').length;
const failed = results.filter(r => r.status === 'error');
console.log(`\nDone: ${ok}/${JOBS.length} PDFs compiled.`);
if (failed.length) {
  console.log(`\nFailed (${failed.length}):`);
  failed.forEach(r => console.log(`  ${r.slug}: ${r.error?.split('\n').find(l => l.startsWith('!')) || 'unknown'}`));
}
console.log(`\n.tex source files → output/tex/{city}/`);
console.log(`PDFs → output/{city}/\n`);
