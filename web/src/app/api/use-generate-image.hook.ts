import { useMutation } from "@tanstack/react-query";
import { generateImage } from "./generateImage";

export const useGetGenerateImage = () => {
    return useMutation({
        mutationFn: async ({ prompt, words, date }: { prompt: string; words: string; date: string }) => {
            return await generateImage(prompt, words, date);
        },
        onSuccess: (image: string) => {
            console.log("Image generated successfully:", image);
        },
        onError: (error) => {
            console.error("Failed to generate image:", error);
        },
    });
};
