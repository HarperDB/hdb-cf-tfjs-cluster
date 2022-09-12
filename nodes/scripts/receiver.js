import axios from "axios";
import HarperDBWebSocketClient from "harperdb-websocket-client";

console.log("HELLOOOO1");
// The credentials used here are specific to the docker-compose file defined earlier
const hdbClient = new HarperDBWebSocketClient({
  hostname: "localhost",
  socketClusterOptions: {
    rejectUnauthorized: false,
    autoReconnect: false,
    ackTimeout: 10000,
    secure: true,
  },
  port: 12345,
  username: "hdbcf",
  password: "hdbcf",
  implicitInit: true,
});

hdbClient.subscribe("dont_forget:deployed_models", (data) => {
  // console.log("process.env", process.env);
  const record = data.transaction.records[0];
  axios({
    url: `http://localhost:${process.env.CUSTOM_FUNCTIONS_PORT}/tfjs-cluster/newModel/${record.id}`,
  });
});

await new Promise((r) => setTimeout(r, 300 * 1000));
