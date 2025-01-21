export type MockRow = {
  id: string;
  name: string;
  quotationId: string;
  part: {
    id: number;
    description: string;
    quantity: number;
  }[];
};

export const mockRows: MockRow[] = [
  {
    id: "1",
    name: "ROW-1",
    quotationId: "Q-1001",
    part: [
      { id: 1, description: "Part A", quantity: 1 },
      { id: 2, description: "Part B", quantity: 2 },
      { id: 3, description: "Part C", quantity: 3 },
    ],
  },
  {
    id: "2",
    name: "ROW-2",
    quotationId: "Q-1002",
    part: [
      { id: 3, description: "Part C", quantity: 3 },
      { id: 4, description: "Part D", quantity: 4 },
      { id: 1, description: "Part A", quantity: 1 },
    ],
  },
  {
    id: "3",
    name: "ROW-3",
    quotationId: "Q-1003",
    part: [
      { id: 5, description: "Part E", quantity: 5 },
      { id: 6, description: "Part F", quantity: 6 },
      { id: 2, description: "Part B", quantity: 2 },
    ],
  },
  {
    id: "4",
    name: "ROW-4",
    quotationId: "Q-1004",
    part: [
      { id: 7, description: "Part G", quantity: 7 },
      { id: 8, description: "Part H", quantity: 8 },
      { id: 3, description: "Part C", quantity: 3 },
    ],
  },
  {
    id: "5",
    name: "ROW-5",
    quotationId: "Q-1005",
    part: [
      { id: 9, description: "Part I", quantity: 9 },
      { id: 10, description: "Part J", quantity: 10 },
      { id: 5, description: "Part E", quantity: 5 },
    ],
  },
  {
    id: "6",
    name: "ROW-6",
    quotationId: "Q-1006",
    part: [
      { id: 11, description: "Part K", quantity: 11 },
      { id: 12, description: "Part L", quantity: 12 },
      { id: 7, description: "Part G", quantity: 7 },
    ],
  },
  {
    id: "7",
    name: "ROW-7",
    quotationId: "Q-1007",
    part: [
      { id: 13, description: "Part M", quantity: 13 },
      { id: 14, description: "Part N", quantity: 14 },
      { id: 8, description: "Part H", quantity: 8 },
    ],
  },
  {
    id: "8",
    name: "ROW-8",
    quotationId: "Q-1008",
    part: [
      { id: 15, description: "Part O", quantity: 15 },
      { id: 16, description: "Part P", quantity: 16 },
      { id: 9, description: "Part I", quantity: 9 },
    ],
  },
  {
    id: "9",
    name: "ROW-9",
    quotationId: "Q-1009",
    part: [
      { id: 17, description: "Part Q", quantity: 17 },
      { id: 18, description: "Part R", quantity: 18 },
      { id: 10, description: "Part J", quantity: 10 },
      { id: 1, description: "Part A", quantity: 1 },
    ],
  },
];

export default mockRows;
