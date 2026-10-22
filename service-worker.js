// TradingAnalyzer API — Worker complet avec cache (économise les crédits Twelve Data)

const TTL = { "1min": 60, "5min": 300, "15min": 900, "1h": 3600, "4h": 14400, "1day": 43200 };
const memo = new Map();

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const json = (obj, status = 200, extra = {}) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { "Content-Type": "application/json", ...cors, ...extra },
      });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const interval = new URL(request.url).searchParams.get("interval") || "5min";
    const ttl = TTL[interval];
    if (!ttl) return json({ error: "Intervalle non autorisé" }, 400);

    const hit = memo.get(interval);
    if (hit && Date.now() - hit.t < ttl * 1000) {
      return json(hit.data, 200, { "Cache-Control": "public, max-age=30" });
    }

    try {
      const key = env.TWELVE_DATA_KEY || env.TWELVEDATA_API_KEY || env.API_KEY;
      const api = new URL("https://api.twelvedata.com/time_series");
      api.searchParams.set("symbol", "XAU/USD");
      api.searchParams.set("interval", interval);
      api.searchParams.set("outputsize", "300");
      api.searchParams.set("timezone", "UTC");
      api.searchParams.set("apikey", key);

      const res = await fetch(api.toString());
      const data = await res.json();

      if (data.status === "error" || !data.values) {
        // Quota dépassé ou erreur : renvoyer les dernières bougies connues si elles existent
        if (hit) return json(hit.data, 200, { "Cache-Control": "public, max-age=30" });
        return json({ error: data.message || "Impossible de récupérer les données" }, 502);
      }

      const candles = data.values
        .map((c) => {
          const iso = c.datetime.includes(" ") ? c.datetime.replace(" ", "T") : c.datetime + "T00:00:00";
          return {
            time: Math.floor(new Date(iso + "Z").getTime() / 1000),
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
          };
        })
        .reverse();

      const out = { symbol: "XAU/USD", interval, candles };
      memo.set(interval, { t: Date.now(), data: out });
      return json(out, 200, { "Cache-Control": "public, max-age=30" });
    } catch (e) {
      if (hit) return json(hit.data, 200);
      return json({ error: "Erreur du serveur de données" }, 502);
    }
  },
};
