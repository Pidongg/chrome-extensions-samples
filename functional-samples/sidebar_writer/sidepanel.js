const submitButton = document.querySelector('button[type="submit"]');

async function fetchBackendData(text_,purpose_) {
  const url = 'https://ly54m7ngya.execute-api.eu-west-3.amazonaws.com/default/ImproveWriting';
  console.log(url);
  try {
      const requestOptions = {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ text: text_, purpose:purpose_ })
      };

      const response = await fetch(url, requestOptions);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response;
      return data.json();
  } catch (error) {
      console.error('Error fetching backend data:', error);
      throw error;
  }
}

function countWords(str) {
  str = str.trim();
  const wordsArray = str.split(/\s+/);
  const filteredWordsArray = wordsArray.filter(word => word.length > 0);
  return Math.ceil(filteredWordsArray.length/9);
}

submitButton.addEventListener('click', async () => {
  const input1 = document.getElementById('input1');
  const input2 = document.getElementById('input2').value;
  const outputField = document.getElementById('output');
  
  const backendData = await fetchBackendData(input1.value,input2);
  let words = backendData.response.replace(/\*\*/g, '').replace(/}\s*$/g, '');

  const newLineCount = (backendData.response.match(/^\s*$/gm) || []).length;
  const newLineCount2 = (input1.value.match(/^\s*$/gm) || []).length;
  // Remove non-alphanumeric characters at the start of each line
    words = words.split('\n').map(line => line.replace(/^[^a-zA-Z0-9]+/, '')).join('\n');
    outputField.value = words; // Update the output field with the response
    outputField.rows= Math.max(countWords(words),1)+newLineCount;
    input1.rows= Math.max(countWords(input1.value),1)+newLineCount2;
  }); 