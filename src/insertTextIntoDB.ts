import { createNewClient } from "./createNewDBClent";

export async function insertText(initialValues: (string|undefined)[]) {
    const text = 'UPDATE public.users SET text = $2 WHERE username = $1 '
    const client = createNewClient();
    client.connect();
    client.query(text, initialValues)
      .then((res: any) => {
        client.end();
        return res
      })
      .catch((e: Error) => console.error(e.stack));
}