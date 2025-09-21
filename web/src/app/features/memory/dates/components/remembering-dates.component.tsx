"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useRememberingDates } from "./use-remembering-dates.hook";
import InputCycler from "./input-cycler.component";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { rememberDatesFormSchema } from "../validation";
import InputError from "./input-error.component";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useAtom, useSetAtom } from "jotai";
import { eventNameAtom } from "../../store/memoryAtoms";

export default function RememberingDates() {
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const setEventName = useSetAtom(eventNameAtom);

  const {
    isGenerateImagePending,
    data,
    generateImageError,
    getDayWord,
    handleDayChange,
    getMonthWord,
    handleMonthChange,
    getYearWord,
    handleYearChange,
    handleGenerateImage,
    cycleDayWord,
    cycleMonthWord,
    cycleYearWord,
  } = useRememberingDates();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      event: "",
      day: null,
      month: null,
      year: "",
    },
    resolver: yupResolver(rememberDatesFormSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (data) setGeneratedImageUrl(data);
  }, [data]);

  const onSubmit = () => {
    handleGenerateImage();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">
            Remembering Numbers
          </h1>
          <p className="text-muted-foreground">
            Use the inputs below to help remember important dates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Memory Aid</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="event">
                    What date are you trying to remember?
                  </Label>
                  <Controller
                    name="event"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e); // update RHF state
                          setEventName(e.target.value); // update jotai atom
                        }}
                        type="text"
                        id="event"
                      />
                    )}
                  />
                  {errors.event && (
                    <InputError message={errors.event.message || null} />
                  )}
                </div>
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    When was the event?
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Controller
                      name="day"
                      control={control}
                      render={({ field }) => (
                        <InputCycler
                          {...field}
                          datePartType="Day"
                          getDatePartWord={getDayWord}
                          cycleDatePartWord={cycleDayWord}
                          handleDatePartChange={handleDayChange}
                          errors={errors.day}
                          disabled={isGenerateImagePending}
                        />
                      )}
                    />
                    <Controller
                      name="month"
                      control={control}
                      render={({ field }) => (
                        <InputCycler
                          {...field}
                          datePartType="Month"
                          getDatePartWord={getMonthWord}
                          cycleDatePartWord={cycleMonthWord}
                          handleDatePartChange={handleMonthChange}
                          errors={errors.month}
                          disabled={isGenerateImagePending}
                        />
                      )}
                    />
                    <Controller
                      name="year"
                      control={control}
                      render={({ field }) => (
                        <InputCycler
                          {...field}
                          datePartType="Year"
                          getDatePartWord={getYearWord}
                          cycleDatePartWord={cycleYearWord}
                          handleDatePartChange={handleYearChange}
                          errors={errors.year}
                          disabled={isGenerateImagePending}
                        />
                      )}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isGenerateImagePending}
                >
                  {isGenerateImagePending ? "Generating..." : "Generate"}
                </Button>
                {generateImageError && (
                  <div>
                    <Alert variant="destructive">
                      <Info />
                      <AlertDescription>
                        {generateImageError.message}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </form>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Your Memory Image</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
              {isGenerateImagePending ? (
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Generating image...</p>
                </div>
              ) : generatedImageUrl ? (
                <div className="text-center space-y-4">
                  <Image
                    src={`http://localhost:3333/${
                      generatedImageUrl || "/placeholder.svg"
                    }`}
                    alt={`Mnemonic image for ...`}
                    className="rounded-lg border max-w-full h-auto"
                    width={400}
                    height={400}
                  />
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl text-muted-foreground">?</div>
                  <p className="text-muted-foreground">
                    Click Generate to create your mnemonic image
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
