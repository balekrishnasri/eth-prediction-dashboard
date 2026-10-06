"use client";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { CONTRACT, PRICE_DECIMALS, trackerAbi } from "@/lib/abi";

const LIVE = { query: { refetchInterval: 15_000 } };
const usd = (v: bigint) =>
  Number(formatUnits(v, PRICE_DECIMALS)).toLocaleString("en-US", { style: "currency", currency: "USD" });
const pct = (bps: bigint) => (Number(bps) / 100).toFixed(2) + "%";
const when = (ts: bigint) => (ts === 0n ? "-" : new Date(Number(ts) * 1000).toLocaleString());
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export default function Home() {
  const { data: count } = useReadContract({ address: CONTRACT, abi: trackerAbi, functionName: "predictionCount", ...LIVE });
  const n = count ?? 0n;
  const from = n > 50n ? n - 50n : 0n;

  const { data: preds } = useReadContract({
    address: CONTRACT, abi: trackerAbi, functionName: "getPredictions", args: [from, 50n],
    query: { enabled: count !== undefined, refetchInterval: 15_000 },
  });
  const { data: board } = useReadContract({ address: CONTRACT, abi: trackerAbi, functionName: "getLeaderboard", ...LIVE });

  const rows = [...(preds ?? [])].reverse();
  const resolved = rows.filter((p) => p.isResolved);
  const avg = resolved.length ? resolved.reduce((s, p) => s + p.accuracyScore, 0n) / BigInt(resolved.length) : null;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-bold">On-Chain AI Price Predictor</h1>
        <p className="text-slate-400">ETH/USD · committed on Sepolia · resolved against Chainlink</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total predictions" value={n.toString()} />
        <Stat label="Resolved (shown)" value={resolved.length.toString()} />
        <Stat label="Avg accuracy (100% − MAPE)" value={avg === null ? "-" : pct(avg)} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Leaderboard</h2>
        <Table head={["#", "Predictor", "Avg accuracy", "Resolved"]}>
          {board && board[0].length ? (
            board[0].map((a, i) => (
              <tr key={a} className="border-t border-slate-800">
                <td className="p-3">{i + 1}</td>
                <td className="p-3 font-mono">{short(a)}</td>
                <td className="p-3 text-emerald-400">{pct(board[1][i])}</td>
                <td className="p-3">{board[2][i].toString()}</td>
              </tr>
            ))
          ) : (
            <Empty cols={4} />
          )}
        </Table>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Predictions</h2>
        <Table head={["ID", "Target time", "Resolved at", "Predicted", "Actual", "Error", "Accuracy"]}>
          {rows.length ? (
            rows.map((p) => {
              const err = p.isResolved
                ? ((Number(p.predictedPrice) - Number(p.actualPrice)) / Number(p.actualPrice)) * 100
                : null;
              return (
                <tr key={p.id.toString()} className="border-t border-slate-800">
                  <td className="p-3">#{p.id.toString()}</td>
                  <td className="p-3">{when(p.targetTimestamp)}</td>
                  <td className="p-3">{p.isResolved ? when(p.resolvedAt) : <span className="text-amber-400">Pending</span>}</td>
                  <td className="p-3">{usd(p.predictedPrice)}</td>
                  <td className="p-3">{p.isResolved ? usd(p.actualPrice) : "-"}</td>
                  <td className="p-3">{err === null ? "-" : `${err > 0 ? "+" : ""}${err.toFixed(3)}%`}</td>
                  <td className="p-3 text-emerald-400">{p.isResolved ? pct(p.accuracyScore) : "-"}</td>
                </tr>
              );
            })
          ) : (
            <Empty cols={7} />
          )}
        </Table>
      </section>
    </main>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
    <div className="text-sm text-slate-400">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
  </div>
);

const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
    <table className="w-full text-left text-sm">
      <thead className="text-slate-400"><tr>{head.map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const Empty = ({ cols }: { cols: number }) => (
  <tr><td colSpan={cols} className="p-6 text-center text-slate-500">No data yet</td></tr>
);
