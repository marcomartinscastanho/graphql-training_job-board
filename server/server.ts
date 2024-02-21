import cors from "cors";
import express, { Request } from "express";
import { authMiddleware, handleLogin } from "./auth";
import { ApolloServer } from "@apollo/server";
import { readFile } from "node:fs/promises";
import { expressMiddleware as apolloMiddleware } from "@apollo/server/express4";
import { resolvers } from "./resolvers";
import { getUser } from "./db/users";

const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post("/login", handleLogin);

const typeDefs = await readFile("./schema.graphql", "utf8");

const getContext = async ({ req }: { req: Request }) => {
  if (req.auth) {
    const user = await getUser(req.auth.sub);
    return { user };
  }
  return {};
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();
// context is set here
app.use("/graphql", apolloMiddleware(apolloServer, { context: getContext }));

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
