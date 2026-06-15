// Client-only PDF helper. Dynamically imports html2pdf so it never runs at SSR.
export async function exportElementToPdf(el: HTMLElement, filename: string) {
  const mod = await import("html2pdf.js");
  const html2pdf = (mod as { default: (...args: unknown[]) => unknown }).default ?? mod;
  await (
    html2pdf as (el: HTMLElement) => {
      set: (opts: Record<string, unknown>) => {
        from: (el: HTMLElement) => { save: () => Promise<void> };
      };
    }
  )(el)
    .set({
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(el)
    .save();
}

export async function generatePdfBase64(el: HTMLElement): Promise<string> {
  const mod = await import("html2pdf.js");
  const html2pdf = (mod as { default: (...args: unknown[]) => unknown }).default ?? mod;
  const result = await (
    html2pdf as (el: HTMLElement) => {
      set: (opts: Record<string, unknown>) => {
        from: (el: HTMLElement) => {
          outputPdf: (type: string) => Promise<string>;
        };
      };
    }
  )(el)
    .set({
      margin: 0,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(el)
    .outputPdf("datauristring");
  return result;
}
