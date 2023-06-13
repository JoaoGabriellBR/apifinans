import express from "express";
import cors from "cors";
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(routes);

const port = process.env.PORT || 3002;
const server = app.listen(port, () =>
  console.log(`The server is running on port: ${port}`)
);

process.on("SIGINT", () => {
  server.close();
  console.log("Server finalized.");
});

console.clear();
