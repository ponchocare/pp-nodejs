export class PPError extends Error {
  public constructor(message: string) {
    super(`[PonchoPay] ${message}`);
  }
}
