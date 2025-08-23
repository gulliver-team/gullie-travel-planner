"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { generatePDFBlob } from "@/lib/pdf/generatePDF";
import { Id } from "../../convex/_generated/dataModel";

interface PDFUploadData {
  name: string;
  email: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  visaOptions: string;
}

export function usePDFUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const savePDFReference = useMutation(api.storage.savePDFReference);

  const uploadPDF = async (data: PDFUploadData): Promise<Id<"_storage"> | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // Generate PDF blob
      const pdfBlob = await generatePDFBlob({
        ...data,
        timestamp: new Date().toISOString(),
      });

      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload PDF to Convex storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: pdfBlob,
      });

      if (!response.ok) {
        throw new Error("Failed to upload PDF");
      }

      const { storageId } = await response.json();

      // Save reference in database
      await savePDFReference({
        storageId,
        email: data.email,
        fileName: `relocation-report-${data.destinationCity.toLowerCase()}.pdf`,
      });

      setIsUploading(false);
      return storageId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload PDF";
      setError(errorMessage);
      setIsUploading(false);
      console.error("PDF upload error:", err);
      return null;
    }
  };

  return {
    uploadPDF,
    isUploading,
    error,
  };
}