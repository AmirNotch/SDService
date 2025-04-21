export interface ImageMessage {
    type: string;
    url: string;
    filename: string;
    data?: string;
  }
  
  export interface ProcessingResult {
    url: string;
    filename?: string;
    status?: string;
  }