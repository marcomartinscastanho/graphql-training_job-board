import cors from "cors";
import express, { Request } from "express";
import { authMiddleware, handleLogin } from "./auth";
import { ApolloServer } from "@apollo/server";
import { readFile } from "node:fs/promises";
import { expressMiddleware as apolloMiddleware } from "@apollo/server/express4";
import { resolvers } from "./resolvers";
import { getUser } from "./db/users";
import { createCompanyLoader } from "./db/companies";

const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post("/login", handleLogin);

const typeDefs = await readFile("./schema.graphql", "utf8");

const getContext = async ({ req }: { req: Request }) => {
  // if we create a companyLoader per request instead of having a global one
  // it only keep companies in the cache for the duration of each request
  // this way we avoid the issue of a company being modified between requests
  // and the new data not being loaded because the company is in the cache
  const companyLoader = createCompanyLoader();
  const context = { companyLoader };

  if (req.auth) {
    const user = await getUser(req.auth.sub);
    return { ...context, user };
  }
  return context;
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();
// context is set here
app.use("/graphql", apolloMiddleware(apolloServer, { context: getContext }));

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
