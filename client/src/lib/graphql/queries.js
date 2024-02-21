import { ApolloClient, ApolloLink, InMemoryCache, concat, createHttpLink, gql } from "@apollo/client";
import { getAccessToken } from "../auth";

const httpLink = createHttpLink({ uri: "http://localhost:9000/graphql" });
const authLink = new ApolloLink((operation, forward) => {
  console.log("[customLink] operation:", operation);

  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});

export const getJobs = async () => {
  const query = gql`
    query Jobs {
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
  const { data } = await apolloClient.query({ query, fetchPolicy: "network-only" });
  return data.jobs;
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
  const { data } = await apolloClient.query({ query, variables: { id } });
  return data.job;
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
  const { data } = await apolloClient.query({ query, variables: { id } });
  return data.company;
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
  const { data } = await apolloClient.mutate({ mutation, variables: { input: { title, description } } });
  return data.job;
};
