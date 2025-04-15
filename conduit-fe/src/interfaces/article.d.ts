interface Author {
  [x: string]: any;
  username: string;
  image: string;
}

interface Article {
  [x: string]: any;
  title: string;
  body: string;
  createdAt: string;
  author: Author;
  favoritesCount: number;
  tagList: string[];
  slug: string;
}
interface ArticleFormData {
  slug: string;
  title: string;
  description: string;
  createdAt: string;
  author: Author;
  favorited: boolean;
  favoritesCount: number;
  tagList: string[];
  likedBy: string[];
}

interface AritcleProps {
  article?: { title: string; description: string };
  register: any;
  handleSubmit: any;
  onSubmit: any;
  tags: string[];
  setTags: any;
  mutation: any;
  errors: any;
  errorMessages: string[];
}

interface ArticleFormProps {
  onSubmit: (data: any) => void;
  apiErrors: string[];
}

// Define a more readable structure for the error field type and error handling functions

// Type for the error fields
type ErrorField =
  | "tags"
  | "title"
  | "description"
  | "body"
  | "root"
  | `root.${string}`
  | `tags.${number}`;

// Function type for setting errors
type SetErrorFunction = (
  field: ErrorField,
  error: { type: string; message: string }
) => void;

// Function type for clearing errors
type ClearErrorFunction = (field: ErrorField) => void;

// Refactor of FormTagsProps interface
interface FormTagsProps {
  // Handler for changes in tags
  onTagsChange: (tags: string[]) => void;

  // Function for setting an error for a specific field
  setError: SetErrorFunction;

  // Function for clearing an error for a specific field
  clearErrors: ClearErrorFunction;
}
