/**
 * Constructs a new PPError. This is the custom exception class used
 * throughout the library to wrap and clearly prefix exceptions
 * with the "PonchoPay" namespace identifier.
 */
export class PPError extends Error {
  /**
   * @param message the specific error message that occurred during the operation
   */
  public constructor(message: string) {
    super(`[PonchoPay] ${message}`);
  }
}
