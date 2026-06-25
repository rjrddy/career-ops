# Raj Reddy

(352) 530-3397 · rajreddy23@outlook.com · github.com/rjrddy · linkedin.com/in/raj-reddy-1 · raj-reddy.com

---

## Education

**University of Utah** — Salt Lake City, UT
*B.S. Computer Science | August 2020 – May 2025*

**Relevant Coursework:** Computer Systems, Machine Learning, Computer Graphics, Algorithms, Software Practice I & II, Database Systems, Computer Networks, Foundations of Data Analysis, Models of Computation, Linear Algebra

---

## Skills

- **Languages:** Python, Java, C++, C#, SQL
- **Software:** PyTorch, Pandas, NumPy, React, Node.js, AWS, Azure, Docker, Git, REST, Django, MongoDB, Linux

---

## Experience

**L3Harris Technologies** — Greenville, TX
*Associate Software Engineer | June 2025 – Present*
- Developed signal processing modules in Python and C++ on embedded systems, collaborating with hardware teams to optimize performance and resource utilization.
- Built microservices for high-frequency data ingestion, processing, and storage, leveraging Podman and serverless functions.
- Automated CI/CD testing with pipelines, integrating static code analysis and integration testing.

**Doxy.me** — Charleston, SC
*Software Engineering Intern | August 2024 – May 2025*
- Built transformer-based models with PyTorch and Llama, integrating WebRTC for real-time video streaming.
- Deployed inference pipelines on SageMaker & Fargate, improving diagnostic accuracy with reinforcement learning.
- Authored and maintained YAML-based configuration files for CI/CD pipelines, cloud infrastructure, and application deployments, enabling reproducible environments and streamlined releases.

**University of Utah** — Salt Lake City, UT
*Undergraduate Research Assistant – FuTURES Lab | May 2024 – June 2025*
- Analyzed and optimized large-scale datasets, enhancing software configuration testing with tools like gcov and CMake, increasing code coverage by 30% on real-world APIs such as Libpng and PyTorch.
- Expanded OSS-Fuzz testing coverage, using compile-time options to improve the robustness of full-stack libraries.

**HEXstream** — Chicago, IL
*Software Engineering Intern | May 2022 – August 2022*
- Engineered backend ETL pipelines integrating data from 25+ enterprise sources into Azure SQL and Azure Data Lake.
- Developed automated workflows for ingestion, cleansing, and aggregation, supporting distributed analytics systems.

---

## Projects

### Current (on CV)

- **University Course Planning/Review Platform:** Built a multi-service data platform enabling student schedule matching, course overlap detection, and behavioral insights. Developed ETL pipelines in Python to process thousands of course records, user preferences, and time-series activity logs. Built a responsive frontend using React + Tailwind, including interactive dashboards, heatmaps, calendar visualizations, and search interfaces.
- **Configuration Fuzzer:** Developed a configuration fuzzing tool for OSS-Fuzz, automating build generation to identify critical compile-time configurations and improve code coverage.
- **Ray Tracing Engine:** Created an interactive WebGL-based ray tracing engine in JavaScript, featuring realistic reflections, dynamic lighting, and customizable environment maps. Implemented shaders and user controls for rendering techniques, scene adjustments, and interactivity.

---

### Project Ideas by Role

#### SWE / Full-Stack
- **TypeScript API Gateway** — Build a lightweight reverse proxy in TypeScript/Node.js with rate limiting, auth middleware, and request logging. Shows backend systems thinking and TypeScript depth. Relevant to: Harvey, GPTZero, Breeze, Cassidy.
- **Real-Time Collaborative Whiteboard** — WebSocket-based shared canvas (React + Node.js + Redis pub/sub) with conflict resolution and presence indicators. Shows you can ship full-stack features with real-time constraints. Relevant to: Airtable, Julius AI, Continue.

#### ML / AI Engineer
- **RAG Pipeline from Scratch** — Build a document Q&A system without a framework: chunk PDFs, embed with a local model (e.g. sentence-transformers), store in a vector DB (Chroma or Qdrant), retrieve and rerank, generate with an LLM. Shows you understand the internals, not just `LangChain.from_docs()`. Relevant to: Centralize, Ema, Reflexivity, Brain Co., US Mobile, Cassidy.
- **LLM Evaluation Harness** — A CLI tool that runs a suite of prompts against multiple models (OpenAI, Anthropic, local), scores outputs with configurable metrics (BLEU, G-Eval, custom rubric), and diffs results across versions. Shows ML rigor and eval thinking. Relevant to: Centralize, Ema, Quora, Fastino AI.

#### Data Engineering
- **Streaming ETL Pipeline** — Kafka → Faust/Flink consumer → Postgres/DuckDB sink with schema validation and dead-letter queuing. Extend the HEXstream story with modern streaming. Relevant to: Perplexity, Samsara, DataKind, Evio.
- **dbt + DuckDB Analytics Stack** — Model a public dataset (e.g. NYC taxi or GitHub archive) end-to-end: raw ingestion → staging → marts → dashboard. Shows modern data stack fluency. Relevant to: dbt Labs, Tinybird, Hightouch.

#### DevOps / Platform / SRE
- **Kubernetes Operator** — Write a custom CRD + controller in Python (kopf) or Go that manages lifecycle of a simple app (e.g. auto-scales based on a custom metric). Shows platform engineering depth. Relevant to: TensorWave, Peec AI, Rula.
- **Internal Developer Platform (IDP) CLI** — A CLI tool that scaffolds, deploys, and monitors services on a local k3s cluster. Think: `myplatform deploy --env staging`. Shows DevEx and tooling instincts. Relevant to: n8n, Zapier DevOps.

#### Forward Deployed Engineer
- **Customer Integration Framework** — A Node.js/Python SDK skeleton that adapts an API (e.g. Salesforce or HubSpot) to a standardized internal schema, with webhook handling, retry logic, and an admin dashboard. Shows the customer-facing integration work FDE roles actually do. Relevant to: OpenAI FDE, LangChain Deployed, Northslope, Firecrawl, OpenRouter.
- **AI Workflow Automation Demo** — Connect 3 tools (e.g. Notion → LLM summarizer → Slack notifier) via a self-hosted n8n or custom orchestrator. Build a polished demo with a README targeted at non-technical users. Relevant to: Sierra, Decagon, Clera, Ascertain.