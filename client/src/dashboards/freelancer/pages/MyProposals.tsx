import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { DashboardPageShell } from "../../_shared/DashboardNavbar";
import EmptyState from "../../_shared/EmptyState";

import Pagination from "../../../components/common/Pagination";
import { BlockLoader } from "../../../components/common/Loader";
import { useToast } from "../../../hooks/useToast";
import Button from "../../../components/common/Button";
import { proposalsApi } from "../../../api/proposals.api";

import type {
  Proposal,
  ProposalStatus,
} from "../../../types/proposal";

import { getApiErrorMessage } from "../../../utils/apiError";

import ProposalStats from "../components/proposals/ProposalStats";
import ProposalFilters from "../components/proposals/ProposalFilters";
import ProposalList from "../components/proposals/ProposalList";

import "../../../css/Proposal.css";


type SortType =
  | "newest"
  | "oldest"
  | "priceHigh"
  | "priceLow"
  | "timeline";


export default function MyProposals() {


  // ==========================
  // Data
  // ==========================

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const { success, error: showError } = useToast();

  const [withdrawId, setWithdrawId] =useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] =useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] =
  useState<Proposal | null>(null);


const [editForm,setEditForm] = useState({
  coverLetter:"",
  price:0,
  timeline:""
});

  // ==========================
  // Pagination
  // ==========================

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);


  // ==========================
  // Filters
  // ==========================

  const [search, setSearch] = useState("");

  const [status, setStatus] =
    useState<ProposalStatus | "">("");

  const [sort, setSort] =
    useState<SortType>("newest");


  // ==========================
  // UI
  // ==========================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");



  // ==========================
  // Fetch Proposals
  // ==========================

  const loadProposals = useCallback(
    async () => {

      setLoading(true);
      setError("");

      try {

        const response =
          await proposalsApi.getMy({
            page,
            limit: 10,
            status:
              status || undefined,
          });


        setProposals(
          response.data.data
        );


        setTotalPages(
          response.data.meta?.totalPages || 1
        );


      } catch (err) {

        setError(
          getApiErrorMessage(
            err,
            "Failed to load proposals."
          )
        );


      } finally {

        setLoading(false);

      }

    },
    [
      page,
      status,
    ]
  );



  useEffect(() => {

    loadProposals();

  }, [loadProposals]);




  // ==========================
  // Local Filtering + Sorting
  // ==========================

  const filteredProposals =
    useMemo(() => {


      let result =
        [...proposals];


      // Search

      if (search.trim()) {

        const keyword =
          search.toLowerCase();


        result =
          result.filter(
            (proposal) => {


              const job =
                typeof proposal.jobId === "string"
                  ? null
                  : proposal.jobId;


              const client =
                job?.clientId;


              const searchable =
                [
                  job?.title,
                  client?.firstName,
                  client?.lastName,
                  proposal.coverLetter,
                ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


              return searchable.includes(keyword);

            }
          );

      }



      // Sorting

      result.sort(
        (a, b) => {


          if (sort === "newest") {

            return (
              new Date(b.createdAt).getTime()
              -
              new Date(a.createdAt).getTime()
            );

          }


          if (sort === "oldest") {

            return (
              new Date(a.createdAt).getTime()
              -
              new Date(b.createdAt).getTime()
            );

          }


          if (sort === "priceHigh") {

            return b.price - a.price;

          }


          if (sort === "priceLow") {

            return a.price - b.price;

          }


          if (sort === "timeline") {

            const getDays =
              (value:string) =>
                Number(
                  value.match(/\d+/)?.[0] || 0
                );


            return (
              getDays(a.timeline)
              -
              getDays(b.timeline)
            );

          }


          return 0;

        }
      );


      return result;


    }, [
      proposals,
      search,
      sort,
    ]);



  // ==========================
  // Statistics
  // ==========================

  const stats =
    useMemo(() => ({

      total:
        proposals.length,


      pending:
        proposals.filter(
          (p) =>
            p.status === "pending"
        ).length,


      accepted:
        proposals.filter(
          (p) =>
            p.status === "accepted"
        ).length,


      rejected:
        proposals.filter(
          (p) =>
            p.status === "rejected"
        ).length,


    }), [
      proposals
    ]);




  // ==========================
  // Filters Handlers
  // ==========================

  const handleFiltersChange = (
    next:{
      search?:string;
      status?:string;
      sort?:string;
    }
  ) => {


    if(next.search !== undefined)
      setSearch(next.search);


    if(next.status !== undefined)
      setStatus(
        next.status as ProposalStatus | ""
      );


    if(next.sort !== undefined)
      setSort(
        next.sort as SortType
      );


    setPage(1);

  };



  const resetFilters = () => {

    setSearch("");

    setStatus("");

    setSort("newest");

    setPage(1);

  };
  const handleWithdraw = async () => {

  if (!withdrawId) return;

  try {

    await proposalsApi.withdraw(withdrawId);

    success(
      "Proposal withdrawn successfully."
    );

    setWithdrawId(null);

    loadProposals();


  } catch (err) {

    showError(
      getApiErrorMessage(
        err,
        "Failed to withdraw proposal."
      )
    );

  }

};


const handleView = (proposal: Proposal) => {
  setSelectedProposal(proposal);
};


const handleEdit = (proposal:Proposal)=>{

setEditingProposal(proposal);

setEditForm({
 coverLetter:proposal.coverLetter,
 price:proposal.price,
 timeline:proposal.timeline
});

};

const handleSaveEdit = async (event: FormEvent) => {
  event.preventDefault();
  if (!editingProposal) return;

  try {
    await proposalsApi.update(editingProposal._id, {
      coverLetter: editForm.coverLetter,
      price: editForm.price,
      timeline: editForm.timeline,
    });
    success("Proposal updated successfully.");
    setEditingProposal(null);
    await loadProposals();
  } catch (err) {
    showError(getApiErrorMessage(err, "Failed to update proposal."));
  }
};

return (

<div className="proposal-page">

  <DashboardPageShell

    eyebrow="Freelancer"

    title="My Proposals"

    subtitle="Manage your submitted proposals and track your opportunities."

  />


  <ProposalStats
    total={stats.total}
    pending={stats.pending}
    accepted={stats.accepted}
    rejected={stats.rejected}
  />



  {error && (

    <div className="wn-dash-alert wn-dash-alert--error">

      {error}

      <Button
        size="sm"
        variant="secondary"
        onClick={loadProposals}
      >
        Retry
      </Button>

    </div>

  )}



  <ProposalFilters

    search={search}

    status={status}

    sort={sort}

    onChange={handleFiltersChange}

    onClear={resetFilters}

  />



  <div className="wn-dash-page__card">


    {loading ? (

      <BlockLoader
        label="Loading proposals..."
      />


    ) : filteredProposals.length === 0 ? (

      <EmptyState

        title="No proposals found"

        description="Submit proposals to jobs and they will appear here."

        actionLabel="Browse jobs"

        actionTo="/freelancer/jobs"

      />


    ) : (


      <>

        <p className="proposal-result-count">

          Showing {filteredProposals.length} proposals

        </p>
       <br></br>

        <ProposalList

          proposals={filteredProposals}

          onView={(proposal: Proposal) => {
            setSelectedProposal(proposal);
          }}

          onEdit={handleEdit}

          onWithdraw={(proposal)=>
            setWithdrawId(proposal._id)
          }

        />



        {totalPages > 1 && (

          <Pagination

            totalPages={totalPages}

            currentPage={page}

            onPageChange={setPage}

          />

        )}


      </>

    )}

  </div>
   {selectedProposal && (

<div className="proposal-confirm-overlay">

  <div className="proposal-details-modal">


    <div className="proposal-details-modal__header">

      <h2>
        {
          typeof selectedProposal.jobId === "string"
          ? "Proposal Details"
          : selectedProposal.jobId.title
        }
      </h2>


      <Button
        variant="ghost"
        onClick={() => setSelectedProposal(null)}
      >
        Close
      </Button>

    </div>



    <div className="proposal-details-modal__section">

      <h4>
        Cover Letter
      </h4>

      <p>
        {selectedProposal.coverLetter}
      </p>

    </div>



    <div className="proposal-info">

      <div>
        <span>
          Your Price
        </span>

        <strong>
          ${selectedProposal.price}
        </strong>
      </div>


      <div>
        <span>
          Timeline
        </span>

        <strong>
          {selectedProposal.timeline}
        </strong>
      </div>


    </div>

    {selectedProposal.status === "accepted" && (
      <div className="proposal-actions" style={{ marginTop: 20 }}>
        <Button variant="outline" size="sm" to="/freelancer/interviews">
          Interviews
        </Button>
        {typeof selectedProposal.jobId === "object" &&
          selectedProposal.jobId?._id &&
          (selectedProposal.jobId.status === "in_progress" ||
            !selectedProposal.jobId.status) && (
            <Button
              variant="primary"
              size="sm"
              to={`/freelancer/workspace?jobId=${selectedProposal.jobId._id}`}
            >
              Open workspace
            </Button>
          )}
      </div>
    )}


  </div>

</div>

)}

{editingProposal && (

<div className="proposal-confirm-overlay">


<div className="proposal-details-modal">


<h2>
 Edit Proposal
</h2>


<form className="proposal-edit-form" onSubmit={handleSaveEdit}>


<label>

Cover Letter

<textarea

value={editForm.coverLetter}

onChange={(e)=>
setEditForm({
...editForm,
coverLetter:e.target.value
})
}

/>

</label>



<label>

Price


<input

type="number"

value={editForm.price}

onChange={(e)=>
setEditForm({
...editForm,
price:Number(e.target.value)
})
}

/>

</label>



<label>

Timeline


<input

value={editForm.timeline}

onChange={(e)=>
setEditForm({
...editForm,
timeline:e.target.value
})
}

/>

</label>



<div className="proposal-edit-form__actions">


<Button
variant="secondary"
onClick={()=>
setEditingProposal(null)
}
>
Cancel
</Button>


<Button
variant="primary"
type="submit"
>
Save Changes
</Button>


</div>


</form>


</div>


</div>

)}
  {withdrawId && (

    <div className="proposal-confirm-overlay">

      <div className="proposal-confirm-modal">


        <h3>
          Withdraw Proposal?
        </h3>


        <p>
          This action cannot be undone.
        </p>



        <div>

          <Button

            variant="secondary"

            onClick={() =>
              setWithdrawId(null)
            }

          >
            Cancel

          </Button>



          <Button

            variant="danger"

            onClick={handleWithdraw}

          >
            Withdraw

          </Button>


        </div>


      </div>

    </div>

  )}


</div>

)}