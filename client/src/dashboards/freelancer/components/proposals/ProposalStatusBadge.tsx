import type { ProposalStatus } from "../../../../types/proposal";

interface Props {
  status: ProposalStatus;
}

export default function ProposalStatusBadge({
  status,
}: Props) {
  return (
    <span
      className={`proposal-status proposal-status--${status}`}
    >
      {status.charAt(0).toUpperCase() +
        status.slice(1)}
    </span>
  );
}