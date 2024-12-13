export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function base64ToFile(base64String, fileName) {
  // Extract the MIME type and base64 data from the string
  const [prefix, base64Data] = base64String.split(",");
  const mimeType = prefix.match(/:(.*?);/)[1]; // Extract MIME type

  // Convert base64 string to binary data
  const binaryData = atob(base64Data); // Decode base64
  const byteArray = new Uint8Array(binaryData.length);

  for (let i = 0; i < binaryData.length; i++) {
    byteArray[i] = binaryData.charCodeAt(i);
  }

  // Create a File object
  return new File([byteArray], fileName, { type: mimeType });
}
