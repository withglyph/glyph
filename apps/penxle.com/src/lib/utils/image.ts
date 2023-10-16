import { toast } from '$lib/notification';
import { fileMime } from './file';

export const validImageMimes = ['image/jpeg', 'image/png'];
const maxSize = 32 * 1024 * 1024; // 32MB

export const isValidImageFile = async (file: File) => {
  if (file.size > maxSize) {
    toast.error(`32MB를 초과하는 파일은 업로드할 수 없어요 (${file.name})`);
    return false;
  }

  const mime = await fileMime(file);
  if (!validImageMimes.includes(mime)) {
    toast.error(`허용되지 않는 파일 타입이에요 (${file.name})`);
    return false;
  }

  return true;
};
