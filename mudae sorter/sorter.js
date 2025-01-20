let draggedCard = null;
let cardOrder = [];

function generateCards() {
    const inputArea = document.getElementById('input-area');
    const cardsContainer = document.getElementById('cards');
    const counter = document.getElementById('counter');
    const listOutput = document.getElementById('list-output');

    cardsContainer.innerHTML = '';
    cardOrder = [];
    listOutput.textContent = '';

    const lines = inputArea.value.trim().split('\n');
    let count = 0;

    lines.forEach(line => {
        const mudaeMatch = line.match(/^(.*) - (https:\/\/mudae\.net\/uploads\/.*\.(png|gif))$/);
        const imgurMatch = line.match(/^(.*) - (https:\/\/imgur\.com\/.*\.(png|gif))$/);

        if (mudaeMatch || imgurMatch) {
            const name = mudaeMatch ? mudaeMatch[1] : imgurMatch[1];
            let link = mudaeMatch ? mudaeMatch[2] : imgurMatch[2];

            if (imgurMatch) {
                const imgurId = link.match(/\/([^/]+)$/)[1];
                link = `https://i.imgur.com/${imgurId}`;
            }

            // Append `?v=1` to the URL
            if (!link.includes('?v=1')) {
                link += '?v=1';
            }

            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('draggable', true);

            const img = document.createElement('img');
            img.src = link;
            img.alt = name;

            // Set `referrerpolicy` to `no-referrer`
            img.setAttribute('referrerpolicy', 'no-referrer');

            img.onerror = () => {
                // Remove the image from the card
                img.remove();

                // Create and append an error message
                const errorMessage = document.createElement('p');
                errorMessage.className = 'error-text';
                errorMessage.textContent = 'Image failed to load.';
                card.appendChild(errorMessage);
            };

            

            const nameElement = document.createElement('div');
            nameElement.className = 'card-name';
            nameElement.textContent = name;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.innerHTML = '&times;';
            deleteButton.addEventListener('click', () => {
                card.remove();
                cardOrder = cardOrder.filter(item => item !== name);
                updateSortedList(); 
                counter.textContent = `Total Characters: ${cardOrder.length}`;
            });

            const overlay = document.createElement('div');
            overlay.className = 'overlay';

            card.appendChild(img);
            card.appendChild(nameElement);
            card.appendChild(deleteButton);
            card.appendChild(overlay);

            cardsContainer.appendChild(card);

            cardOrder.push(name);
            count++;

            card.addEventListener('dragstart', onDragStart);
            card.addEventListener('dragend', onDragEnd);
            cardsContainer.addEventListener('dragover', onDragOver);
            cardsContainer.addEventListener('drop', onDrop);
        }
    });

    counter.textContent = `Total Characters: ${count}`;
    updateSortedList();
}


function updateSortedList() {
    const maxLength = 4000;
    
    let formattedList = "$sm " + cardOrder.map(name => `$${name}`).join(" ");
    
    const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');
    dynamicFieldsContainer.innerHTML = '';

    if (formattedList.length > maxLength) {
        let currentLength = 0;
        let tempList = [];
        let chunk = '';
        let chunkIndex = 0;

        for (let i = 0; i < cardOrder.length; i++) {
            const name = `$${cardOrder[i]}`;
            tempList.push(name);
            currentLength = (`$sm ${tempList.join(" ")}`).length;

            if (currentLength > maxLength) {
                const listStr = `$sm ${tempList.join(" ")}`;
                const lastIndex = listStr.lastIndexOf('$');
                chunk = listStr.substring(0, lastIndex);

                createTextField(chunk, chunkIndex);

                tempList = [name];
                currentLength = (`$sm ${name}`).length;
                chunkIndex++;
            }
        }

        if (tempList.length > 0) {
            chunk = `$sm ${tempList.join(" ")}`;
            createTextField(chunk, chunkIndex);
        }
    } else {
        createTextField(formattedList, 0);
    }
}

function createTextField(content, index) {
    const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');

    const newDiv = document.createElement('div');
    newDiv.classList.add('text-field-container');

    const textarea = document.createElement('textarea');
    textarea.rows = 10;
    textarea.cols = 50;
    textarea.readOnly = true;
    textarea.value = content;

    const copyButton = document.createElement('button');
    copyButton.textContent = `Copy List ${index + 1}`;
    copyButton.onclick = function() {
        copyTextToClipboard(textarea);
    };

    newDiv.appendChild(textarea);
    newDiv.appendChild(copyButton);

    dynamicFieldsContainer.appendChild(newDiv);
}

function copyTextToClipboard(textarea) {
    textarea.select();
    document.execCommand('copy');
}

function copyList(listType) {
    let formattedList = "$sm " + cardOrder.map(name => `$${name}`).join(" ");
    
    if (listType === 'main') {
        formattedList = formattedList.substring(0, 4000);
    } else if (listType === 'extra') {
        formattedList = formattedList.substring(4000);
    }

    navigator.clipboard.writeText(formattedList).then(() => {
        console.log(`List copied to clipboard: ${listType}`);
    }).catch(err => {
        console.error('Error copying list:', err);
    });
}

function updateCardSize(size) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.width = `${size}px`;
        card.style.height = 'auto';
    });
}

function onDragStart(e) {
    draggedCard = e.target.closest('.card');
    draggedCard.style.opacity = 0.5;
}

function onDragEnd(e) {
    draggedCard.style.opacity = 1;
    draggedCard = null;
}

function onDragOver(e) {
    e.preventDefault();
    const draggingOverCard = e.target.closest('.card');
    if (draggingOverCard && draggedCard !== draggingOverCard) {
        draggingOverCard.style.border = '2px dashed #ccc';
    }
}

function onDrop(e) {
    e.preventDefault();
    const draggingOverCard = e.target.closest('.card');
    if (draggingOverCard && draggedCard !== draggingOverCard) {
        draggingOverCard.style.border = '';
        const allCards = Array.from(document.querySelectorAll('.card'));
        const draggedIndex = allCards.indexOf(draggedCard);
        const targetIndex = allCards.indexOf(draggingOverCard);

        if (draggedIndex < targetIndex) {
            draggingOverCard.after(draggedCard);
        } else {
            draggingOverCard.before(draggedCard);
        }

        updateOrder();
    }
}

function updateOrder() {
    const cards = document.querySelectorAll('.card');
    const orderedNames = Array.from(cards).map(card => card.querySelector('.card-name').textContent);
    cardOrder = orderedNames;
    updateSortedList();
}
