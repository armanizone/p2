import PocketBase from 'pocketbase';

// const pb = new PocketBase('http://127.0.0.1:8090');
// const pb = new PocketBase('http://10.0.2.2:8090');
const pb = new PocketBase("https://sys.fly.dev");
// const pb = new PocketBase(process.env.EXPO_PUBLIC_DB_URL);

pb.autoCancellation(false)

export { 
  pb
}