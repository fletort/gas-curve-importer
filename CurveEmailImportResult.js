/**
 * Class used to store and return result of the {@link CurveEmailImporter#importNewEmails} method.
 */
class CurveEmailImporterResult {
  constructor() {
    /** Number of Gmail Thread detected. */
    this.nbThreadDetected = 0;
    /** Number of Message/Operations detected. */
    this.nbOperationsDetected = 0;
    /** Number of Operations with a paring error status. */
    this.nbOperationsInError = 0;
    /** Number of Operations not added/updated as already present. */
    this.nbOperationsNotAdded = 0;
    /** Indicates if the sheet header row was updated or not. */
    this.isHeaderUpdated = false;
    /** Indicate that the process stops before timeout. No all mail was managed. */
    this.isTimeout = false;
  }

  /**
   * Get Curve Import Report in a simple string list.
   */
  getResultString() {
    const message = "";
    if (this.isHeaderUpdated) {
      message += `- Header of curve sheet was updated.\n`;
    }
    message += `- Number of Threads detected: ${this.nbThreadDetected}.\n`;
    if (this.nbOperationsDetected > 0) {
      message += `- Number of Operations detected: ${this.nbOperationsDetected}.\n`;
    }
    if (this.nbOperationsInError > 0) {
      message += `- Number of Operations in Error: ${this.nbOperationsInError}.\n`;
    }
    if (this.nbOperationsNotAdded > 0) {
      message += `- Number of Operations not Added as already present: ${this.nbOperationsNotAdded}`;
    }

    return message;
  }

}