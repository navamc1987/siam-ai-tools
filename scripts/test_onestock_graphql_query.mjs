const payload = {
  operationName: "ConstructionCalculatorResultHooks",
  query:
    "query ConstructionCalculatorResultHooks($sku:[String!]!){findItemsBySku(sku:$sku){id sku name piecePerPack piecePerPackUnit unit url priceSummary{priceAfterDiscount}}}",
  variables: {
    sku: ["A30200089", "A30200092"],
  },
};

const res = await fetch("https://www.onestockhome.com/th/graph_api/v1/graphql", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    accept: "application/json",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    origin: "https://www.onestockhome.com",
    referer: "https://www.onestockhome.com/th/construction_calculator",
  },
  body: JSON.stringify(payload),
});

console.log("status", res.status);
const text = await res.text();
console.log(text.slice(0, 2000));

