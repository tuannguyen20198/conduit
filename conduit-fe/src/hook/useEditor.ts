import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createArticle, getArticleBySlug, updateArticle } from "@/lib/api";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";

const useEditor = (refreshArticles?: () => void) => {
  const { slug } = useParams(); // Lấy slug từ URL
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [articleData, setArticleData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Đặt cấu hình form với type bao gồm cả body

  const methods = useForm<EditorFormData>({
    mode: "onSubmit",
    defaultValues: { tags: [], body: "" },
  });

  const {
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = methods;

  // Hàm xử lý tags
  const handleTagsChange = (tags: string[]) => {
    if (
      tags.length !== methods.getValues("tags").length ||
      !tags.every((tag, idx) => tag === methods.getValues("tags")[idx])
    ) {
      console.log("Updating tags in form...");
      setValue("tags", tags); // Only update if tags actually changed
    }
    if (tags.length > 0) {
      clearErrors("tags");
    }
  };

  // Fetch dữ liệu bài viết khi slug có
  // Cập nhật tags khi lấy dữ liệu
  const fetchArticleData = async () => {
    if (slug) {
      setLoading(true); // Hiển thị loading khi fetching data
      try {
        const data = await getArticleBySlug(slug);
        setArticleData(data);

        // Cập nhật các giá trị trong form, bao gồm cả tags
        if (data) {
          setValue("body", data.body || ""); // Cập nhật body
          setValue("title", data.title); // Cập nhật title
          setValue("description", data.description); // Cập nhật description
          setValue("tags", data.tags || []); // Cập nhật tagList trong form
          console.log("Fetched tags:", data.tags); // Log các tags được fetch
        }

        setLoading(false); // Tắt loading khi hoàn tất fetching
      } catch (error: unknown) {
        setLoading(false); // Tắt loading khi có lỗi
        if (error instanceof Error) {
          setApiErrors([error.message || "Something went wrong!"]);
        } else {
          setApiErrors(["An unknown error occurred"]);
        }
      }
    } else {
      setLoading(false); // Không có slug thì tắt loading
    }
  };

  // Submit bài viết mới hoặc cập nhật bài viết
  const onSubmitArticles = async (data: any) => {
    console.log("Submitted data before sending to API:", data); // Kiểm tra dữ liệu trước khi gửi

    if (!data.tags || data.tags.length === 0) {
      setError("tags", { type: "required", message: "Tags are required" });
      return;
    }

    try {
      if (slug) {
        // Cập nhật bài viết nếu slug có
        const response = await updateArticle(slug, data);
        console.log(response);
        alert("Bài viết đã được cập nhật");
        refreshArticles?.();
        navigate("/", { replace: true });
      } else {
        // Tạo bài viết mới nếu không có slug
        await createArticle(data);
        alert("Bài viết đã được tạo mới");
        navigate("/", { replace: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        setApiErrors([error.message || "Something went wrong!"]);
      } else {
        setApiErrors(["Đã xảy ra lỗi khi cập nhật bài viết!"]);
      }
    }
  };

  // Gọi fetch dữ liệu bài viết nếu slug có
  useEffect(() => {
    fetchArticleData();
  }, [slug]); // Ensure that the effect only runs when the slug changes

  return {
    articleData,
    handleTagsChange,
    onSubmitArticles,
    loading,
    apiErrors,
    errors,
    methods,
  };
};

export default useEditor;
