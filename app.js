const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

let numberWindow = [];

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNzQ2NTA5LCJpYXQiOjE3NDM3NDYyMDksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA0NmZhMzNiLTk5OWEtNDZiZC05NGNhLTRmOWIxM2JiODNhNSIsInN1YiI6ImUyMmNzZXUwNzgyQGJlbm5ldHQuZWR1LmluIn0sImVtYWlsIjoiZTIyY3NldTA3ODJAYmVubmV0dC5lZHUuaW4iLCJuYW1lIjoia2h1c2hpIGdveWFsIiwicm9sbE5vIjoiZTIyY3NldTA3ODIiLCJhY2Nlc3NDb2RlIjoicnRDSFpKIiwiY2xpZW50SUQiOiIwNDZmYTMzYi05OTlhLTQ2YmQtOTRjYS00ZjliMTNiYjgzYTUiLCJjbGllbnRTZWNyZXQiOiJOdW5FVG1Td0FnSGNXRllEIn0.ZmqoZt8nlVsoEI8149PBk54IhjmPy8lOFoRiZFyPWWw";
const apiEndpoints = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand'
};

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  
  if (!['p', 'f', 'e', 'r'].includes(numberid)) {
    return res.status(400).json({ error: 'Invalid number ID. Use one of p, f, e, r.' });
  }
  
  const url = apiEndpoints[numberid];
  let apiResponse = { numbers: [] };
  const windowPrevState = [...numberWindow];
  
  try 
  {
    const response = await axios.get(url, {
      timeout: 500,
      headers: 
      {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });
    console.log("API Response:", response.data);
    apiResponse = response.data;
  } catch (err) 
  {
    console.error(`API call failed or timed out: ${err.message}`);
    return res.json({
      windowPrevState,
      windowCurrState: numberWindow,
      numbers: [],
      avg: numberWindow.length > 0 ? parseFloat((numberWindow.reduce((a, b) => a + b, 0) / numberWindow.length).toFixed(2)) : 0.00
    });
  }
  const receivedNumbers = apiResponse.numbers || [];
  receivedNumbers.forEach(num => {
    if (!numberWindow.includes(num)) 
        {
      numberWindow.push(num);
      if (numberWindow.length > WINDOW_SIZE) {
        numberWindow.shift();
      }
    }
  });
  const sum = numberWindow.reduce((acc, val) => acc + val, 0);
  const avg = numberWindow.length > 0 ? parseFloat((sum / numberWindow.length).toFixed(2)) : 0.00;
  res.json({
    windowPrevState,
    windowCurrState: numberWindow,
    numbers: receivedNumbers,
    avg
  });
});
app.listen(PORT, () => {
  console.log(`Average Calculator microservice running on port ${PORT}`);
});
