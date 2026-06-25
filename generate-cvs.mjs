#!/usr/bin/env node
/**
 * generate-cvs.mjs
 * Generates 17 tailored CV PDFs for Raj Reddy — NYC startup job applications.
 */

import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = resolve(__dirname, 'templates/cv-template.html');
const OUTPUT_DIR = resolve(__dirname, 'output');

await mkdir(OUTPUT_DIR, { recursive: true });

// ─── Base contact info ───────────────────────────────────────────────────────
const BASE = {
  NAME: 'Raj Reddy',
  EMAIL: 'shrirajreddy20@gmail.com',
  PHONE: '(352) 530-3397',
  LINKEDIN_URL: 'https://linkedin.com/in/raj-reddy-1',
  LINKEDIN_DISPLAY: 'linkedin.com/in/raj-reddy-1',
  PORTFOLIO_URL: 'https://raj-reddy.com',
  PORTFOLIO_DISPLAY: 'raj-reddy.com',
  LANG: 'en',
  PAGE_WIDTH: '800px',
  SECTION_SUMMARY: 'Professional Summary',
  SECTION_COMPETENCIES: 'Core Competencies',
  SECTION_EXPERIENCE: 'Experience',
  SECTION_PROJECTS: 'Projects',
  SECTION_EDUCATION: 'Education',
  SECTION_CERTIFICATIONS: '',
  SECTION_SKILLS: 'Technical Skills',
};

// ─── Reusable experience blocks ──────────────────────────────────────────────

const EXP_L3HARRIS = `
<div class="job avoid-break">
  <div class="job-header">
    <div>
      <span class="job-company">L3Harris Technologies</span>
      <span class="job-location"> — Greenville, TX</span>
    </div>
    <span class="job-period">June 2025 – Present</span>
  </div>
  <div class="job-role">Associate Software Engineer</div>
  <ul>
    <li>Developed <strong>signal processing modules in Python and C++</strong> on embedded systems, collaborating with hardware teams to optimize performance and resource utilization.</li>
    <li>Built <strong>microservices for high-frequency data ingestion, processing, and storage</strong>, leveraging Podman and serverless functions.</li>
    <li>Automated <strong>CI/CD testing pipelines</strong>, integrating static code analysis and integration testing.</li>
  </ul>
</div>`;

const EXP_L3HARRIS_SYSTEMS_FIRST = `
<div class="job avoid-break">
  <div class="job-header">
    <div>
      <span class="job-company">L3Harris Technologies</span>
      <span class="job-location"> — Greenville, TX</span>
    </div>
    <span class="job-period">June 2025 – Present</span>
  </div>
  <div class="job-role">Associate Software Engineer</div>
  <ul>
    <li>Built <strong>containerized microservices for high-frequency data ingestion and processing</strong> using Podman and serverless architecture, handling real-time defense sensor streams.</li>
    <li>Developed <strong>signal processing algorithms in Python and C++</strong> on embedded systems, working directly with hardware teams to meet strict latency and resource constraints.</li>
    <li>Automated <strong>CI/CD pipelines with static code analysis and integration testing</strong>, reducing deployment friction across teams.</li>
  </ul>
</div>`;

const EXP_DOXYME = `
<div class="job avoid-break">
  <div class="job-header">
    <div>
      <span class="job-company">Doxy.me</span>
      <span class="job-location"> — Charleston, SC</span>
    </div>
    <span class="job-period">Aug 2024 – May 2025</span>
  </div>
  <div class="job-role">Software Engineering Intern</div>
  <ul>
    <li>Built <strong>transformer-based models with PyTorch and Llama</strong>, integrating WebRTC for real-time video streaming in a production telehealth environment.</li>
    <li>Deployed <strong>ML inference pipelines on SageMaker and Fargate</strong>, improving diagnostic accuracy using reinforcement learning.</li>
  </ul>
</div>`;

const EXP_DOXYME_ML_FIRST = `
<div class="job avoid-break">
  <div class="job-header">
    <div>
      <span class="job-company">Doxy.me</span>
      <span class="job-location"> — Charleston, SC</span>
    </div>
    <span class="job-period">Aug 2024 – May 2025</span>
  </div>
  <div class="job-role">Software Engineering Intern</div>
  <ul>
    <li>Trained and fine-tuned <strong>transformer-based LLMs (PyTorch, Llama)</strong> for medical diagnostics, integrated with WebRTC real-time video for live inference.</li>
    <li>Built and deployed <strong>end-to-end ML inference pipelines on AWS SageMaker and Fargate</strong>, applying reinforcement learning to improve model accuracy in production.</li>
  </ul>
</div>`;

const EXP_FUTURES_LAB = `
<div class="job avoid-break">
  <div class="job-header">
    <div>
      <span class="job-company">University of Utah</span>
      <span class="job-location"> — Salt Lake City, UT</span>
    </div>
    <span class="job-period">May 2024 – June 2025</span>
  </div>
  <div class="job-role">Undergraduate Research Assistant — FuTURES Lab</div>
  <ul>
    <li>Analyzed and optimized <strong>large-scale datasets</strong>, enhancing software configuration testing with gcov and CMake, <strong>increasing code coverage by 30%</strong> on real-world APIs (Libpng, PyTorch).</li>
    <li>Expanded <strong>OSS-Fuzz testing coverage</strong> using compile-time options to improve robustness of full-stack libraries.</li>
  </ul>
</div>`;

const EXP_HEXSTREAM = `
<div class="job avoid-break">
  <div class="job-header">
    <div>
      <span class="job-company">HEXstream</span>
      <span class="job-location"> — Chicago, IL</span>
    </div>
    <span class="job-period">May 2022 – Aug 2022</span>
  </div>
  <div class="job-role">Software Engineering Intern</div>
  <ul>
    <li>Engineered <strong>backend ETL pipelines integrating data from 25+ enterprise sources</strong> into Azure SQL and Azure Data Lake.</li>
    <li>Developed automated workflows for ingestion, cleansing, and aggregation, supporting distributed analytics systems.</li>
  </ul>
</div>`;

// ─── Reusable project blocks ─────────────────────────────────────────────────

const PROJ_COURSE_PLATFORM = `
<div class="project avoid-break">
  <div><span class="project-title">University Course Planning & Review Platform</span></div>
  <div class="project-desc">Multi-service data platform for student schedule matching, course overlap detection, and behavioral insights. ETL pipelines in Python processing thousands of course records and time-series activity logs.</div>
  <div class="project-tech">Python · React · Tailwind · ETL · Heatmaps · Calendar Visualizations</div>
</div>`;

const PROJ_ACCOUNTABILITY = `
<div class="project avoid-break">
  <div><span class="project-title">Accountability Tracker</span></div>
  <div class="project-desc">Full-stack app with Next.js and TypeScript for managing daily goals and recurring tasks. Firebase Auth, localStorage guest mode, and PostgreSQL with Prisma for persistence. Progress visualizations and social accountability features.</div>
  <div class="project-tech">Next.js · TypeScript · PostgreSQL · Prisma · Firebase Auth · React</div>
</div>`;

const PROJ_RAYTRACER = `
<div class="project avoid-break">
  <div><span class="project-title">WebGL Ray Tracing Engine</span></div>
  <div class="project-desc">Interactive WebGL-based ray tracing engine in JavaScript with realistic reflections, dynamic lighting, and customizable environment maps. Custom shaders and user controls for rendering techniques and scene adjustments.</div>
  <div class="project-tech">JavaScript · WebGL · GLSL Shaders · Ray Tracing · 3D Graphics</div>
</div>`;

const EDUCATION_HTML = `
<div class="edu-item">
  <div class="edu-header">
    <div>
      <span class="edu-title">B.S. Computer Science</span>
      <span> — </span>
      <span class="edu-org">University of Utah</span>
    </div>
    <span class="edu-year">Aug 2020 – May 2025</span>
  </div>
  <div class="edu-desc">Relevant: Machine Learning, Computer Systems, Algorithms, Database Systems, Computer Networks, Software Practice I &amp; II, Computer Graphics, Foundations of Data Analysis, Linear Algebra</div>
</div>`;

const SKILLS_HTML = `
<div class="skills-grid">
  <span class="skill-item"><span class="skill-category">Languages:</span> Python, C++, TypeScript, Java, SQL</span>
  <span class="skill-item"><span class="skill-category">ML/AI:</span> PyTorch, Transformers, SageMaker, Fargate, Reinforcement Learning, NumPy, Pandas</span>
  <span class="skill-item"><span class="skill-category">Backend:</span> Node.js, Django, REST APIs, Microservices, Podman, Docker, Linux</span>
  <span class="skill-item"><span class="skill-category">Frontend:</span> React, Next.js, Tailwind, TypeScript</span>
  <span class="skill-item"><span class="skill-category">Data:</span> PostgreSQL, MongoDB, Azure SQL, Azure Data Lake, ETL Pipelines</span>
  <span class="skill-item"><span class="skill-category">Cloud:</span> AWS, Azure</span>
  <span class="skill-item"><span class="skill-category">Tools:</span> Git, CI/CD, gcov, CMake, OSS-Fuzz, WebRTC, WebGL</span>
</div>`;

function makeTags(tags) {
  return tags.map(t => `<span class="competency-tag">${t}</span>`).join('\n      ');
}

// ─── Job definitions ─────────────────────────────────────────────────────────

const JOBS = [
  // ── APPLY NOW ────────────────────────────────────────────────────────────

  {
    slug: 'openai-fde-nyc',
    company: 'OpenAI',
    role: 'Forward Deployed Software Engineer',
    location: 'New York, NY',
    summary: 'Software engineer with production experience deploying ML systems and delivering technical solutions to end users. At Doxy.me, built transformer-based LLMs (PyTorch, Llama) and deployed inference pipelines on SageMaker and Fargate in a live healthcare environment. At L3Harris, shipped high-frequency microservices and automated CI/CD for defense systems. Comfortable moving from ambiguous customer requirements to working software quickly — the core of the Forward Deployed Engineer role.',
    competencies: ['Python', 'ML Deployment', 'SageMaker', 'Fargate', 'PyTorch', 'LLMs', 'Microservices', 'REST APIs', 'WebRTC', 'CI/CD', 'AWS', 'Fast Prototyping'],
    experience: EXP_DOXYME_ML_FIRST + EXP_L3HARRIS + EXP_HEXSTREAM + EXP_FUTURES_LAB,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'mistral-backend-nyc',
    company: 'Mistral AI',
    role: 'Software Engineer, Backend',
    location: 'New York, NY',
    summary: 'Systems-oriented backend engineer with experience building high-frequency microservices, signal processing pipelines, and ML-integrated backend systems. At L3Harris, developed C++ and Python modules on embedded systems and built containerized microservices using Podman. At Doxy.me, integrated transformer-based inference with real-time WebRTC infrastructure. Brings low-level systems thinking to backend architecture and is excited to work on core AI infrastructure.',
    competencies: ['Python', 'C++', 'Microservices', 'REST APIs', 'Podman', 'Docker', 'CI/CD', 'Linux', 'Embedded Systems', 'Node.js', 'AWS', 'High-Frequency Data'],
    experience: EXP_L3HARRIS_SYSTEMS_FIRST + EXP_DOXYME + EXP_HEXSTREAM + EXP_FUTURES_LAB,
    projects: PROJ_ACCOUNTABILITY + PROJ_COURSE_PLATFORM + PROJ_RAYTRACER,
  },

  {
    slug: 'modal-fde-ml',
    company: 'Modal',
    role: 'Forward Deployed Engineer — ML',
    location: 'New York, NY',
    summary: 'ML engineer with end-to-end deployment experience who thrives in fast-moving, customer-facing environments. Deployed transformer and LLM inference pipelines on SageMaker and Fargate with reinforcement learning at Doxy.me. Built high-frequency data microservices and signal processing pipelines in Python and C++ at L3Harris. Experienced bridging ML systems and production infrastructure — the exact profile Modal\'s FDE-ML role requires.',
    competencies: ['Python', 'PyTorch', 'LLMs', 'SageMaker', 'Fargate', 'ML Deployment', 'AWS', 'Inference Pipelines', 'Reinforcement Learning', 'Microservices', 'Docker', 'Fast Prototyping'],
    experience: EXP_DOXYME_ML_FIRST + EXP_L3HARRIS + EXP_FUTURES_LAB + EXP_HEXSTREAM,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'harvey-swe-new-grad',
    company: 'Harvey',
    role: 'Software Engineer, New Grad',
    location: 'New York, NY',
    summary: 'Full-stack software engineer with production experience across ML, backend, and frontend systems. At Doxy.me, built LLM-powered telehealth features integrating PyTorch models with WebRTC infrastructure. At L3Harris, shipped production microservices and automated deployment pipelines. Independently built full-stack products including a React + Python course platform and a Next.js + PostgreSQL tracker with social features. Ready to contribute from day one at a fast-moving AI company.',
    competencies: ['Python', 'TypeScript', 'React', 'Node.js', 'Next.js', 'PostgreSQL', 'REST APIs', 'LLMs', 'PyTorch', 'AWS', 'Full-Stack', 'CI/CD'],
    experience: EXP_DOXYME + EXP_L3HARRIS + EXP_HEXSTREAM + EXP_FUTURES_LAB,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'airtable-swe-new-grad',
    company: 'Airtable',
    role: 'Software Engineer, New Grad (2026)',
    location: 'New York, NY (Hybrid)',
    summary: 'Full-stack engineer with production experience building data-driven applications, backend APIs, and user-facing interfaces. Built ETL pipelines integrating 25+ enterprise data sources at HEXstream. Developed full-stack course platform with Python ETL, React dashboards, and interactive visualizations. At Doxy.me, shipped ML-powered features in a live production environment. Strong foundation across backend, frontend, and data layers — eager to build at scale.',
    competencies: ['TypeScript', 'React', 'Python', 'Node.js', 'PostgreSQL', 'REST APIs', 'ETL Pipelines', 'Azure', 'AWS', 'Full-Stack', 'Data Modeling', 'CI/CD'],
    experience: EXP_HEXSTREAM + EXP_DOXYME + EXP_L3HARRIS + EXP_FUTURES_LAB,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'perplexity-data-platform',
    company: 'Perplexity',
    role: 'Software Engineer — Data Platform',
    location: 'New York, NY / Seattle / SF',
    summary: 'Data platform engineer with experience building scalable ETL pipelines, ML data infrastructure, and large-scale data processing systems. At HEXstream, designed and built pipelines integrating 25+ enterprise sources into Azure SQL and Data Lake. At the FuTURES Lab, analyzed and optimized large-scale datasets to improve software testing coverage by 30%. Deployed ML inference pipelines on SageMaker and Fargate at Doxy.me — understands data all the way through to model serving.',
    competencies: ['Python', 'SQL', 'ETL Pipelines', 'Azure SQL', 'Azure Data Lake', 'AWS', 'SageMaker', 'Pandas', 'NumPy', 'Data Engineering', 'Distributed Systems', 'CI/CD'],
    experience: EXP_HEXSTREAM + EXP_FUTURES_LAB + EXP_DOXYME + EXP_L3HARRIS,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  // ── STRONG CONTENDERS ────────────────────────────────────────────────────

  {
    slug: 'gptzero-fullstack-nyc',
    company: 'GPTZero',
    role: 'Fullstack Engineer',
    location: 'New York, NY',
    summary: 'Full-stack engineer with hands-on experience building ML-powered applications and production web systems. At Doxy.me, integrated transformer-based LLMs with WebRTC in a live healthtech product. Built a multi-service course platform with React + Tailwind dashboards, Python ETL, and behavioral analytics. At L3Harris, shipped backend microservices and automated CI/CD pipelines. Excited to work on AI detection technology at an NYC startup with real-world impact.',
    competencies: ['React', 'TypeScript', 'Python', 'Node.js', 'REST APIs', 'LLMs', 'PyTorch', 'PostgreSQL', 'Full-Stack', 'AWS', 'CI/CD', 'Data Pipelines'],
    experience: EXP_DOXYME + EXP_L3HARRIS + EXP_HEXSTREAM + EXP_FUTURES_LAB,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'centralize-applied-ai',
    company: 'Centralize',
    role: 'Software Engineer (Applied AI)',
    location: 'New York, NY / SF',
    summary: 'Applied AI engineer with production experience across the ML stack — from model training to deployment to full-stack integration. Built transformer-based LLMs with PyTorch and Llama, deployed inference pipelines with RL on SageMaker and Fargate, and shipped full-stack data products. At L3Harris, built containerized microservices and automated testing pipelines. Interested in multi-agent systems and bringing AI into enterprise workflows.',
    competencies: ['Python', 'PyTorch', 'LLMs', 'Multi-Agent Systems', 'SageMaker', 'Fargate', 'REST APIs', 'Microservices', 'AWS', 'TypeScript', 'React', 'Reinforcement Learning'],
    experience: EXP_DOXYME_ML_FIRST + EXP_L3HARRIS + EXP_HEXSTREAM + EXP_FUTURES_LAB,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'brainco-early-career-ai',
    company: 'Brain Co.',
    role: 'Early Career AI/ML Engineer',
    location: 'New York, NY',
    summary: 'Machine learning engineer with hands-on production experience training, fine-tuning, and deploying AI models. At Doxy.me, developed transformer-based models (PyTorch, Llama) integrated with real-time WebRTC infrastructure, and deployed inference pipelines on SageMaker and Fargate using reinforcement learning. Signal processing background in Python and C++ at L3Harris. Strong research foundation from FuTURES Lab — 30% code coverage improvement on PyTorch and Libpng OSS APIs.',
    competencies: ['Python', 'PyTorch', 'Transformers', 'LLMs', 'Reinforcement Learning', 'SageMaker', 'Fargate', 'Signal Processing', 'C++', 'NumPy', 'Pandas', 'AWS'],
    experience: EXP_DOXYME_ML_FIRST + EXP_L3HARRIS + EXP_FUTURES_LAB + EXP_HEXSTREAM,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'julius-ai-new-grad',
    company: 'Julius AI',
    role: 'Software Engineer — Product, New Grad',
    location: 'New York, NY',
    summary: 'Product-minded software engineer with experience building full-stack applications and ML-powered features across multiple production environments. Built transformer-based ML features integrated into a live telehealth product at Doxy.me. Designed and shipped a full-stack course planning platform with Python ETL, React dashboards, and heatmap visualizations. At L3Harris, automated deployment pipelines and built backend microservices. Excited by the challenge of turning AI capabilities into polished user-facing products.',
    competencies: ['Python', 'TypeScript', 'React', 'Node.js', 'Next.js', 'PostgreSQL', 'REST APIs', 'LLMs', 'PyTorch', 'Full-Stack', 'AWS', 'ETL Pipelines'],
    experience: EXP_DOXYME + EXP_L3HARRIS + EXP_HEXSTREAM + EXP_FUTURES_LAB,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'reflexivity-ml-nyc',
    company: 'Reflexivity',
    role: 'Machine Learning & AI Engineer',
    location: 'New York, NY',
    summary: 'Machine learning engineer with production experience building, training, and deploying models in latency-sensitive environments. Built transformer-based models with PyTorch and Llama at Doxy.me, deployed with reinforcement learning on SageMaker and Fargate. At L3Harris, developed signal processing pipelines in Python and C++ handling real-time sensor data streams. Strong background in both ML modeling and the data infrastructure that supports it.',
    competencies: ['Python', 'PyTorch', 'Transformers', 'Reinforcement Learning', 'SageMaker', 'Fargate', 'Signal Processing', 'C++', 'ETL Pipelines', 'SQL', 'NumPy', 'Pandas'],
    experience: EXP_DOXYME_ML_FIRST + EXP_L3HARRIS_SYSTEMS_FIRST + EXP_HEXSTREAM + EXP_FUTURES_LAB,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'ema-ml-swe',
    company: 'Ema',
    role: 'Software Engineer, Machine Learning',
    location: 'New York, NY',
    summary: 'Software engineer specializing in ML systems and production AI integration. At Doxy.me, trained transformer-based models (PyTorch, Llama), integrated them with WebRTC real-time infrastructure, and deployed inference pipelines on SageMaker and Fargate. At L3Harris, built containerized microservices for high-frequency data processing. Comfortable owning the full lifecycle from model training through production deployment — the right profile for an enterprise AI platform.',
    competencies: ['Python', 'PyTorch', 'LLMs', 'SageMaker', 'Fargate', 'ML Deployment', 'Microservices', 'REST APIs', 'AWS', 'Reinforcement Learning', 'Node.js', 'CI/CD'],
    experience: EXP_DOXYME_ML_FIRST + EXP_L3HARRIS + EXP_HEXSTREAM + EXP_FUTURES_LAB,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'continue-swe-new-grad',
    company: 'Continue',
    role: 'Software Engineer, New Grad',
    location: 'New York, NY',
    summary: 'Software engineer who builds with AI tools and understands the infrastructure behind them. Built transformer-based LLM features at Doxy.me (PyTorch, Llama + WebRTC), shipped production ML inference pipelines, and built full-stack web applications from scratch. Strong interest in developer tooling and the future of AI-assisted coding — Continue\'s mission resonates personally with how I approach building software.',
    competencies: ['Python', 'TypeScript', 'LLMs', 'PyTorch', 'React', 'Node.js', 'REST APIs', 'Full-Stack', 'AWS', 'CI/CD', 'Developer Tools', 'PostgreSQL'],
    experience: EXP_DOXYME + EXP_L3HARRIS + EXP_HEXSTREAM + EXP_FUTURES_LAB,
    projects: PROJ_ACCOUNTABILITY + PROJ_COURSE_PLATFORM + PROJ_RAYTRACER,
  },

  {
    slug: 'northslope-fde-new-grad',
    company: 'Northslope Technologies',
    role: 'Forward Deployed Software Engineer, New Grad',
    location: 'New York, NY (Hybrid)',
    summary: 'Software engineer with a defense background and strong ML deployment experience — an unusual combination for a new grad. At L3Harris, built signal processing systems and high-frequency microservices for defense applications. At Doxy.me, deployed ML inference pipelines on SageMaker and Fargate in a live production environment. Comfortable with ambiguity, fast-moving requirements, and shipping systems that matter — core to the Forward Deployed role.',
    competencies: ['Python', 'C++', 'ML Deployment', 'Microservices', 'SageMaker', 'CI/CD', 'REST APIs', 'AWS', 'Signal Processing', 'Podman', 'Linux', 'Fast Prototyping'],
    experience: EXP_L3HARRIS_SYSTEMS_FIRST + EXP_DOXYME + EXP_FUTURES_LAB + EXP_HEXSTREAM,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'talos-swe-nyc',
    company: 'Talos',
    role: 'Software Engineer',
    location: 'New York, NY',
    summary: 'Systems-focused software engineer with experience building high-frequency data infrastructure and low-latency processing pipelines. At L3Harris, developed real-time signal processing in C++ and Python on embedded systems, and built microservices handling high-frequency defense data streams. At HEXstream, designed backend ETL pipelines integrating 25+ enterprise data sources. Strong foundation in performance-critical systems engineering — the right profile for trading infrastructure.',
    competencies: ['Python', 'C++', 'Microservices', 'High-Frequency Data', 'ETL Pipelines', 'SQL', 'Linux', 'REST APIs', 'CI/CD', 'Podman', 'Docker', 'Azure SQL'],
    experience: EXP_L3HARRIS_SYSTEMS_FIRST + EXP_HEXSTREAM + EXP_DOXYME + EXP_FUTURES_LAB,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },

  {
    slug: 'breeze-fullstack-nyc',
    company: 'Breeze',
    role: 'Fullstack Software Engineer',
    location: 'New York, NY (Hybrid)',
    summary: 'Full-stack engineer with experience across React frontends, Node.js backends, and production data pipelines. Built a multi-service course platform with React + Tailwind, a full-stack accountability tracker with Next.js + TypeScript + PostgreSQL, and ML-powered features at Doxy.me. At L3Harris, shipped backend microservices and automated CI/CD pipelines. Eager to be one of the first NYC engineers at a high-growth fintech startup and own the stack end-to-end.',
    competencies: ['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Prisma', 'REST APIs', 'Python', 'Full-Stack', 'CI/CD', 'Firebase', 'AWS'],
    experience: EXP_DOXYME + EXP_L3HARRIS + EXP_HEXSTREAM + EXP_FUTURES_LAB,
    projects: PROJ_ACCOUNTABILITY + PROJ_COURSE_PLATFORM + PROJ_RAYTRACER,
  },

  {
    slug: 'usmobile-ml-nyc',
    company: 'US Mobile',
    role: 'AI/ML Engineer',
    location: 'New York, NY',
    summary: 'Machine learning engineer with production experience across model development, training, and deployment. At Doxy.me, built transformer-based models (PyTorch, Llama) integrated with real-time WebRTC for live inference, and deployed on SageMaker and Fargate with reinforcement learning fine-tuning. Developed signal processing algorithms in Python and C++ at L3Harris. Strong ML engineering background applicable to next-generation user experiences.',
    competencies: ['Python', 'PyTorch', 'Transformers', 'LLMs', 'SageMaker', 'Fargate', 'Reinforcement Learning', 'Signal Processing', 'C++', 'NumPy', 'AWS', 'REST APIs'],
    experience: EXP_DOXYME_ML_FIRST + EXP_L3HARRIS + EXP_FUTURES_LAB + EXP_HEXSTREAM,
    projects: PROJ_COURSE_PLATFORM + PROJ_ACCOUNTABILITY + PROJ_RAYTRACER,
  },
];

// ─── Template fill ────────────────────────────────────────────────────────────

function fillTemplate(template, job) {
  const vars = {
    ...BASE,
    LOCATION: job.location,
    SUMMARY_TEXT: job.summary,
    COMPETENCIES: makeTags(job.competencies),
    EXPERIENCE: job.experience,
    PROJECTS: job.projects,
    EDUCATION: EDUCATION_HTML,
    CERTIFICATIONS: '',
    SKILLS: SKILLS_HTML,
  };

  let html = template;
  for (const [key, value] of Object.entries(vars)) {
    html = html.replaceAll(`{{${key}}}`, value ?? '');
  }
  // Remove certifications section if empty
  html = html.replace(/<div class="section avoid-break">\s*<div class="section-title"><\/div>\s*\s*<\/div>/g, '');
  return html;
}

// ─── PDF generation ───────────────────────────────────────────────────────────

async function generatePDF(html, outputPath, templatePath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Use file:// base URL so relative font paths resolve
  const baseURL = `file://${resolve(dirname(templatePath))}/`;
  await page.setContent(html, { waitUntil: 'networkidle', baseURL });

  await page.pdf({
    path: outputPath,
    format: 'Letter',
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
    printBackground: true,
  });

  await browser.close();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const template = await readFile(TEMPLATE_PATH, 'utf8');

console.log(`\nGenerating ${JOBS.length} tailored CVs...\n`);

const results = [];
for (const job of JOBS) {
  const html = fillTemplate(template, job);
  const htmlPath = resolve(OUTPUT_DIR, `${job.slug}.html`);
  const pdfPath = resolve(OUTPUT_DIR, `${job.slug}.pdf`);

  await writeFile(htmlPath, html, 'utf8');

  try {
    await generatePDF(html, pdfPath, TEMPLATE_PATH);
    console.log(`✅ ${job.company} — ${job.role}`);
    results.push({ ...job, status: 'ok', pdf: pdfPath });
  } catch (err) {
    console.error(`❌ ${job.company}: ${err.message}`);
    results.push({ ...job, status: 'error', error: err.message });
  }
}

const ok = results.filter(r => r.status === 'ok').length;
console.log(`\nDone: ${ok}/${JOBS.length} PDFs generated → output/\n`);
results.filter(r => r.status === 'ok').forEach(r => {
  console.log(`  ${r.slug}.pdf`);
});
