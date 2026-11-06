// Only http(s) links are ever opened (blocks javascript: and other unsafe schemes)
export const isSafeUrl = (url) => /^https?:\/\/\S+$/i.test(url || '');

// Google Drive "view" links are turned into direct-download links; other links are used as they are
export const downloadUrl = (link) => {
  const m = /drive\.google\.com\/file\/d\/([^/?#]+)/.exec(link || '');
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : link;
};
