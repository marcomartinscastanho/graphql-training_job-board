import { useQuery } from "@apollo/client";
import { companyIdQuery } from "./queries";

export const useCompany = (id) => {
  const { data, error, loading } = useQuery(companyIdQuery, { variables: { id } });
  return { company: data?.company, error: Boolean(error), loading };
};
