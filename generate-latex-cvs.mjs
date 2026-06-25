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

const SKILLS = {
  fde: skillsSection(
    'Python, TypeScript, C++, SQL, Java',
    'React, Node.js, AWS, SageMaker, Fargate, Docker, Podman, REST, Django, PostgreSQL, Linux'
  ),
  ml: skillsSection(
    'Python, C++, Java, TypeScript, SQL',
    'PyTorch, NumPy, Pandas, SageMaker, Fargate, AWS, Docker, scikit-learn, Linux, REST, Django'
  ),
  backend: skillsSection(
    'Python, C++, TypeScript, Java, SQL',
    'Node.js, Docker, Podman, REST, AWS, Azure, Linux, Django, MongoDB, CI/CD, Microservices'
  ),
  fullstack: skillsSection(
    'Python, TypeScript, Java, C++, SQL',
    'React, Next.js, Node.js, PostgreSQL, Prisma, Firebase, Tailwind, REST, AWS, Docker, Linux'
  ),
  data: skillsSection(
    'Python, SQL, TypeScript, Java, C++',
    'Pandas, NumPy, Azure SQL, Azure Data Lake, AWS, SageMaker, Docker, ETL, Django, Linux'
  ),
  systems: skillsSection(
    'Python, C++, TypeScript, Java, SQL, C\\#',
    'Node.js, AWS, Azure, Docker, Podman, .NET, REST, Django, MongoDB, Linux, CI/CD'
  ),
};

// ─── Experience blocks ────────────────────────────────────────────────────────

const EXP_L3HARRIS_DEFAULT = String.raw`
	\item
	      \headerrow
	      {\textbf{L3Harris Technologies}}
	      {\textbf{Greenville, TX}}
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
	      {\textbf{Greenville, TX}}
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
	      {\textbf{Greenville, TX}}
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
	      {\emph{Software Engineering Intern}}
	      {\emph{August 2024 -- May 2025}}
	      \begin{itemize*}
	      	\item Built transformer-based models with PyTorch and Llama, integrating WebRTC for real-time video streaming.
	      	\item Deployed inference pipelines on SageMaker \& Fargate, improving diagnostic accuracy with reinforcement learning.
	      	\item Authored and maintained YAML-based configuration files for CI/CD pipelines, cloud infrastructure, and application deployments, enabling reproducible environments and streamlined releases.
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
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
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
    experience: experienceSection([EXP_HEXSTREAM_DEFAULT, EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'api', 'data', 'dashboard', 'postgresql'],
  },
  {
    slug: 'perplexity-data-platform',
    company: 'Perplexity',
    role: 'SWE Data Platform',
    skills: SKILLS.data,
    experience: experienceSection([EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT, EXP_L3HARRIS_DEFAULT, EXP_DOXYME_DEFAULT]),
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
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['deployed', 'integration', 'api', 'python', 'systems', 'webhook'],
  },
  {
    slug: 'talos-swe-nyc',
    company: 'Talos',
    role: 'Software Engineer',
    skills: SKILLS.systems,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_HEXSTREAM_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
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
    experience: experienceSection([EXP_DOXYME_DEFAULT, EXP_L3HARRIS_DEFAULT, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['fullstack', 'react', 'python', 'data', 'dashboard', 'api', 'node', 'typescript'],
  },
  {
    slug: 'rogo-ml-eng',
    company: 'Rogo',
    role: 'AI/ML Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_DOXYME_DEFAULT, EXP_L3HARRIS_ML, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'llm', 'inference', 'api', 'data', 'etl'],
  },
  {
    slug: 'dataminr-swe-ml',
    company: 'Dataminr',
    role: 'ML/SWE',
    skills: SKILLS.data,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_HEXSTREAM_DEFAULT, EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['data', 'etl', 'pipeline', 'backend', 'python', 'api', 'systems', 'real-time'],
  },
  {
    slug: 'hebbia-ml-eng',
    company: 'Hebbia',
    role: 'ML Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_DOXYME_DEFAULT, EXP_FUTURES_DEFAULT, EXP_L3HARRIS_ML, EXP_HEXSTREAM_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'research', 'llm', 'inference', 'search'],
  },
  {
    slug: 'eliseai-ml-backend',
    company: 'EliseAI',
    role: 'ML/Backend Engineer',
    skills: SKILLS.ml,
    experience: experienceSection([EXP_DOXYME_DEFAULT, EXP_L3HARRIS_ML, EXP_FUTURES_DEFAULT, EXP_HEXSTREAM_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'llm', 'inference', 'react', 'fullstack', 'backend'],
  },
  {
    slug: 'domino-ml-eng',
    company: 'Domino Data Lab',
    role: 'ML/Platform Engineer',
    skills: SKILLS.data,
    experience: experienceSection([EXP_DOXYME_DEFAULT, EXP_L3HARRIS_BACKEND, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['ml', 'python', 'data', 'etl', 'api', 'systems', 'ci-cd', 'backend'],
  },
  {
    slug: 'superblocks-fde',
    company: 'Superblocks',
    role: 'FDE / SWE',
    skills: SKILLS.fde,
    experience: experienceSection([EXP_L3HARRIS_BACKEND, EXP_DOXYME_DEFAULT, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['fullstack', 'react', 'node', 'typescript', 'api', 'deployed', 'integration', 'webhook'],
  },
  {
    slug: 'maywood-swe-yc',
    company: 'Maywood',
    role: 'SWE/ML (YC)',
    skills: SKILLS.fullstack,
    experience: experienceSection([EXP_DOXYME_DEFAULT, EXP_L3HARRIS_ML, EXP_HEXSTREAM_DEFAULT, EXP_FUTURES_DEFAULT]),
    tags: ['ml', 'ai', 'python', 'fullstack', 'react', 'api', 'dashboard', 'data'],
  },
];

// ─── Generate + compile ───────────────────────────────────────────────────────

console.log(`\nGenerating ${JOBS.length} LaTeX CVs...\n`);

const results = [];

for (const job of JOBS) {
  const projects = projectsSection(selectProjects(job.tags));
  const texFull = buildTex(job.skills, job.experience, projects, true);
  const texSandbox = buildTex(job.skills, job.experience, projects, false);

  // Save canonical .tex (lato) for user's local compile
  const texPath = resolve(TEX_DIR, `${job.slug}.tex`);
  await writeFile(texPath, texFull, 'utf8');

  // Compile sandbox version
  const tmpTex = resolve(TEX_DIR, `${job.slug}-sandbox.tex`);
  await writeFile(tmpTex, texSandbox, 'utf8');

  try {
    execSync(
      `pdflatex -interaction=nonstopmode -output-directory="${OUTPUT_DIR}" "${tmpTex}"`,
      { stdio: 'pipe' }
    );

    // Rename output to clean slug (pdflatex uses the tex filename)
    execSync(
      `mv "${OUTPUT_DIR}/${job.slug}-sandbox.pdf" "${OUTPUT_DIR}/${job.slug}.pdf" 2>/dev/null || true`
    );

    console.log(`✅  ${job.company} — ${job.role}`);
    results.push({ ...job, status: 'ok' });
  } catch (err) {
    const log = err.stdout?.toString() || err.stderr?.toString() || err.message;
    console.error(`❌  ${job.company}: ${log.split('\n').filter(l => l.startsWith('!')).slice(0,2).join(' | ')}`);
    results.push({ ...job, status: 'error', error: log });
  }

  // Clean up aux files
  execSync(`rm -f "${OUTPUT_DIR}/${job.slug}-sandbox.aux" "${OUTPUT_DIR}/${job.slug}-sandbox.log" 2>/dev/null || true`);
}

// Clean up old HTML-based PDFs if they still exist (same names)
// (they've been overwritten by pdflatex output above)

const ok = results.filter(r => r.status === 'ok').length;
const failed = results.filter(r => r.status === 'error');
console.log(`\nDone: ${ok}/${JOBS.length} PDFs compiled.`);
if (failed.length) {
  console.log(`\nFailed (${failed.length}):`);
  failed.forEach(r => console.log(`  ${r.slug}: ${r.error?.split('\n').find(l => l.startsWith('!')) || 'unknown'}`));
}
console.log(`\n.tex source files → output/tex/`);
console.log(`PDFs → output/\n`);
