export type StaticGalleryItem = {
  image: string;
  title?: string;
  caption?: string;
  year?: number;
};

// 8 distinct, authentic showcase captures for the 3D rotating cylinder on the landing page
export const GALLERY: StaticGalleryItem[] = [
  {
    "image": "/images/gallery/gallery_107ae5e9b38d.jpg",
    "title": "Participant Registration & Badge Verification",
    "year": 2025,
    "caption": "Student coordinators verifying team credentials, rosters, and issuing official hacker badges at the registration desk."
  },
  {
    "image": "/images/gallery/gallery_281f8433ca16.jpg",
    "title": "Grand Prize Cheque & Champion Honors",
    "year": 2025,
    "caption": "Champion team receiving the grand winner cash prize cheque and trophies from faculty leadership and sponsors."
  },
  {
    "image": "/images/gallery/gallery_3810d0fc668a.jpg",
    "title": "Inaugural Auditorium Assembly",
    "year": 2025,
    "caption": "Hundreds of participants gathered in the main auditorium during the opening ceremony as challenge tracks were revealed."
  },
  {
    "image": "/images/gallery/gallery_422ed1dfbc9a.jpg",
    "title": "Expert Faculty Mentorship Round",
    "year": 2025,
    "caption": "Senior professor and technical mentor leaning over the workstation to evaluate team architecture and give tactical advice."
  },
  {
    "image": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(10).jpeg",
    "title": "Euphoric Victory Celebration & Cheers",
    "year": 2025,
    "caption": "Participants and volunteers celebrating with raised hands, pure joy, and infectious enthusiasm after hitting their goal."
  },
  {
    "image": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(3).jpeg",
    "title": "Illuminated Wishing Tree & Light Ceremony",
    "year": 2025,
    "caption": "The ceremonial illuminated tree glowing with warm fairy lights and participant wish tags during the evening celebrations."
  },
  {
    "image": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(9).jpeg",
    "title": "Traditional Cultural Fire Performance",
    "year": 2025,
    "caption": "Electrifying cultural folk performance featuring traditional costume and roaring fire torches to re-energize hackers."
  },
  {
    "image": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.33%20AM%20(5).jpeg",
    "title": "Traditional Lamp Lighting Ceremony",
    "year": 2025,
    "caption": "Dignitaries, principal, and department heads lighting the auspicious traditional brass lamp to inaugurate HackMITTEN."
  }
];

export function resolveGalleryItems() {
  return GALLERY.map((item, index) => ({
    id: `static-gallery-${index}`,
    title: item.title ?? `Archive ${String(index + 1).padStart(2, "0")}`,
    caption: item.caption ?? null,
    imageUrl: item.image,
    year: item.year ? String(item.year) : "",
  }));
}

export type GalleryArchiveItem = {
  id: string;
  title: string;
  category: "all" | "sprints" | "mentorship" | "ceremony" | "teams";
  edition: "HackMITTEN 2.0" | "HackMITTEN 1.0";
  year: number;
  imageUrl: string;
  location: string;
  description: string;
  highlight?: string;
  badge: string;
};

// 40 authentic captures from the gallery folder with accurate titles, categories, and descriptions
export const GALLERY_ARCHIVE: GalleryArchiveItem[] = [
  {
    "id": "g-01",
    "title": "Participant Registration & Badge Verification",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/gallery_107ae5e9b38d.jpg",
    "location": "Registration Counter - Panel 3",
    "description": "Student coordinators verifying team credentials, rosters, and issuing official hacker badges at the registration desk.",
    "highlight": "Roster Verification",
    "badge": "REGISTRATION"
  },
  {
    "id": "g-02",
    "title": "Grand Prize Cheque & Champion Honors",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/gallery_281f8433ca16.jpg",
    "location": "Main Auditorium Dais",
    "description": "Champion team receiving the grand winner cash prize cheque and trophies from faculty leadership and sponsors.",
    "highlight": "₹25,000 Grand Prize",
    "badge": "CHAMPIONS"
  },
  {
    "id": "g-03",
    "title": "Inaugural Auditorium Assembly",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/gallery_3810d0fc668a.jpg",
    "location": "Central Auditorium",
    "description": "Hundreds of participants gathered in the main auditorium during the opening ceremony as challenge tracks were revealed.",
    "highlight": "Opening Ceremony",
    "badge": "INAUGURATION"
  },
  {
    "id": "g-04",
    "title": "Expert Faculty Mentorship Round",
    "category": "mentorship",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/gallery_422ed1dfbc9a.jpg",
    "location": "Computing Complex - Bay A",
    "description": "Senior professor and technical mentor leaning over the workstation to evaluate team architecture and give tactical advice.",
    "highlight": "Architecture Guidance",
    "badge": "MENTORING"
  },
  {
    "id": "g-05",
    "title": "24-Hour Non-Stop Hacking Arena",
    "category": "sprints",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/gallery_5aa13a42a978.jpg",
    "location": "Central Computer Center",
    "description": "Packed lab of builders and software engineers deep in code, racing against the 24-hour countdown clock.",
    "highlight": "Non-Stop Sprint",
    "badge": "HACKING BAY"
  },
  {
    "id": "g-06",
    "title": "Team Workspace & Sprint Huddle",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/gallery_84b51ffab12f.jpg",
    "location": "Innovation Hall - Table 14",
    "description": "Team members taking a brief pause at their dedicated hackathon table before finalizing their morning deliverables.",
    "highlight": "Team Coordination",
    "badge": "HACKER STATION"
  },
  {
    "id": "g-07",
    "title": "Prototype Demo & Mentor Q&A",
    "category": "mentorship",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/gallery_987aaa4de3f3.jpg",
    "location": "Review Station Beta",
    "description": "Developers walking through their functional demo and answering technical questions from evaluators.",
    "highlight": "Interactive Demo",
    "badge": "DEMO REVIEW"
  },
  {
    "id": "g-08",
    "title": "Stage Felicitations & Dignitary Gathering",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/gallery_a4fb0dba489f.jpg",
    "location": "Grand Stage",
    "description": "Department heads, organizers, and guests on stage honoring contributors and partners during the formal proceedings.",
    "highlight": "Dignitary Honors",
    "badge": "CEREMONY"
  },
  {
    "id": "g-09",
    "title": "Deep Focus Sprint Session",
    "category": "sprints",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.30%20AM.jpeg",
    "location": "Hacking Cluster 04",
    "description": "Hackers in intense concentration, writing code and debugging frontend interfaces under the pressure of the deadline.",
    "highlight": "Deep Focus",
    "badge": "DEEP CODING"
  },
  {
    "id": "g-10",
    "title": "Daytime Lab Development Sprint",
    "category": "sprints",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.31%20AM.jpeg",
    "location": "CS&E Computing Complex",
    "description": "Sunlit computing lab with dozens of developer teams collaborating on system builds and algorithm implementation.",
    "highlight": "Daytime Rush",
    "badge": "SPRINT ARENA"
  },
  {
    "id": "g-11",
    "title": "Paper Prototyping & Flowcharting",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(1).jpeg",
    "location": "Design Thinking Bay",
    "description": "Team members mapping out user journey flows, entity schemas, and prototype wireframes on chart paper.",
    "highlight": "UI Wireframing",
    "badge": "WIREFRAMING"
  },
  {
    "id": "g-12",
    "title": "Euphoric Victory Celebration & Cheers",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(10).jpeg",
    "location": "Main Corridor",
    "description": "Participants and volunteers celebrating with raised hands, pure joy, and infectious enthusiasm after hitting their goal.",
    "highlight": "High Spirits",
    "badge": "CELEBRATION"
  },
  {
    "id": "g-13",
    "title": "Nighttime Campus Amphitheater Debrief",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(11).jpeg",
    "location": "Campus Amphitheater Steps",
    "description": "Nighttime debrief on the campus steps where student coordinators and participants unwind and plan the overnight sprint.",
    "highlight": "Night Debrief",
    "badge": "CAMPUS HUDDLE"
  },
  {
    "id": "g-14",
    "title": "UI Walkthrough & Team Alignment",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(12).jpeg",
    "location": "Terminal Station 08",
    "description": "Teammates gathered around a display discussing UI interactions and reviewing front-end styling alignment.",
    "highlight": "UI Alignment",
    "badge": "TEAM HUDDLE"
  },
  {
    "id": "g-15",
    "title": "Faculty Leadership & VIP Lab Inspection",
    "category": "mentorship",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(13).jpeg",
    "location": "Central Lab Corridor",
    "description": "Department heads, senior professors, and institutional leaders conducting inspection walkthroughs across hacking bays.",
    "highlight": "Leadership Tour",
    "badge": "FACULTY TOUR"
  },
  {
    "id": "g-16",
    "title": "Pair Programming & Code Review",
    "category": "sprints",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(14).jpeg",
    "location": "Computing Bay C",
    "description": "Developers collaborating closely on a single machine, reviewing git branches and squashing elusive bugs.",
    "highlight": "Pair Coding",
    "badge": "PAIR CODING"
  },
  {
    "id": "g-17",
    "title": "Workstation Setup & Systems Check",
    "category": "sprints",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(15).jpeg",
    "location": "Computing Lab Delta",
    "description": "Engineers configuring developer environments, testing multi-monitor setups, and verifying local dev servers.",
    "highlight": "Dev Environment",
    "badge": "SYSTEMS CHECK"
  },
  {
    "id": "g-18",
    "title": "Architectural Chart Presentation to Judges",
    "category": "mentorship",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(16).jpeg",
    "location": "Evaluation Room 1",
    "description": "Team presenting architectural charts and system workflows to seated judges during mid-evaluation rounds.",
    "highlight": "Chart Review",
    "badge": "EVALUATION"
  },
  {
    "id": "g-19",
    "title": "Problem Statement Pitch & Slide Deck",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(17).jpeg",
    "location": "Seminar Hall 2",
    "description": "Student presenter walking the evaluation committee through problem statement breakdown on the projection screen.",
    "highlight": "Slide Presentation",
    "badge": "PITCH DECK"
  },
  {
    "id": "g-20",
    "title": "Technical Defense & Judge Q&A",
    "category": "mentorship",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(18).jpeg",
    "location": "Review Desk Gamma",
    "description": "Team defending technical architecture, API choices, and feasibility in a rigorous Q&A session with the evaluator.",
    "highlight": "Technical Defense",
    "badge": "JUDGE DEFENSE"
  },
  {
    "id": "g-21",
    "title": "Final Deployment Sanity Check",
    "category": "sprints",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(19).jpeg",
    "location": "Sprint Bay Omega",
    "description": "Final check of Docker builds, cloud endpoints, and database connection strings minutes before code freeze.",
    "highlight": "Pre-Flight Check",
    "badge": "DEPLOY CHECK"
  },
  {
    "id": "g-22",
    "title": "Faculty Diagram Inspection & Advice",
    "category": "mentorship",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(2).jpeg",
    "location": "Department Innovation Bay",
    "description": "Faculty mentor inspecting data flow diagrams on chart paper and providing optimization pointers.",
    "highlight": "Flowchart Audit",
    "badge": "MENTOR AUDIT"
  },
  {
    "id": "g-23",
    "title": "Student Organizing Committee in Uniform",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(20).jpeg",
    "location": "Operations Headquarters",
    "description": "The core student committee and volunteer leads in black HackMITTEN t-shirts managing seamless event operations.",
    "highlight": "Event Crew",
    "badge": "ORGANIZERS"
  },
  {
    "id": "g-24",
    "title": "Sprint Problem Solving & Collaboration",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(21).jpeg",
    "location": "Hacking Bay Theta",
    "description": "Developers collaborating on algorithms and feature integration as the clock ticks down.",
    "highlight": "Sprint Synergy",
    "badge": "TEAMWORK"
  },
  {
    "id": "g-25",
    "title": "Illuminated Wishing Tree & Light Ceremony",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(3).jpeg",
    "location": "Central Atrium Installation",
    "description": "The ceremonial illuminated tree glowing with warm fairy lights and participant wish tags during the evening celebrations.",
    "highlight": "Light Ceremony",
    "badge": "LIGHT CEREMONY"
  },
  {
    "id": "g-26",
    "title": "Wish Tags & Glowing Fairy Lights",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(4).jpeg",
    "location": "Light Installation Center",
    "description": "Close-up of vibrant wish cards and glowing light strands tied to the ceremonial tree by hackathon participants.",
    "highlight": "Participant Wishes",
    "badge": "WISH TREE"
  },
  {
    "id": "g-27",
    "title": "Hanging Wishes on the Light Tree",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(5).jpeg",
    "location": "Physics Wing Corridor",
    "description": "A hacker carefully tying their handwritten aspiration and wish tag onto the branches of the glowing light tree.",
    "highlight": "Ceremonial Ritual",
    "badge": "LIGHT CEREMONY"
  },
  {
    "id": "g-28",
    "title": "Joyful Moments by the Light Tree",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(6).jpeg",
    "location": "Light Installation Atrium",
    "description": "Students smiling and celebrating their hackathon journey beside the illuminated tree of wishes.",
    "highlight": "Shared Smiles",
    "badge": "LIGHT CEREMONY"
  },
  {
    "id": "g-29",
    "title": "Capturing the Illuminated Tree",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(7).jpeg",
    "location": "Night Installation Hall",
    "description": "Hackers photographing each other through the glowing fairy light strands and hanging message tags.",
    "highlight": "Keepsake Photo",
    "badge": "PHOTO MOMENT"
  },
  {
    "id": "g-30",
    "title": "Organizers Group Portrait at the Tree",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(8).jpeg",
    "location": "Main Foyer Installation",
    "description": "Volunteer crew and student leads posing proudly in front of the illuminated tree they constructed for the event.",
    "highlight": "Crew Portrait",
    "badge": "CREW PORTRAIT"
  },
  {
    "id": "g-31",
    "title": "Traditional Cultural Fire Performance",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM%20(9).jpeg",
    "location": "Outdoor Cultural Deck",
    "description": "Electrifying cultural folk performance featuring traditional costume and roaring fire torches to re-energize hackers.",
    "highlight": "Folk Fire Dance",
    "badge": "CULTURAL NIGHT"
  },
  {
    "id": "g-32",
    "title": "Strategic Problem Breakdown & Notes",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.32%20AM.jpeg",
    "location": "Sprint Bay 02",
    "description": "Developers collaborating on paper, refining logical constraints and drafting backend data relationships.",
    "highlight": "Problem Analysis",
    "badge": "BRAINSTORMING"
  },
  {
    "id": "g-33",
    "title": "Campus Library Hacking Arena",
    "category": "sprints",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.33%20AM%20(1).jpeg",
    "location": "Department Reference Library",
    "description": "The campus library transformed into an active development space where dozens of teams code between book stacks.",
    "highlight": "Library Arena",
    "badge": "LIBRARY SPRINT"
  },
  {
    "id": "g-34",
    "title": "Window Bay Coding Collaboration",
    "category": "sprints",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.33%20AM%20(3).jpeg",
    "location": "West Wing Window Bay",
    "description": "Team members immersed in laptop screens, debugging errors and coordinating task distribution.",
    "highlight": "Daytime Huddle",
    "badge": "TEAM HUDDLE"
  },
  {
    "id": "g-35",
    "title": "Operations & Hospitality Volunteers",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.33%20AM%20(4).jpeg",
    "location": "Hospitality Control Station",
    "description": "Student logistics coordinators ensuring round-the-clock water, snacks, technical support, and medical assistance.",
    "highlight": "Hospitality Crew",
    "badge": "SUPPORT CREW"
  },
  {
    "id": "g-36",
    "title": "Traditional Lamp Lighting Ceremony",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.33%20AM%20(5).jpeg",
    "location": "Main Stage Dais",
    "description": "Dignitaries, principal, and department heads lighting the auspicious traditional brass lamp to inaugurate HackMITTEN.",
    "highlight": "Deepa Prajwalana",
    "badge": "LAMP LIGHTING"
  },
  {
    "id": "g-37",
    "title": "Inaugural Keynote Address at the Dais",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.33%20AM%20(6).jpeg",
    "location": "Auditorium Podium",
    "description": "Student anchor and dignitary delivering the welcome address and laying out the national hackathon vision.",
    "highlight": "Keynote Address",
    "badge": "STAGE ADDRESS"
  },
  {
    "id": "g-38",
    "title": "Participant Team Camaraderie on Stage",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/WhatsApp%20Image%202026-10-15%20at%209.19.33%20AM.jpeg",
    "location": "Auditorium Stage Area",
    "description": "Students smiling, bonding, and reviewing their demo deliverables in front of the official HackMITTEN stage banner.",
    "highlight": "Team Camaraderie",
    "badge": "TEAM SMILES"
  },
  {
    "id": "g-39",
    "title": "Roundtable Assembly & Hacker Briefing",
    "category": "teams",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/gallery_assembly_banquet_hall.jpg",
    "location": "Main Banquet & Assembly Hall",
    "description": "Participants gathered at round banquet tables for event orientation, problem statement discussions, and team strategy sessions.",
    "highlight": "Full House Assembly",
    "badge": "ROUNDTABLE HUDDLE"
  },
  {
    "id": "g-40",
    "title": "HackMITTEN Laptop Photo Booth Keepsake",
    "category": "ceremony",
    "edition": "HackMITTEN 2.0",
    "year": 2025,
    "imageUrl": "/images/gallery/gallery_laptop_photobooth_frame.jpg",
    "location": "CSE Department Photo Booth",
    "description": "Participants celebrating and posing inside the custom MacBook cutout photobooth frame featuring the HackMITTEN 2.0 trophy cutout.",
    "highlight": "MacBook Photo Frame",
    "badge": "PHOTO BOOTH"
  }
];
