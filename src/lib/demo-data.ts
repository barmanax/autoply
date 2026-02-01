// Demo data based on Aditya Barman's resume

export const DEMO_RESUME_TEXT = `Aditya Barman
(848) 259-7203 | a02barman@gmail.com | linkedin.com/in/adityabarman/ | U.S. Citizen

EDUCATION
University of Illinois at Urbana-Champaign (UIUC) - Champaign, IL
Bachelor of Science in Computer Science & Statistics, Minor in Mathematics
Graduation: May 2028
- GPA: 4.0/4.0
- James Scholars Honors Program
- Activities: Pulse Competitions Committee, CS Sail Logistics Staff, Simplify Campus Ambassador

EXPERIENCE

Motorola Solutions - Chicago, IL
Software Engineering Intern & Co-Op | May 2025 – Nov. 2025
- Designed and deployed a full-stack RAG system using LangChain, ChromaDB, HuggingFace embeddings, and Gemini API, indexing 30k+ proprietary documents with vector storage and API integration to deliver structured knowledge retrieval inside Motorola's documentation platform for 350 systems engineers.
- Implemented ingestion pipelines with chunking, embeddings, and access controls, improving initial retrieval precision by over 40% and boosting accuracy by 65% through JSON serialization of diagrams.
- Deployed to production a Python + DrawSVG engineering documentation generation pipeline, now used organization-wide.
- Extended RAG system with multimodal capabilities using OpenAI CLIP embeddings to answer schematic questions and automated rack/cable diagram generation with Python and DrawSVG to cut manual effort by 80%.

University of Illinois & United States Department of Agriculture (USDA) - Urbana, IL
Computer Vision & Machine Learning Researcher | Nov. 2024 – May 2025
- Engineered an OpenCV-based image processing pipeline to warp, segment, and analyze 198 kernel/flake image pairs, extracting area and shape features with a 95%+ success rate.
- Implemented feature extraction algorithms to quantify kernel to flake surface areas ratios, producing a dataset of 1,700+ measurements for downstream ML.
- Applied TensorFlow regression models to predict popcorn flake expansion from kernel characteristics, improving predictive accuracy and accelerating breeding program analysis.

Chief Digital and Artificial Intelligence Office – Department of Defense - Washington, D.C.
Software Development Intern – AI4Defense Program | June 2024 – Aug. 2024
- Developed a Python application with OpenAI API integration to extract and analyze key terms from government documents, automating workflows and reducing manual effort by 90%.
- Built a full-stack prototype supporting PDF ingestion, frequency analysis, sentiment scoring, and visualization for rapid policy assessment by government officials.
- Presented solution at the AI4Defense Showcase and achieved a podium finish.

George Mason University (GMU) - Fairfax, VA
Artificial Intelligence Research Intern | June 2024 – Aug. 2024
- Compared 4 large language models' (ChatGPT, Copilot, Claude, Gemini) performance in grading algorithm assignments to assess the feasibility of LLM evaluation.
- Computed Intraclass Correlation Coefficients and other statistical metrics to quantify consistency across models.
- Co-authored paper accepted to the MIT Undergraduate Research Technology Conference (URTC) 2024.

PROJECTS

EchoBrief | FastAPI, Python, JavaScript, Google Gemini API, OpenAI Whisper | July 2025
- Developed an AI-powered post-incident analysis tool processing radio traffic recordings to generate after-action dashboards.
- Selected as a Top 10 project out of 495 Open Innovation Hackathon submissions in Motorola Solutions' Project Greenlight for potential product integration.
- Integrated OpenAI Whisper for transcription and Google Gemini API for summarization + event extraction, surfacing officer contributions, key incidents, and overall timeline with timestamps and floorplan overlays.
- Delivered incident summaries and visual event mapping that reduced manual after-action review time by 70%.

LearnLion | Python, Flask, React, HTML/CSS, Google Gemini API | Nov. 2024
- Built an interactive learning platform that generates personalized coding challenges based on user skill level.
- Implemented adaptive difficulty scaling using Gemini API for real-time code evaluation and feedback.

SKILLS
Languages: Python, Java, JavaScript/TypeScript, SQL, C++, Go, Rust
Frameworks: React, FastAPI, Flask, LangChain, TensorFlow, PyTorch
Tools: Git, Docker, AWS, GCP, PostgreSQL, ChromaDB, OpenCV`;

export const DEMO_PROFILE = {
  fullName: "Aditya Barman",
  email: "a02barman@gmail.com",
  phone: "(848) 259-7203",
  linkedin: "linkedin.com/in/adityabarman/",
  university: "University of Illinois at Urbana-Champaign",
  degree: "B.S. in Computer Science & Statistics, Minor in Mathematics",
  graduationDate: "2028-05",
  gpa: "4.0/4.0",
  workAuthorization: "U.S. Citizen",
  gender: "Male",
  race: "Asian",
};

export const DEMO_PREFERENCES = {
  roles: ["Software Engineering Intern", "Data Science Intern", "Machine Learning Intern"],
  locations: ["San Francisco, CA", "New York, NY", "Seattle, WA", "Remote"],
  remoteOk: true,
  sponsorshipNeeded: false,
};

export type FilledField = {
  label: string;
  value: string;
};

export const DEMO_FILLED_FIELDS: FilledField[] = [
  { label: "Full Name", value: "Aditya Barman" },
  { label: "Email", value: "a02barman@gmail.com" },
  { label: "Phone", value: "(848) 259-7203" },
  { label: "LinkedIn", value: "linkedin.com/in/adityabarman/" },
  { label: "University", value: "University of Illinois at Urbana-Champaign" },
  { label: "Degree", value: "B.S. in Computer Science & Statistics, Minor in Mathematics" },
  { label: "Graduation Date", value: "May 2028" },
  { label: "GPA", value: "4.0/4.0" },
  { label: "Work Authorization", value: "U.S. Citizen" },
  { label: "Gender", value: "Male" },
  { label: "Race/Ethnicity", value: "Asian" },
  { label: "Are you legally authorized to work in the United States?", value: "Yes" },
  { label: "Do you now or will you in the future require sponsorship?", value: "No" },
];
