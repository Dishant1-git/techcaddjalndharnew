/**
 * Content for /college-partnerships.
 *
 * Note what is deliberately NOT here: a list of named partner institutions.
 * Naming a college as a partner is a public claim about a real organisation,
 * and inventing one for placeholder copy would put a false statement on a live
 * marketing site. The page describes the programme instead, and the roster is
 * left for the team to add once the agreements are confirmed.
 */

export type Offering = {
  title: string
  body: string
  icon: "workshop" | "training" | "placement" | "faculty" | "lab" | "certificate"
}

export const OFFERINGS: Offering[] = [
  {
    icon: "workshop",
    title: "Campus Workshops",
    body: "Hands-on sessions on AI, robotics, cyber security and emerging tools, run at your campus and sized to a single department or a whole year group.",
  },
  {
    icon: "training",
    title: "Industrial Training",
    body: "45-day, 6-week and 6-month programmes mapped to university training requirements, so a batch completes its mandated hours without a timetable clash.",
  },
  {
    icon: "placement",
    title: "Placement Drives",
    body: "Joint drives and pre-placement talks with the employers who recruit from us, hosted on your campus or at the Jalandhar centre.",
  },
  {
    icon: "faculty",
    title: "Faculty Development",
    body: "Short programmes that bring teaching staff up to date on the stacks their students will be interviewed on — cloud, data and modern web tooling.",
  },
  {
    icon: "lab",
    title: "Lab & Curriculum Support",
    body: "Help specifying a teaching lab and aligning elective content with what hiring managers currently ask for, rather than what the syllabus was written against.",
  },
  {
    icon: "certificate",
    title: "Certification",
    body: "Completion certificates and internship letters issued in the format your university requires, for every student who finishes a programme.",
  },
]

export type Step = { title: string; body: string }

export const PROCESS: Step[] = [
  {
    title: "Introductory call",
    body: "A short conversation about your departments, student numbers and where the gap between syllabus and industry is widest.",
  },
  {
    title: "Proposal",
    body: "A written plan covering scope, duration, delivery mode and cost — nothing starts on a handshake.",
  },
  {
    title: "Pilot batch",
    body: "One cohort or one workshop first, so both sides can judge the fit before committing to a longer arrangement.",
  },
  {
    title: "Ongoing programme",
    body: "A rolling schedule across semesters, with placement activity attached to the students who complete it.",
  },
]

/**
 * TODO: placeholder figures. Replace with numbers the team can evidence — these
 * are the sort of claims a prospective partner will check.
 */
export const PARTNERSHIP_STATS = [
  { value: "2016", label: "Working with institutions since" },
  { value: "10,000+", label: "Students trained" },
  { value: "50+", label: "Courses and tracks" },
  { value: "6", label: "Partnership formats" },
]
