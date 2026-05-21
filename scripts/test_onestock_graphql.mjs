const payload = {
  operationName: "ConstructionCalculatorResultHooks",
  variables: {
    sku: [
      "A30200089",
      "A30200092",
      "A30200271",
      "A30200272",
      "A30200279",
      "A30200280",
      "A30200129",
      "A30200131",
      "A30200133",
      "A30200322",
      "A30200321",
      "A30200328",
      "A30200324",
      "A30200323",
      "A30200135",
      "A30200784",
      "A30200786",
      "A30200785",
      "A30200777",
    ],
  },
  extensions: {
    clientLibrary: { name: "@apollo/client", version: "4.0.7" },
    persistedQuery: {
      version: 1,
      sha256Hash: "ce1a2a013e58773f80a1651362bd2d4d3ce5a3b23430b6d139850acdc44d5fc8",
    },
  },
};

const res = await fetch("https://www.onestockhome.com/th/graph_api/v1/graphql", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    accept: "application/json",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  },
  body: JSON.stringify(payload),
});

console.log("status", res.status);
const text = await res.text();
console.log(text.slice(0, 1000));

