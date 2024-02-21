import { useQuery } from "@apollo/client";
import { companyIdQuery, jobByIdQuery, jobsQuery } from "./queries";

export const useCompany = (id) => {
  const { data, error, loading } = useQuery(companyIdQuery, { variables: { id } });
  return { company: data?.company, error: Boolean(error), loading };
};

export const useJobs = () => {
  const { data, error, loading } = useQuery(jobsQuery, { fetchPolicy: "network-only" });
  return { jobs: data?.jobs, error: Boolean(error), loading };
};

export const useJob = (id) => {
  const { data, error, loading } = useQuery(jobByIdQuery, { variables: { id } });
  return { job: data?.job, error: Boolean(error), loading };
};
