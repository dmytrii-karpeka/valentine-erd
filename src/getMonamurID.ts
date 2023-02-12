import { createNewClient } from "./createNewDBClent";

export async function getMonamurID(nickname:(string|undefined)[]) {
    const queryCheck = "SELECT chatidfrom FROM public.users WHERE username = $1";
    const client = createNewClient();
    client.connect();
    let rows: any = [];
    await client.query(queryCheck, nickname)
      .then((res: any) => {
        client.end();
        rows = res.rows;
      })
      .catch((e: Error) => console.error(e.stack));
    return rows;
}