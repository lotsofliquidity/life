import axios from "axios";

export async function generateImage(
  prompt: string,
  words: string,
  date: string
): Promise<string> {
  try {
    const response = await axios.post("http://localhost:3333/GenerateImage", {
      prompt,
      words,
      date,
    });

    console.log("API Response:", response.data);
    // Adjust this according to your API response structure
    return response.data.image;
  } catch (error: any) {
    throw new Error(`Error generating image: ${error.message}`);
  }
}
