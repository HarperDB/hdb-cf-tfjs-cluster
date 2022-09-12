/**
 * setup.js
 * configures clustering - pub/sub for tables
 * creates schema
 */
import axios from "axios";
import range from "lodash/range.js";

const nNodes = 5;

const hdbUser = "hdbcf";
const hdbPass = "hdbcf";
const schema = "dont_forget";

const token = Buffer.from(`${hdbUser}:${hdbPass}`).toString("base64");

// configure clustering
for await (const nNode of range(1, nNodes + 1)) {
  console.log("subscribing for ", nNode);
  try {
    const { data, status } = await axios({
      url: `http://localhost:94${nNode}5`,
      method: "POST",
      headers: {
        authorization: `Basic ${token}`,
      },
      data: {
        operation: "add_node",
        name: "tfjs-dashboard",
        host: "host.docker.internal",
        port: 12345,
        subscriptions: [
          {
            channel: "dont_forget:deployed_models",
            subscribe: true,
            publish: false,
          },
          {
            channel: "dont_forget:purchases",
            subscribe: false,
            publish: true,
          },
          {
            channel: "dont_forget:items",
            subscribe: true,
            publish: false,
          },
          {
            channel: "dont_forget:model_metrics",
            subscribe: false,
            publish: true,
          },
          {
            channel: "dont_forget:production_metrics",
            subscribe: false,
            publish: true,
          },
        ],
      },
    });
    console.log("status", status);
    console.log("data", data);
  } catch (error) {
    console.log("error", error);
    console.log("error.message", error.message);
  }
  console.log("waiting 15s");
  await new Promise((r) => setTimeout(r, 15 * 1000));
}

console.log("waiting 45s");
await new Promise((r) => setTimeout(r, 45 * 1000));

// setup schema
console.log("dropping schema");
try {
  const { data, status } = await axios({
    url: "http://localhost:9405",
    method: "POST",
    headers: {
      authorization: `Basic ${token}`,
    },
    data: {
      operation: "drop_schema",
      schema,
    },
  });
  console.log("status", status);
  console.log("data", data);
} catch (error) {
  console.log("error.message", error.message);
}

console.log("creating schema");
try {
  const { data, status } = await axios({
    url: "http://localhost:9405",
    method: "POST",
    headers: {
      authorization: `Basic ${token}`,
    },
    data: {
      operation: "create_schema",
      schema,
    },
  });
  console.log("status", status);
  console.log("data", data);
} catch (error) {
  console.log("error.message", error.message);
}

console.log("creating purchases table");
try {
  const { data, status } = await axios({
    url: "http://localhost:9405",
    method: "POST",
    headers: {
      authorization: `Basic ${token}`,
    },
    data: {
      operation: "create_table",
      schema,
      table: "purchases",
      hash_attribute: "id",
    },
  });
  console.log("status", status);
  console.log("data", data);
} catch (error) {
  console.log("error.message", error.message);
}

console.log("creating item table");
try {
  const { data, status } = await axios({
    url: "http://localhost:9405",
    method: "POST",
    headers: {
      authorization: `Basic ${token}`,
    },
    data: {
      operation: "create_table",
      schema,
      table: "items",
      hash_attribute: "id",
    },
  });
  console.log("status", status);
  console.log("data", data);
} catch (error) {
  console.log("error.message", error.message);
}

console.log("creating models table");
try {
  const { data, status } = await axios({
    url: "http://localhost:9405",
    method: "POST",
    headers: {
      authorization: `Basic ${token}`,
    },
    data: {
      operation: "create_table",
      schema,
      table: "models",
      hash_attribute: "id",
    },
  });
  console.log("status", status);
  console.log("data", data);
} catch (error) {
  console.log("error.message", error.message);
}

console.log("creating deployed_models table");
try {
  const { data, status } = await axios({
    url: "http://localhost:9405",
    method: "POST",
    headers: {
      authorization: `Basic ${token}`,
    },
    data: {
      operation: "create_table",
      schema,
      table: "deployed_models",
      hash_attribute: "id",
    },
  });
  console.log("status", status);
  console.log("data", data);
} catch (error) {
  console.log("error.message", error.message);
}

console.log("creating model_metrics table");
try {
  const { data, status } = await axios({
    url: "http://localhost:9405",
    method: "POST",
    headers: {
      authorization: `Basic ${token}`,
    },
    data: {
      operation: "create_table",
      schema,
      table: "model_metrics",
      hash_attribute: "id",
    },
  });
  console.log("status", status);
  console.log("data", data);
} catch (error) {
  console.log("error.message", error.message);
}

console.log("creating production_metrics table");
try {
  const { data, status } = await axios({
    url: "http://localhost:9405",
    method: "POST",
    headers: {
      authorization: `Basic ${token}`,
    },
    data: {
      operation: "create_table",
      schema,
      table: "production_metrics",
      hash_attribute: "id",
    },
  });
  console.log("status", status);
  console.log("data", data);
} catch (error) {
  console.log("error.message", error.message);
}
