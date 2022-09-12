/**
 * cleanData.js
 * create list of all items and indexes for each
 * parse the Groceries_dataset into shopping excursions per user
 * split purchase data amongst nodes
 */
import axios from "axios";
import fs from "fs";
import range from "lodash/range.js";
import shuffle from "lodash/shuffle.js";

const nNodes = 5;

const hdbUser = "hdbcf";
const hdbPass = "hdbcf";
const schema = "dont_forget";

console.log("loading data");
const data = fs.readFileSync("Groceries_dataset.csv").toString();

console.log("gathering items and users");
const items = [];
const users = [];
const lines = data.split("\n");
lines.shift();
lines.forEach((line) => {
  const info = line.split(",");
  const user = info[0];
  const date = info[1];
  const item = info[2];
  users.push(user);
  items.push(item);
});

console.log("creating idx lookups");
const userIdxs = Array.from(new Set(users)).reduce((all, user, index) => {
  all[user] = index;
  return all;
}, {});
console.log("nUsers", Object.keys(userIdxs).length);

// group users by tfjs-node
const nUsersPerNode = Math.floor(Object.keys(userIdxs).length / nNodes);
const nodeUsers = {};
const shuffledUsers = shuffle(Object.values(userIdxs));
for (let i = 1; i <= nNodes; i++) {
  shuffledUsers
    .slice((i - 1) * nUsersPerNode, i * nUsersPerNode)
    .forEach((userIdx) => {
      nodeUsers[userIdx] = i;
    });
}
console.log("nUsersPerNode", nUsersPerNode);

let v = 0;
for (let i = 1; i <= nNodes; i++) {
  v += Object.keys(nodeUsers).filter((k) => nodeUsers[k] == i).length;
  console.log(
    `Object.keys(nodeUsers).filter(k => nodeUsers[k] == ${i}).length`,
    Object.keys(nodeUsers).filter((k) => nodeUsers[k] == i).length
  );
}
console.log("v", v);

const itemIdxs = Array.from(new Set(items)).reduce((all, item, index) => {
  all[item] = index;
  return all;
}, {});
console.log("nItems", Object.keys(itemIdxs).length);

console.log("gathering excursions");
const nodeExcursions = range(1, nNodes + 1).reduce((a, v) => {
  a[v] = [];
  return a;
}, {});

let errorUsers = [];
lines.forEach((line) => {
  const info = line.split(",");
  const user = info[0];
  const userIdx = userIdxs[user];
  const date = info[1];
  const item = info[2];
  const itemIdx = itemIdxs[item];
  const excursionKey = `${userIdx}-${date}`;
  const nNode = nodeUsers[userIdx];
  try {
    nodeExcursions[nNode][excursionKey].push(itemIdx);
  } catch (error) {
    try {
      nodeExcursions[nNode][excursionKey] = [itemIdx];
    } catch (error) {
      errorUsers.push(userIdx);
    }
  }
});

const purchases = {};
Object.keys(nodeExcursions).forEach((nNode) => {
  purchases[nNode] = [];
  const excursions = nodeExcursions[nNode];
  Object.keys(excursions).forEach((key) => {
    const items = Array.from(new Set(excursions[key]));
    items.sort();
    const userIdx = key.split("-")[0];
    const date = key.split("-").slice(1).join("-");
    purchases[nNode].push({
      userIdx,
      date,
      items,
      location: `LOCATION-${nNode}`,
    });
  });
});

const token = Buffer.from(`${hdbUser}:${hdbPass}`).toString("base64");

try {
  const { data, status } = await axios({
    url: "http://localhost:9405",
    method: "POST",
    headers: {
      authorization: `Basic ${token}`,
    },
    data: {
      operation: "insert",
      schema,
      table: "items",
      records: Object.keys(itemIdxs).map((item) => ({
        item,
        index: itemIdxs[item],
      })),
    },
  });
} catch (error) {
  console.log("error.message", error.message);
}

for (let i = 1; i <= nNodes; i++) {
  try {
    const { data, status } = await axios({
      url: `http://localhost:94${i}5`,
      method: "POST",
      headers: {
        authorization: `Basic ${token}`,
      },
      data: {
        operation: "insert",
        schema,
        table: "purchases",
        records: purchases[i],
      },
    });
  } catch (error) {
    console.log("error.message", error.message);
  }
}
