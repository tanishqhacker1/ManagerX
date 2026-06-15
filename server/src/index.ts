import path from "path";
import express from "express";
import cors from "cors";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(express.json());

const clientDist = path.join(__dirname, "..", "..", "client", "dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDist));
}

const AgentRole = z.enum(["CEO", "CTO", "Engineer", "Designer", "Analyst"]);
const AgentStatus = z.enum(["idle", "working", "review", "blocked"]);

const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: AgentRole,
  monthlyBudget: z.number().min(0),
  spent: z.number().min(0),
  status: AgentStatus,
  tasks: z.array(z.string())
});

let agents = [
  {
    id: "agent-1",
    name: "Ari",
    role: "CEO" as const,
    monthlyBudget: 5000,
    spent: 1200,
    status: "working" as const,
    tasks: ["Define product vision", "Review AI partnerships"]
  },
  {
    id: "agent-2",
    name: "Cleo",
    role: "CTO" as const,
    monthlyBudget: 7000,
    spent: 3100,
    status: "review" as const,
    tasks: ["Audit Claude integration", "Speed up pipeline"]
  }
] satisfies Array<z.infer<typeof agentSchema>>;

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  ownerId: z.string().nullable(),
  status: z.enum(["todo", "in-progress", "done"]),
  costEstimate: z.number().min(0),
  dueDate: z.string().nullable()
});

let tasks = [
  {
    id: "task-1",
    title: "Launch monthly budget guardrails",
    ownerId: "agent-2",
    status: "in-progress",
    costEstimate: 1500,
    dueDate: "2026-07-01"
  },
  {
    id: "task-2",
    title: "Map org structure and agent roles",
    ownerId: "agent-1",
    status: "todo",
    costEstimate: 500,
    dueDate: "2026-06-20"
  }
] satisfies Array<z.infer<typeof taskSchema>>;

app.get("/api/status", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.get("/api/agents", (req, res) => {
  res.json(agents);
});

app.post("/api/agents", (req, res) => {
  const result = agentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.format() });
  }
  agents.push(result.data);
  res.status(201).json(result.data);
});

app.patch("/api/agents/:id/budget", (req, res) => {
  const agent = agents.find((a) => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  const payload = z.object({ monthlyBudget: z.number().min(0) }).safeParse(req.body);
  if (!payload.success) return res.status(400).json({ error: payload.error.format() });

  agent.monthlyBudget = payload.data.monthlyBudget;
  res.json(agent);
});

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const result = taskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.format() });
  }
  tasks.push(result.data);
  res.status(201).json(result.data);
});

app.patch("/api/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const payload = z.object({
    status: z.enum(["todo", "in-progress", "done"]).optional(),
    ownerId: z.string().nullable().optional(),
    title: z.string().optional(),
    costEstimate: z.number().min(0).optional(),
    dueDate: z.string().nullable().optional()
  }).safeParse(req.body);

  if (!payload.success) return res.status(400).json({ error: payload.error.format() });

  Object.assign(task, payload.data);
  res.json(task);
});

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`ManagerX server listening on http://localhost:${PORT}`);
});
