import {
  siAnsible, siAngular, siAnthropic, siApacheairflow, siApachekafka,
  siApachespark, siBurpsuite, siCss, siDatabricks, siDjango, siDocker, siElasticsearch,
  siExpress, siFigma, siGit, siGithubactions, siGoogleads, siGoogleanalytics,
  siGooglecloud, siGooglesearchconsole, siGrafana, siHtml5, siHuggingface,
  siJenkins, siJupyter, siKalilinux, siKeras, siKubernetes, siLangchain,
  siLaravel, siLinux, siMailchimp, siMetasploit, siMongodb, siMysql, siNextdotjs,
  siNginx, siNodedotjs, siNumpy, siOpencv, siOwasp, siPandas, siPlotly,
  siPostgresql, siPrometheus, siPython, siPytorch, siReact, siRedis,
  siScikitlearn, siSass, siSemrush, siShopify, siSnowflake, siStreamlit,
  siTailwindcss, siTensorflow, siTerraform, siTypescript, siVuedotjs,
  siWireshark, siWordpress,
} from "simple-icons"
import type { Tech } from "./technologies"

type Icon = { path: string; hex: string }

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

export type Capability = {
  id: string
  label: string
  /** Shown above the grid while this capability is selected. */
  blurb: string
  items: Tech[]
}

/**
 * What techcadd builds and teaches, each backed by the stack it is actually
 * delivered on. The blurbs carry the copy the old capabilities list used.
 */
export const CAPABILITIES: Capability[] = [
  {
    id: "ai-ml",
    label: "AI & Machine Learning",
    blurb:
      "Models, agents and data pipelines built for production, not for the demo.",
    items: [
      ico(siTensorflow, "TensorFlow"),
      ico(siPytorch, "PyTorch"),
      ico(siKeras, "Keras"),
      ico(siScikitlearn, "scikit-learn"),
      ico(siHuggingface, "Hugging Face"),
      ico(siLangchain, "LangChain"),
      ico(siAnthropic, "Anthropic"),
      ico(siOpencv, "OpenCV"),
      ico(siPandas, "Pandas"),
      ico(siNumpy, "NumPy"),
      ico(siJupyter, "Jupyter"),
      ico(siStreamlit, "Streamlit"),
    ],
  },
  {
    id: "full-stack",
    label: "Full-Stack Engineering",
    blurb:
      "MERN, MEAN and PHP stacks delivered end to end, from schema to deploy.",
    items: [
      ico(siReact, "React"),
      ico(siNextdotjs, "Next.js"),
      ico(siAngular, "Angular"),
      ico(siVuedotjs, "Vue"),
      ico(siNodedotjs, "Node.js"),
      ico(siExpress, "Express"),
      ico(siDjango, "Django"),
      ico(siLaravel, "Laravel"),
      ico(siTypescript, "TypeScript"),
      ico(siTailwindcss, "Tailwind CSS"),
      ico(siHtml5, "HTML5"),
      ico(siSass, "Sass"),
    ],
  },
  {
    id: "data",
    label: "Data & Analytics",
    blurb:
      "Warehouses, streaming pipelines and dashboards that decision-makers actually open.",
    items: [
      ico(siPostgresql, "PostgreSQL"),
      ico(siMongodb, "MongoDB"),
      ico(siMysql, "MySQL"),
      ico(siRedis, "Redis"),
      ico(siElasticsearch, "Elasticsearch"),
      ico(siSnowflake, "Snowflake"),
      ico(siDatabricks, "Databricks"),
      ico(siApachespark, "Apache Spark"),
      ico(siApachekafka, "Kafka"),
      ico(siApacheairflow, "Airflow"),
      ico(siPlotly, "Plotly"),
      mono("Power BI", "BI", "F2C811"),
    ],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    blurb:
      "Hardened infrastructure, automated delivery and cloud migration you can hand over.",
    items: [
      mono("Amazon Web Services", "AWS", "FF9900"),
      mono("Microsoft Azure", "Az", "0078D4"),
      ico(siGooglecloud, "Google Cloud"),
      ico(siDocker, "Docker"),
      ico(siKubernetes, "Kubernetes"),
      ico(siTerraform, "Terraform"),
      ico(siAnsible, "Ansible"),
      ico(siJenkins, "Jenkins"),
      ico(siGithubactions, "GitHub Actions"),
      ico(siNginx, "NGINX"),
      ico(siGrafana, "Grafana"),
      ico(siPrometheus, "Prometheus"),
    ],
  },
  {
    id: "security",
    label: "Cybersecurity",
    blurb:
      "Ethical-hacking audits, hardening and incident response, taught on the real toolchain.",
    items: [
      ico(siKalilinux, "Kali Linux"),
      ico(siMetasploit, "Metasploit"),
      ico(siWireshark, "Wireshark"),
      ico(siOwasp, "OWASP"),
      ico(siLinux, "Linux"),
      ico(siPython, "Python"),
      ico(siDocker, "Docker"),
      ico(siGit, "Git"),
      ico(siBurpsuite, "Burp Suite"),
      mono("Nmap", "Nm", "4682B4"),
    ],
  },
  {
    id: "marketing",
    label: "Digital Marketing",
    blurb:
      "Search, paid media and storefronts — measured, not guessed at.",
    items: [
      ico(siWordpress, "WordPress"),
      ico(siShopify, "Shopify"),
      ico(siGoogleads, "Google Ads"),
      ico(siGoogleanalytics, "Analytics"),
      ico(siGooglesearchconsole, "Search Console"),
      ico(siSemrush, "Semrush"),
      ico(siMailchimp, "Mailchimp"),
      ico(siFigma, "Figma"),
      ico(siCss, "CSS"),
      mono("Meta Ads", "Me", "0866FF"),
    ],
  },
]
