import { useEffect, useMemo, useState } from "react";

type AgentRole = "CEO" | "CTO" | "Engineer" | "Designer" | "Analyst";
type AgentStatus = "idle" | "working" | "review" | "blocked";

type Agent = {
  id: string;
  name: string;
  role: AgentRole;
  monthlyBudget: number;
  spent: number;
  status: AgentStatus;
  tasks: string[];
};

type TaskStatus = "todo" | "in-progress" | "done";

type Task = {
  id: string;
  title: string;
  ownerId: string | null;
  status: TaskStatus;
  costEstimate: number;
  dueDate: string | null;
};

const roleColors: Record<AgentRole, string> = {
  CEO: "#2563EB",
  CTO: "#047857",
  Engineer: "#9333EA",
  Designer: "#B45309",
  Analyst: "#0F766E"
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [budgetValue, setBudgetValue] = useState<string>("");

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then(setAgents)
      .catch(console.error);
    fetch("/api/tasks")
      .then((res) => res.json())
      .then(setTasks)
      .catch(console.error);
  }, []);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId]
  );

  const budgetProgress = useMemo(() => {
    if (!selectedAgent) return 0;
    return Math.min(100, Math.round((selectedAgent.spent / Math.max(selectedAgent.monthlyBudget, 1)) * 100));
  }, [selectedAgent]);

  const workflowCounts = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      done: tasks.filter((task) => task.status === "done").length
    }),
    [tasks]
  );

  const handleBudgetSubmit = async () => {
    if (!selectedAgent) return;
    const parsed = Number(budgetValue);
    if (Number.isNaN(parsed) || parsed < 0) return;

    const response = await fetch(`/api/agents/${selectedAgent.id}/budget`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyBudget: parsed })
    });

    if (!response.ok) return;
    const updated = await response.json();
    setAgents((current) => current.map((agent) => (agent.id === updated.id ? updated : agent)));
    setBudgetValue("");
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Orchestration Platform</p>
          <h1>ManagerX</h1>
          <p className="hero-copy">Build your AI board, assign roles, track agent tasks, and control spending across your team.</p>
        </div>
      </header>

      <main className="layout-grid">
        <section className="panel mission-panel">
          <div className="panel-header">
            <h2>Company mission</h2>
            <span>Board-level command center</span>
          </div>
          <p>Lead a unified AI company. Set the mission, hire agents, assign tasks, and keep budget controls in one central dashboard.</p>
          <div className="mission-pill">Mission: Scale AI-enabled products with predictable cost control</div>
        </section>

        <section className="panel metrics-panel">
          <div className="panel-header">
            <h2>Org health</h2>
            <span>Team, tasks, budget</span>
          </div>
          <div className="stats-row">
            <div className="stat-card">
              <p>Agents</p>
              <strong>{agents.length}</strong>
            </div>
            <div className="stat-card">
              <p>Tasks</p>
              <strong>{tasks.length}</strong>
            </div>
            <div className="stat-card">
              <p>Active budget usage</p>
              <strong>{workflowCounts.inProgress}</strong>
            </div>
          </div>
        </section>

        <section className="panel org-panel">
          <div className="panel-header">
            <h2>Org chart</h2>
            <span>Roles and status</span>
          </div>
          <div className="org-list">
            {agents.map((agent) => (
              <button
                key={agent.id}
                className={`org-card ${selectedAgentId === agent.id ? "selected" : ""}`}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <div>
                  <p className="agent-name">{agent.name}</p>
                  <p className="agent-role" style={{ color: roleColors[agent.role] }}>{agent.role}</p>
                </div>
                <div className="agent-badge">{agent.status}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel task-panel">
          <div className="panel-header">
            <h2>Task board</h2>
            <span>Assignments and progress</span>
          </div>
          <div className="task-columns">
            {(["todo", "in-progress", "done"] as TaskStatus[]).map((status) => (
              <div key={status} className="task-column">
                <h3>{status.replace("-", " ")}</h3>
                {tasks.filter((task) => task.status === status).map((task) => {
                  const owner = agents.find((agent) => agent.id === task.ownerId);
                  return (
                    <div key={task.id} className="task-card">
                      <strong>{task.title}</strong>
                      <p>{owner ? `Owner: ${owner.name}` : "Unassigned"}</p>
                      <p className="task-footnote">Est. {formatMoney(task.costEstimate)} · Due {task.dueDate ?? "TBD"}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <section className="panel detail-panel">
          <div className="panel-header">
            <h2>Agent detail</h2>
            <span>Budget risk & focus</span>
          </div>
          {selectedAgent ? (
            <div>
              <div className="detail-row">
                <div>
                  <h3>{selectedAgent.name}</h3>
                  <p className="agent-role" style={{ color: roleColors[selectedAgent.role] }}>{selectedAgent.role}</p>
                </div>
                <span className="agent-status pill">{selectedAgent.status}</span>
              </div>
              <div className="budget-card">
                <p>Monthly budget</p>
                <strong>{formatMoney(selectedAgent.monthlyBudget)}</strong>
                <p className="subtle">Spent {formatMoney(selectedAgent.spent)} ({budgetProgress}%)</p>
                <div className="budget-bar">
                  <div className="budget-fill" style={{ width: `${budgetProgress}%` }} />
                </div>
              </div>
              <div className="budget-form">
                <label>
                  Adjust monthly budget
                  <input
                    type="number"
                    min="0"
                    value={budgetValue}
                    placeholder="New budget"
                    onChange={(event) => setBudgetValue(event.target.value)}
                  />
                </label>
                <button onClick={handleBudgetSubmit}>Update budget</button>
              </div>
              <div className="panel-divider" />
              <div>
                <h3>Tasks assigned</h3>
                <ul className="task-list">
                  {tasks.filter((task) => task.ownerId === selectedAgent.id).map((task) => (
                    <li key={task.id}>{task.title} · <span>{task.status}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>Select an agent to inspect spending, status, and assignments.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
