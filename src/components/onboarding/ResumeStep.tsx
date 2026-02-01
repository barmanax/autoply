import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, ArrowRight, Upload, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DEMO_RESUME_TEXT } from "@/lib/demo-data";
import * as pdfjsLib from "pdfjs-dist";

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface ResumeStepProps {
  userId: string;
  resumeText: string;
  setResumeText: (text: string) => void;
  onNext: () => void;
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }
  
  return fullText.trim();
}

export default function ResumeStep({ userId, resumeText, setResumeText, onNext }: ResumeStepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPdf(file);
      
      if (extractedText.length < 50) {
        toast({
          title: "Could not extract text",
          description: "The PDF appears to have very little text. Try pasting your resume text directly.",
          variant: "destructive",
        });
        return;
      }

      // Set the extracted text
      setResumeText(extractedText);
      
      // Also upload the file to storage
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) {
        console.warn("Storage upload failed:", uploadError);
        // Don't fail the whole operation - text extraction succeeded
      }

      setUploadedFileName(file.name);
      toast({
        title: "Resume parsed",
        description: `Extracted ${extractedText.length} characters from your PDF.`,
      });
    } catch (error: any) {
      console.error("PDF parsing error:", error);
      toast({
        title: "Failed to parse PDF",
        description: "Could not extract text from the PDF. Try pasting your resume text directly.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Your Resume</CardTitle>
            <CardDescription>
              Upload a PDF and/or paste your resume text
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demo Button */}
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            setResumeText(DEMO_RESUME_TEXT);
            setUploadedFileName("demo_resume.pdf");
            toast({
              title: "Demo resume loaded",
              description: "Resume pre-filled with demo data.",
            });
          }}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Load Demo Resume
        </Button>

        {/* PDF Upload */}
        <div className="space-y-2">
          <Label>Resume PDF (optional)</Label>
          <div className="flex items-center gap-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload PDF
            </Button>
            {uploadedFileName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {uploadedFileName}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Max 5MB PDF file</p>
        </div>

        {/* Resume Text */}
        <div className="space-y-2">
          <Label htmlFor="resume">Resume Text</Label>
          <Textarea
            id="resume"
            placeholder="Paste your resume content here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[250px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {resumeText.length} characters (minimum 50 required)
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext} disabled={resumeText.trim().length < 50}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
