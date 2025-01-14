let draggedCard = null;
let cardOrder = [];

function generateCards() {
    const inputArea = document.getElementById('input-area');
    const cardsContainer = document.getElementById('cards');
    const counter = document.getElementById('counter');
    const listOutput = document.getElementById('list-output');
    const extraListOutput = document.getElementById('extra-list-output');
    const extraListDiv = document.getElementById('extra-list');

    cardsContainer.innerHTML = '';
    cardOrder = [];
    listOutput.textContent = ''; // Clear the previous list output
    extraListOutput.value = ''; // Clear the extra list output

    const lines = inputArea.value.trim().split('\n');
    let count = 0;

    lines.forEach(line => {
        const mudaeMatch = line.match(/^(.*) - (https:\/\/mudae\.net\/uploads\/.*\.(png|gif))$/);
        const imgurMatch = line.match(/^(.*) - (https:\/\/imgur\.com\/.*\.(png|gif))$/);

        if (mudaeMatch || imgurMatch) {
            const name = mudaeMatch ? mudaeMatch[1] : imgurMatch[1];
            let link = mudaeMatch ? mudaeMatch[2] : imgurMatch[2];

            // Convert Imgur URL to raw image link
            if (imgurMatch) {
                const imgurId = link.match(/\/([^/]+)$/)[1]; // Extract the file name from the link
                link = `https://i.imgur.com/${imgurId}`; // Convert to raw image link
            }

            const card = document.createElement('div');
            card.className = 'card';

            const img = document.createElement('img');
            img.src = link;
            img.alt = name;

            img.onerror = () => {
                img.src = "https://via.placeholder.com/100?text=Image+Not+Found";
            };

            const nameElement = document.createElement('div');
            nameElement.className = 'card-name';
            nameElement.textContent = name;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.innerHTML = '&times;'; // White "X" symbol
            deleteButton.addEventListener('click', () => {
                card.remove(); // Remove the card element
                cardOrder = cardOrder.filter(item => item !== name); // Remove from order
                updateSortedList(); // Update the list
                counter.textContent = `Total Characters: ${cardOrder.length}`; // Update counter
            });

            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.draggable = true;

            card.appendChild(img);
            card.appendChild(nameElement);
            card.appendChild(deleteButton); // Append the delete button
            card.appendChild(overlay);

            cardsContainer.appendChild(card);

            cardOrder.push(name);
            count++;

            overlay.addEventListener('dragstart', onDragStart);
            overlay.addEventListener('dragend', onDragEnd);
            cardsContainer.addEventListener('dragover', onDragOver);
            cardsContainer.addEventListener('drop', onDrop);
        }
    });

    counter.textContent = `Total Characters: ${count}`;
    updateSortedList(); // Ensure the list is updated when cards are generated
}


function updateSortedList() {
    const listOutput = document.getElementById('list-output');
    const extraListOutput = document.getElementById('extra-list-output');
    const extraListDiv = document.getElementById('extra-list');

    let formattedList = "$sm " + cardOrder.map(name => `$${name}`).join(" ");
    
    // Check if list exceeds 4000 characters
    if (formattedList.length > 4000) {
        const mainList = formattedList.substring(0, 4000);
        const extraList = "$sm " + formattedList.substring(4000); // Prepend $sm to extra list

        // Update main list
        listOutput.textContent = mainList;
        
        // Show extra list and update it
        extraListDiv.style.display = 'block';
        extraListOutput.value = extraList; // Set the value in the textarea for extra list
    } else {
        listOutput.textContent = formattedList;
        extraListDiv.style.display = 'none'; // Hide extra list if not needed
    }
}

function copyList(listType) {
    let formattedList = "$sm " + cardOrder.map(name => `$${name}`).join(" ");
    
    if (listType === 'main') {
        // Copy the main list (first 4000 characters)
        formattedList = formattedList.substring(0, 4000);
    } else if (listType === 'extra') {
        // Copy the extra list (remaining characters)
        formattedList = formattedList.substring(4000);
    }

    // Copy to clipboard
    navigator.clipboard.writeText(formattedList).then(() => {
        // Optional: Display a custom notification in your UI (instead of using alert)
        console.log(`List copied to clipboard: ${listType}`);
    }).catch(err => {
        console.error('Error copying list:', err);
    });
}

function updateCardSize(size) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.width = `${size}px`;
        card.style.height = 'auto'; // Let the height adjust based on the content
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
