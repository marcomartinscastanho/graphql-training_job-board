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

const apolloClient = new ApolloClient({
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

const jobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  # the definition of the fragment must be included along the query
  ${jobDetailFragment}
`;

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
  const { data } = await apolloClient.query({ query: jobByIdQuery, variables: { id } });
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
        # we need to get all the job info, so that we store it in the cache
        # this we we avoid getting the job in a separate request after creating it
        ...JobDetail
      }
    }
    ${jobDetailFragment}
  `;
  const { data } = await apolloClient.mutate({
    mutation,
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

  return data.job;
};
