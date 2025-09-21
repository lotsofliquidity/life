import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DatePartType, WordScrollDirection } from "../../store/enums";
import InputError from "./input-error.component";

interface InputCyclerProps {
  value?: string | null;
  onChange: (val: string) => void;
  datePartType: DatePartType;
  getDatePartWord: () => string | null;
  cycleDatePartWord: (direction: WordScrollDirection) => void;
  handleDatePartChange: (value: string) => void;
  errors?: { message?: string | null } | undefined;
  disabled?: boolean;
}

export default function InputCycler({
  value,
  onChange,
  datePartType,
  getDatePartWord,
  cycleDatePartWord,
  handleDatePartChange,
  errors,
  disabled = false,
}: InputCyclerProps) {
  const maxLength = datePartType === "Year" ? 4 : 2;
  
  return (
    <div>
      <div className="space-y-2">
        <Label htmlFor={datePartType} className="text-sm">
          {datePartType}
        </Label>
        <Input
          type="text"
          id={datePartType}
          value={value ?? ""}
          onChange={(e) => {
            onChange(e.target.value);
            handleDatePartChange(e.target.value);
          }}
          maxLength={maxLength}
          disabled={disabled}
        />
        {value && (
          <div className="text-center">
            <div className="text-xs font-medium text-primary mb-1">
              {getDatePartWord()}
            </div>
            <div className="flex justify-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => cycleDatePartWord("up")}
                className="h-6 w-6 p-0"
                disabled={disabled}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => cycleDatePartWord("down")}
                className="h-6 w-6 p-0"
                disabled={disabled}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
      {errors && !value && <InputError message={errors.message || null} />}
    </div>
  );
}