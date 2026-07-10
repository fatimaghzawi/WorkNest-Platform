import Input from "../../../../components/common/Input";

interface Props {
  search: string;
  status: string;
  sort: string;

  onChange: (filters: {
    search?: string;
    status?: string;
    sort?: string;
  }) => void;

  onClear: () => void;
}

export default function ProposalFilters({
  search,
  status,
  sort,
  onChange,
  onClear,
}: Props) {
  return (
    <section className="proposal-toolbar">

      <Input
        placeholder="Search by job title..."
        value={search}
        onChange={(e) =>
          onChange({ search: e.target.value })
        }
      />

      <select
        value={status}
        onChange={(e) =>
          onChange({ status: e.target.value })
        }
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>

      <select
        value={sort}
        onChange={(e) =>
          onChange({ sort: e.target.value })
        }
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="priceHigh">Highest Price</option>
        <option value="priceLow">Lowest Price</option>
      </select>

      <button
        className="proposal-clear-btn"
        onClick={onClear}
      >
        Clear
      </button>

    </section>
  );
}