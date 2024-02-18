import { getCompany } from "./db/companies";
import { getJob, getJobs, getJobsByCompanyId } from "./db/jobs";

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

  // when you query for objects that exist on the DB, graphql will return them
  // but if you query for fields that are not on the DB, or are under a different name
  // then you need a resolver for those fields (e.g. job doesn't have a date column)

  Company: {
    jobs: (company) => getJobsByCompanyId(company.id),
  },

  Job: {
    // resolver function always receives the parent object as the first parameter
    // which in this case is the job object
    date: (job) => job.createdAt.slice(0, "yyyy-mm-dd".length),
    company: (job) => getCompany(job.companyId),
  },
};
