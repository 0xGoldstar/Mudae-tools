function processInput() {
    const input = document.getElementById('input-area').value.trim();
    const lines = input.split('\n');
    const outputDiv = document.getElementById('output');
    const characterNameDiv = document.getElementById('character-name');
  
    outputDiv.innerHTML = '';
    characterNameDiv.textContent = 'Character: ';
  
    if (lines.length === 0) return;
  
    const characterName = lines.pop();
    characterNameDiv.textContent = `Character: ${characterName}`;
  
    lines.reverse();
  
    lines.forEach((line, index) => {
      const parts = line.split('. ');
      if (parts.length === 2) {
        const value = parts[0].trim();
        const url = parts[1].trim();
  
        const card = document.createElement('div');
        card.className = 'card';
  
        const img = document.createElement('img');
        img.src = url;
        card.appendChild(img);
  
        const valueText = document.createElement('p');
        valueText.textContent = value;
        card.appendChild(valueText);
  
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = 'X';
        deleteButton.addEventListener('click', (e) => {
          e.stopPropagation();
          card.remove();
        });
  
        card.appendChild(deleteButton);
  
        card.addEventListener('click', () => {
          const allCards = document.querySelectorAll('.card');
          allCards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
  
          const copyText = `$c ${characterName} ${value}`;
          const copyTextarea = document.getElementById('copy-textarea');
          copyTextarea.value = copyText;
          copyTextarea.style.display = 'block';
          copyTextarea.select();
          document.execCommand('copy');
        });
  
        outputDiv.appendChild(card);
      }
    });
}
  
const cardSizeSlider = document.getElementById('card-size');
const cardSizeValue = document.getElementById('card-size-value');
const outputDiv = document.getElementById('output');
  
cardSizeSlider.addEventListener('input', function () {
    const sizeValue = cardSizeSlider.value;
    cardSizeValue.textContent = `${sizeValue}px`;
  
    outputDiv.style.gridTemplateColumns = `repeat(auto-fit, minmax(${sizeValue}px, 1fr))`;
});
