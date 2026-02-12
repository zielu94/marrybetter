import Card from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";

interface GuestStatsProps {
  stats: {
    total: number;
    invitesSent: number;
    confirmed: number;
    declined: number;
  };
}

export default function GuestStats({ stats }: GuestStatsProps) {
  const showRate = stats.invitesSent > 0
    ? ((stats.confirmed / stats.invitesSent) * 100).toFixed(0) + "%"
    : "-";

  return (
    <Card padding="sm">
      <div className="grid grid-cols-2 md:grid-cols-4">
        <StatsCard title="Gäste gesamt" value={stats.total} />
        <StatsCard title="Einladungen" value={stats.invitesSent} className="border-l border-border" />
        <StatsCard title="Zusagen" value={stats.confirmed} subtitle={`Zusagequote: ${showRate}`} className="border-l border-border" />
        <StatsCard title="Absagen" value={stats.declined} className="border-l border-border" />
      </div>
    </Card>
  );
}
