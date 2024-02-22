import DataLoader from "dataloader";
import { connection } from "./connection";

const getCompanyTable = () => connection.table("company");

export async function getCompany(id: string) {
  return await getCompanyTable().first().where({ id });
}

// the DataLoader batches calls to getCompany together
// calling the batch resolver function
// with the ids of all the calls to getCompany that were batched together
export const createCompanyLoader = () =>
  new DataLoader(async (ids: readonly string[]) => {
    // this gets all the companies we need with 1 SQL query
    const companies = await getCompanyTable().select().whereIn("id", ids);

    // the DataLoader expects the items to be returned in the same order the ids were provided
    // however, an SQL query does not guarantee any specific order
    // so we need to explicitly keep the order of results the same as the order of the ids provided
    return ids.map((id) => companies.find((company) => company.id === id));
  });
