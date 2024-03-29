import { ApolloClient, ApolloLink, InMemoryCache, concat, createHttpLink, gql } from "@apollo/client";
import { getAccessToken } from "../auth";

const httpLink = createHttpLink({ uri: "http://localhost:9000/graphql" });
const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});

// in order to avoid having to list all the fields of the job in every query,
// one can define a fragment with certain Job fields that are often queried
// and then query for the fields in the fragment
const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    description
    date
    company {
      id
      name
    }
  }
`;

export const jobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  # the definition of the fragment must be included along the query
  ${jobDetailFragment}
`;

export const companyIdQuery = gql`
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

export const jobsQuery = gql`
  query Jobs($limit: Int, $offset: Int) {
    jobs(limit: $limit, offset: $offset) {
      items {
        id
        title
        date
        company {
          id
          name
        }
      }
      totalCount
    }
  }
`;

export const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput!) {
    # job is an alias for the createJob mutation
    # so that the response has a job object and not a createJob object
    job: createJob(input: $input) {
      # we need to get all the job info, so that we store it in the cache
      # this we we avoid getting the job in a separate request after creating it
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;
