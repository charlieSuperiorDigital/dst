import { apiRequest } from "@/utils/client-side-api";

interface PaintType {
  id: number;
  description: string;
  name: string;
}

let paintTypes: PaintType[] = [];

export const updatePaintTypes = async () => {
  try {
    const colors: PaintType[] = await apiRequest({
      url: '/api/Color',
      method: 'get'
    });
    paintTypes = colors;
    return colors;
  } catch (error) {
    console.error('Error updating paint types:', error);
    console.log(error as Error);
    return paintTypes; // Return default colors if API call fails
  }
};

// Initialize colors when the module is imported
updatePaintTypes();

export { paintTypes };
