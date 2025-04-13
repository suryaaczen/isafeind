
// This code should be deployed as a Google Apps Script Web App
// The sheets URL is: https://docs.google.com/spreadsheets/d/17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo/edit?usp=sharing

// The sheet should have these columns: id, from, to, vehicleNumber, phoneNumber, timestamp, status

function doGet(e) {
  // Set CORS headers for all responses
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add required headers for CORS
  output.addHeader('Access-Control-Allow-Origin', '*');
  output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (e.parameter.action === 'getRides') {
    return getRides(output);
  }
  
  return output.setContent(JSON.stringify({ error: 'Invalid action' }));
}

function doPost(e) {
  // Set CORS headers for all responses
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add required headers for CORS
  output.addHeader('Access-Control-Allow-Origin', '*');
  output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return output.setContent(JSON.stringify({ 
      success: false, 
      error: "Invalid JSON in request body" 
    }));
  }
  
  if (data.action === 'addRide') {
    return addRide(data.data, output);
  } else if (data.action === 'updateStatus') {
    return updateStatus(data.data, output);
  }
  
  return output.setContent(JSON.stringify({ error: 'Invalid action' }));
}

// Handle preflight OPTIONS requests for CORS
function doOptions(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add required headers for CORS preflight response
  output.addHeader('Access-Control-Allow-Origin', '*');
  output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.addHeader('Access-Control-Max-Age', '3600');
  
  return output.setContent(JSON.stringify({ status: 'success' }));
}

function getRides(output) {
  try {
    var sheet = SpreadsheetApp.openById('17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo').getSheetByName('Rides');
    
    // Check if sheet exists
    if (!sheet) {
      // Create it if it doesn't exist
      sheet = SpreadsheetApp.openById('17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo').insertSheet('Rides');
      sheet.appendRow(['id', 'from', 'to', 'vehicleNumber', 'phoneNumber', 'timestamp', 'status']);
      
      return output.setContent(JSON.stringify({ 
        success: true, 
        rides: [] 
      }));
    }
    
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
    
    return output.setContent(JSON.stringify({ 
      success: true, 
      rides: rides 
    }));
  } catch (error) {
    return output.setContent(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    }));
  }
}

function addRide(rideData, output) {
  try {
    var sheet = SpreadsheetApp.openById('17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo').getSheetByName('Rides');
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      sheet = SpreadsheetApp.openById('17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo').insertSheet('Rides');
      sheet.appendRow(['id', 'from', 'to', 'vehicleNumber', 'phoneNumber', 'timestamp', 'status']);
    }
    
    // Log the received data for debugging
    Logger.log("Received ride data: " + JSON.stringify(rideData));
    
    sheet.appendRow([
      rideData.id || '',
      rideData.from || '',
      rideData.to || '',
      rideData.vehicleNumber || '',
      rideData.phoneNumber || '',
      rideData.timestamp || new Date().toISOString(),
      rideData.status || 'active'
    ]);
    
    return output.setContent(JSON.stringify({ 
      success: true,
      message: "Ride added successfully"
    }));
  } catch (error) {
    Logger.log("Error adding ride: " + error.toString());
    return output.setContent(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    }));
  }
}

function updateStatus(data, output) {
  try {
    var sheet = SpreadsheetApp.openById('17UfZU0E1wgnUzxHYDozlkfhvW81KeVeKimpOT8ZWtMo').getSheetByName('Rides');
    
    // Check if sheet exists
    if (!sheet) {
      return output.setContent(JSON.stringify({
        success: false,
        error: "Rides sheet does not exist"
      }));
    }
    
    var values = sheet.getDataRange().getValues();
    var found = false;
    
    for (var i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        // Update status (assuming status is the 7th column, index 6)
        sheet.getRange(i + 1, 7).setValue(data.status);
        found = true;
        break;
      }
    }
    
    if (!found) {
      return output.setContent(JSON.stringify({
        success: false,
        error: "Ride with ID " + data.id + " not found"
      }));
    }
    
    return output.setContent(JSON.stringify({ 
      success: true,
      message: "Status updated successfully" 
    }));
  } catch (error) {
    return output.setContent(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    }));
  }
}
