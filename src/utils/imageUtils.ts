/**
 * 画像アップロード関連のユーティリティ関数
 */

// 定数
export const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
export const MAX_IMAGES_PER_MESSAGE = 5; // メッセージあたりの最大画像数

/**
 * ファイルをBase64形式に変換する
 * @param file 変換するファイル
 * @returns Base64形式の文字列
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * 画像サイズが制限内かチェックする
 * @param file チェックするファイル
 * @returns サイズが制限内ならtrue、そうでなければfalse
 */
export const checkImageSize = (file: File): boolean => {
  return file.size <= MAX_IMAGE_SIZE;
};

/**
 * 画像をリサイズする
 * @param base64 リサイズする画像のBase64文字列
 * @param maxWidth 最大幅（デフォルト800px）
 * @returns リサイズ後の画像のBase64文字列
 */
export const resizeImage = (
  base64: string,
  maxWidth = 800,
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      // 画像が十分小さい場合はそのまま返す
      if (img.width <= maxWidth) {
        resolve(base64);
        return;
      }

      // 縦横比を維持してリサイズ
      const canvas = document.createElement("canvas");
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64); // コンテキストが取得できない場合は元の画像を返す
        return;
      }

      // 画像を描画
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 画質を調整してBase64に変換（JPEG形式、品質0.8）
      const resizedBase64 = canvas.toDataURL("image/jpeg", 0.8);
      resolve(resizedBase64);
    };
    img.onerror = () => {
      resolve(base64); // エラーが発生した場合は元の画像を返す
    };
  });
};
