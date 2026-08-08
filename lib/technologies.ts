import {
  siAngular, siAnsible, siAnsys, siAnthropic, siApachecassandra,
  siAutocad, siAutodesk, siAutodeskmaya, siAutodeskrevit, siBlender, siBootstrap,
  siC, siCloudflare, siCplusplus, siDassaultsystemes, siDigitalocean, siDjango,
  siDocker, siDotnet, siElasticsearch, siExpress, siFirebase, siFlutter,
  siFreecad, siGit, siGithub, siGithubactions, siGitlab, siGo, siGooglecloud,
  siGrafana, siHuggingface, siJavascript, siJenkins, siJupyter, siKeras,
  siKotlin, siKubernetes, siLangchain, siLaravel, siLinux, siMariadb, siMongodb,
  siMysql, siNeo4j, siNetlify, siNextdotjs, siNginx, siNodedotjs, siNumpy,
  siOpencv, siOpenjdk, siOpenstack, siPandas, siPhp, siPostgresql, siPrisma,
  siPrometheus, siPython, siPytorch, siR, siReact, siRedis, siRhinoceros,
  siRuby, siRust,
  siScikitlearn, siSiemens, siSketchup, siSpring, siSqlite, siSupabase,
  siSwift, siTailwindcss, siTensorflow, siTerraform, siTypescript, siVercel,
  siVuedotjs,
} from "simple-icons"

export type Tech = {
  name: string
  /** SVG path data — present when simple-icons ships the mark. */
  path?: string
  /** Brand colour, without the leading '#'. */
  hex: string
  /** 2–3 letter fallback for brands simple-icons omits (trademark policy). */
  mono?: string
}

type Icon = { path: string; hex: string }

/** Adapts a simple-icons entry, letting us override the display name. */
const ico = (icon: Icon, name: string): Tech => ({
  name,
  path: icon.path,
  hex: icon.hex,
})

/** Hand-built chip for marks simple-icons does not distribute. */
const mono = (name: string, mono: string, hex: string): Tech => ({
  name,
  mono,
  hex,
})

export type Category = {
  id: string
  label: string
  /** Exactly 13 — 8 on the outer ring, 5 on the inner. */
  items: Tech[]
}

export const TECH_CATEGORIES: Category[] = [
  {
    id: "programming",
    label: "Programming",
    items: [
      ico(siPython, "Python"),
      ico(siOpenjdk, "Java"),
      ico(siJavascript, "JavaScript"),
      ico(siTypescript, "TypeScript"),
      ico(siCplusplus, "C++"),
      ico(siC, "C"),
      ico(siPhp, "PHP"),
      ico(siKotlin, "Kotlin"),
      ico(siGo, "Go"),
      ico(siSwift, "Swift"),
      ico(siRuby, "Ruby"),
      ico(siR, "R"),
      ico(siRust, "Rust"),
    ],
  },
  {
    id: "frameworks",
    label: "Frameworks",
    items: [
      ico(siReact, "React"),
      ico(siNextdotjs, "Next.js"),
      ico(siAngular, "Angular"),
      ico(siVuedotjs, "Vue"),
      ico(siNodedotjs, "Node.js"),
      ico(siExpress, "Express"),
      ico(siDjango, "Django"),
      ico(siLaravel, "Laravel"),
      ico(siSpring, "Spring"),
      ico(siDotnet, ".NET"),
      ico(siFlutter, "Flutter"),
      ico(siBootstrap, "Bootstrap"),
      ico(siTailwindcss, "Tailwind CSS"),
    ],
  },
  {
    id: "ai-ml",
    label: "AI & ML",
    items: [
      ico(siTensorflow, "TensorFlow"),
      ico(siPytorch, "PyTorch"),
      ico(siKeras, "Keras"),
      ico(siScikitlearn, "scikit-learn"),
      ico(siPandas, "Pandas"),
      ico(siNumpy, "NumPy"),
      ico(siJupyter, "Jupyter"),
      ico(siHuggingface, "Hugging Face"),
      ico(siOpencv, "OpenCV"),
      ico(siLangchain, "LangChain"),
      ico(siAnthropic, "Anthropic"),
      mono("Power BI", "BI", "F2C811"),
      mono("Tableau", "Tb", "E97627"),
    ],
  },
  {
    id: "cad-cam",
    label: "CAD / CAM",
    items: [
      ico(siAutocad, "AutoCAD"),
      ico(siAutodesk, "Autodesk"),
      ico(siAutodeskrevit, "Revit"),
      ico(siAutodeskmaya, "Maya"),
      ico(siAnsys, "ANSYS"),
      ico(siBlender, "Blender"),
      ico(siSketchup, "SketchUp"),
      ico(siRhinoceros, "Rhino"),
      ico(siFreecad, "FreeCAD"),
      ico(siSiemens, "Siemens NX"),
      ico(siDassaultsystemes, "Dassault"),
      mono("SolidWorks", "SW", "D6001C"),
      mono("CATIA", "CT", "005386"),
    ],
  },
  {
    id: "databases",
    label: "Databases",
    items: [
      ico(siMysql, "MySQL"),
      ico(siPostgresql, "PostgreSQL"),
      ico(siMongodb, "MongoDB"),
      ico(siRedis, "Redis"),
      ico(siSqlite, "SQLite"),
      ico(siFirebase, "Firebase"),
      ico(siSupabase, "Supabase"),
      ico(siElasticsearch, "Elasticsearch"),
      ico(siMariadb, "MariaDB"),
      ico(siApachecassandra, "Cassandra"),
      ico(siNeo4j, "Neo4j"),
      ico(siPrisma, "Prisma"),
      mono("Oracle", "OR", "C74634"),
    ],
  },
  {
    id: "devops",
    label: "DevOps",
    items: [
      ico(siDocker, "Docker"),
      ico(siKubernetes, "Kubernetes"),
      ico(siJenkins, "Jenkins"),
      ico(siGit, "Git"),
      ico(siGithub, "GitHub"),
      ico(siGitlab, "GitLab"),
      ico(siAnsible, "Ansible"),
      ico(siTerraform, "Terraform"),
      ico(siGrafana, "Grafana"),
      ico(siPrometheus, "Prometheus"),
      ico(siLinux, "Linux"),
      ico(siNginx, "NGINX"),
      ico(siGithubactions, "GitHub Actions"),
    ],
  },
  {
    id: "cloud",
    label: "Cloud",
    items: [
      mono("Amazon Web Services", "AWS", "FF9900"),
      mono("Microsoft Azure", "Az", "0078D4"),
      ico(siGooglecloud, "Google Cloud"),
      ico(siVercel, "Vercel"),
      ico(siNetlify, "Netlify"),
      ico(siCloudflare, "Cloudflare"),
      ico(siDigitalocean, "DigitalOcean"),
      ico(siOpenstack, "OpenStack"),
      ico(siDocker, "Docker"),
      ico(siKubernetes, "Kubernetes"),
      ico(siTerraform, "Terraform"),
      ico(siFirebase, "Firebase"),
      ico(siSupabase, "Supabase"),
    ],
  },
]
