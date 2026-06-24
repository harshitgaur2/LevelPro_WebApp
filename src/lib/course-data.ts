export type CourseIcon =
  | "code"
  | "file"
  | "layers"
  | "users"
  | "git"
  | "chart"
  | "science"
  | "ai";

export type Course = {
  slug: string;
  title: string;
  category: string;
  description: string;
  overview: string;
  duration: string;
  level: string;
  language: string;
  projects: string;
  icon: CourseIcon;
  accent: string;
  curriculum: { title: string; description: string }[];
  outcomes: string[];
  audience: string[];
  tools: string[];
  finalProject: {
    title: string;
    description: string;
  };
};

export const courses: Course[] = [
  {
    slug: "dsa-java",
    title: "DSA in Java",
    category: "Coding Foundations",
    description: "Master data structures, algorithms, and Java problem solving from arrays to graphs.",
    overview:
      "A structured Java DSA track that takes students from programming fundamentals to core data structures, recursion, dynamic programming, and graph problem solving with guided LeetCode practice.",
    duration: "30 lectures",
    level: "Beginner to Advanced",
    language: "Java",
    projects: "170+ practice questions",
    icon: "code",
    accent: "from-cyan-300 to-blue-500",
    curriculum: [
      { title: "Getting Started", description: "Input, loops, conditions, data types, and Java setup." },
      { title: "Patterns and Number System", description: "Pattern thinking, dry runs, binary basics, and math foundations." },
      { title: "Arrays and Functions", description: "Array traversal, searching, functions, and reusable logic." },
      { title: "2D Arrays and Strings", description: "Matrices, string manipulation, ArrayList, and StringBuilder." },
      { title: "Recursion and Complexity", description: "Recursive thinking, time complexity, space complexity, and tracing." },
      { title: "Dynamic Programming", description: "State design, memoization, tabulation, and classic DP patterns." },
      { title: "Stacks, Queues, and Linked Lists", description: "Linear data structures and interview-style implementations." },
      { title: "Trees, Heaps, Hash Maps, and Graphs", description: "Advanced data structures with curated LeetCode practice." },
    ],
    outcomes: [
      "Solve DSA questions using Java",
      "Understand time and space complexity",
      "Build strong recursion and DP intuition",
      "Practice arrays, strings, trees, graphs, heaps, and hash maps",
      "Prepare for coding interviews",
      "Create a disciplined problem-solving routine",
    ],
    audience: [
      "Students starting coding from basics",
      "Learners preparing for internships and placements",
      "Java learners who want structured DSA practice",
      "Students who need curated LeetCode direction",
    ],
    tools: ["Java", "IntelliJ IDEA", "VS Code", "LeetCode", "GitHub", "JDK"],
    finalProject: {
      title: "DSA Problem-Solving Portfolio",
      description:
        "Build a public GitHub repository with solved Java DSA patterns, explanations, complexity notes, and curated LeetCode links.",
    },
  },
  {
    slug: "resume-masterclass",
    title: "Resume Masterclass",
    category: "Career Readiness",
    description: "Build a crisp engineering resume that gets shortlisted for internships and jobs.",
    overview:
      "A career-focused masterclass for students who want a recruiter-ready resume, stronger project storytelling, and a polished LinkedIn/GitHub presence.",
    duration: "2 weeks",
    level: "Career Ready",
    language: "English + Hindi",
    projects: "Resume review",
    icon: "file",
    accent: "from-pink-300 to-fuchsia-500",
    curriculum: [
      { title: "Resume Strategy", description: "Understand what recruiters scan and how shortlisting works." },
      { title: "Profile Positioning", description: "Choose the right headline, summary, skills, and project ordering." },
      { title: "Project Storytelling", description: "Write impact-driven bullets for technical and academic projects." },
      { title: "ATS Formatting", description: "Build a clean, readable resume that works with screening tools." },
      { title: "LinkedIn and GitHub", description: "Make your online profiles consistent with your resume." },
      { title: "Mock Review", description: "Review, rewrite, and improve the final resume." },
    ],
    outcomes: [
      "Create a polished one-page resume",
      "Write stronger project bullets",
      "Improve LinkedIn and GitHub profile positioning",
      "Avoid common ATS formatting mistakes",
      "Prepare for recruiter screening",
      "Build a clean career story",
    ],
    audience: [
      "Students applying for internships",
      "Freshers preparing for placements",
      "Learners with projects but weak resume presentation",
      "Anyone needing a clean technical profile",
    ],
    tools: ["Google Docs", "LinkedIn", "GitHub", "Canva", "ATS format", "Portfolio links"],
    finalProject: {
      title: "Recruiter-Ready Resume Kit",
      description:
        "Create a final resume, LinkedIn headline, GitHub profile summary, and project bullet bank ready for applications.",
    },
  },
  {
    slug: "full-stack-foundations",
    title: "Full Stack Foundations",
    category: "Project Track",
    description: "Learn modern web development by building real projects with frontend and backend flows.",
    overview:
      "A practical full-stack starter course covering UI fundamentals, APIs, authentication basics, database concepts, and deployable project workflows.",
    duration: "8 weeks",
    level: "Project Track",
    language: "JavaScript",
    projects: "3 projects",
    icon: "layers",
    accent: "from-blue-300 to-violet-500",
    curriculum: [
      { title: "Web Foundations", description: "HTML, CSS, responsive layouts, and modern UI structure." },
      { title: "JavaScript Essentials", description: "DOM, state, async logic, and component thinking." },
      { title: "React Basics", description: "Components, props, state, forms, and routing." },
      { title: "Backend APIs", description: "REST APIs, route handlers, validation, and server logic." },
      { title: "Database Basics", description: "Tables, relations, CRUD flows, and Prisma-style modeling." },
      { title: "Auth and Deployment", description: "Login flows, protected pages, environment variables, and hosting." },
    ],
    outcomes: [
      "Build responsive web interfaces",
      "Create API-backed workflows",
      "Understand frontend/backend integration",
      "Use database-backed CRUD patterns",
      "Deploy a portfolio project",
      "Explain your project architecture",
    ],
    audience: [
      "Students moving from basics to projects",
      "Learners who want portfolio-ready apps",
      "Frontend beginners exploring backend concepts",
      "Students preparing for project interviews",
    ],
    tools: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Prisma", "Postgres", "GitHub"],
    finalProject: {
      title: "Full-Stack Student Portal",
      description:
        "Build and deploy a dashboard-style app with auth, database records, profile management, and responsive UI.",
    },
  },
  {
    slug: "interview-prep",
    title: "Interview Prep",
    category: "Placement Track",
    description: "Practice coding interviews, explain solutions clearly, and improve under time pressure.",
    overview:
      "A placement-focused track for students who want mock interview practice, DSA communication, resume walkthroughs, and structured preparation habits.",
    duration: "4 weeks",
    level: "Placement Track",
    language: "Java / English",
    projects: "Mock rounds",
    icon: "users",
    accent: "from-violet-300 to-blue-500",
    curriculum: [
      { title: "Interview Roadmap", description: "Understand rounds, expectations, and preparation planning." },
      { title: "Problem-Solving Communication", description: "Learn how to explain approach, tradeoffs, and complexity." },
      { title: "Core DSA Revision", description: "Revise arrays, strings, recursion, linked lists, trees, and graphs." },
      { title: "Resume Walkthrough", description: "Prepare project explanations and behavioral answers." },
      { title: "Mock Interviews", description: "Practice timed coding and feedback-based improvement." },
      { title: "Final Preparation Plan", description: "Build a weekly roadmap for applications and revision." },
    ],
    outcomes: [
      "Answer interview questions with structure",
      "Explain DSA solutions clearly",
      "Improve speed under time pressure",
      "Prepare project and resume walkthroughs",
      "Identify weak areas through mocks",
      "Build a realistic placement plan",
    ],
    audience: [
      "Students preparing for campus placements",
      "Freshers applying for internships",
      "Learners who know DSA but struggle in interviews",
      "Students needing mock interview feedback",
    ],
    tools: ["LeetCode", "Java", "Resume", "Google Meet", "GitHub", "Notion"],
    finalProject: {
      title: "Interview Readiness Pack",
      description:
        "Complete a mock interview cycle with solved questions, reviewed resume answers, and a personal improvement roadmap.",
    },
  },
  {
    slug: "git-github-sprint",
    title: "Git/GitHub Sprint",
    category: "Developer Workflow",
    description: "Ship like a developer with Git workflows, pull requests, and portfolio repositories.",
    overview:
      "A focused sprint to help students use Git and GitHub confidently for projects, collaboration, portfolio building, and professional development habits.",
    duration: "1 week",
    level: "Fast Sprint",
    language: "Command line",
    projects: "Portfolio repo",
    icon: "git",
    accent: "from-pink-300 to-blue-400",
    curriculum: [
      { title: "Git Basics", description: "Repositories, commits, branches, and version history." },
      { title: "GitHub Setup", description: "Profiles, remotes, README files, and repo organization." },
      { title: "Branching Workflow", description: "Feature branches, pull requests, reviews, and merging." },
      { title: "Collaboration", description: "Issues, project boards, conflict resolution, and contribution habits." },
      { title: "Portfolio Polish", description: "Make repositories presentable for recruiters and mentors." },
    ],
    outcomes: [
      "Use Git from the command line",
      "Create clean GitHub repositories",
      "Work with branches and pull requests",
      "Resolve basic merge conflicts",
      "Write strong README files",
      "Build a portfolio-ready GitHub profile",
    ],
    audience: [
      "Beginners who have never used Git",
      "Students building project portfolios",
      "Learners preparing for team projects",
      "Anyone who wants clean developer workflow habits",
    ],
    tools: ["Git", "GitHub", "VS Code", "Markdown", "GitHub Issues", "Pull Requests"],
    finalProject: {
      title: "Professional GitHub Portfolio",
      description:
        "Publish a polished repository with branching history, README documentation, project screenshots, and clean commit messages.",
    },
  },
  {
    slug: "advanced-data-analytics",
    title: "Advanced Data Analytics Course",
    category: "Analytics",
    description:
      "A practical analytics course focused on SQL, Excel, Power BI, data storytelling, dashboarding, business KPIs, and real-world analytics workflows.",
    overview:
      "A practical analytics course focused on SQL, Excel, Power BI, data storytelling, dashboarding, business KPIs, and real-world analytics workflows.",
    duration: "8 modules",
    level: "Intermediate",
    language: "SQL + BI",
    projects: "Dashboard capstone",
    icon: "chart",
    accent: "from-cyan-300 to-sky-500",
    curriculum: [
      { title: "Analytics fundamentals and business problem solving", description: "Frame business questions and convert them into measurable analytics problems." },
      { title: "Advanced Excel for data cleaning and reporting", description: "Clean, transform, summarize, and report messy datasets with spreadsheet workflows." },
      { title: "SQL for analytics", description: "Write business-focused queries using filters, joins, aggregations, and windows." },
      { title: "Power BI dashboard development", description: "Design interactive dashboards with clean layouts and stakeholder-ready visuals." },
      { title: "DAX formulas and KPI building", description: "Create calculated measures, KPIs, and performance metrics." },
      { title: "Data storytelling and insight presentation", description: "Turn analysis into clear recommendations and executive-ready narratives." },
      { title: "Real-world business case studies", description: "Solve realistic analytics scenarios across product, marketing, and operations." },
      { title: "Capstone analytics dashboard project", description: "Build a portfolio-ready analytics dashboard from raw data to final presentation." },
    ],
    outcomes: [
      "Build professional dashboards",
      "Write SQL queries for business analysis",
      "Clean and transform messy datasets",
      "Present insights clearly",
      "Understand KPIs and business metrics",
      "Create portfolio-ready analytics projects",
    ],
    audience: [
      "Students targeting data analyst roles",
      "Excel users who want SQL and BI skills",
      "Learners who want portfolio dashboards",
      "Business students moving into analytics",
    ],
    tools: ["Excel", "SQL", "Power BI", "DAX", "Power Query", "Google Sheets"],
    finalProject: {
      title: "Business Analytics Dashboard",
      description:
        "Build a Power BI dashboard with KPI cards, trend analysis, filters, and a final business insight presentation.",
    },
  },
  {
    slug: "complete-data-science",
    title: "Complete Data Science Course",
    category: "Data Science",
    description:
      "A complete beginner-to-advanced data science track covering Python, statistics, machine learning, data preprocessing, model building, evaluation, and deployment basics.",
    overview:
      "A complete beginner-to-advanced data science track covering Python, statistics, machine learning, data preprocessing, model building, evaluation, and deployment basics.",
    duration: "10 modules",
    level: "Beginner to Advanced",
    language: "Python",
    projects: "ML capstone",
    icon: "science",
    accent: "from-blue-300 to-indigo-500",
    curriculum: [
      { title: "Python programming for data science", description: "Build Python fundamentals for analysis, notebooks, and data workflows." },
      { title: "NumPy, Pandas, and data cleaning", description: "Load, clean, transform, and structure real datasets." },
      { title: "Exploratory data analysis", description: "Understand data using summaries, charts, and pattern discovery." },
      { title: "Statistics and probability", description: "Learn the statistical thinking needed for practical data science." },
      { title: "Machine learning fundamentals", description: "Understand supervised learning, features, labels, training, and inference." },
      { title: "Regression and classification models", description: "Build predictive models for continuous and categorical outcomes." },
      { title: "Model evaluation and optimization", description: "Measure accuracy, tune models, and avoid common evaluation mistakes." },
      { title: "Feature engineering", description: "Create useful model inputs from raw data." },
      { title: "Real-world ML projects", description: "Apply data science workflows to realistic use cases." },
      { title: "Capstone data science project", description: "Create an end-to-end machine learning project for your portfolio." },
    ],
    outcomes: [
      "Analyze datasets using Python",
      "Build machine learning models",
      "Understand statistics for data science",
      "Create end-to-end ML projects",
      "Prepare for data analyst/data scientist roles",
      "Build a strong project portfolio",
    ],
    audience: [
      "Beginners entering data science",
      "Students who know Python basics",
      "Learners preparing for analytics and ML roles",
      "Builders who want portfolio ML projects",
    ],
    tools: ["Python", "NumPy", "Pandas", "Matplotlib", "Scikit-learn", "Jupyter Notebook", "Streamlit"],
    finalProject: {
      title: "End-to-End ML Project",
      description:
        "Build a complete machine learning project with data cleaning, model training, evaluation, and a simple Streamlit demo.",
    },
  },
  {
    slug: "genai-foundational",
    title: "GenAI Foundational Course",
    category: "Generative AI",
    description:
      "A beginner-friendly GenAI course covering LLM basics, prompt engineering, ChatGPT workflows, AI tools, RAG basics, agents, and real-world GenAI applications.",
    overview:
      "A beginner-friendly GenAI course covering LLM basics, prompt engineering, ChatGPT workflows, AI tools, RAG basics, agents, and real-world GenAI applications.",
    duration: "10 modules",
    level: "Beginner",
    language: "No-code + Python basics",
    projects: "GenAI app",
    icon: "ai",
    accent: "from-fuchsia-300 to-cyan-400",
    curriculum: [
      { title: "Introduction to Generative AI", description: "Understand what GenAI is and where it is used." },
      { title: "How LLMs work", description: "Learn the basic mental model behind large language models." },
      { title: "Prompt engineering fundamentals", description: "Write clear prompts with context, constraints, examples, and evaluation." },
      { title: "ChatGPT productivity workflows", description: "Use ChatGPT for learning, writing, planning, coding, and research." },
      { title: "AI tools for students and professionals", description: "Explore practical AI tools for daily workflows." },
      { title: "RAG and vector database basics", description: "Understand retrieval, embeddings, and knowledge-grounded answers." },
      { title: "Introduction to AI agents", description: "Learn what agents are and how they use tools and memory." },
      { title: "Building simple GenAI apps", description: "Create beginner-friendly AI-powered workflows and demos." },
      { title: "Responsible AI and limitations", description: "Understand hallucinations, privacy, bias, and safe usage." },
      { title: "Final GenAI project", description: "Build a simple GenAI portfolio project." },
    ],
    outcomes: [
      "Understand core GenAI concepts",
      "Write better prompts",
      "Use AI tools professionally",
      "Build simple AI-powered workflows",
      "Understand RAG and agents at a beginner level",
      "Create a GenAI portfolio project",
    ],
    audience: [
      "Students curious about AI",
      "Professionals who want practical GenAI workflows",
      "Beginners exploring prompt engineering",
      "Builders who want to create simple AI apps",
    ],
    tools: ["ChatGPT", "Gemini", "Claude", "LangChain basics", "Python basics", "Streamlit", "Vector DB basics"],
    finalProject: {
      title: "GenAI Workflow App",
      description:
        "Create a simple AI-powered workflow such as a study assistant, resume helper, or document Q&A prototype.",
    },
  },
];

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}
