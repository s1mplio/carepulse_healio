import * as sdk from "node-appwrite";

export const {
    NEXT_PUBLIC_ENDPOINT: ENDPOINT,
    PROJECT_ID,
    API_KEY,
    DATABASE_ID,
    PATIENT_COLLECTION_ID,
    DOCTOR_COLLECTION_ID,
    APPOINTMENT_COLLECTION_ID,
    NEXT_PUBLIC_BUCKET_ID: BUCKET_ID,
  } = process.env;

  const client = new sdk.Client();

  client.setEndpoint('https://fra.cloud.appwrite.io/v1'!).setProject('6803c601000167c47ae7'!).setKey('standard_78770c502862a9456be03e1076e8d0cab6d7b120704f6c3c239679f54e543f256094ca9f2fade204e75716da4d76e52ee9cde4568128af9800786ae762329a5ff0016352a38dc9d11bbc4d32bf88304cbac6ea25de5ac2a0139fa070ed2f1074d9f541e4f9cf1405cc67176b9fbfd2a74a1bcad383deeea716a7ad214c9042db'!);

export const databases = new sdk.Databases(client);
export const users = new sdk.Users(client);
export const messaging = new sdk.Messaging(client);
export const storage = new sdk.Storage(client);