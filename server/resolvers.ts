import { getJobs } from "./db/jobs";

export const resolvers = {
  Query: {
    jobs: () => getJobs(),
  },
};
