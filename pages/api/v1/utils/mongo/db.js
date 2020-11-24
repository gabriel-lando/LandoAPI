import { connectToDatabase } from "../../../../../util/mongodb";

export async function GetCredentials() {
  const { db } = await connectToDatabase();

  global.credentials = await db.collection("credentials").findOne();

  return global.credentials;
};

export async function SetCredentials(credentials) {
    const { db } = await connectToDatabase();
    
    const result = await db.collection("credentials").updateOne({}, global.credentials, {upsert: true});
};

export default (request, response) => {
    response.status(404);
    response.json(null);
}
