const getExtensionFromMimeType = (mimeType) => {
  const mimeToExt = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return mimeToExt[mimeType] || "unknown";
};

export const getFileExtension = async (url) => {
  // Fallback: Fetch the blob and use its MIME type
  const blob = await fetch(url).then((res) => res.blob());
  return getExtensionFromMimeType(blob.type);
};
