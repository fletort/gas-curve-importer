
var CurveSearchForMailMethod = {
  BySender: 1,
  ByUserLabel: 2, 
  ByCustomFilter: 4
}

var CurveImportedMailBehaviour = {
  MoveToArchive: 1,
  ApplyLabel: 2,
  MarkAsRead: 4
}

/**
 * Import Curve Operation from Email to a Google Sheet. This class is the main class for the Curve Email Import service.
 * 
 * Main Global Methods are:
 * - {@link CurveEmailImporter#importNewEmails importNewEmails} Use to automatically detect new email and import their information
 * inside the sheet.
 * - {@link CurveEmailImporter#sheetUpdateRanges updateRanges} Use to update somes rows (selected one for example). Usefull to 
 * add a menu action "update selected rows". The update parse again the related mail and update the row information.
 * Can be usefull in case of a bug.
 * 
 */
class CurveEmailImporter {

  /**
   * @constructor Build a new instance of CurveEmailImporter.
   * @param {Object} params - The unique object named parameter
   * @param {SpreadsheetApp.Sheet} params.sheet - The Sheet object contening the managed curve operations.
   * @param {number} params.searchForMailMethod - Mask defining the searchs Method used, based on the CurveSearchForMailMethod Flags.
   * @param {number} params.importedMailBehaviour - Mask defining the action made on the imported messages, based on the CurveImportedMailBehaviour Flags.
   * @param {string} params.importedLabel - The label to apply on the imported messages when the CurveImportedMailBehaviour.ApplyLabel method is activated.
   * @param {string} params.searchLabel  - The name of the user label to search for when the CurveSearchForMailMethod.ByUserLabel method is activated.
   * @param {string} params.sender - The number of the creditCard used by Curve for this operation.
   * @param {number} params.batchNumber - The messages batch number (messages are imported x by x).
   */
  constructor({sheet,
               searchForMailMethod=CurveSearchForMailMethod.BySender, 
               importedMailBehaviour=CurveImportedMailBehaviour.ApplyLabel,
               importedLabel="_imported",
               searchLabel="",
               sender="support@imaginecurve.com",
               batchNumber=10}) {
    this.sheet = sheet;
    this.searchForMailMethod = searchForMailMethod;
    this.importedMailBehaviour = importedMailBehaviour;
    this.importedLabel = importedLabel;
    this.searchLabel = searchLabel;
    this.sender = sender;
    this.batchNumber = batchNumber;
    Tools.addMethodArrayCompare();
  }
  
  /**
   * Create the filter sentence that is used to search for email.
   * 
   * This method is internally used by {@link CurveEmailImporter#emailSearch emailSearch}
   * to create the full filter depending of the configuration of the class, ie depending of
   * the feature activated on the searchForMailMethod class parameter (see {@link CurveSearchForMailMethod} flags)
   * and the feature activated on the importedMailBehaviour class parameter (see {@link CurveImportedMailBehaviour} flags)
   */
  emailCreateSearchFilter() {
    let searchFilter = "";

    if (this.searchForMailMethod & CurveSearchForMailMethod.BySender) {
      if (this.sender == undefined || this.sender == "") {
        throw new Error("Sender must be defined to can be used in search filter")
      }
      searchFilter += " from:" + this.sender;
    }
    if (this.searchForMailMethod & CurveSearchForMailMethod.ByUserLabel) {
      if (this.searchLabel == undefined || this.searchLabel == "") {
        throw new Error("searchLabel must be defined to can be used in search filter")
      }
      searchFilter += " label:"+ this.searchLabel;
    }

    if (this.importedMailBehaviour & CurveImportedMailBehaviour.MoveToArchive) {
      searchFilter += " -in:archive";
    }
    if (this.importedMailBehaviour & CurveImportedMailBehaviour.ApplyLabel) {
      if (this.importedLabel == undefined || this.importedLabel == "") {
        throw new Error("importedLabel must be defined to can be used to identify imported emails")
      }
      searchFilter += " -label:"+ this.importedLabel;
    }
    if (this.importedMailBehaviour & CurveImportedMailBehaviour.MarkAsRead) {
      searchFilter += " is:unread";
    }

    return searchFilter;
  }

  /**
   * Search for emails
   * 
   * This methods returns the emails found corresponding to the filter defined
   * by the internal {@link CurveEmailImporter.emailCreateSearchFilter emailCreateSearchFilter} method.
   * This filter is based on this class configuration regarding the {@link CurveSearchForMailMethod}
   * and {@link CurveImportedMailBehaviour} flags.
   * 
   * @return {[GmailThread]} The List of {@link https://developers.google.com/apps-script/reference/gmail/gmail-thread GmailThread} found. 
   * This list contains maximum {@link CurveEmailImporter#batchNumber batchNumber} items.
   */
  emailSearch() {
    const searchFilter = this.emailCreateSearchFilter();
    return GmailApp.search(searchFilter, 0, this.batchNumber);
  }

  /**
   * Mark the given threads as imported
   * 
   * This methods marks the given emails as imported. 
   * The actions made are defined by the importedMailBehaviour class parameter 
   * (see {@link CurveImportedMailBehaviour} flags).
   * If {@link CurveImportedMailBehaviour.MoveToArchive} flag is defined, imported
   * threads are move to Archive.
   * If {@link CurveImportedMailBehaviour.ApplyLabel} flag is defined, the customer
   * label, defined by importedLabel class parameter, is added to imported threads.
   * If {@link CurveImportedMailBehaviour.MarkAsRead} flag is defined, imported
   * threads are marked as Read.
   */
  emailMarkAsImported(threads) {
    if (this.importedMailBehaviour & CurveImportedMailBehaviour.MoveToArchive) {
      threads.forEach(thread => thread.moveToArchive());
    }
    if (this.importedMailBehaviour & CurveImportedMailBehaviour.ApplyLabel) {
      if (this.importedLabel == undefined || this.importedLabel == "") {
          throw new Error("importedLabel must be defined to can be used to identify imported emails")
      }
      let importedLabel = GmailApp.getUserLabelByName(this.importedLabel);
      if (importedLabel == undefined) {
        importedLabel = GmailApp.createLabel(this.importedLabel);
      }
      threads.forEach(thread => thread.addLabel(importedLabel));
    }
    if (this.importedMailBehaviour & CurveImportedMailBehaviour.MarkAsRead) {
      threads.forEach(thread => thread.markRead());
    }
  }

  /**
   * Main Method used to search/parse/import new emails.
   * 
   * Following "step internal" method are used:
   * - updateSheetHeader
   * - searchEmails
   * - parseThreads
   * - addDataToSheet
   * - markAsImported
   */
  importNewEmails() {
    this.sheetUpdateHeader();
    let threads = this.emailSearch();
    while(threads.length > 0) {
      let operations = this.emailParseThreads(threads);
      this.sheetAddOperations(operations);
      this.emailMarkAsImported(threads);
      threads = this.emailSearch();
    }
  }

  emailParseThreads(threads) {
    let operations = threads.reduce((accumulator, thread, index) => {
        accumulator.push(...thread.getMessages().map(message => this.emailParse(message)))
        return accumulator;
      }
      ,[]
    );

    return operations;
  }

  emailParseId(gmailId) {
    const message = GmailApp.getMessageById(gmailId);
    return this.emailParse(message);
  }

  emailParse(message) {
    let regExp = null;
    let emailSubject = message.getSubject();
    //Logger.log('Email subject: ' + emailSubject);
    let emailBody = message.getPlainBody(); // Get Plain email body (no html)
    //Logger.log('Email text contant: ' + emailBody);

    let operation = new CurveEmailOperation({
      mailId: message.getId(),
      mailDate: message.getDate()
    });

    if (emailSubject.startsWith("Curve Receipt: Purchase at")) {
      operation.operationType = ECurveEmailOperationType.Purchase;
      regExp = new RegExp(/You made a purchase at:\s+([^€]+)\s€(\d+.\d+)\s+(\d+\s[^\s]+\s\d{4}\s\d{2}:\d{2}:\d{2})/)
    } 
    else if (emailSubject.startsWith("Curve Receipt: Refund from")) {
      operation.operationType = ECurveEmailOperationType.Refund;
      regExp = new RegExp(/(?:onto your account|reach out to us)\.\s+([^\+]+)\+(\d+\.\d+)€\s+(\d+\s[\w\W]+\s\d{4}\s\d{2}:\d{2}:\d{2})/)
    }
    else if (emailSubject.startsWith("Updated Curve Receipt: Purchase at")) {    
      if (emailBody.includes("You went back in time and changed the payment card for this purchase")) {
        operation.operationType = ECurveEmailOperationType.PurchaseUpdateNewCard;
        regExp = new RegExp(/You went back in time and changed the payment card for this purchase:\s+([^€]+)\s€(\d+.\d+)\s+(\d+\s[^\s]+\s\d{4}\s\d{2}:\d{2}:\d{2})/)
      }
      else if (emailBody.includes("There's been an update to your transaction, below are the new details.")) {
        operation.operationType = ECurveEmailOperationType.PurchaseUpdateChangeAmount;
        regExp = new RegExp(/You made a purchase at:\s+([^€]+)\s€(\d+.\d+)\s+(\d+\s[^\s]+\s\d{4}\s\d{2}:\d{2}:\d{2})/)
      }
      else {
        Logger.log("ERROR - Curve Update Operation not managed: '" + emailSubject + "'");
        operation.error = ECurveEmailImportErrorType.UpdateOperationNotManaged;
        Logger.log('Email text content: ' + emailBody);
        return operation;
      }
    }
    else {
      Logger.log("ERROR - Curve Subject email not managed: '" + emailSubject + "'");
      operation.error = ECurveEmailImportErrorType.SubjectEmailNotManaged;
      return operation;
    } 
      
    let match = regExp.exec(emailBody);
    if (match) {
      operation.supplier = Tools.htmlEntitiesDecode(match[1].trim());
      operation.amount = parseFloat(match[2]);
      operation.date = new Date(match[3]);   
    }
    else {
      Logger.log("ERROR - Curve email content (supplier/amount/date) not parsed: '" + emailSubject + "'");
      Logger.log('Email text content: ' + emailBody);
      operation.error = ECurveEmailImportErrorType.ContentSuppplierAmoundDateNotParsed;
      return operation;
    }
    regExp = new RegExp(/[Oo]n\s+this\s+card:\s+(.+)\s+(.+)\s+(.+)/);
    match = regExp.exec(emailBody);
    if (match) {
      operation.creditCardOwner = Tools.htmlEntitiesDecode(match[1]);
      operation.creditCardBank = Tools.htmlEntitiesDecode(match[2]);
      operation.crediCardNumber = Tools.htmlEntitiesDecode(match[3]);
    }
    else {
      Logger.log("ERROR - Curve email content (creditCard Informations) not parsed: '" + emailSubject + "'");
      Logger.log('Email text content: ' + emailBody);
      operation.error = ECurveEmailImportErrorType.ContentCreditCardNotParsed;
      return operation;
    }
    regExp = new RegExp(/This Transaction will appear on your bank statement as:\s+(.+)\s+Generated/);
    match = regExp.exec(emailBody);
    if (match) {
      operation.transactionDescription = Tools.htmlEntitiesDecode(match[1].trim());
    }
    else {
      Logger.log("ERROR - Curve email content (transactionDescription) not parsed: '" + emailSubject + "'");
      Logger.log('Email text content: ' + emailBody);
      operation.error = ECurveEmailImportErrorType.ContentTransactionDescriptionNotParsed;
      return operation;
    }
    
    //Logger.log(operation.stringify());
    Logger.log("Email " + operation.mailId + " was parsed successfully")

    return operation;
  }

  sheetUpdateHeader() {
    const headerRange = this.sheet.getRange(1, 1, 1, this.sheet.getLastColumn());
    const headerValues = headerRange.getValues()[0];
    const fakeOp = new CurveEmailOperation({mailId: 11, mailDate: new Date(Date.now())});
    const waitedHeaders = fakeOp.getHeaderRow();
    const headersOk = headerValues.equals(waitedHeaders);
    if (headersOk == false) {
      const isEmpty = headerValues.every((element) => element == "")
      if (isEmpty || (this.sheet.getLastRow() == 1)) {
        Logger.log("Headers are initialized")
        this.sheet.getRange(1, 1, 1, waitedHeaders.length).setValues([waitedHeaders])
      }
      else {
        throw new Error("Migration is needed.")
      }
    }
  }

  /**
   * Add Curve Email Transaction Information to Dedicated Sheet Cache.
   * @param {SpreadsheetApp.Sheet} sheet      - The sheet cache
   * @param {[CurveEmailOperation]} operations - List of Operations to add
  */
  sheetAddOperations(operations) {
    const range = this.sheet.getDataRange();
    const values = range.getValues();
    const existingOperations = values.slice(1);

    // Keep Only new Operations (remove already present)
    const operationsToAdd = operations.filter(operation => existingOperations.find((exOp) => exOp[0] == operation.mailId) == undefined);
    
    if (operationsToAdd.length > 0) {
      Logger.log(operationsToAdd.length + " new operations will be added");
      const valuesToAdd = operationsToAdd.map(operation => operation.toRowData())
      const newRange = this.sheet.getRange(range.getNumRows()+1, 1, valuesToAdd.length, valuesToAdd[0].length);
      newRange.setValues(valuesToAdd);
    }
  }

  sheetUpdateOperations(operations) {
    const range = this.sheet.getDataRange();
    const values = range.getValues().slice(1);
    const existingOperations = values.map(row => CurveEmailOperation.fromRow(row));
    let operationsToAdd = [];

    operations.forEach(operation => {
      const values = operation.toRowData();
      const index = existingOperations.findIndex((exOp) => exOp.mailId == operation.mailId);
      if (index == undefined) {
        // This is a new operation
        operationsToAdd.push(operation);
      }
      else {
        const diffs = existingOperations[index].diff(operation)
        if (diffs.length > 0) {
          const rowNumber = index + 2;
          Logger.log(`The operation ${operation.mailId} needs to be updated. Row ${rowNumber}. Keys: ${diffs.join(',')}`)
          const rangeToUpdate = this.sheet.getRange(rowNumber, 1, 1, values.length);
          rangeToUpdate.setValues([values]);
        }
      }
    })

    if (operationsToAdd.length > 0) {
      Logger.log(operationsToAdd.length + " new operations will be added");
      const valuesToAdd = operationsToAdd.map(operation => operation.toRowData())
      const newRange = this.sheet.getRange(range.getNumRows()+1, 1, valuesToAdd.length, valuesToAdd[0].length);
      newRange.setValues(valuesToAdd);
    }
  }

  /**
   * Update Information for given Rows.
   * The related email are parsed again to update information of selected Rows.
   * The emailIs is given by each of theses rows.
   * Rows can be selected only with one selected cell for each row.
   * @param {SpreadsheetApp.RangeList} ranges - Range list of Rows to update.
   */
  sheetUpdateRanges(ranges) {
    ranges.getRanges().forEach(range => {
      const values = this.sheet.getRange(range.getRowIndex(), 1, range.getNumRows(), this.sheet.getLastColumn()).getValues();
      const existingOperations = values.map(row => CurveEmailOperation.fromRow(row));
      const updateOperations = existingOperations.map(op => this.emailParseId(op.mailId));
      const diff = existingOperations.map((existingOp, index) => existingOp.diff(updateOperations[index]));
      if (diff.flat().length > 0) {
        Logger.log(`Rows ${range.getRowIndex()} to ${range.getRowIndex() + range.getNumRows()} will be update, some diffs are found.`);
        const newValues = updateOperations.map(operation => operation.toRowData());
        const rangeToUpdate = this.sheet.getRange(range.getRowIndex(), 1, range.getNumRows(), newValues[0].length);
        rangeToUpdate.setValues(newValues);
      } else {
        Logger.log(`Rows ${range.getRowIndex()} to ${range.getRowIndex() + range.getNumRows()} will not be update, any diffs are found.`);
      }
    })
  }


}



function DEV() {
	var ss = SpreadsheetApp.openById(Settings.sheets.curve_mail_import.sheetId);
  var sheet = ss.getSheetByName(Settings.sheets.curve_mail_import.sheetName)
  let my = new CurveEmailImporter({sheet: sheet});
  //let op = my.parseEmailId("18ef4bf7c80d569e");
  //my.updateDataToSheet([op]);
  const rl = sheet.getRangeList(['A2:D3']);
  my.sheetUpdateRanges(rl);


  //my.importNewEmails();
}



function Debug() {
  let mailId = "****"
  let c = new CurveEmailImporter({sheet: undefined});
  let op = c.emailParseId(mailId);
  Logger.log(op.stringify())
}










  

