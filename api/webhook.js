// Webhook receiver — accepts POST from Pipefy, n8n, Zapier, etc.
// GET returns pending notifications and clears them
// URL: https://your-app.vercel.app/api/webhook

let pending = [];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    try {
      const data = req.body || {};
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: data.type || "proposta",
        vendor: data.vendor || data.vendedor || data.assignee || "",
        client: data.client || data.cliente || data.title || "",
        value: data.value || data.valor || 0,
        status: data.status || "NOVA",
        source: data.source || "webhook",
        raw: data,
      };
      pending.push(notification);
      // Keep only last 100
      if (pending.length > 100) pending = pending.slice(-100);
      return res.status(200).json({ ok: true, id: notification.id });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  if (req.method === "GET") {
    const items = [...pending];
    pending = []; // Clear after reading
    return res.status(200).json({ notifications: items, count: items.length });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
