interface FormInputProps {
  name: string;
  placeholder?: string;
  type?: "text" | "textarea" | "markdown" | "password" | "email";
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  value?: string;
}
type EditorFormData = {
  tags: string[];
  title: string;
  description: string;
  body: string;
  tagList?: string[]; // Add tagList to the type definition
};

interface EditorFormProps {
  onSubmit: (data: any) => Promise<void>;
  apiErrors: string[];
}
