import { getJobs } from "./db/jobs";

export const resolvers = {
  Query: {
    jobs: () => getJobs(),
  },

  Job: {
    date: (job) => job.createdAt.slice(0, "yyyy-mm-dd".length),
  },
};
