"use client";

import { useRef, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { CvModel } from "@/lib/model/CvModel";
import { trackPhotoUpload } from "@/lib/analytics/gtag";

interface BasicsFormProps {
  labels: {
    name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    website: string;
    photo: string;
    photoUpload: string;
    photoRemove: string;
  };
}

export function BasicsForm({ labels }: BasicsFormProps) {
  const { register, watch, setValue } = useFormContext<CvModel>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photo = watch("photo");

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 2MB limit
      if (file.size > 2 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("photo", reader.result as string, { shouldDirty: true });
        trackPhotoUpload();
      };
      reader.readAsDataURL(file);

      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [setValue]
  );

  const personalFields = [
    { name: "name" as const, label: labels.name },
    { name: "headline" as const, label: labels.headline },
  ];

  const contactFields = [
    { name: "email" as const, label: labels.email },
    { name: "phone" as const, label: labels.phone },
    { name: "location" as const, label: labels.location },
  ];

  const linkFields = [
    { name: "linkedIn" as const, label: labels.linkedIn },
    { name: "website" as const, label: labels.website },
  ];

  const renderFieldGroup = (fields: { name: keyof CvModel; label: string }[]) => (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.name} className="space-y-1">
          <Label htmlFor={field.name} className="text-xs">
            {field.label}
          </Label>
          <Input id={field.name} {...register(field.name)} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Photo */}
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{labels.photo}</Label>
        <div className="flex items-center gap-3">
          {photo && (
            <img
              src={photo}
              alt=""
              className="h-16 w-16 rounded-full object-cover border"
            />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {labels.photoUpload}
            </Button>
            {photo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setValue("photo", "", { shouldDirty: true })}
              >
                {labels.photoRemove}
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Personal info */}
      <div className="rounded-lg border bg-card p-4">
        {renderFieldGroup(personalFields)}
      </div>

      {/* Contact */}
      <div className="rounded-lg border bg-card p-4">
        {renderFieldGroup(contactFields)}
      </div>

      {/* Links */}
      <div className="rounded-lg border bg-card p-4">
        {renderFieldGroup(linkFields)}
      </div>
    </div>
  );
}
