// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = [
  { id: "u1", name: "Alex Rivera",      email: "student@nust.edu.pk",  password: "Test@1234", role: "student",   department: "CS",   active: true,  avatar: "AR" },
  { id: "u2", name: "Dr. Sarah Jenkins",email: "faculty@nust.edu.pk",  password: "Test@1234", role: "faculty",   department: "CS",   active: true,  avatar: "SJ" },
  { id: "u3", name: "Admin User",       email: "admin@nust.edu.pk",    password: "Test@1234", role: "admin",     department: "IT",   active: true,  avatar: "AU" },
  { id: "u4", name: "Maria Hassan",     email: "maria@nust.edu.pk",    password: "Test@1234", role: "student",   department: "CS",   active: true,  avatar: "MH" },
  { id: "u5", name: "Dr. Omar Sheikh",  email: "omar@nust.edu.pk",     password: "Test@1234", role: "faculty",   department: "EE",   active: true,  avatar: "OS" },
  { id: "u6", name: "Zara Malik",       email: "zara@nust.edu.pk",     password: "Test@1234", role: "student",   department: "CS",   active: false, avatar: "ZM" },
  { id: "u7", name: "Bilal Ahmed",      email: "bilal@nust.edu.pk",    password: "Test@1234", role: "student",   department: "SE",   active: true,  avatar: "BA" },
];

// ─── COURSES ─────────────────────────────────────────────────────────────────
export const courses = [
  { id: "c1", code: "CS-401", title: "Advanced Algorithm Design",      instructor: "Dr. Sarah Jenkins", department: "CS", creditHours: 3, enrolled: 42, capacity: 50, progress: 65, status: "active" },
  { id: "c2", code: "PSY-210",title: "Cognitive Psychology",           instructor: "Dr. Aris Thorne",   department: "HUM",creditHours: 3, enrolled: 35, capacity: 40, progress: 82, status: "active" },
  { id: "c3", code: "LIT-405",title: "Comparative Literature Seminar", instructor: "Prof. Miriam Sterling", department: "HUM", creditHours: 3, enrolled: 28, capacity: 30, progress: 40, status: "active" },
  { id: "c4", code: "CS-305", title: "Database Systems",               instructor: "Dr. Sarah Jenkins", department: "CS", creditHours: 3, enrolled: 38, capacity: 50, progress: 55, status: "active" },
];

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────
const now = new Date();
const future  = (h) => new Date(now.getTime() + h * 3600 * 1000).toISOString();
const past    = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString();

export const assignments = [
  { id: "a1", courseId: "c1", courseCode: "CS-401", title: "Lab Report 01 – Graph Traversal",      description: "Implement BFS and DFS. Submit a PDF report with time complexity analysis.", deadline: future(24),  maxMarks: 100, status: "upcoming",  submissionType: "PDF/DOCX/ZIP" },
  { id: "a2", courseId: "c2", courseCode: "PSY-210", title: "Case Study Analysis",                  description: "Review chapters 4–6 and submit a 1500-word case study.", deadline: future(48),  maxMarks: 50,  status: "upcoming",  submissionType: "PDF/DOCX" },
  { id: "a3", courseId: "c3", courseCode: "LIT-405", title: "Comparative Analysis Essay",           description: "Compare modernist poetry and the urban landscape. Minimum 2000 words.", deadline: past(2),    maxMarks: 80,  status: "overdue",   submissionType: "PDF/DOCX" },
  { id: "a4", courseId: "c1", courseCode: "CS-401", title: "Lab Report 00 – Complexity Analysis",  description: "Analyse time and space complexity of sorting algorithms.", deadline: past(10),   maxMarks: 100, status: "overdue",   submissionType: "PDF/DOCX/ZIP" },
  { id: "a5", courseId: "c4", courseCode: "CS-305", title: "ER Diagram Assignment",                 description: "Design an ER diagram for a hospital management system.", deadline: future(72),  maxMarks: 60,  status: "submitted", submissionType: "PDF/DOCX" },
];

// ─── SUBMISSIONS ─────────────────────────────────────────────────────────────
export const submissions = [
  { id: "s1", assignmentId: "a1", studentId: "u1", studentName: "Alex Rivera",   fileURL: "lab01_alex.pdf",   fileType: "PDF", timestamp: past(1),  status: "submitted", grade: null, feedback: null },
  { id: "s2", assignmentId: "a1", studentId: "u4", studentName: "Maria Hassan",  fileURL: "lab01_maria.pdf",  fileType: "PDF", timestamp: past(3),  status: "submitted", grade: null, feedback: null },
  { id: "s3", assignmentId: "a1", studentId: "u7", studentName: "Bilal Ahmed",   fileURL: "lab01_bilal.zip",  fileType: "ZIP", timestamp: past(5),  status: "submitted", grade: null, feedback: null },
  { id: "s4", assignmentId: "a5", studentId: "u1", studentName: "Alex Rivera",   fileURL: "er_diagram.pdf",   fileType: "PDF", timestamp: past(20), status: "graded",    grade: 85,   feedback: "Good effort, improve code comments." },
];

// ─── GRADES ──────────────────────────────────────────────────────────────────
export const grades = [
  { courseCode: "CS-401", courseTitle: "Advanced Algorithm Design",      grade: "A",  credits: 4.0, points: 16.0, grader: "Dr. Sarah Jenkins" },
  { courseCode: "ENG-305",courseTitle: "Modernist Literature",           grade: "A-", credits: 3.0, points: 11.1, grader: "Prof. James Sterling" },
  { courseCode: "PHY-201",courseTitle: "Quantum Mechanics I",            grade: "B+", credits: 4.0, points: 13.2, grader: "Prof. Sarah Chen" },
];

// ─── RUBRIC ──────────────────────────────────────────────────────────────────
export const rubricCriteria = [
  { id: "r1", criterion: "Code Correctness",    maxPoints: 40, description: "Does the implementation produce correct output for all test cases?" },
  { id: "r2", criterion: "Code Quality",        maxPoints: 20, description: "Is the code clean, well-commented, and follows naming conventions?" },
  { id: "r3", criterion: "Time Complexity",     maxPoints: 25, description: "Is the time complexity analysed correctly and is the solution optimal?" },
  { id: "r4", criterion: "Report Presentation", maxPoints: 15, description: "Is the PDF report well-structured with diagrams and clear explanations?" },
];

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const notifications = [
  { id: "n1", type: "grade",      message: "Your grade for ER Diagram Assignment has been released.", time: "2h ago",  read: false },
  { id: "n2", type: "assignment", message: "New assignment posted: Lab Report 01 – Graph Traversal.",  time: "1d ago",  read: false },
  { id: "n3", type: "assignment", message: "Reminder: Case Study Analysis due in 2 days.",             time: "3h ago",  read: true  },
];
