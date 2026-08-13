/**
 * Questions the Jalandhar centre actually fields on the phone — admissions,
 * batches, placement and certification. Order matters: the first entry opens
 * by default, so it should be the one most people ask.
 */

export type FaqCategory =
  | "Admissions"
  | "Courses & Batches"
  | "Fees"
  | "Placement"
  | "Certification"

export type Faq = {
  question: string
  answer: string
  /** Groups the question on /faq. The homepage ignores it. */
  category: FaqCategory
}

/** The order the /faq page renders its sections in. */
export const FAQ_CATEGORIES: FaqCategory[] = [
  "Admissions",
  "Courses & Batches",
  "Fees",
  "Placement",
  "Certification",
]

export const FAQS: Faq[] = [
  {
    question: "Do you provide placement assistance after the course?",
    answer:
      "Yes. Every full-length programme includes our placement cell — resume and portfolio reviews, mock interviews, and direct referrals to hiring partners across Jalandhar, Mohali and the wider Tricity. Support continues until you are placed.",
    category: "Placement",
  },
  {
    question: "Can I join without any programming background?",
    answer:
      "Absolutely. Most of our students start from zero. Courses begin with fundamentals and move to project work at a pace set by the batch, so a non-technical degree or a gap after 12th is never a barrier.",
    category: "Admissions",
  },
  {
    question: "Are the internships certified, and how long do they run?",
    answer:
      "We run 45-day, 6-week and 6-month industrial training programmes, each ending with an ISO-certified completion certificate and a live project you can show in interviews. Durations are chosen to match university training requirements.",
    category: "Certification",
  },
  {
    question: "Are classes offline, online, or both?",
    answer:
      "Both. You can attend at the Jalandhar campus, join the same batch live online, or switch between the two. Recordings and lab access stay available through your student login for the full duration of the course.",
    category: "Courses & Batches",
  },
  {
    question: "What are the fees, and can they be paid in instalments?",
    answer:
      "Fees vary by programme and duration. Instalment plans are available on every course, and scholarships apply for students enrolling in a combined training-plus-internship track. Talk to our team for a written breakdown.",
    category: "Fees",
  },
  {
    question: "Do you offer training for colleges or corporate teams?",
    answer:
      "Yes. We deliver customised batches for colleges, universities and corporate teams — on your campus or ours — with a syllabus mapped to your curriculum or your team's current stack.",
    category: "Courses & Batches",
  },

  /* Everything below appears only on /faq — the homepage shows the first six.
     TODO: placeholder answers written to plausible policy. Have the admissions
     team confirm the fee, refund and batch-transfer wording before publishing,
     since visitors will treat these as commitments. */
  {
    question: "What documents do I need to enrol?",
    answer:
      "A photo ID, your most recent marksheet and two passport photographs are enough to register. College students taking mandated training should also bring the letter or format their university has issued.",
    category: "Admissions",
  },
  {
    question: "When do new batches start?",
    answer:
      "New batches open every month across most courses, with additional summer and winter intakes for short-term training. Call the centre for the next start date on a specific track — popular batches fill before the listed date.",
    category: "Admissions",
  },
  {
    question: "What is the batch size?",
    answer:
      "Classroom batches are kept small enough that every student gets lab time and individual attention during practical sessions. Ask about the current size for your track when you enquire.",
    category: "Courses & Batches",
  },
  {
    question: "Can I switch to another course or batch timing after joining?",
    answer:
      "Timing changes are usually straightforward, subject to seats in the batch you want. Switching to a different course is handled case by case, and is easiest in the opening weeks before the syllabuses diverge.",
    category: "Courses & Batches",
  },
  {
    question: "Do you have a refund policy?",
    answer:
      "Refund terms depend on the programme and how far into it you are, and are set out in the enrolment form you sign. Ask for them in writing before you pay so there is no ambiguity later.",
    category: "Fees",
  },
  {
    question: "Are there scholarships or discounts?",
    answer:
      "Scholarships apply to combined training-plus-internship tracks, and group enrolments from the same college are eligible for a reduced rate. Both are confirmed at counselling rather than applied automatically.",
    category: "Fees",
  },
  {
    question: "Do you guarantee a job at the end of the course?",
    answer:
      "No, and be cautious of anyone who does. What we commit to is preparation and access: portfolio and interview readiness, and referrals to the hiring partners who recruit from us. The offer itself is between you and the employer.",
    category: "Placement",
  },
  {
    question: "Which companies hire from Techcadd?",
    answer:
      "Our placement cell works with IT services firms, product startups and design studios across Jalandhar, Mohali and the Tricity, and hosts campus drives during the placement season. Ask for the current list when you visit.",
    category: "Placement",
  },
  {
    question: "Is the certificate recognised by employers?",
    answer:
      "Certificates are issued on completion of a programme and its project work, and are accepted for university training requirements. What carries weight in an interview is the project you built alongside it, which is why every track ends with one.",
    category: "Certification",
  },
  {
    question: "Will I get an internship letter for my university file?",
    answer:
      "Yes. Industrial training and internship programmes come with a completion certificate and a letter in the format most universities ask for. Bring your college's required format if it differs and we will match it.",
    category: "Certification",
  },
]

/** The homepage band shows the six most-asked; /faq shows everything. */
export const HOMEPAGE_FAQS = FAQS.slice(0, 6)
