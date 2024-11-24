// From cloudinary docs: https://cloudinary.com/documentation/upload_images#uploading_with_a_direct_call_to_the_api
import cloudinary from "cloudinary";
import { writeAsyncIterableToWritable } from "@remix-run/node";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImageCloudinary(data) {
  const uploadPromise = new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: "smask" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      },
    );
    writeAsyncIterableToWritable(data, uploadStream).catch(reject);
  });
  return uploadPromise;
}

export { uploadImageCloudinary };
