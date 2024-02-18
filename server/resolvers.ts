import { GraphQLError } from "graphql";
import { getCompany } from "./db/companies";
import { createJob, deleteJob, getJob, getJobs, getJobsByCompanyId } from "./db/jobs";

export const resolvers = {
  Query: {
    company: async (_root, { id }) => {
      const company = await getCompany(id);

      if (!company) {
        throw notFoundError("No Company found with id " + id);
      }

      return company;
    },
    // the first parameter of this resolver is the root object, which is useless here
    // the second parameter however is the request arguments object
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError("No Job found with id " + id);
      }
      return job;
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

  Mutation: {
    createJob: (_root, { input: { title, description } }) => {
      const companyId = "FjcJCHJALA4i"; // TODO: temp
      return createJob({ title, description, companyId });
    },
    deleteJob: (_root, { id }) => {
      return deleteJob(id);
    },
  },
};

const notFoundError = (message: string) => {
  return new GraphQLError(message, {
    extensions: {
      code: "NOT_FOUND",
    },
  });
};
