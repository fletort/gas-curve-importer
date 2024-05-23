class ECurveEmailOperationType {
  
  constructor(name) {
    this.name = name
  }
  toString() {
    return this.name;
  }
}
ECurveEmailOperationType.Purchase = new ECurveEmailOperationType("Purchase");
ECurveEmailOperationType.Refund = new ECurveEmailOperationType("Refund");
ECurveEmailOperationType.PurchaseUpdateNewCard = new ECurveEmailOperationType("PurchaseUpdateNewCard");
ECurveEmailOperationType.PurchaseUpdateChangeAmount = new ECurveEmailOperationType("PurchaseUpdateChangeAmount");

class ECurveEmailImportErrorType {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
}
ECurveEmailImportErrorType.UpdateOperationNotManaged = new ECurveEmailImportErrorType("UpdateOperationNotManaged", "Curve Update Operation not managed");
ECurveEmailImportErrorType.SubjectEmailNotManaged = new ECurveEmailImportErrorType("SubjectEmailNotManaged", "Curve Subject email not managed");
ECurveEmailImportErrorType.ContentSuppplierAmoundDateNotParsed = new ECurveEmailImportErrorType("ContentSuppplierAmoundDateNotParsed", "Curve email content (supplier/amount/date) not parsed");
ECurveEmailImportErrorType.ContentCreditCardNotParsed = new ECurveEmailImportErrorType("ContentCreditCardNotParsed", "Curve email content (creditCard Informations) not parsed");
ECurveEmailImportErrorType.ContentTransactionDescriptionNotParsed = new ECurveEmailImportErrorType("ContentTransactionDescriptionNotParsed", "Curve email content (transactionDescription) not parsed");


class CurveEmailOperation {
  
  /**
   * @constructor Build a new instance of CurveEmail.
   * @param {Object} params                 - The unique object named parameter
   * @param {string} params.mailId          - The gmail id contening the operation information.
   * @param {string} params.mailDate        - The reception sate of the email contening the operation information.
   * @param {ECurveEmailOperationType} params.operationType - The type of this Curve operation.
   * @param {string} params.creditCardOwner - The owner of the creditCard used by Curve for this operation.
   * @param {string} params.creditCardBank  - The bank of the creditCard used by Curve for this operation.
   * @param {string} params.crediCardNumber - The number of the creditCard used by Curve for this operation.
   * @param {Date} params.date              - The date of this operation.
   * @param {string} params.supplier        - The supplier (vendor) for this operation.
   * @param {number} params.amount          - The operation amount.
   * @param {string} params.transactionDescription - How this operation will appear on the bank statement
   * @param {ECurveEmailImportErrorType} params.error - Defined when the import of the operation fail
   */
  constructor({mailId, mailDate, operationType=undefined, creditCardOwner=undefined, creditCardBank=undefined, crediCardNumber=undefined, date=undefined, supplier=undefined, amount=undefined, transactionDescription=undefined, error=undefined}) {
    Tools.checkType(operationType, "ECurveEmailOperationType", "operationType");
    Tools.checkType(date, "Date", "date");
    Tools.checkType(mailDate, "Date", "mailDate");
    Tools.checkType(amount, "Number", "amount");

    this.mailId = mailId;
    this.mailDate = mailDate;
    this.operationType = operationType;
    this.creditCardOwner = creditCardOwner;
    this.creditCardBank = creditCardBank;
    this.crediCardNumber = crediCardNumber;
    this.date = date;
    this.supplier = supplier;
    this.amount = amount;
    this.transactionDescription = transactionDescription;
    this.error = error;
  }

  /** Returns the key with different value 
   * @param {CurveEmailOperation} other - The object to compare
  */
  diff(other) {
    let diffKeys = [];
    if (this.mailId != other.mailId) {
      diffKeys.push('mailId');
    }
    if (this.mailDate.getDate() != other.mailDate.getDate()) {
      diffKeys.push('mailDate');
    }
    if (this.operationType && other.operationType && (this.operationType.name != other.operationType.name)) {
      diffKeys.push('operationType');
    }
    if (this.creditCardOwner != other.creditCardOwner) {
      diffKeys.push('creditCardOwner');
    }
    if (this.creditCardBank != other.creditCardBank) {
      diffKeys.push('creditCardBank');
    }
    if (this.date && other.date && (this.date.getDate() != other.date.getDate())) {
      diffKeys.push('date');
    }
    if (this.supplier != other.supplier) {
      diffKeys.push('supplier');
    }
    if (this.amount != other.amount) {
      diffKeys.push('amount');
    }
    if (this.transactionDescription != other.transactionDescription) {
      diffKeys.push('transactionDescription');
    }
    if (this.error && other.error && (this.error.name != other.error.name)) {
      diffKeys.push('error');
    }
    
    return diffKeys
  }

  equals(other) {
    return this.diff(other).length == 0;
  }


  static fromRow(row)
  {
    row = row.map(element => element == "" ? undefined:element);

    return new CurveEmailOperation({
      mailId: row[0],
      mailDate: row[1],
      operationType: new ECurveEmailOperationType(row[2]),
      creditCardOwner: row[3],
      creditCardBank: row[4],
      crediCardNumber: row[5],
      date: row[6],
      supplier: row[7],
      amount: row[8],
      transactionDescription: row[9],
      error: row[10]
    });
  }

  stringify() {
    function replacer(key, value){
      if (key == 'operationType') {
        return value.name;
      }
      return value;
    }

    return JSON.stringify(this, replacer, 4);
  }

  toRowData() {
    return [this.mailId, this.mailDate, this.operationType.name, this.creditCardOwner, this.creditCardBank, 
      this.crediCardNumber, this.date, this.supplier, this.amount, this.transactionDescription, this.error];
  }

  getHeaderRow() {
    return Object.keys(this);
  }
}
