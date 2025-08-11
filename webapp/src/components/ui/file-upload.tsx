import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label?: string;
  error?: string;
  accept?: string;
  placeholder?: string;
  description?: string;
  onChange: (file: File | null) => void;
  value: File | null;
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      error,
      accept,
      placeholder = "Choose file",
      description,
      onChange,
      value,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const fileRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      onChange(file);
      // Reset the input value to allow selecting the same file again if needed
      if (file === null) {
        e.target.value = "";
      }
    };

    const handleClear = () => {
      onChange(null);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    };

    const hasError = !!error;
    const displayText = value ? value.name : placeholder;
    const isPlaceholder = !value;

    return (
      <div className="file-upload-wrapper">
        {label && <label className="file-upload-label">{label}</label>}

        <div className="file-upload-container">
          <div className={cn("file-upload-display", hasError && "has-error")}>
            <span
              className={cn(
                "file-upload-text",
                isPlaceholder && "is-placeholder"
              )}
            >
              {displayText}
            </span>

            {value && (
              <button
                type="button"
                className="file-upload-clear"
                onClick={handleClear}
              >
                ×
              </button>
            )}

            <button
              type="button"
              className="file-upload-browse"
              onClick={() => fileRef.current?.click()}
            >
              Browse
            </button>
          </div>

          <input
            type="file"
            ref={fileRef}
            className="file-upload-input"
            accept={accept}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {description && (
          <div className="file-upload-description">{description}</div>
        )}

        {error && <div className="file-upload-error">{error}</div>}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;
