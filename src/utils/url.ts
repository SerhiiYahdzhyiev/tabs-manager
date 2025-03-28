export class URLConstructionError extends Error {}

export function url(value: string | URL): URL {
  if (!value) throw new URLConstructionError("Missing payload!");
  if (typeof value !== "string" && !((value as unknown) instanceof URL))
    throw new URLConstructionError("Invalid payload type!");

  try {
    return new URL(value);
  } catch (error: unknown) {
    console.error(error);
    throw new URLConstructionError((error as Error).message);
  }
}
