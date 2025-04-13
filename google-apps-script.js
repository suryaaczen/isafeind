
// This code should be deployed as a Google Apps Script Web App
// The sheets URL is: https://docs.google.com/spreadsheets/d/17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo/edit?usp=sharing

// The sheet should have these columns: id, from, to, vehicleNumber, phoneNumber, timestamp, status

function doGet(e) {
  if (e.parameter.action === 'getRides') {
    return getRides();
  }
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  
  if (data.action === 'addRide') {
    return addRide(data.data);
  } else if (data.action === 'updateStatus') {
    return updateStatus(data.data);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getRides() {
  try {
    var sheet = SpreadsheetApp.openById('17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo').getSheetByName('Rides');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rides = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var ride = {};
      
      for (var j = 0; j < headers.length; j++) {
        ride[headers[j]] = row[j];
      }
      
      rides.push(ride);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      rides: rides 
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function addRide(rideData) {
  try {
    var sheet = SpreadsheetApp.openById('17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo').getSheetByName('Rides');
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      sheet = SpreadsheetApp.openById('17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo').insertSheet('Rides');
      sheet.appendRow(['id', 'from', 'to', 'vehicleNumber', 'phoneNumber', 'timestamp', 'status']);
    }
    
    sheet.appendRow([
      rideData.id,
      rideData.from,
      rideData.to,
      rideData.vehicleNumber,
      rideData.phoneNumber,
      rideData.timestamp,
      rideData.status
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function updateStatus(data) {
  try {
    var sheet = SpreadsheetApp.openById('17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo').getSheetByName('Rides');
    var values = sheet.getDataRange().getValues();
    
    for (var i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        // Update status (assuming status is the 7th column)
        sheet.getRange(i + 1, 7).setValue(data.status);
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
