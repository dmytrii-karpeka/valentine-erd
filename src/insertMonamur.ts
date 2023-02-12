import { createNewClient } from "./createNewDBClent";

export async function insertMonamur(initialValues: (string|undefined)[]) {
    const text = 'UPDATE public.users SET usernameto = $2, chatidto = $3 WHERE username = $1 '
    const client = createNewClient();
    client.connect();
    client.query(text, initialValues)
      .then((res: any) => {
        client.end();
        return res
      })
      .catch((e: Error) => console.error(e.stack));
}