interface PaintType {
  id: number;
  description: string;
  name: string;
}
export const paintTypes: PaintType[] = [
  { id: 1, description: "Standard Blue", name: "stdBlue" },
  { id: 2, description: "Standard Orange", name: "stdOrange" },
  { id: 3, description: "Galvazined", name: "galv" },
  { id: 4, description: "Unpainted", name: "unpainted" },
  { id: 5, description: "Standard Red", name: "stdRed" },
];
