\documentclass[11pt,letterpaper]{article}
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
\setlength{\tabcolsep}{0em}

% indentsection style, used for sections that aren't already in lists
% that need indentation to the level of all text in the document
\newenvironment{indentsection}[1]%
{\begin{list}{}%
{\setlength{\leftmargin}{#1}}%
     \item[]
}
{\end{list}}

% opposite of above; bump a section back toward the left margin
\newenvironment{unindentsection}[1]%
{\begin{list}{}%
{\setlength{\leftmargin}{-0.5#1}}%
\item[]%
}
{\end{list}}

% format two pieces of text, one left aligned and one right aligned
\newcommand{\headerrow}[2]
{\begin{tabular*}{\linewidth}{l@{\extracolsep{\fill}}r}
#1 &
#2 \\
\end{tabular*}}

% make "C++" look pretty when used in text by touching up the plus signs
\newcommand{\CPP}
{C\nolinebreak[4]\hspace{-.05em}\raisebox{.22ex}{\footnotesize\bf ++}}

% and the actual content starts here
\begin{document}

\begin{center}
    {\LARGE \textbf{Raj Reddy}}\\
    \vspace{0.05cm}
    \raisebox{-0.2\height} \ \  (352) 530-3397 
    \hfill\raisebox{-0.2\height} \ \ rajreddy23@outlook.com
    \hfill \raisebox{-0.2\height}  \ \ github.com/rjrddy
    \hfill \raisebox{-0.2\height}  \ \ linkedin.com/in/raj-reddy-1
     \hfill \raisebox{-0.2\height}  \ \ raj-reddy.com
\end{center}

\hrule
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

\hrule
\vspace{-1em}
\subsection*{\Large Skills}

\hyphenpenalty=1000
\begin{itemize}[leftmargin=1em]
    \parskip=0.1em
    \item \textbf{Languages:}
          Python, Java, C++, TypeScript, SQL
    \item \textbf{Software:}
        Pandas, NumPy, React, Node.js, AWS, Azure, Docker, Next.js, REST, Django, MongoDB, Linux       
    
          
\end{itemize}

\hrule
\vspace{-1em}
\subsection*{\Large Experience}

\renewcommand\labelitemi{}
\renewcommand\labelitemii{$\bullet$}
\begin{itemize}[leftmargin=1em]
    \parskip=0.1em

        \item
          \headerrow
          {\textbf{L3Harris Technologies}}
          {\textbf{Greenville, TX}}
          \headerrow
          {\emph{Associate Software Engineer}}
          {\emph{June 2025 -- Present}}
          \begin{itemize*}
                \item Developed signal processing modules in Python and C++ on embedded systems, collaborating with hardware teams to optimize performance and resource utilization.
                \item Built microservices for high-frequency data ingestion, processing, and storage, leveraging Podman and serverless functions.
                \item Automated CI/CD testing with pipelines, integrating static code analysis, and integration testing.
            \end{itemize*}

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
            \end{itemize*}
        
    \headerrow
          {\textbf{University of Utah}}
          {\textbf{Salt Lake City, UT}}
          \headerrow
          {\emph{Undergraduate Research Assistant - FuTURES Lab}}
          {\emph{May 2024 --  Jun 2025}}
          \begin{itemize*}
            \item Analyzed and optimized large-scale datasets, enhancing software configuration testing with tools like gcov and CMake, increasing code coverage by 30\% on real-world APIs such as Libpng and PyTorch.
            \item Expanded OSS-Fuzz testing coverage, using compile-time options to improve the robustness of full-stack libraries.
          \end{itemize*}
                          
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
          \end{itemize*}
                  
\end{itemize}

\hrule
\vspace{-1em}
\subsection*{\Large Projects}

\hyphenpenalty=1000
\begin{itemize}[leftmargin=1em,noitemsep]
    \item \textbf{University Course Planning/Review Platform:} Built a multi-service data platform enabling student schedule matching, course overlap detection, and behavioral insights. Developed ETL pipelines in Python to process thousands of course records, user preferences, and time-series activity logs. Built a responsive frontend using React + Tailwind, including interactive dashboards, heatmaps, calendar visualizations, and search interfaces.
    \item \textbf{Accountability Tracker:} Built a full stack Accountability Tracker with Next.js and TypeScript for managing daily goals and recurring tasks. Added Firebase Auth, localStorage guest support, and PostgreSQL with Prisma for persistent data storage. Created progress visualizations and social features to improve engagement and accountability. 
    \item \textbf{Ray Tracing Engine:} Created an interactive WebGL-based ray tracing engine in JavaScript, featuring realistic reflections, dynamic lighting, and customizable environment maps. Implemented shaders and user controls for rendering techniques, scene adjustments, and interactivity.

\end{itemize}

\end{document}