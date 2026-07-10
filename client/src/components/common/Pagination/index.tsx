import "../../../css/Pagination.css";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="wn-pagination">
      <button
        className="wn-pagination__arrow"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        &#10094;
      </button>

      <div className="wn-pagination__dots">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;

          return (
            <button
              key={page}
              className={`wn-pagination__dot ${
                currentPage === page ? "wn-pagination__dot--active" : ""
              }`}
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
            />
          );
        })}
      </div>

      <button
        className="wn-pagination__arrow"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        &#10095;
      </button>
    </div>
  );
}