import { getCompany } from "./db/companies";
import { getJob, getJobs } from "./db/jobs";

export const resolvers = {
  Query: {
    company: (_root, { id }) => getCompany(id),
    // the first parameter of this resolver is the root object, which is useless here
    // the second parameter however is the request arguments object
    job: (_root, args) => {
      const { id } = args;
      return getJob(id);
    },
    jobs: () => getJobs(),
  },

  Job: {
    // resolver function always receives the parent object as the first parameter
    // which in this case is the job object
    date: (job) => job.createdAt.slice(0, "yyyy-mm-dd".length),
    company: (job) => getCompany(job.companyId),
  },
};
