/**
 * Questions the Jalandhar centre actually fields on the phone — admissions,
 * batches, placement and certification. Order matters: the first entry opens
 * by default, so it should be the one most people ask.
 */

export type Faq = {
  question: string
  answer: string
}

export const FAQS: Faq[] = [
  {
    question: "Do you provide placement assistance after the course?",
    answer:
      "Yes. Every full-length programme includes our placement cell — resume and portfolio reviews, mock interviews, and direct referrals to hiring partners across Jalandhar, Mohali and the wider Tricity. Support continues until you are placed.",
  },
  {
    question: "Can I join without any programming background?",
    answer:
      "Absolutely. Most of our students start from zero. Courses begin with fundamentals and move to project work at a pace set by the batch, so a non-technical degree or a gap after 12th is never a barrier.",
  },
  {
    question: "Are the internships certified, and how long do they run?",
    answer:
      "We run 45-day, 6-week and 6-month industrial training programmes, each ending with an ISO-certified completion certificate and a live project you can show in interviews. Durations are chosen to match university training requirements.",
  },
  {
    question: "Are classes offline, online, or both?",
    answer:
      "Both. You can attend at the Jalandhar campus, join the same batch live online, or switch between the two. Recordings and lab access stay available through your student login for the full duration of the course.",
  },
  {
    question: "What are the fees, and can they be paid in instalments?",
    answer:
      "Fees vary by programme and duration. Instalment plans are available on every course, and scholarships apply for students enrolling in a combined training-plus-internship track. Talk to our team for a written breakdown.",
  },
  {
    question: "Do you offer training for colleges or corporate teams?",
    answer:
      "Yes. We deliver customised batches for colleges, universities and corporate teams — on your campus or ours — with a syllabus mapped to your curriculum or your team's current stack.",
  },
]
