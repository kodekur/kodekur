const GSHEET_TO_SEASON = [
    [5, 'spring'],
    [6, 'summer'],
    [7, 'autumn'],
];

const SEASON_LABELS = {
    spring: 'ВЕСНА',
    summer: 'ЛЕТО',
    autumn: 'ОСЕНЬ',
};

const SEASON_KEYS = Object.keys(SEASON_LABELS);
const CART_HEADER_LABELS = [
    'Фото',
    'Код',
    'Наименование',
    'Цена, руб.',
    'Количество',
    '',
];

/*
  Формат хранения корзины в localStorage:
  map1 -- сезон (ключ):
        map2 -- код товара (ключ):
                JSON с полями photo, name, price, quantity
*/
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || {};
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function clearCart() {
    localStorage.removeItem('cart');
    loadCart();
}

function styleCartCell(cell) {
    cell.style.border = '1px solid #000';
    cell.style.padding = '4px 8px';
    cell.style.textAlign = 'center';
}

function initCartTable(cartTable) {
    cartTable.style.borderCollapse = 'collapse';
    cartTable.style.width = '100%';
    cartTable.style.border = '1px solid #000';
    cartTable.style.marginTop = '20px';

    const tableHead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = '#99FF99';
    CART_HEADER_LABELS.forEach((label) => {
        const headerCell = document.createElement('th');
        headerCell.textContent = label;
        styleCartCell(headerCell);
        headerCell.style.whiteSpace = 'nowrap';
        headerRow.appendChild(headerCell);
    });
    tableHead.appendChild(headerRow);
    cartTable.appendChild(tableHead);
}

function loadCart() {
    const cart = getCart();
    const cartTable = document.getElementById('cart-table');
    cartTable.innerHTML = '';
    const emptyMessage = document.querySelector('#empty-message');
    const checkoutButton = document.querySelector('#checkout-button');

    const isCartEmpty = !SEASON_KEYS.some((season) => {
        const seasonItems = cart[season];
        return seasonItems && Object.keys(seasonItems).length > 0;
    });

    emptyMessage.style.display = isCartEmpty ? 'block' : 'none';
    checkoutButton.disabled = isCartEmpty;

    if (isCartEmpty) {
        return;
    }

    initCartTable(cartTable);

    SEASON_KEYS.forEach((season) => {
        const seasonItems = cart[season];
        if (!seasonItems) {
            return;
        }

        const itemsEntries = Object.entries(seasonItems);
        if (itemsEntries.length === 0) {
            return;
        }

        // каждый сезон -- отдельный tbody.
        const seasonBody = document.createElement('tbody');
        seasonBody.id = `cart-body-${season}`;
        cartTable.appendChild(seasonBody);

        const headerRow = document.createElement('tr');
        headerRow.style.backgroundColor = '#99FF99';
        const headerCell = document.createElement('td');
        headerCell.colSpan = 6;
        headerCell.textContent = SEASON_LABELS[season];
        styleCartCell(headerCell);
        headerRow.appendChild(headerCell);
        seasonBody.appendChild(headerRow);

        itemsEntries.forEach(([code, item]) => {
            const row = document.createElement('tr');

            const photoCell = document.createElement('td');
            photoCell.innerHTML = item.photo;
            styleCartCell(photoCell);
            photoCell.style.padding = '0px';
            row.appendChild(photoCell);

            const codeCell = document.createElement('td');
            codeCell.textContent = code;
            styleCartCell(codeCell);
            row.appendChild(codeCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;
            styleCartCell(nameCell);
            nameCell.style.textAlign = 'left';
            row.appendChild(nameCell);

            const priceCell = document.createElement('td');
            priceCell.textContent = item.price;
            styleCartCell(priceCell);
            priceCell.style.textAlign = 'right';
            row.appendChild(priceCell);

            const quantityCell = document.createElement('td');
            const quantityInput = newQuantityInput(item.quantity);
            quantityInput.addEventListener('change', () => updateQuantity(season, code, quantityInput.value));
            quantityCell.appendChild(quantityInput);
            styleCartCell(quantityCell);
            row.appendChild(quantityCell);

            const actionCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Удалить';
            removeButton.className = 'remove-item';

            removeButton.addEventListener('click', () => {
                removeItem(season, code);
            });

            actionCell.appendChild(removeButton);
            styleCartCell(actionCell);
            row.appendChild(actionCell);

            seasonBody.appendChild(row);
        });
    });
}

function newQuantityInput(value) {
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.value = value || 1;
    quantityInput.min = '1';
    quantityInput.max = '10';
    quantityInput.className = 'quantity-input';
    quantityInput.name = 'quantity[]'; // to supress form validation error
    return quantityInput;
}

function updateQuantity(season, code, newQuantity) {
    const cart = getCart();
    if (cart[season] && cart[season][code]) {
        cart[season][code].quantity = parseInt(newQuantity, 10);
        saveCart(cart);
    }
}

function removeItem(season, code) {
    const cart = getCart();
    if (cart[season]) {
        delete cart[season][code];
        if (Object.keys(cart[season]).length === 0) {
            delete cart[season];
        }
    }
    saveCart(cart);
    loadCart();
}

function addToCartFromCatalogRow(row, quantity, season) {
    const cells = row.querySelectorAll('td');
    const photo = cells[0].innerHTML;
    const code = cells[1].textContent;
    const name = cells[2].textContent;
    const price = cells[4].textContent;
    const normalizedSeason = season;
    const parsedQuantity = parseInt(quantity);

    const cart = getCart();
    if (!cart[normalizedSeason]) {
        cart[normalizedSeason] = {};
    }

    const seasonCart = cart[normalizedSeason];

    if (seasonCart[code]) {
        seasonCart[code].quantity += parsedQuantity;
    } else {
        seasonCart[code] = { photo, name, price, quantity: parsedQuantity };
    }

    saveCart(cart);
    loadCart();
}
