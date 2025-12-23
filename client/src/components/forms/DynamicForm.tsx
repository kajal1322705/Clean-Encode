import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type FieldDescriptor, getFormFields, type FieldMap } from "@/data/fieldMapper";
import { Loader2 } from "lucide-react";

interface DynamicFormProps {
  fieldMap: FieldMap;
  onSubmit: (data: Record<string, unknown>) => void;
  defaultValues?: Record<string, unknown>;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
}

function buildZodSchema(fields: FieldDescriptor[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  fields.forEach(field => {
    let fieldSchema: z.ZodTypeAny;
    
    switch (field.type) {
      case "email":
        fieldSchema = z.string().email("Invalid email address");
        break;
      case "phone":
        fieldSchema = z.string().min(10, "Phone must be 10 digits").max(10, "Phone must be 10 digits");
        break;
      case "number":
      case "currency":
        fieldSchema = z.coerce.number();
        if (field.validation?.min !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).min(field.validation.min);
        }
        break;
      case "checkbox":
        fieldSchema = z.boolean();
        break;
      default:
        fieldSchema = z.string();
        if (field.validation?.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(field.validation.minLength);
        }
        if (field.validation?.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(field.validation.maxLength);
        }
    }
    
    if (!field.required) {
      fieldSchema = fieldSchema.optional().or(z.literal(""));
    }
    
    shape[field.id] = fieldSchema;
  });
  
  return z.object(shape);
}

export function DynamicForm({
  fieldMap,
  onSubmit,
  defaultValues = {},
  isLoading = false,
  submitLabel = "Submit",
  className,
}: DynamicFormProps) {
  const fields = getFormFields(fieldMap);
  const schema = buildZodSchema(fields);
  
  const formDefaultValues = fields.reduce((acc, field) => {
    acc[field.id] = defaultValues[field.id] ?? field.defaultValue ?? "";
    return acc;
  }, {} as Record<string, unknown>);
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: formDefaultValues,
  });

  const handleSubmit = (data: Record<string, unknown>) => {
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== "" && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);
    onSubmit(cleanedData);
  };

  const renderField = (field: FieldDescriptor) => {
    return (
      <FormField
        key={field.id}
        control={form.control}
        name={field.id}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {renderInput(field, formField)}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const renderInput = (field: FieldDescriptor, formField: { value: unknown; onChange: (value: unknown) => void; onBlur: () => void }) => {
    switch (field.type) {
      case "select":
        return (
          <Select
            value={formField.value as string}
            onValueChange={formField.onChange}
          >
            <SelectTrigger data-testid={`select-${field.id}`}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value} data-testid={`option-${field.id}-${option.value}`}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "textarea":
        return (
          <Textarea
            {...formField}
            value={formField.value as string}
            placeholder={field.placeholder}
            data-testid={`textarea-${field.id}`}
          />
        );
      
      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formField.value as boolean}
              onCheckedChange={formField.onChange}
              data-testid={`checkbox-${field.id}`}
            />
            <Label className="text-sm text-muted-foreground">{field.placeholder}</Label>
          </div>
        );
      
      case "date":
        return (
          <Input
            type="date"
            {...formField}
            value={formField.value as string}
            data-testid={`input-${field.id}`}
          />
        );
      
      case "datetime":
        return (
          <Input
            type="datetime-local"
            {...formField}
            value={formField.value as string}
            data-testid={`input-${field.id}`}
          />
        );
      
      case "number":
      case "currency":
        return (
          <Input
            type="number"
            {...formField}
            value={formField.value as string}
            placeholder={field.placeholder}
            data-testid={`input-${field.id}`}
          />
        );
      
      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => formField.onChange(e.target.files?.[0])}
            data-testid={`input-${field.id}`}
          />
        );
      
      default:
        return (
          <Input
            type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
            {...formField}
            value={formField.value as string}
            placeholder={field.placeholder}
            data-testid={`input-${field.id}`}
          />
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        <div className="grid gap-4">
          {fields.map(renderField)}
          <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-form-submit">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
