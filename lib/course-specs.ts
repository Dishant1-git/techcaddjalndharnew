/**
 * Per-course facts that make each generated page specific.
 *
 * Keyed by full path so `/courses/generative-ai` and
 * `/after-12th-courses/generative-ai` can differ. Everything here is course
 * data — the shared brand copy lives in the generator, not in fifty copies.
 */
/** The fields of a CourseSpec that a CMS record can supply. */
export type CourseSpecField =
  | 'tagline'
  | 'demand'
  | 'careers'
  | 'topics'
  | 'tools'
  | 'salary'
  | 'duration'
  | 'mode'
  | 'fee'
  | 'level'

export type CourseSpec = {
  /** One line: what the course actually is. */
  tagline: string
  /** One sentence on who in Punjab hires for it. */
  demand: string
  /** Job titles this course leads to. */
  careers: string[]
  /** Eight syllabus topics — the generator groups them into modules. */
  topics: string[]
  tools: string[]
  /** Realistic fresher band in the Jalandhar / Mohali market. */
  salary: string
  /**
   * The facts strip, when the CMS has been given them.
   *
   * Optional and absent from every checked-in spec below: these are the fields
   * an office actually revises — a fee rises, a batch length changes — and they
   * belong to the record rather than to this file. When unset the page keeps
   * the segment's generic facts, which is what it showed before.
   */
  duration?: string
  mode?: string
  fee?: string
  level?: string
  /**
   * Which of the above came from a CMS record rather than from this file.
   *
   * Absent on every checked-in spec below — they are all authored copy by
   * definition. Set by `specFromCourse`, and read by `getCoursePage` to decide
   * which hand-written page fields an editor is allowed to overrule.
   */
  fromCms?: readonly CourseSpecField[]
}

export const COURSE_SPECS: Record<string, CourseSpec> = {
  // ---------- Programming ----------
  "courses/python": {
    tagline:
      "the language behind almost every AI, automation and backend job advertised today",
    demand:
      "Python sits under data work, automation and backend services, so it is the first requirement on most analyst and developer listings in Mohali and Chandigarh.",
    careers: ["Python Developer", "Automation Engineer", "Data Analyst", "Backend Developer"],
    topics: [
      "Syntax, data types and control flow",
      "Functions, modules and virtual environments",
      "Object-oriented programming and error handling",
      "File handling, JSON and CSV processing",
      "Databases with SQLite and PostgreSQL",
      "APIs with Flask and FastAPI",
      "Automation scripting and web scraping",
      "NumPy and Pandas for data work",
    ],
    tools: ["Python 3", "VS Code", "Git", "Flask", "FastAPI", "PostgreSQL", "Pandas", "Jupyter"],
    salary: "₹18,000 – ₹30,000",
  },
  "courses/java": {
    tagline:
      "the enterprise language that still runs banking, insurance and large-scale backend systems",
    demand:
      "Java remains the default in enterprise and service companies, which is what most campus recruiters in Punjab are hiring for.",
    careers: ["Java Developer", "Backend Engineer", "Android Developer", "Software Engineer"],
    topics: [
      "Core Java, JVM and memory model",
      "OOP, collections and generics",
      "Exception handling and multithreading",
      "JDBC and database connectivity",
      "Spring and Spring Boot fundamentals",
      "REST APIs and layered architecture",
      "Maven, testing and debugging",
      "Deployment and version control",
    ],
    tools: ["Java 21", "IntelliJ IDEA", "Spring Boot", "Maven", "MySQL", "Git", "Postman", "JUnit"],
    salary: "₹18,000 – ₹32,000",
  },
  "courses/c-cpp": {
    tagline:
      "the foundation course that teaches you how memory, pointers and machines actually work",
    demand:
      "C and C++ underpin embedded work, systems roles and every competitive-programming round in campus placements.",
    careers: ["Software Developer", "Embedded Engineer", "Systems Programmer", "QA Engineer"],
    topics: [
      "C syntax, operators and control flow",
      "Pointers, arrays and memory management",
      "Structures, unions and file handling",
      "C++ classes, objects and constructors",
      "Inheritance, polymorphism and templates",
      "STL containers and algorithms",
      "Data structures — stacks, queues, trees",
      "Problem solving for placement rounds",
    ],
    tools: ["GCC", "VS Code", "Code::Blocks", "GDB", "Git", "LeetCode"],
    salary: "₹15,000 – ₹28,000",
  },
  "courses/kotlin": {
    tagline: "the modern language Google recommends for building Android applications",
    demand:
      "Android work is one of the few development skills with steady freelance demand in Punjab alongside agency jobs.",
    careers: ["Android Developer", "Kotlin Developer", "Mobile App Engineer", "Freelance Developer"],
    topics: [
      "Kotlin syntax, null safety and types",
      "Functions, lambdas and collections",
      "OOP and coroutines for async work",
      "Android Studio and the activity lifecycle",
      "Layouts, Jetpack Compose and navigation",
      "Room database and local storage",
      "REST APIs with Retrofit",
      "Publishing to the Play Store",
    ],
    tools: ["Kotlin", "Android Studio", "Jetpack Compose", "Room", "Retrofit", "Firebase", "Git"],
    salary: "₹18,000 – ₹32,000",
  },
  "courses/web-designing": {
    tagline: "the visual and front-end craft of turning a design into a working, responsive website",
    demand:
      "Every agency and export house in Jalandhar needs someone who can build and maintain a presentable site.",
    careers: ["Web Designer", "UI Developer", "Front-End Developer", "Freelance Designer"],
    topics: [
      "HTML5 semantics and document structure",
      "CSS layout with Flexbox and Grid",
      "Responsive and mobile-first design",
      "Typography, colour and design systems",
      "Bootstrap and Tailwind CSS",
      "JavaScript for interactivity",
      "Figma to working page workflow",
      "Accessibility and performance basics",
    ],
    tools: ["HTML5", "CSS3", "JavaScript", "Tailwind CSS", "Bootstrap", "Figma", "Git", "VS Code"],
    salary: "₹12,000 – ₹25,000",
  },
  "courses/web-development": {
    tagline: "full-stack web development, from database schema through to deployed interface",
    demand:
      "Web development is the widest entry point into IT jobs in Punjab, from agencies to product startups.",
    careers: ["Web Developer", "Full-Stack Developer", "Front-End Engineer", "Freelance Developer"],
    topics: [
      "HTML, CSS and modern JavaScript",
      "DOM, events and fetch APIs",
      "React components, state and hooks",
      "Node.js and Express servers",
      "REST API design and authentication",
      "Databases — MongoDB and SQL",
      "Git, GitHub and collaborative workflow",
      "Deployment, domains and hosting",
    ],
    tools: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Git", "Vercel", "Postman"],
    salary: "₹18,000 – ₹32,000",
  },
  "courses/mern-stack": {
    tagline: "the MongoDB, Express, React and Node stack most Indian startups build on",
    demand:
      "MERN is the most requested stack in job listings across Mohali, Chandigarh and remote Indian startups.",
    careers: ["MERN Developer", "Full-Stack Developer", "React Developer", "Node.js Developer"],
    topics: [
      "JavaScript ES6+ and async patterns",
      "React components, hooks and routing",
      "State management and context",
      "Node.js and Express API design",
      "MongoDB schemas with Mongoose",
      "JWT authentication and authorisation",
      "File uploads, payments and third-party APIs",
      "Deployment, environment config and CI",
    ],
    tools: ["MongoDB", "Express", "React", "Node.js", "Mongoose", "JWT", "Git", "Vercel"],
    salary: "₹20,000 – ₹35,000",
  },
  "courses/mean-stack": {
    tagline: "the Angular-based JavaScript stack used across enterprise and service companies",
    demand:
      "MEAN and Angular remain standard in service companies and enterprise teams that value structure over speed.",
    careers: ["MEAN Developer", "Angular Developer", "Full-Stack Developer", "Software Engineer"],
    topics: [
      "TypeScript fundamentals",
      "Angular components, modules and services",
      "RxJS observables and reactive forms",
      "Routing, guards and interceptors",
      "Node.js and Express backends",
      "MongoDB data modelling",
      "Authentication and role-based access",
      "Build, test and deploy pipeline",
    ],
    tools: ["Angular", "TypeScript", "Node.js", "Express", "MongoDB", "RxJS", "Git", "Postman"],
    salary: "₹20,000 – ₹35,000",
  },
  "courses/php-full-stack": {
    tagline: "PHP and Laravel development, still the backbone of most small-business websites",
    demand:
      "A large share of existing business websites in Jalandhar run on PHP or WordPress and need maintaining.",
    careers: ["PHP Developer", "Laravel Developer", "Web Developer", "WordPress Developer"],
    topics: [
      "PHP syntax, arrays and functions",
      "Forms, sessions and validation",
      "MySQL and database design",
      "Object-oriented PHP and MVC",
      "Laravel routing, Blade and Eloquent",
      "REST APIs and authentication",
      "WordPress theme and plugin basics",
      "Hosting, cPanel and deployment",
    ],
    tools: ["PHP 8", "Laravel", "MySQL", "Composer", "WordPress", "cPanel", "Git", "Postman"],
    salary: "₹15,000 – ₹28,000",
  },

  // ---------- AI & Data ----------
  "courses/artificial-intelligence": {
    tagline:
      "applied artificial intelligence — building systems that classify, predict, generate and decide",
    demand:
      "AI skills now appear in job listings well beyond tech companies, from analytics teams to marketing and operations.",
    careers: ["AI Engineer", "ML Engineer", "Data Scientist", "AI Product Analyst"],
    topics: [
      "Python for AI and scientific computing",
      "Mathematics for machine learning",
      "Supervised and unsupervised learning",
      "Neural networks and deep learning",
      "Computer vision with OpenCV",
      "Natural language processing",
      "Large language models and prompting",
      "Model deployment and monitoring",
    ],
    tools: ["Python", "TensorFlow", "PyTorch", "scikit-learn", "OpenCV", "Hugging Face", "Jupyter", "Streamlit"],
    salary: "₹22,000 – ₹40,000",
  },
  "courses/machine-learning": {
    tagline: "the statistical core of AI — training models that learn patterns from real data",
    demand:
      "Machine learning is where analytics teams in banking, retail and healthcare are adding headcount fastest.",
    careers: ["ML Engineer", "Data Scientist", "Analytics Engineer", "Research Assistant"],
    topics: [
      "Python, NumPy and Pandas",
      "Statistics and probability for ML",
      "Regression and classification models",
      "Decision trees, forests and boosting",
      "Clustering and dimensionality reduction",
      "Feature engineering and pipelines",
      "Model evaluation and cross-validation",
      "Deploying models as APIs",
    ],
    tools: ["Python", "scikit-learn", "Pandas", "NumPy", "Matplotlib", "Jupyter", "Streamlit", "Git"],
    salary: "₹22,000 – ₹38,000",
  },
  "courses/deep-learning": {
    tagline: "neural network architectures for vision, language and generative tasks",
    demand:
      "Deep learning is the specialism behind computer vision and language products, and it commands a premium.",
    careers: ["Deep Learning Engineer", "Computer Vision Engineer", "NLP Engineer", "AI Researcher"],
    topics: [
      "Neural network fundamentals and backpropagation",
      "TensorFlow and PyTorch workflows",
      "Convolutional networks for vision",
      "Recurrent networks and sequence models",
      "Transformers and attention",
      "Transfer learning and fine-tuning",
      "Generative models and diffusion basics",
      "GPU training and model optimisation",
    ],
    tools: ["PyTorch", "TensorFlow", "Keras", "OpenCV", "Hugging Face", "Google Colab", "NumPy"],
    salary: "₹25,000 – ₹45,000",
  },
  "courses/data-science": {
    tagline: "the full pipeline from raw data to a decision a business will actually act on",
    demand:
      "Every mid-size company in Punjab now sits on data it cannot read, which is exactly the gap this fills.",
    careers: ["Data Scientist", "Data Analyst", "Business Analyst", "Analytics Engineer"],
    topics: [
      "Python and SQL for data work",
      "Data cleaning and wrangling with Pandas",
      "Exploratory analysis and visualisation",
      "Statistics, sampling and hypothesis testing",
      "Machine learning models end to end",
      "Time series and forecasting",
      "Dashboards with Power BI and Tableau",
      "Storytelling and stakeholder reporting",
    ],
    tools: ["Python", "SQL", "Pandas", "scikit-learn", "Power BI", "Tableau", "Jupyter", "Excel"],
    salary: "₹20,000 – ₹38,000",
  },
  "courses/data-analytics": {
    tagline: "turning business data into dashboards and answers, without a heavy coding load",
    demand:
      "Analytics roles are the most common non-developer entry into IT, and Excel-to-Power BI skills hire fast locally.",
    careers: ["Data Analyst", "Business Analyst", "MIS Executive", "Reporting Analyst"],
    topics: [
      "Advanced Excel and pivot analysis",
      "SQL queries, joins and aggregation",
      "Data cleaning and preparation",
      "Descriptive statistics for business",
      "Power BI data modelling and DAX",
      "Tableau dashboards and stories",
      "KPI design and reporting cadence",
      "Presenting findings to management",
    ],
    tools: ["Excel", "SQL", "Power BI", "Tableau", "Python", "Google Sheets", "Looker Studio"],
    salary: "₹16,000 – ₹30,000",
  },
  "courses/power-bi": {
    tagline: "Microsoft's business intelligence tool, from raw tables to a board-ready dashboard",
    demand:
      "Power BI is the reporting standard in most Indian companies running on Microsoft infrastructure.",
    careers: ["Power BI Developer", "Data Analyst", "MIS Executive", "BI Consultant"],
    topics: [
      "Power BI Desktop and the data model",
      "Power Query and data transformation",
      "Relationships and star schemas",
      "DAX measures and calculated columns",
      "Visualisations and report design",
      "Row-level security and permissions",
      "Publishing, workspaces and refresh",
      "Connecting SQL and Excel sources",
    ],
    tools: ["Power BI", "Power Query", "DAX", "Excel", "SQL Server", "Power BI Service"],
    salary: "₹16,000 – ₹30,000",
  },
  "courses/tableau": {
    tagline: "visual analytics for people who need to explain numbers, not just calculate them",
    demand:
      "Tableau is common in analytics consultancies and multinational back offices across the Chandigarh belt.",
    careers: ["Tableau Developer", "Data Analyst", "BI Analyst", "Visualisation Specialist"],
    topics: [
      "Tableau Desktop and data connections",
      "Dimensions, measures and aggregation",
      "Calculated fields and table calculations",
      "Parameters, sets and filters",
      "Dashboard and story design",
      "Maps and geographic analysis",
      "Performance tuning for large data",
      "Publishing to Tableau Server",
    ],
    tools: ["Tableau Desktop", "Tableau Public", "SQL", "Excel", "Tableau Prep"],
    salary: "₹16,000 – ₹30,000",
  },

  // ---------- Digital marketing family ----------
  "courses/seo": {
    tagline: "the discipline of earning search traffic instead of paying for every click",
    demand:
      "Every business in Jalandhar that wants enquiries without an ad budget needs someone who understands search.",
    careers: ["SEO Executive", "SEO Analyst", "Content Strategist", "Freelance SEO Consultant"],
    topics: [
      "How search engines crawl, index and rank",
      "Keyword research and search intent",
      "On-page optimisation and schema markup",
      "Technical SEO — speed, sitemaps, robots",
      "Local SEO and Google Business Profile",
      "Link building and digital PR",
      "Content strategy and topical authority",
      "Search Console and rank tracking",
    ],
    tools: ["Google Search Console", "Semrush", "Ahrefs", "Screaming Frog", "GA4", "Ubersuggest", "WordPress"],
    salary: "₹15,000 – ₹28,000",
  },
  "courses/google-ads": {
    tagline: "paid search and display advertising, run on live accounts with real budgets",
    demand:
      "Immigration consultancies, clinics, schools and exporters across Jalandhar all run Google Ads and need people who can manage them.",
    careers: ["PPC Executive", "Google Ads Specialist", "Performance Marketer", "Freelance Ads Manager"],
    topics: [
      "Account structure and campaign types",
      "Keyword match types and negatives",
      "Ad copywriting and extensions",
      "Bidding strategies and budgets",
      "Display, YouTube and Performance Max",
      "Shopping campaigns for ecommerce",
      "Conversion tracking and attribution",
      "Optimisation and reporting cadence",
    ],
    tools: ["Google Ads", "Google Analytics 4", "Tag Manager", "Keyword Planner", "Looker Studio", "Merchant Center"],
    salary: "₹16,000 – ₹30,000",
  },
  "courses/social-media-marketing": {
    tagline: "building audiences and running paid social across Instagram, Facebook and LinkedIn",
    demand:
      "Social is the first channel most Punjab businesses invest in, and the one they most often hand to an in-house hire.",
    careers: ["Social Media Executive", "Content Creator", "Meta Ads Specialist", "Brand Manager"],
    topics: [
      "Platform strategy and content pillars",
      "Content calendars and scheduling",
      "Reels, short video and creative formats",
      "Meta Ads Manager and audience building",
      "Retargeting and lookalike audiences",
      "Influencer and collaboration campaigns",
      "Community management and reputation",
      "Analytics and reporting",
    ],
    tools: ["Meta Ads Manager", "Instagram", "Canva", "Buffer", "Google Analytics 4", "CapCut"],
    salary: "₹14,000 – ₹26,000",
  },
  "courses/wordpress": {
    tagline: "building and maintaining business websites on the platform 40% of the web runs on",
    demand:
      "Most small-business sites in Jalandhar are WordPress, which makes this the most immediately billable freelance skill.",
    careers: ["WordPress Developer", "Web Designer", "Freelance Developer", "Website Manager"],
    topics: [
      "Hosting, domains and installation",
      "Themes, child themes and customisation",
      "Elementor and page building",
      "Plugins, forms and integrations",
      "WooCommerce store setup",
      "SEO plugins and site structure",
      "Speed, caching and security",
      "Backups, updates and maintenance",
    ],
    tools: ["WordPress", "Elementor", "WooCommerce", "Yoast SEO", "cPanel", "Cloudflare"],
    salary: "₹12,000 – ₹25,000",
  },
  "courses/shopify": {
    tagline: "launching and running ecommerce stores that actually convert",
    demand:
      "D2C brands and exporters in Punjab increasingly sell direct, and Shopify is where most of them start.",
    careers: ["Shopify Developer", "Ecommerce Executive", "Store Manager", "Freelance Ecommerce Consultant"],
    topics: [
      "Store setup, products and collections",
      "Theme customisation and Liquid basics",
      "Payments, shipping and taxes for India",
      "Product page conversion optimisation",
      "Apps, upsells and email capture",
      "Shopify SEO and content",
      "Meta and Google Shopping integration",
      "Analytics, orders and fulfilment",
    ],
    tools: ["Shopify", "Liquid", "Meta Commerce", "Google Merchant Center", "Klaviyo", "Canva"],
    salary: "₹15,000 – ₹28,000",
  },

  // ---------- Cyber & Cloud ----------
  "courses/cybersecurity": {
    tagline: "defending networks, applications and data against real attack techniques",
    demand:
      "Security roles are growing faster than the local supply of trained people, which keeps salaries above average.",
    careers: ["Security Analyst", "SOC Analyst", "Penetration Tester", "IT Security Executive"],
    topics: [
      "Networking and protocols for security",
      "Linux fundamentals and hardening",
      "Threats, vulnerabilities and risk",
      "Vulnerability assessment and scanning",
      "Web application security and OWASP Top 10",
      "Network attacks and packet analysis",
      "Incident response and forensics basics",
      "Security tooling and reporting",
    ],
    tools: ["Kali Linux", "Wireshark", "Nmap", "Burp Suite", "Metasploit", "OWASP ZAP", "Linux"],
    salary: "₹20,000 – ₹35,000",
  },
  "courses/ethical-hacking": {
    tagline: "offensive security — finding the holes before somebody else does",
    demand:
      "Penetration testing is billable consulting work, and certified testers are scarce across Punjab.",
    careers: ["Penetration Tester", "Ethical Hacker", "Security Analyst", "Bug Bounty Hunter"],
    topics: [
      "Reconnaissance and footprinting",
      "Scanning, enumeration and exploitation",
      "System hacking and privilege escalation",
      "Web application attacks and SQL injection",
      "Wireless and network attacks",
      "Social engineering techniques",
      "Malware analysis fundamentals",
      "Reporting and responsible disclosure",
    ],
    tools: ["Kali Linux", "Metasploit", "Burp Suite", "Nmap", "Wireshark", "John the Ripper", "Hydra"],
    salary: "₹20,000 – ₹38,000",
  },
  "courses/cloud-computing": {
    tagline: "deploying and running infrastructure on AWS and Azure instead of a server in the office",
    demand:
      "Cloud and DevOps skills are the clearest salary jump available to a working IT professional in Punjab.",
    careers: ["Cloud Engineer", "DevOps Engineer", "System Administrator", "Cloud Support Associate"],
    topics: [
      "Cloud models, regions and pricing",
      "AWS core services — EC2, S3, VPC, IAM",
      "Azure fundamentals and equivalents",
      "Linux administration for cloud",
      "Docker containers and images",
      "Kubernetes orchestration basics",
      "CI/CD pipelines and automation",
      "Monitoring, logging and cost control",
    ],
    tools: ["AWS", "Azure", "Docker", "Kubernetes", "Terraform", "Jenkins", "Linux", "Git"],
    salary: "₹22,000 – ₹40,000",
  },
  "courses/linux": {
    tagline: "the operating system every server, container and cloud instance actually runs",
    demand:
      "Linux is the quiet prerequisite behind cloud, DevOps and security roles, and the fastest gap to close.",
    careers: ["Linux Administrator", "System Engineer", "DevOps Associate", "Support Engineer"],
    topics: [
      "Linux installation and file system",
      "Command line and shell essentials",
      "Users, groups and permissions",
      "Package management and services",
      "Shell scripting and automation",
      "Networking and SSH configuration",
      "Web servers with Nginx and Apache",
      "Monitoring, logs and troubleshooting",
    ],
    tools: ["Ubuntu", "CentOS", "Bash", "Nginx", "systemd", "SSH", "Git"],
    salary: "₹15,000 – ₹28,000",
  },

  // ---------- AI menu ----------
  "courses/generative-ai": {
    tagline: "building with large language models, image models and the tools around them",
    demand:
      "Generative AI is the fastest-moving hiring category in India, and almost nobody locally has structured training in it.",
    careers: ["AI Engineer", "Prompt Engineer", "AI Product Developer", "Automation Consultant"],
    topics: [
      "How large language models work",
      "Prompt design and evaluation",
      "OpenAI, Claude and open-source models",
      "Embeddings and vector databases",
      "Retrieval-augmented generation",
      "Image and audio generation",
      "Building AI apps with Python",
      "Cost, safety and deployment",
    ],
    tools: ["Python", "LangChain", "Hugging Face", "Claude", "ChatGPT", "Pinecone", "Streamlit"],
    salary: "₹25,000 – ₹45,000",
  },
  "courses/prompt-engineering": {
    tagline: "getting reliable, repeatable output from AI systems instead of lucky answers",
    demand:
      "Every team adopting AI needs someone who can turn a vague request into a dependable prompt and workflow.",
    careers: ["Prompt Engineer", "AI Content Specialist", "Automation Analyst", "AI Trainer"],
    topics: [
      "How models interpret instructions",
      "Zero-shot, few-shot and chain prompting",
      "Structured output and formatting",
      "System prompts and role design",
      "Evaluating and testing prompts",
      "Prompt chaining and workflows",
      "Guardrails and failure handling",
      "Applying prompts to real business tasks",
    ],
    tools: ["ChatGPT", "Claude", "Gemini", "LangChain", "Google Sheets", "Zapier"],
    salary: "₹18,000 – ₹35,000",
  },
  "courses/chatgpt-ai-tools": {
    tagline: "practical AI tooling for everyday work — writing, analysis, design and automation",
    demand:
      "Employers increasingly expect AI fluency as a baseline, the way Excel was expected a decade ago.",
    careers: ["AI Tools Specialist", "Content Executive", "Operations Analyst", "Freelance Consultant"],
    topics: [
      "The current AI tool landscape",
      "Writing and editing workflows",
      "Research and summarisation",
      "Spreadsheets and data analysis with AI",
      "Image, video and design tools",
      "Meeting notes and documentation",
      "Automation with Zapier and Make",
      "Verification and avoiding AI mistakes",
    ],
    tools: ["ChatGPT", "Claude", "Canva AI", "Notion AI", "Zapier", "Perplexity", "Excel"],
    salary: "₹14,000 – ₹26,000",
  },
  "courses/agentic-ai": {
    tagline: "AI systems that plan, use tools and complete multi-step work on their own",
    demand:
      "Agentic systems are where AI budgets are moving, and practitioners are genuinely rare in North India.",
    careers: ["AI Engineer", "Agent Developer", "Automation Architect", "AI Consultant"],
    topics: [
      "Agent architectures and planning loops",
      "Tool use and function calling",
      "Memory, context and state",
      "Multi-agent coordination",
      "Retrieval and knowledge grounding",
      "Evaluation and guardrails",
      "Building agents in Python",
      "Deployment, cost and observability",
    ],
    tools: ["Python", "LangChain", "LangGraph", "Claude", "OpenAI API", "Vector DBs", "FastAPI"],
    salary: "₹25,000 – ₹50,000",
  },
  "courses/ai-powered-marketing": {
    tagline: "running marketing with AI in the loop — research, creative, targeting and reporting",
    demand:
      "Agencies now expect marketers to produce more with AI, and the ones who can command better pay.",
    careers: ["Digital Marketer", "AI Content Strategist", "Performance Marketer", "Growth Executive"],
    topics: [
      "AI for keyword and market research",
      "Content production at scale",
      "Ad copy and creative generation",
      "Audience analysis and segmentation",
      "Automated reporting and insights",
      "Chatbots and lead qualification",
      "Personalisation and email automation",
      "Measuring what AI actually improved",
    ],
    tools: ["ChatGPT", "Claude", "Canva", "Meta Ads", "Google Ads", "Looker Studio", "Zapier"],
    salary: "₹18,000 – ₹32,000",
  },
  "courses/rag-development": {
    tagline: "retrieval-augmented generation — making AI answer from your data, not its memory",
    demand:
      "RAG is the most requested AI build in Indian enterprises, because it is how internal knowledge tools get made.",
    careers: ["AI Engineer", "RAG Developer", "ML Engineer", "AI Solutions Consultant"],
    topics: [
      "Why retrieval beats fine-tuning for facts",
      "Document parsing and chunking",
      "Embeddings and similarity search",
      "Vector databases and indexing",
      "Query rewriting and re-ranking",
      "Grounded answering and citations",
      "Evaluation and hallucination testing",
      "Production deployment and scaling",
    ],
    tools: ["Python", "LangChain", "Pinecone", "ChromaDB", "Hugging Face", "FastAPI", "Claude"],
    salary: "₹25,000 – ₹45,000",
  },
  "courses/ai-powered-courses": {
    tagline: "a guided path through the AI skills employers are actually asking for",
    demand:
      "AI literacy has moved from optional to expected across analyst, marketing and developer roles alike.",
    careers: ["AI Associate", "Automation Analyst", "AI Content Specialist", "Technical Consultant"],
    topics: [
      "AI foundations and terminology",
      "Python basics for AI work",
      "Working with language models",
      "Prompt design and evaluation",
      "Data handling and analysis with AI",
      "Automation and workflow tools",
      "Building a small AI application",
      "Ethics, limitations and verification",
    ],
    tools: ["Python", "ChatGPT", "Claude", "LangChain", "Jupyter", "Zapier", "Streamlit"],
    salary: "₹18,000 – ₹32,000",
  },

  // ---------- CAD ----------
  "courses/autocad": {
    tagline: "2D drafting and 3D modelling for civil, mechanical and architectural work",
    demand:
      "Jalandhar's hand tool, agri-implement and construction firms all need drafting skills in-house.",
    careers: ["CAD Draftsman", "Design Engineer", "Civil Draftsman", "Mechanical Designer"],
    topics: [
      "Interface, coordinates and drawing setup",
      "2D drafting and modify tools",
      "Layers, blocks and attributes",
      "Dimensioning and annotation standards",
      "Isometric and 3D modelling",
      "Rendering and visual styles",
      "Plotting, layouts and sheet sets",
      "Industry drawing conventions",
    ],
    tools: ["AutoCAD", "AutoCAD LT", "DWG TrueView", "Autodesk Viewer"],
    salary: "₹12,000 – ₹25,000",
  },
  "courses/solidworks": {
    tagline: "parametric 3D modelling and assemblies for mechanical product design",
    demand:
      "Manufacturing units across Punjab use SolidWorks for tooling, fixtures and product development.",
    careers: ["Design Engineer", "CAD Engineer", "Product Designer", "Mechanical Draftsman"],
    topics: [
      "Sketching and parametric modelling",
      "Part design and features",
      "Assemblies and mates",
      "Drawings and GD&T basics",
      "Sheet metal design",
      "Weldments and structures",
      "Surface modelling introduction",
      "Simulation and motion basics",
    ],
    tools: ["SolidWorks", "eDrawings", "SolidWorks Simulation"],
    salary: "₹14,000 – ₹28,000",
  },
  "courses/3ds-max": {
    tagline: "3D modelling, lighting and photoreal rendering for architecture and product visuals",
    demand:
      "Architects, builders and interior firms in Jalandhar need visualisation to sell before they build.",
    careers: ["3D Visualiser", "Architectural Renderer", "3D Modeller", "Interior Visualiser"],
    topics: [
      "Interface, modifiers and modelling",
      "Polygon and spline modelling",
      "Materials and UV mapping",
      "Lighting setups and daylight systems",
      "Camera composition",
      "V-Ray and Corona rendering",
      "Post-production in Photoshop",
      "Walkthrough animation basics",
    ],
    tools: ["3ds Max", "V-Ray", "Corona", "Photoshop", "AutoCAD"],
    salary: "₹14,000 – ₹28,000",
  },
  "courses/revit": {
    tagline: "building information modelling for architecture, structure and MEP coordination",
    demand:
      "BIM is becoming mandatory on larger projects, and Revit skills are still scarce in the region.",
    careers: ["BIM Modeller", "Architectural Technician", "Revit Draftsman", "MEP Coordinator"],
    topics: [
      "BIM concepts and Revit interface",
      "Walls, floors, roofs and stairs",
      "Families and parametric components",
      "Structural and MEP basics",
      "Views, sheets and documentation",
      "Schedules and quantity take-off",
      "Coordination and clash detection",
      "Rendering and presentation",
    ],
    tools: ["Revit", "Navisworks", "AutoCAD", "Enscape"],
    salary: "₹15,000 – ₹30,000",
  },
}

/** Falls back to a usable spec so no page is ever content-less. */
export const GENERIC_SPEC: CourseSpec = {
  tagline: "a job-oriented programme built around live projects rather than theory",
  demand:
    "Employers in Jalandhar, Mohali and Chandigarh consistently ask for demonstrable project work over certificates alone.",
  careers: ["Trainee Executive", "Junior Developer", "Analyst", "Freelance Consultant"],
  topics: [
    "Foundations and core concepts",
    "Hands-on tools and environment setup",
    "Practical techniques and workflows",
    "Working with real data and files",
    "Industry standards and best practice",
    "Live project build",
    "Testing, review and iteration",
    "Portfolio, CV and interview preparation",
  ],
  tools: ["Industry-standard toolchain", "Git", "VS Code"],
  salary: "₹15,000 – ₹28,000",
}
