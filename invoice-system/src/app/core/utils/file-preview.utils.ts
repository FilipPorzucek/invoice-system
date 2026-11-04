export const ACCEPTED_INVOICE_FILE_TYPES = 'application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png';

export async function isPdfBlob(blob: Blob): Promise<boolean> {
  if (blob.type === 'application/pdf') {
    return true;
  }
  if (blob.type.startsWith('image/')) {
    return false;
  }
  const header = await blob.slice(0, 4).text();
  return header === '%PDF';
}
