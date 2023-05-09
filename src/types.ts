export interface DBItem {
  hexCodes: string[];
  offset: number;
  /**
   * file extensions, ie:
   * pdf, jpg, jpeg
   */
  // exts: string[];
  /**
   * mime types from the file extension, ie:
   * application/pdf
   * image/jpeg
   */
  mimeTypes: string[];
}
