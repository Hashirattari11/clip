export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface ClipSuggestion {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  start: number;
  end: number;
  score: number;
  reason: string;
  transcript: string;
}

export interface JobClip {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  start: number;
  end: number;
  score: number;
  reason: string;
  transcript: string;
  filename: string;
  thumbnail?: string;
  status: "pending" | "processing" | "done" | "error";
}

export type JobStatus =
  | "queued"
  | "downloading"
  | "transcribing"
  | "analyzing"
  | "clipping"
  | "done"
  | "error";

export interface Job {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
  status: JobStatus;
  progress: number;
  message: string;
  clips: JobClip[];
  createdAt: string;
  error?: string;
  processingTime?: number;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
}
