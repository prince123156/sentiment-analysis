import { Activity, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../api.js";
import Layout from "../components/Layout.jsx";

const sentimentColors = {
  positive: "#059669",
  neutral: "#64748b",
  negative: "#e11d48"
};

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
        <Icon size={20} />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);

  async function loadDashboard() {
    const res = await api.get("/dashboard");
    setData(res.data);
  }

  useEffect(() => {
    loadDashboard();
    const id = setInterval(loadDashboard, 10000);
    return () => clearInterval(id);
  }, []);

  const sentiment = data?.sentimentDistribution?.map((item) => ({
    name: item._id || "neutral",
    value: item.count
  })) || [];

  const activity = data?.activity?.map((item) => ({
    date: item._id,
    messages: item.count
  })) || [];

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Live summary of message volume, room activity, and sentiment.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Stat icon={MessageSquare} label="Total messages" value={data?.totalMessages ?? 0} />
          <Stat icon={Users} label="Active users" value={data?.activeUsers ?? 0} />
          <Stat icon={Activity} label="Rooms" value={data?.totalRooms ?? 0} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 font-semibold">Sentiment distribution</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sentiment} dataKey="value" nameKey="name" outerRadius={95} label>
                    {sentiment.map((entry) => (
                      <Cell fill={sentimentColors[entry.name] || "#64748b"} key={entry.name} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 font-semibold">Message activity</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line dataKey="messages" stroke="#059669" strokeWidth={2} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h2 className="mb-4 font-semibold">Sentiment counts</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={sentiment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {sentiment.map((entry) => (
                      <Cell fill={sentimentColors[entry.name] || "#64748b"} key={entry.name} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
