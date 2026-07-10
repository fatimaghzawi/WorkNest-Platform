import {
  FileText,
  Clock3,
  CircleCheck,
  CircleX,
} from "lucide-react";

interface Props {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

const stats = (
  total: number,
  pending: number,
  accepted: number,
  rejected: number
) => [
  {
    title: "Total",
    value: total,
    icon: FileText,
  },
  {
    title: "Pending",
    value: pending,
    icon: Clock3,
  },
  {
    title: "Accepted",
    value: accepted,
    icon: CircleCheck,
  },
  {
    title: "Rejected",
    value: rejected,
    icon: CircleX,
  },
];

export default function ProposalStats(props: Props) {
  return (
    <section className="proposal-stats">
      {stats(
        props.total,
        props.pending,
        props.accepted,
        props.rejected
      ).map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="proposal-stat-card"
          >
            <div className="proposal-stat-icon">
              <Icon size={22} />
            </div>

            <h2>{item.value}</h2>

            <span>{item.title}</span>
          </div>
        );
      })}
    </section>
  );
}