import { useState } from "react";
import JobList from "../components/JobList";
import { useJobs } from "../lib/graphql/hooks";

const JOBS_PER_PAGE = 10;

function HomePage() {
  const [currentPage, setCurrentPage] = useState(0);
  const { jobs, error, loading } = useJobs(JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="has-text-danger">Data unavailable</div>;
  }

  return (
    <div>
      <h1 className="title">Job Board</h1>
      <div>
        <button onClick={() => setCurrentPage((prevPage) => prevPage - 1)}>Previous</button>
        <span> {currentPage + 1} </span>
        <button onClick={() => setCurrentPage((prevPage) => prevPage + 1)}>Next</button>
      </div>
      <JobList jobs={jobs} />
    </div>
  );
}

export default HomePage;
