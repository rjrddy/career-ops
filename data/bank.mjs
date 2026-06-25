/**
 * data/bank.mjs — Project & Experience Bank
 *
 * HOW TO USE:
 *   - Add any project or experience you've built (or plan to build) here.
 *   - Set status: 'built'  → included in CV selection
 *   - Set status: 'idea'   → tracked but not yet included in CVs
 *   - When you finish building an idea, flip status to 'built' and re-run the generator.
 *
 * TAGS drive selection. The generator scores each item against a job's tags
 * and picks the top N. Add tags that match the skills/themes of the role.
 *
 * LATEX field is what gets printed on the CV. Keep it under ~3 lines when rendered.
 */

export const bank = {

  // ─── PROJECTS ──────────────────────────────────────────────────────────────
  // status: 'built' = on CV | 'idea' = build it, then flip to 'built'

  projects: [

    // ── Currently built ────────────────────────────────────────────────────

    {
      id: 'course-platform',
      title: 'University Course Planning/Review Platform',
      status: 'built',
      tags: ['fullstack', 'react', 'tailwind', 'python', 'etl', 'data', 'postgresql', 'dashboard', 'search', 'api'],
      latex: String.raw`\item \textbf{University Course Planning/Review Platform:} Built a multi-service data platform enabling student schedule matching, course overlap detection, and behavioral insights. Developed ETL pipelines in Python to process thousands of course records, user preferences, and time-series activity logs. Built a responsive frontend in React + Tailwind with interactive dashboards, heatmaps, and calendar visualizations.`,
    },

    {
      id: 'config-fuzzer',
      title: 'Configuration Fuzzer',
      status: 'built',
      tags: ['systems', 'testing', 'fuzzing', 'research', 'c++', 'oss', 'ci-cd', 'coverage'],
      latex: String.raw`\item \textbf{Configuration Fuzzer:} Developed a configuration fuzzing tool for OSS-Fuzz, automating build generation to identify critical compile-time configurations and improve code coverage, uncovering previously untested code paths and increasing bug detection effectiveness.`,
    },

    {
      id: 'ray-tracer',
      title: 'Ray Tracing Engine',
      status: 'built',
      tags: ['graphics', 'javascript', 'webgl', 'rendering', 'frontend', 'interactive'],
      latex: String.raw`\item \textbf{Ray Tracing Engine:} Created an interactive WebGL-based ray tracing engine in JavaScript, featuring realistic reflections, dynamic lighting, and customizable environment maps. Implemented shaders and user controls for rendering techniques, scene adjustments, and interactivity.`,
    },

    // ── Ideas — flip status to 'built' when done ───────────────────────────

    {
      id: 'rag-pipeline',
      title: 'RAG Pipeline',
      status: 'idea',
      tags: ['llm', 'rag', 'ai', 'python', 'ml', 'inference', 'search', 'vector-db', 'embeddings'],
      latex: String.raw`\item \textbf{RAG Pipeline:} Built a document Q\&A system from scratch---chunking, embedding with sentence-transformers, retrieval via Qdrant, and generation with an open-source LLM. Benchmarked retrieval quality across chunking strategies and reranking methods.`,
    },

    {
      id: 'llm-eval-harness',
      title: 'LLM Evaluation Harness',
      status: 'idea',
      tags: ['llm', 'ml', 'ai', 'python', 'evaluation', 'research', 'cli', 'inference'],
      latex: String.raw`\item \textbf{LLM Evaluation Harness:} CLI tool that runs prompt suites against multiple models (OpenAI, Anthropic, local), scores outputs with configurable metrics (BLEU, G-Eval, custom rubric), and diffs results across model versions to surface regressions.`,
    },

    {
      id: 'streaming-etl',
      title: 'Streaming ETL Pipeline',
      status: 'idea',
      tags: ['data', 'etl', 'pipeline', 'streaming', 'backend', 'postgresql', 'kafka', 'analytics'],
      latex: String.raw`\item \textbf{Streaming ETL Pipeline:} Built a real-time Kafka consumer pipeline with schema validation, dead-letter queuing, and a PostgreSQL/DuckDB sink. Supports configurable transformation stages and backpressure handling for high-throughput data streams.`,
    },

    {
      id: 'ts-api-gateway',
      title: 'TypeScript API Gateway',
      status: 'idea',
      tags: ['backend', 'api', 'typescript', 'node', 'systems', 'microservices', 'auth', 'ci-cd'],
      latex: String.raw`\item \textbf{TypeScript API Gateway:} Lightweight reverse proxy in Node.js/TypeScript with rate limiting, JWT auth middleware, per-route caching, and structured request logging. Deployed via Docker Compose with a Prometheus metrics endpoint.`,
    },

    {
      id: 'collab-whiteboard',
      title: 'Real-Time Collaborative Whiteboard',
      status: 'idea',
      tags: ['fullstack', 'react', 'node', 'typescript', 'real-time', 'websocket', 'redis', 'dashboard'],
      latex: String.raw`\item \textbf{Real-Time Collaborative Whiteboard:} WebSocket-based shared canvas (React + Node.js + Redis pub/sub) supporting concurrent drawing, presence indicators, and conflict-free shape merging. Scales to multiple rooms via a lightweight room-state protocol.`,
    },

    {
      id: 'k8s-operator',
      title: 'Kubernetes Operator',
      status: 'idea',
      tags: ['devops', 'kubernetes', 'systems', 'platform', 'backend', 'python', 'infrastructure'],
      latex: String.raw`\item \textbf{Kubernetes Operator:} Custom CRD and controller (Python/kopf) that manages the lifecycle of a multi-replica service---auto-scaling on custom metrics, rolling restarts on config changes, and health-check-gated promotion between environments.`,
    },

    {
      id: 'integration-framework',
      title: 'Customer Integration Framework',
      status: 'idea',
      tags: ['deployed', 'integration', 'api', 'node', 'python', 'fullstack', 'webhook', 'typescript'],
      latex: String.raw`\item \textbf{Customer Integration Framework:} Node.js/Python SDK that adapts third-party APIs (Salesforce, HubSpot) to a normalized internal schema, with webhook ingestion, retry logic, and an admin dashboard for mapping and monitoring integration health.`,
    },

    {
      id: 'ai-workflow-demo',
      title: 'AI Workflow Automation',
      status: 'idea',
      tags: ['llm', 'ai', 'deployed', 'integration', 'automation', 'fullstack', 'python', 'api'],
      latex: String.raw`\item \textbf{AI Workflow Automation:} End-to-end automation connecting Notion, an LLM summarizer, and Slack via a self-hosted orchestrator. Non-technical users configure triggers and actions through a React UI; the backend handles retries, logging, and multi-step branching.`,
    },

    {
      id: 'dbt-analytics',
      title: 'dbt + DuckDB Analytics Stack',
      status: 'idea',
      tags: ['data', 'etl', 'analytics', 'postgresql', 'dashboard', 'search', 'sql', 'dbt'],
      latex: String.raw`\item \textbf{dbt + DuckDB Analytics Stack:} Modeled a public dataset (NYC taxi) end-to-end---raw ingestion, staging, marts, and a Metabase dashboard. Enforced data contracts with dbt tests and automated freshness checks in a GitHub Actions CI pipeline.`,
    },

  ],

  // ─── EXPERIENCES ───────────────────────────────────────────────────────────
  // Extra experience entries beyond the 4 core jobs.
  // Same pattern: status 'built' = eligible for CV, 'idea' = placeholder.

  experiences: [
    // Add freelance work, open-source contributions, volunteer roles, etc. here.
    // Example:
    // {
    //   id: 'freelance-api',
    //   title: 'Freelance — API Integration Consultant',
    //   status: 'built',
    //   tags: ['integration', 'api', 'fullstack', 'deployed'],
    //   latex: String.raw`\item
    //     \headerrow{\textbf{Freelance}}{\textbf{Remote}}
    //     \headerrow{\emph{API Integration Consultant}}{\emph{Jan 2024 -- Apr 2024}}
    //     \begin{itemize*}
    //       \item Built and shipped X, Y, Z.
    //     \end{itemize*}`,
    // },
  ],

};

/**
 * selectProjects(jobTags, n = 3)
 * Returns the latex strings for the top-N projects from the bank
 * that best match the job's tags. Only 'built' projects are eligible.
 * Tie-break: preserve declaration order (most impactful first).
 */
export function selectProjects(jobTags, n = 3) {
  return bank.projects
    .filter(p => p.status === 'built')
    .map(p => ({
      ...p,
      score: p.tags.filter(t => jobTags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(p => p.latex);
}

/**
 * selectExperiences(jobTags, n = 2)
 * Returns the latex strings for top-N extra experiences from the bank.
 * Use this if you want to supplement the 4 core jobs with freelance/OSS/etc.
 */
export function selectExperiences(jobTags, n = 2) {
  return bank.experiences
    .filter(e => e.status === 'built')
    .map(e => ({
      ...e,
      score: e.tags.filter(t => jobTags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(e => e.latex);
}
