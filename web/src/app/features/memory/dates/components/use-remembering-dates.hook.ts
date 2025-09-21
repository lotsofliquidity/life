import { useState } from "react";
import { wordMap } from "../../../words";
import {
  dayAtom,
  monthAtom,
  yearAtom,
  generatedImageAtom,
  eventNameAtom,
} from "../../store/memoryAtoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useGetGenerateImage } from "@/app/api/use-generate-image.hook";
import { WordScrollDirection } from "../../store/enums";

export const useRememberingDates = () => {
  const [day, setDay] = useAtom(dayAtom);
  const [month, setMonth] = useAtom(monthAtom);
  const [year, setYear] = useAtom(yearAtom);
  const setGeneratedImage = useSetAtom(generatedImageAtom);
  const [dayWordIndex, setDayWordIndex] = useState(0);
  const [monthWordIndex, setMonthWordIndex] = useState(0);
  const [yearWordIndex, setYearWordIndex] = useState(0);
  const eventName = useAtomValue(eventNameAtom);
  const { mutate: generateImage, isPending: isGenerateImagePending, data, error: generateImageError } = useGetGenerateImage();

  /**  
    123 -> ["01", "23"]

    1234 -> ["12", "34"]

    12345 -> ["01", "23", "45"]
    */
  const paddingChunkedValues = (value: string) => {
    return splitIntoChunks(
      value.padStart(value.length % 2 ? value.length + 1 : value.length, "0")
    );
  };

  // Word options for different numbers (using phonetic/visual associations / Major System)
  const getWordOptions = (num: string) => {
    if (wordMap.hasOwnProperty(num)) {
      return wordMap[num];
    }
    if (Number.parseInt(num) >= 1000) {
      const chunks = paddingChunkedValues(num);

      return chunks.flatMap((chunk) => wordMap[Number(chunk)]);
    }
    return [];
  };

  const splitIntoChunks = (str: string): string[] => {
    const chunkSize = 2;
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += chunkSize) {
      chunks.push(str.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const splitAndGetWordOptions = (number: string | null): string[][] => {
    if (!number) return [];
    const chunks = splitIntoChunks(number);
    return chunks.map((chunk) => getWordOptions(chunk));
  };

  const getWords = (
    number: string | null,
    wordIndex: number
  ): string | null => {
    const chunkOptions = splitAndGetWordOptions(number);

    if (chunkOptions.length === 2) {
      const [firstChunkOptions, secondChunkOptions] = chunkOptions;
      const combinations = firstChunkOptions.flatMap((first) =>
        secondChunkOptions.map((second) => `${first} ${second}`)
      );
      return combinations[wordIndex];
    }

    return chunkOptions.flat()[wordIndex];
  };

  const getDayWord = () => getWords(day, dayWordIndex);
  const getMonthWord = () => getWords(month, monthWordIndex);
  const getYearWord = () => getWords(year, yearWordIndex);

  const cycleWord = (
    number: string | null,
    setWordIndex: React.Dispatch<React.SetStateAction<number>>,
    direction: WordScrollDirection
  ): void => {
    if (!number) return;
    const chunkOptions = splitAndGetWordOptions(number);

    let totalCombinations = 0;
    if (chunkOptions.length === 2) {
      const [firstChunkOptions, secondChunkOptions] = chunkOptions;
      totalCombinations = firstChunkOptions.length * secondChunkOptions.length;
    } else {
      totalCombinations = chunkOptions.flat().length;
    }

    changeDirection(setWordIndex, direction, totalCombinations);
  };

  const changeDirection = (
    setWordIndex: React.Dispatch<React.SetStateAction<number>>,
    direction: WordScrollDirection,
    totalCombinations: number
  ) => {
    if (direction === "up") {
      setWordIndex((prev) => (prev + 1) % totalCombinations);
    } else {
      setWordIndex(
        (prev) => (prev - 1 + totalCombinations) % totalCombinations
      );
    }
  };

  const cycleDayWord = (direction: WordScrollDirection) =>
    cycleWord(day, setDayWordIndex, direction);
  const cycleMonthWord = (direction: WordScrollDirection) =>
    cycleWord(month, setMonthWordIndex, direction);
  const cycleYearWord = (direction: WordScrollDirection) =>
    cycleWord(year, setYearWordIndex, direction);

  const concatWords = (): string => {
    return [getDayWord(), getMonthWord(), getYearWord()].filter(Boolean).join(", ");
  };

  const handleDayChange = (value: string) => {
    setDay(value);
    setDayWordIndex(0);
  };

  const handleMonthChange = (value: string) => {
    setMonth(value);
    setMonthWordIndex(0);
  };

  const handleYearChange = (value: string) => {
    setYear(value);
    setYearWordIndex(0);
  };

  const handleGenerateImage = async () => {
    setGeneratedImage(null);

    const concatenatedWords = concatWords();
    const prompt = `Generate a surreal, illustration that tells a wildly exaggerated and visually bizarre story about ${eventName} in no more than 4 tiles, can even be 1 if required. The image must use all of the following words as visual elements: ${concatenatedWords}. Depict the story in a sequential absurd scene while remaining tied to the central theme of ${eventName}. 

Objects or people should be oversized, distorted, or behaving unnaturally. Use vivid, saturated colors to heighten the madness and make the image unforgettable. 

Do NOT use any text! This story must be told entirely through visuals. Incorporate thematic symbols like flags, geography, or historical references to anchor the chaos in the event. Every word must be clearly represented as a visual motif on screen. The final result should feel like a fever dream with a hint of historical parody.`;


    console.log("Prompt:", prompt);
    generateImage({
      prompt,
      words: concatenatedWords,
      date: `${year}-${month}-${day}`,
    });
  };

  return {
    generateImage,
    isGenerateImagePending,
    generateImageError,
    data,
    day,
    month,
    year,
    dayWordIndex,
    monthWordIndex,
    yearWordIndex,
    concatWords,
    getDayWord,
    getMonthWord,
    getYearWord,
    cycleDayWord,
    cycleMonthWord,
    cycleYearWord,
    handleDayChange,
    handleMonthChange,
    handleYearChange,
    handleGenerateImage,
  };
};
