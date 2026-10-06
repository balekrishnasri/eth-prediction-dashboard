export const CONTRACT = "0x193dBBA0AeA058b264c8FEBE6b3A0B90FA672a5b" as const;
export const PRICE_DECIMALS = 8;

const predictionComponents = [
  { name: "id", type: "uint256" },
  { name: "predictorAddress", type: "address" },
  { name: "targetTimestamp", type: "uint256" },
  { name: "predictedPrice", type: "uint256" },
  { name: "actualPrice", type: "uint256" },
  { name: "isResolved", type: "bool" },
  { name: "accuracyScore", type: "uint256" },
  { name: "committedAt", type: "uint256" },
  { name: "resolvedAt", type: "uint256" },
] as const;

export const trackerAbi = [
  {
    type: "function",
    name: "predictionCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getPredictions",
    stateMutability: "view",
    inputs: [
      { name: "fromId", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [{ name: "out", type: "tuple[]", components: predictionComponents }],
  },
  {
    type: "function",
    name: "getLeaderboard",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "addrs", type: "address[]" },
      { name: "avgScoreBps", type: "uint256[]" },
      { name: "resolvedCounts", type: "uint256[]" },
    ],
  },
] as const;
