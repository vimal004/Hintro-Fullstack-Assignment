// ─────────────────────────────────────────────────────────
//  Mock Data — Realistic seed for frontend-first dev
// ─────────────────────────────────────────────────────────

export const mockUsers = [
  {
    id: "u1",
    name: "Vimal Manoharan",
    email: "vimal@taskflow.io",
    avatar: null,
    initials: "VM",
    color: "#1a73e8",
  },
  {
    id: "u2",
    name: "Priya Sharma",
    email: "priya@taskflow.io",
    avatar: null,
    initials: "PS",
    color: "#e8710a",
  },
  {
    id: "u3",
    name: "Arjun Patel",
    email: "arjun@taskflow.io",
    avatar: null,
    initials: "AP",
    color: "#1e8e3e",
  },
  {
    id: "u4",
    name: "Meera Nair",
    email: "meera@taskflow.io",
    avatar: null,
    initials: "MN",
    color: "#a142f4",
  },
];

export const mockLabels = [
  { id: "lb1", name: "Bug", color: "#d93025" },
  { id: "lb2", name: "Feature", color: "#1a73e8" },
  { id: "lb3", name: "Enhancement", color: "#1e8e3e" },
  { id: "lb4", name: "Design", color: "#a142f4" },
  { id: "lb5", name: "Urgent", color: "#e8710a" },
  { id: "lb6", name: "Research", color: "#f9ab00" },
];

export const mockBoards = [
  {
    id: "b1",
    title: "Product Launch Q1",
    description: "Plan and execute the Q1 product launch across all channels.",
    color: "#1a73e8",
    members: ["u1", "u2", "u3"],
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-14T14:30:00Z",
  },
  {
    id: "b2",
    title: "Mobile App Redesign",
    description: "Complete UI/UX overhaul for the mobile application.",
    color: "#a142f4",
    members: ["u1", "u4"],
    createdAt: "2026-01-20T09:00:00Z",
    updatedAt: "2026-02-13T11:00:00Z",
  },
  {
    id: "b3",
    title: "Backend Infrastructure",
    description: "Microservices migration and cloud infrastructure setup.",
    color: "#1e8e3e",
    members: ["u1", "u3"],
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-02-12T16:45:00Z",
  },
  {
    id: "b4",
    title: "Marketing Campaign",
    description: "Social media strategy and content calendar for Q1.",
    color: "#e8710a",
    members: ["u2", "u4"],
    createdAt: "2026-02-05T12:00:00Z",
    updatedAt: "2026-02-11T09:20:00Z",
  },
];

export const mockLists = {
  b1: [
    {
      id: "l1",
      boardId: "b1",
      title: "Backlog",
      position: 0,
      tasks: [
        {
          id: "t1",
          title: "Define launch messaging",
          description:
            "Create core messaging framework for all launch materials and press releases.",
          labels: ["lb2"],
          assignees: ["u1", "u2"],
          dueDate: "2026-02-20",
          priority: "high",
          createdAt: "2026-01-16T10:00:00Z",
        },
        {
          id: "t2",
          title: "Competitive analysis report",
          description:
            "Research and document competitor positioning for 5 key competitors.",
          labels: ["lb6"],
          assignees: ["u3"],
          dueDate: "2026-02-18",
          priority: "medium",
          createdAt: "2026-01-17T09:00:00Z",
        },
      ],
    },
    {
      id: "l2",
      boardId: "b1",
      title: "In Progress",
      position: 1,
      tasks: [
        {
          id: "t3",
          title: "Landing page design",
          description:
            "Design the hero section, features grid, and CTA for the launch landing page.",
          labels: ["lb4", "lb2"],
          assignees: ["u1"],
          dueDate: "2026-02-22",
          priority: "high",
          createdAt: "2026-01-20T14:00:00Z",
        },
        {
          id: "t4",
          title: "Email sequence setup",
          description:
            "Build 5-part email drip sequence for launch subscribers.",
          labels: ["lb3"],
          assignees: ["u2"],
          dueDate: "2026-02-25",
          priority: "medium",
          createdAt: "2026-01-22T11:00:00Z",
        },
        {
          id: "t5",
          title: "Press kit preparation",
          description:
            "Compile logos, screenshots, product descriptions, and founder bios.",
          labels: ["lb2"],
          assignees: ["u2", "u3"],
          dueDate: "2026-02-19",
          priority: "low",
          createdAt: "2026-01-25T08:00:00Z",
        },
      ],
    },
    {
      id: "l3",
      boardId: "b1",
      title: "Review",
      position: 2,
      tasks: [
        {
          id: "t6",
          title: "Social media content calendar",
          description:
            "Plan 4 weeks of organic social content across Twitter, LinkedIn, and Instagram.",
          labels: ["lb3"],
          assignees: ["u4"],
          dueDate: "2026-02-17",
          priority: "medium",
          createdAt: "2026-02-01T10:00:00Z",
        },
      ],
    },
    {
      id: "l4",
      boardId: "b1",
      title: "Done",
      position: 3,
      tasks: [
        {
          id: "t7",
          title: "Brand guideline update",
          description:
            "Updated brand colors, typography, and usage guidelines for new product line.",
          labels: ["lb4"],
          assignees: ["u1"],
          dueDate: "2026-02-10",
          priority: "low",
          createdAt: "2026-01-18T15:00:00Z",
        },
      ],
    },
  ],
  b2: [
    {
      id: "l5",
      boardId: "b2",
      title: "To Do",
      position: 0,
      tasks: [
        {
          id: "t8",
          title: "User research interviews",
          description:
            "Conduct 10 user interviews to identify pain points in the current mobile experience.",
          labels: ["lb6"],
          assignees: ["u4"],
          dueDate: "2026-02-28",
          priority: "high",
          createdAt: "2026-01-21T09:00:00Z",
        },
        {
          id: "t9",
          title: "Design system components",
          description:
            "Create button, input, card, and modal components in Figma.",
          labels: ["lb4"],
          assignees: ["u1"],
          dueDate: "2026-03-01",
          priority: "high",
          createdAt: "2026-01-22T10:00:00Z",
        },
      ],
    },
    {
      id: "l6",
      boardId: "b2",
      title: "In Progress",
      position: 1,
      tasks: [
        {
          id: "t10",
          title: "Navigation redesign",
          description:
            "Implement bottom tab navigation with gesture support and smooth transitions.",
          labels: ["lb2", "lb4"],
          assignees: ["u1", "u4"],
          dueDate: "2026-02-26",
          priority: "high",
          createdAt: "2026-02-02T14:00:00Z",
        },
      ],
    },
    {
      id: "l7",
      boardId: "b2",
      title: "Done",
      position: 2,
      tasks: [],
    },
  ],
  b3: [
    {
      id: "l8",
      boardId: "b3",
      title: "Planning",
      position: 0,
      tasks: [
        {
          id: "t11",
          title: "Service decomposition",
          description:
            "Identify bounded contexts and define microservice boundaries.",
          labels: ["lb6"],
          assignees: ["u3"],
          dueDate: "2026-02-20",
          priority: "high",
          createdAt: "2026-02-01T08:00:00Z",
        },
      ],
    },
    {
      id: "l9",
      boardId: "b3",
      title: "In Progress",
      position: 1,
      tasks: [
        {
          id: "t12",
          title: "Docker containerization",
          description:
            "Containerize auth service, task service, and notification service.",
          labels: ["lb2"],
          assignees: ["u1", "u3"],
          dueDate: "2026-02-24",
          priority: "medium",
          createdAt: "2026-02-05T10:00:00Z",
        },
      ],
    },
    {
      id: "l10",
      boardId: "b3",
      title: "Done",
      position: 2,
      tasks: [],
    },
  ],
  b4: [
    {
      id: "l11",
      boardId: "b4",
      title: "Ideas",
      position: 0,
      tasks: [
        {
          id: "t13",
          title: "Influencer partnership plan",
          description:
            "Identify 15 micro-influencers and draft partnership proposals.",
          labels: ["lb6"],
          assignees: ["u2"],
          dueDate: "2026-02-28",
          priority: "medium",
          createdAt: "2026-02-05T12:00:00Z",
        },
      ],
    },
    {
      id: "l12",
      boardId: "b4",
      title: "Scheduled",
      position: 1,
      tasks: [
        {
          id: "t14",
          title: "Blog post series",
          description: "Write 3 long-form blog posts on industry trends.",
          labels: ["lb3"],
          assignees: ["u4"],
          dueDate: "2026-03-05",
          priority: "low",
          createdAt: "2026-02-07T09:00:00Z",
        },
      ],
    },
    {
      id: "l13",
      boardId: "b4",
      title: "Published",
      position: 2,
      tasks: [],
    },
  ],
};

export const mockActivities = [
  {
    id: "a1",
    userId: "u1",
    boardId: "b1",
    taskId: "t3",
    action: "moved",
    detail: 'Moved "Landing page design" from Backlog to In Progress',
    timestamp: "2026-02-14T14:30:00Z",
  },
  {
    id: "a2",
    userId: "u2",
    boardId: "b1",
    taskId: "t4",
    action: "updated",
    detail: 'Updated description of "Email sequence setup"',
    timestamp: "2026-02-14T13:15:00Z",
  },
  {
    id: "a3",
    userId: "u1",
    boardId: "b1",
    taskId: "t7",
    action: "completed",
    detail: 'Marked "Brand guideline update" as complete',
    timestamp: "2026-02-14T11:00:00Z",
  },
  {
    id: "a4",
    userId: "u3",
    boardId: "b1",
    taskId: "t2",
    action: "assigned",
    detail: 'Was assigned to "Competitive analysis report"',
    timestamp: "2026-02-13T16:45:00Z",
  },
  {
    id: "a5",
    userId: "u4",
    boardId: "b2",
    taskId: "t10",
    action: "created",
    detail: 'Created task "Navigation redesign"',
    timestamp: "2026-02-02T14:00:00Z",
  },
  {
    id: "a6",
    userId: "u1",
    boardId: "b2",
    taskId: "t10",
    action: "assigned",
    detail: 'Was assigned to "Navigation redesign"',
    timestamp: "2026-02-02T14:05:00Z",
  },
];
