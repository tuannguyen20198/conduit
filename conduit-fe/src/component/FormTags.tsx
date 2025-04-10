import { useEffect, useState } from "react";

const FormTags = ({ onTagsChange, setError, clearErrors, defaultTags }: FormTagsProps) => {
  const [tags, setTags] = useState<string[]>([]); // Cập nhật tags
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (defaultTags && defaultTags.length > 0) {
      setTags(defaultTags); // Cập nhật tags khi defaultTags thay đổi
    }
  }, [defaultTags]);

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault(); // Ngừng submit form khi nhấn Enter

      if (tags.includes(inputValue.trim())) {
        setError("tags", { type: "duplicate", message: "Tag already exists." });
        return;
      }

      const newTags = [...tags, inputValue.trim()];
      setTags(newTags); // Cập nhật tags trong state
      onTagsChange(newTags); // Truyền tags mới lên parent
      clearErrors("tags"); // Xóa lỗi nếu có
      setInputValue(""); // Reset input field
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_: string, i:number) => i !== index);
    setTags(newTags); // Cập nhật tags trong state
    onTagsChange(newTags); // Truyền tags mới lên parent
  };

  return (
    <div className="form-group">
      <label>Tags</label>
      <input
        type="text"
        className="form-control"
        placeholder="Enter tags and press Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={addTag}
      />
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
          {tags.map((tag:string, index:number) => (
            <span key={index} className="tag-default tag-pill">
              {tag}
              <i
                className="ion-close-round"
                onClick={() => removeTag(index)}
                style={{ cursor: "pointer", marginLeft: "5px" }}
              ></i>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
export default FormTags;