"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type DragEvent, type MouseEvent } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteStoredImage,
  isBlobOrDataImage,
  isMediaUrl,
  isStoredImageRef,
  resolveImageSrc,
  saveImageFromFile,
} from "@/lib/local-image-store";

type ImageUploadDropzoneProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  aspectClass?: string;
  emptyText?: string;
  className?: string;
  accept?: string;
};

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp";
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export function ImageUploadDropzone({
  value,
  onChange,
  label = "이미지",
  aspectClass = "aspect-[4/3]",
  emptyText = "드래그 앤 드롭 또는 클릭하여 업로드",
  className,
  accept = DEFAULT_ACCEPT,
}: ImageUploadDropzoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    setPreview(resolveImageSrc(value));
  }, [value]);

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return;

      if (!file.type.startsWith("image/") || !ALLOWED_IMAGE_TYPES.has(file.type)) {
        setError("PNG, JPG, JPEG, WEBP 형식만 업로드할 수 있습니다.");
        return;
      }

      try {
        if (isStoredImageRef(value)) await deleteStoredImage(value);
        const ref = await saveImageFromFile(file);
        onChange(ref);
        setPreview(resolveImageSrc(ref));
        setError("");
      } catch {
        setError("이미지 업로드에 실패했습니다.");
      }
    },
    [onChange, value]
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0] ?? null;
      void handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation();
    if (isStoredImageRef(value)) void deleteStoredImage(value);
    onChange(null);
    setPreview(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const displaySrc = preview ?? (value ? resolveImageSrc(value) : null);
  const unoptimized =
    !!displaySrc &&
    (displaySrc.startsWith("blob:") ||
      displaySrc.startsWith("data:") ||
      isMediaUrl(value ?? "") ||
      isStoredImageRef(value ?? ""));

  return (
    <div className={className}>
      {label ? (
        <p className="mb-1.5 text-[13px] font-medium text-artdear-text-muted">{label}</p>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[16px] border-2 border-dashed transition-colors",
          aspectClass,
          dragging
            ? "border-artdear-purple bg-artdear-purple-light/40"
            : "border-artdear-border-strong bg-artdear-panel hover:border-artdear-purple",
          displaySrc && "border-solid"
        )}
      >
        {displaySrc ? (
          <>
            <Image
              src={displaySrc}
              alt=""
              fill
              unoptimized={unoptimized || isBlobOrDataImage(value)}
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
                className="flex size-9 items-center justify-center rounded-full bg-white/90 text-artdear-purple shadow-sm hover:bg-white"
                aria-label="이미지 변경"
              >
                <Upload className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex size-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm hover:bg-white"
                aria-label="이미지 삭제"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <ImagePlus className="size-8 text-artdear-purple/50" />
            <p className="text-[13px] text-artdear-text-light">{emptyText}</p>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      {error ? (
        <p className="mt-2 text-[13px] text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
