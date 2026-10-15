export interface FAQItem {
  id: number;
  question: string;
  category: "general" | "teams" | "domains" | "logistics";
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    category: "general",
    question: "What is HackMITTEN 3.0?",
    answer:
      "HackMITTEN 3.0 is a 24-hour national-level hackathon organized by the Departments of Computer Science & Engineering (CS&E) and Computer Science & Engineering (AI & ML) at Maharaja Institute of Technology Thandavapura (MITT), in collaboration with VigyanLabs. The event challenges students to solve industry-relevant problem statements through creativity, collaboration, and rapid technical execution."
  },
  {
    id: 2,
    category: "teams",
    question: "Who is eligible to participate?",
    answer:
      "Students currently enrolled in Diploma, Undergraduate (UG), and Postgraduate (PG) programs from recognized educational institutions are eligible to participate. Inter-branch and inter-college team formations are permitted, provided all members belong to the same educational tier."
  },
  {
    id: 3,
    category: "teams",
    question: "Can students from different branches or colleges form a team?",
    answer:
      "Yes! Inter-branch and inter-college teams are permitted and encouraged. For instance, students from different departments or different institutions can collaborate, provided they all belong to the exact same educational level (e.g., all Diploma, all UG, or all PG)."
  },
  {
    id: 4,
    category: "teams",
    question: "Can Diploma, UG, and PG students form a team together?",
    answer:
      "No. Mixing students from different educational levels is strictly prohibited. Diploma teams must consist exclusively of Diploma students, UG teams exclusively of Undergraduate students, and PG teams exclusively of Postgraduate students to ensure fair evaluation."
  },
  {
    id: 5,
    category: "teams",
    question: "What is the required team size?",
    answer:
      "Each team must consist of 3 to 4 members. Solo participation or teams of 2 or more than 4 are not allowed."
  },
  {
    id: 6,
    category: "general",
    question: "What are the registration fees?",
    answer:
      "The registration fees are: Diploma Category: ₹500 per team; Undergraduate (UG) Category: ₹1,000 per team; Postgraduate (PG) Category: ₹1,000 per team. Registration covers full 24-hour event participation and access to facilities."
  },
  {
    id: 7,
    category: "general",
    question: "Are registration fees refundable?",
    answer:
      "No. In accordance with the official event policy, registration fees are strictly non-refundable once registration is completed."
  },
  {
    id: 8,
    category: "domains",
    question: "What domains are available for each category?",
    answer:
      "Diploma Category domains include: 1. Banking, 2. Agriculture, and 3. Healthcare. Undergraduate (UG) and Postgraduate (PG) Categories domains include: 1. Cybersecurity, 2. Cloud Computing, 3. AIOps, and 4. Enterprise ERP."
  },
  {
    id: 9,
    category: "domains",
    question: "When will the problem statements be released?",
    answer:
      "Problem statements will be officially unveiled on the day of the event during the opening ceremony. Teams will select their domain and begin work immediately once the countdown begins."
  },
  {
    id: 10,
    category: "general",
    question: "What is the total prize pool and additional benefits?",
    answer:
      "HackMITTEN 3.0 features an overall prize pool of ₹1,00,000! Additionally, winners receive direct internship opportunities with VigyanLabs and incubation support for the most viable prototypes."
  },
  {
    id: 11,
    category: "logistics",
    question: "Where will HackMITTEN 3.0 take place?",
    answer:
      "The event is hosted on campus at Maharaja Institute of Technology Thandavapura (MITT), Mysuru, Karnataka. Key operational venues include the Seminar Hall, Central Library, and the MCA Lab."
  },
  {
    id: 12,
    category: "logistics",
    question: "Will accommodation, food, and transportation be provided?",
    answer:
      "Official accommodation is arranged in association with Youth Hostel Mysuru at ₹250 per person (pre-booking is mandatory at least 5 days in advance). Food and refreshments are provided on campus during the 24-hour sprint. Full hostel address, booking instructions, and coordinator contacts are available on the Accommodation page."
  },
  {
    id: 13,
    category: "logistics",
    question: "What should participants bring to the event?",
    answer:
      "Participants must bring their personal laptops with chargers, multi-plug power extension cords, official college ID cards, mobile phones with personal hotspot data, comfortable hackathon attire, personal medications, and basic personal care items."
  }
];

export interface GearItem {
  id: string;
  name: string;
  category: "essential" | "personal";
  desc: string;
}

export const GEAR_ITEMS: GearItem[] = [
  { id: "laptop", name: "Laptop & Charger", category: "essential", desc: "Core workstation with dev environments pre-installed." },
  { id: "extcord", name: "Multi-Plug Extension Cord", category: "essential", desc: "Critical for shared team charging at workstations." },
  { id: "collegeid", name: "Official College ID Card", category: "essential", desc: "Mandatory for physical check-in and security clearance." },
  { id: "hotspot", name: "Mobile Hotspot & Cable", category: "essential", desc: "Secondary connectivity backup for team resilience." },
  { id: "softwares", name: "Pre-installed SDKs & IDEs", category: "essential", desc: "Docker, Node, Python, Git, and preferred databases ready." },
  { id: "clothes", name: "Comfortable Hackathon Attire", category: "personal", desc: "Breathable clothes for 24-hour endurance coding." },
  { id: "jacket", name: "Warm Jacket / Hoodie", category: "personal", desc: "Night-time temperature in air-conditioned labs can get chilly." },
  { id: "water", name: "Reusable Water Bottle", category: "personal", desc: "Campus hydration stations available throughout 24 hours." },
  { id: "meds", name: "Personal Medication & First Aid", category: "personal", desc: "Personal prescriptions or daily health requirements." },
  { id: "toiletries", name: "Refreshment Kit & Toiletries", category: "personal", desc: "Toothbrush, face wash, small towel for midnight refresh." }
];
