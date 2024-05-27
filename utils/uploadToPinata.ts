import pinataSDK from "@pinata/sdk";
import fs from "fs";
import path from "path";

const pinataApiKey = process.env.PINATA_API_KEY || "";
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY || "";
const pinataJWTKey = process.env.PINATA_JWT_KEY || "";
// eslint-disable-next-line new-cap
const pinata = new pinataSDK(
  pinataJWTKey ? { pinataJWTKey } : { pinataApiKey, pinataSecretApiKey }
);

export async function storeImages(imagesFilePath: string) {
  const fullImagesPath = path.resolve(imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  const responses = [];
  for (const fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile, {
        pinataMetadata: {
          name: files[fileIndex],
        },
      });
      responses.push(response);
    } catch (error) {
      console.error(error);
    }
  }
  return { responses, files };
}

export async function storeTokenUriMetadata(metadata: Object, options: any) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata, options);
    return response;
  } catch (error) {
    console.error(error);
  }
  return null;
}
