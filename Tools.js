  const entities = [
    { entity: "&#039;", character: "'" },
    { entity: "&Agrave;", character: "À" },
    { entity: "&Aacute;", character: "Á" },
    { entity: "&Acirc;", character: "Â" },
    { entity: "&Atilde;", character: "Ã" },
    { entity: "&Auml;", character: "Ä" },
    { entity: "&Aring;", character: "Å" },
    { entity: "&agrave;", character: "à" },
    { entity: "&aacute;", character: "á" },
    { entity: "&acirc;", character: "â" },
    { entity: "&atilde;", character: "ã" },
    { entity: "&auml;", character: "ä" },
    { entity: "&aring;", character: "å" },
    { entity: "&AElig;", character: "Æ" },
    { entity: "&aelig;", character: "æ" },
    { entity: "&szlig;", character: "ß" },
    { entity: "&Ccedil;", character: "Ç" },
    { entity: "&ccedil;", character: "ç" },
    { entity: "&Egrave;", character: "È" },
    { entity: "&Eacute;", character: "É" },
    { entity: "&Ecirc;", character: "Ê" },
    { entity: "&Euml;", character: "Ë" },
    { entity: "&egrave;", character: "è" },
    { entity: "&eacute;", character: "é" },
    { entity: "&ecirc;", character: "ê" },
    { entity: "&euml;", character: "ë" },
    { entity: "&#131;", character: "ƒ" },
    { entity: "&Igrave;", character: "Ì" },
    { entity: "&Iacute;", character: "Í" },
    { entity: "&Icirc;", character: "Î" },
    { entity: "&Iuml;", character: "Ï" },
    { entity: "&igrave;", character: "ì" },
    { entity: "&iacute;", character: "í" },
    { entity: "&icirc;", character: "î" },
    { entity: "&iuml;", character: "ï" },
    { entity: "&Ntilde;", character: "Ñ" },
    { entity: "&ntilde;", character: "ñ" },
    { entity: "&Ograve;", character: "Ò" },
    { entity: "&Oacute;", character: "Ó" },
    { entity: "&Ocirc;", character: "Ô" },
    { entity: "&Otilde;", character: "Õ" },
    { entity: "&Ouml;", character: "Ö" },
    { entity: "&ograve;", character: "ò" },
    { entity: "&oacute;", character: "ó" },
    { entity: "&ocirc;", character: "ô" },
    { entity: "&otilde;", character: "õ" },
    { entity: "&ouml;", character: "ö" },
    { entity: "&Oslash;", character: "Ø" },
    { entity: "&oslash;", character: "ø" },
    { entity: "&#140;", character: "Œ" },
    { entity: "&#156;", character: "œ" },
    { entity: "&#138;", character: "Š" },
    { entity: "&#154;", character: "š" },
    { entity: "&Ugrave;", character: "Ù" },
    { entity: "&Uacute;", character: "Ú" },
    { entity: "&Ucirc;", character: "Û" },
    { entity: "&Uuml;", character: "Ü" },
    { entity: "&ugrave;", character: "ù" },
    { entity: "&uacute;", character: "ú" },
    { entity: "&ucirc;", character: "û" },
    { entity: "&uuml;", character: "ü" },
    { entity: "&#181;", character: "µ" },
    { entity: "&#215;", character: "×" },
    { entity: "&Yacute;", character: "Ý" },
    { entity: "&#159;", character: "Ÿ" },
    { entity: "&yacute;", character: "ý" },
    { entity: "&yuml;", character: "ÿ" },
    { entity: "&#176;", character: "°" },
    { entity: "&#134;", character: "†" },
    { entity: "&#135;", character: "‡" },
    { entity: "&lt;", character: "<" },
    { entity: "&gt;", character: ">" },
    { entity: "&#177;", character: "±" },
    { entity: "&#171;", character: "«" },
    { entity: "&#187;", character: "»" },
    { entity: "&#191;", character: "¿" },
    { entity: "&#161;", character: "¡" },
    { entity: "&#183;", character: "·" },
    { entity: "&#149;", character: "•" },
    { entity: "&#153;", character: "™" },
    { entity: "&copy;", character: "©" },
    { entity: "&reg;", character: "®" },
    { entity: "&#167;", character: "§" },
    { entity: "&#182;", character: "¶" },
    { entity: "&quot;", character: "\"" },
    { entity: "&nbsp;", character: " " },
    { entity: "&ndash;", character: "-" },
    { entity: "&amp;", character: "&" },
    { entity: "&ldquo;", character: "“" },
    { entity: "&bull;", character: "•" },
    { entity: "&rdquo;", character: "”" },
    { entity: "&ordf;", character: "ª" },
    { entity: "&ordm;", character: "º" },
    { entity: "&ordf;", character: "ª" },
    { entity: "&ordf;", character: "ª" },
    { entity: "&ordf;", character: "ª" },
    { entity: "&ordf;", character: "ª" },
    { entity: "&ordf;", character: "ª" },
  ];  

class Tools {

  static testType(variable, waitedType) {
    let type = Object.prototype.toString.call(variable).slice(8, -1);
    return (type == waitedType);
  }
  
  static checkType(variable, waitedType, argumentName="") {
    if (variable != undefined) {
      let type = Object.prototype.toString.call(variable).slice(8, -1);
      if (type == "Object" && waitedType != "Object") {
        type = variable.constructor.name;
      }
      
      if (type != waitedType) {
        throw new TypeError(`The type of argument ${argumentName} is ${type}: `
              +`it should be of type ${waitedType}`) 
      }
    }
  }

  static addMethodArrayCompare() {
    // Warn if overriding existing method
    if(Array.prototype.equals)
        console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
    // attach the .equals method to Array's prototype to call it on any array
    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;
        // if the argument is the same array, we can be sure the contents are same as well
        if(array === this)
            return true;
        // compare lengths - can save a lot of time 
        if (this.length != array.length)
            return false;

        for (var i = 0, l=this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;       
            }
            else if (this[i] instanceof Date && array[i] instanceof Date) {
              if (this[i].getTime() != array[i].getTime())
                return false;
            }     
            else if (this[i] != array[i]) { 
                Logger.log(i)
                Logger.log(this[i])
                Logger.log(array[i])
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;   
            }           
        }       
        return true;
    }
    // Hide method from for-in loops
    Object.defineProperty(Array.prototype, "equals", {enumerable: false});
  }


  static htmlEntitiesDecode(input) {
    entities.forEach(function(substitution) {
      var regex = new RegExp(substitution.entity, 'g');
      input = input.replace(regex, substitution.character);
    });
    return input;
  }

  /**
   * Check Sheet Availability and check Header Columns
   * @param {SpreadsheetApp.Spreadsheet} spreadsheet
   * @param {string} sheetName              - The sheetName to check
   * @param {Array.<string>} waitedHeaders   - List of Waited Columnes (in order)
   * @param {number} offset - The offset colum (starting 1) to start to check for headers (1 if ommited)
   * @return {SpreadsheetApp.Sheet} The Sheet
   * @throws Will throw an SyntaxError if the sheet does not exist
  */
  static checkSheet(spreadsheet, sheetName, waitedHeaders, offset=1) {
    // check Import sheet
    var sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet == null) {
      throw new SyntaxError(sheetName + " sheet not found in spreadsheet " + spreadsheet.getName());
    }
    // Check waited headers in import sheet
    var headers = sheet.getRange(1, offset).getValues()[0];
    headers.forEach((item, index) => {
      if (item != waitedHeaders[index]) {
        throw new SyntaxError(`Column ${index} is not the ${waitedHeaders[index]} but ${item}`);
      }
    });
    return sheet;
  }

  
}