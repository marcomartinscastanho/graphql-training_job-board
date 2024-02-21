import { GraphQLClient, gql } from "graphql-request";
import { getAccessToken } from "../auth";

const client = new GraphQLClient("http://localhost:9000/graphql", {
  headers: () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      return { Authorization: `Bearer ${accessToken}` };
    }
    return {};
  },
});

export const getJobs = async () => {
  const query = gql`
    query {
      jobs {
        id
        title
        date
        company {
          id
          name
        }
      }
    }
  `;
  const { jobs } = await client.request(query);
  return jobs;
};

export const getJob = async (id) => {
  const query = gql`
    query JobById($id: ID!) {
      job(id: $id) {
        id
        title
        description
        date
        company {
          id
          name
        }
      }
    }
  `;
  const { job } = await client.request(query, { id });
  return job;
};

export const getCompany = async (id) => {
  const query = gql`
    query CompanyById($id: ID!) {
      company(id: $id) {
        name
        description
        jobs {
          id
          title
          date
        }
      }
    }
  `;
  const { company } = await client.request(query, { id });
  return company;
};

export const createJob = async ({ title, description }) => {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput!) {
      # job is an alias for the createJob mutation
      # so that the response has a job object and not a createJob object
      job: createJob(input: $input) {
        id
      }
    }
  `;
  const { job } = await client.request(mutation, {
    input: {
      title,
      description,
    },
  });
  return job;
};
