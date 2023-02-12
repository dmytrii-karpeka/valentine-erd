import { createNewClient } from "./createNewDBClent";

export async function checkInitialization(initialValues: (string|undefined)[]) {
    const queryCheck = "SELECT username,chatidfrom FROM public.users WHERE username = $1 AND chatidfrom = $2";
    const client = createNewClient();
    client.connect();

    let rows: any = [];
    await client.query(queryCheck, initialValues)
      .then((res: any) => {
        client.end();
        rows = res.rows;
      })
      .catch((e: Error) => console.error(e.stack));
    return rows.length > 0;
}