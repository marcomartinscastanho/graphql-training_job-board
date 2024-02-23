import { useMutation, useQuery } from "@apollo/client";
import { companyIdQuery, createJobMutation, jobByIdQuery, jobsQuery } from "./queries";

export const useCompany = (id) => {
  const { data, error, loading } = useQuery(companyIdQuery, { variables: { id } });
  return { company: data?.company, error: Boolean(error), loading };
};

export const useJobs = (limit, offset) => {
  const { data, error, loading } = useQuery(jobsQuery, { variables: { limit, offset }, fetchPolicy: "network-only" });
  return { jobs: data?.jobs, error: Boolean(error), loading };
};

export const useJob = (id) => {
  const { data, error, loading } = useQuery(jobByIdQuery, { variables: { id } });
  return { job: data?.job, error: Boolean(error), loading };
};

export const useCreateJob = () => {
  // unlike queries, useMutation doesn't send the mutation when called
  // only when the returned "mutate" function is called
  // so that we can control when the mutation is called (when the form is submitted)
  // and not automatically when the page is loaded
  const [mutate, { loading }] = useMutation(createJobMutation);

  const createJob = async (title, description) => {
    const {
      data: { job },
    } = await mutate({
      variables: { input: { title, description } },
      // what this does is: when we call the mutation to create the job, it returns the created job
      // so we explicitly add the returned data to the cache
      // so that the next time this job is queried, it's already in cache
      update: (cache, { data }) => {
        cache.writeQuery({
          query: jobByIdQuery,
          variables: { id: data.job.id },
          data,
        });
      },
    });

    return job;
  };

  return { loading, createJob };
};
