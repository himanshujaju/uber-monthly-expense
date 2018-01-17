function isDigit(ch) {
  return (ch >= '0' && ch <= '9');
}

function getNumber(text, pos) {
  var ret = 0;
  while(pos < text.length && isDigit(text.charAt(pos))) {
    ret = ret * 10 + (text.charAt(pos) - '0');
    pos += 1;
  }
  return ret;
}

function getMailCost(body) {
  var pos = body.indexOf("Thanks for choosing Uber,") - 1;
  while (pos >= 0 && !isDigit(body.charAt(pos))) pos--;
  while (pos >= 0 && isDigit(body.charAt(pos))) pos--;
  var fraction = getNumber(body, pos + 1);
  if (body.charAt(pos) != '.') return fraction;
  pos -= 1;
  while (pos >= 0 && isDigit(body.charAt(pos))) pos--;
  var whole = getNumber(body, pos + 1);
  return (whole + (fraction / 100.0));
}

function isUberMail(from, replyTo) {
  return (replyTo == "Uber Receipts <uber.india@uber.com>" || from == "Uber Receipts <uber.india@uber.com>");
}

function inCurrentMonth(emailDate, month, year) {
  var date = new Date(emailDate);
  return (date.getMonth() == month && date.getYear() == year);
}

function getMonthlyUberExpense(month, year) {
  var sum = 0;
  var response = GmailApp.search("trip with uber");
  var responseSize = response.length;
  for (var i = 0; i < responseSize; i++) {
    var messages = response[i].getMessages();
    for (var j = 0; j < messages.length; j++) {
      if (isUberMail(messages[j].getFrom(), messages[j].getReplyTo()) && inCurrentMonth(messages[j].getDate(), month, year)) {
        sum += getMailCost(messages[j].getPlainBody());
      }
    }
  }
  return Math.ceil(sum);
}

function output(month, year, sum) {
  var names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return HtmlService.createHtmlOutput('<center><h2>Uber Expense for ' + (names[month]) + ', ' + year + ' : Rs.' + sum + '</h2></center>');
}

function doGet() {
  var date = new Date();
  var month = date.getMonth();
  var year = date.getYear();
  var sum = getMonthlyUberExpense(month, year);
  return output(month, year, sum);
}
