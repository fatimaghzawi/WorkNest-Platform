import ProposalCard from "./ProposalCard";
import type { Proposal } from "../../../../types/proposal";

interface Props {
  proposals: Proposal[];
  onView: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onWithdraw: (proposal: Proposal) => void;
}

export default function ProposalList({
  proposals,
  onView,
  onEdit,
  onWithdraw,
}: Props) {
  return (
    <div className="proposal-list">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal._id}
          proposal={proposal}
          onView={onView}
          onEdit={onEdit}
          onWithdraw={onWithdraw}
        />
      ))}
    </div>
  );
}