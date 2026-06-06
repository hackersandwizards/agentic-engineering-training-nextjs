"use client";

import { Checkbox } from "@chakra-ui/react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface CheckboxFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  disabled?: boolean;
}

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
}: CheckboxFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox.Root
          checked={field.value === true}
          disabled={disabled}
          onCheckedChange={(e) => field.onChange(e.checked === true)}
        >
          <Checkbox.HiddenInput onBlur={field.onBlur} />
          <Checkbox.Control />
          <Checkbox.Label>{label}</Checkbox.Label>
        </Checkbox.Root>
      )}
    />
  );
}
