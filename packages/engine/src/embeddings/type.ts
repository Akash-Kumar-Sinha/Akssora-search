export type VectorEmbedding = {
  vector: number[];
  timestamp: number;
};

export interface AudioEmbeddings {
  text: VectorEmbedding;
  audio: VectorEmbedding;
  transcript: string;
}

export type VideoEmbeddings = VectorEmbedding[];

export interface ProcessedMedia {
  metadata: JSON;
  videoEmbeddings: VideoEmbeddings;
  audioEmbeddings: AudioEmbeddings;
}
