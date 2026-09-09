export type Media = {
  data: Buffer;
  mimeType: MimeType;
};

export const MP4 = "video/mp4";
export type MimeType = typeof MP4;
