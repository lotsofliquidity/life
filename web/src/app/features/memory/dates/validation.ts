import { object, string } from "yup";

export const rememberDatesFormSchema = object({
  event: string().required("Event name is required"),
  day: string()
    .nullable()
    .test("day-range", "Day must be between 1 and 31", (value) => {
      if (!value) return true; // allow empty
      return /^(0?[1-9]|[12][0-9]|3[01])$/.test(value);
    }),

  month: string()
    .nullable()
    .test("month-range", "Month must be between 1 and 12", (value) => {
      if (!value) return true; // allow empty
      return /^(0?[1-9]|1[0-2])$/.test(value);
    }),

  year: string()
    .matches(/^\d{1,4}$/, "Must be between 1 and 4 digits")
    .required("Year is required"),
});