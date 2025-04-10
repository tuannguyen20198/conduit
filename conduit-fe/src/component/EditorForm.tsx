import { FormProvider } from "react-hook-form";
import FormInput from "./FormInput";
import useEditor from "@/hook/useEditor";
import FormTags from "./FormTags";


const EditorForm: React.FC<EditorFormProps> = ({  }) => {
  // Using the useEditor hook to get the necessary values
  const {
    articleData,
    handleTagsChange,
    onSubmitArticles,
    loading,
    errors,
    methods, // Methods from useForm
  } = useEditor(); // Use the custom hook

  // Function to handle clearing errors when typing in form inputs
  const handleClearError = (fieldName: "tags" | "title" | "description" | "body") => () => {
    methods.clearErrors(fieldName);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmitArticles)}>
        {/* Title Input */}
        <div className="form-group mb-3">
          <FormInput
            name="title"
            placeholder="Article Title"
            type="text"
            onChange={handleClearError("title")} // Clear error when typing
          />
        </div>

        {/* Description Input */}
        <div className="form-group mb-3">
          <FormInput
            name="description"
            placeholder="What's this article about?"
            type="text"
            onChange={handleClearError("description")} // Clear error when typing
          />
        </div>

        {/* Body Input: You might need a custom component for markdown or textarea */}
        <div className="form-group mb-3">
          <FormInput
            name="body"
            placeholder="Write your article"
            type="textarea" // You can use textarea or a markdown editor here
            onChange={ handleClearError("body")} // Clear error when typing
          />
        </div>

        {/* Tags Input */}
        <div className="form-group mb-3">
          <fieldset className="form-group">
            <FormTags
              onTagsChange={handleTagsChange}
              defaultTags={articleData?.tagList || []} // Pass tags from article if available
              setError={methods.setError} // Pass setError from methods
              clearErrors={methods.clearErrors} // Pass clearErrors from methods
            />
          </fieldset>
        </div>

        {/* Submit Button */}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {articleData?.slug ? "Update Article" : "Create Article"} {/* Show different button for create and update */}
        </button>
      </form>
    </FormProvider>
  );
};

export default EditorForm;
