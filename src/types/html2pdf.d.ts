declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: 'jpeg' | 'png' | 'webp';
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      [key: string]: unknown;
    };
    jsPDF?: {
      unit?: 'pt' | 'mm' | 'cm' | 'in';
      format?: string | number[];
      orientation?: 'portrait' | 'landscape';
      [key: string]: unknown;
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
    enableLinks?: boolean;
  }

  interface Html2PdfWorker {
    from(element: Element | string): Html2PdfWorker;
    set(options: Html2PdfOptions): Html2PdfWorker;
    save(filename?: string): Promise<void>;
    outputPdf(type: 'blob' | 'datauristring' | 'arraybuffer'): Promise<Blob | string | ArrayBuffer>;
    then<T>(onFulfilled: (value: T) => T | PromiseLike<T>): Html2PdfWorker;
  }

  function html2pdf(): Html2PdfWorker;
  function html2pdf(element: Element, options?: Html2PdfOptions): Promise<void>;

  export = html2pdf;
}