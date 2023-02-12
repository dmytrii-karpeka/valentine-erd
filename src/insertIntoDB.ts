import { createNewClient } from "./createNewDBClent";

export async function insertInitialValues(initialValues: (string|undefined)[]) {
    const text = 'INSERT INTO public.users(username,chatidfrom) VALUES($1, $2) RETURNING *'
    const client = createNewClient();
    client.connect();
    client.query(text, initialValues)
      .then((res: any) => {
        client.end();
        return res
      })
      .catch((e: Error) => console.error(e.stack));
}