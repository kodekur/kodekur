function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || {};
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const cart = getCart();
    const cartTableBody = document.querySelector('#cart-table tbody');
    const emptyMessage = document.querySelector('#empty-message');
    const checkoutButton = document.querySelector('#checkout-button');

    cartTableBody.innerHTML = '';

    const cartEntries = Object.entries(cart);
    const isCartEmpty = cartEntries.length === 0;

    emptyMessage.style.display = isCartEmpty ? 'block' : 'none';
    checkoutButton.disabled = isCartEmpty;

    cartEntries.forEach(([code, item]) => {
        const row = document.createElement('tr');

        const photoCell = document.createElement('td');
        photoCell.innerHTML = item.photo;
        row.appendChild(photoCell);

        const codeCell = document.createElement('td');
        codeCell.textContent = code;
        row.appendChild(codeCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        row.appendChild(nameCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = item.price;
        row.appendChild(priceCell);

        const quantityCell = document.createElement('td');
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.value = item.quantity;
        quantityInput.min = '1';
        quantityInput.max = '10';
        quantityInput.className = 'quantity';
        quantityInput.addEventListener('change', () => updateQuantity(code, quantityInput.value));
        quantityCell.appendChild(quantityInput);
        row.appendChild(quantityCell);

        const actionCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Удалить';
        removeButton.className = 'remove-item';

        removeButton.addEventListener('click', () => {
            removeItem(code);
        });

        actionCell.appendChild(removeButton);
        row.appendChild(actionCell);

        cartTableBody.appendChild(row);
    });
}

function updateQuantity(code, newQuantity) {
    const cart = getCart();
    cart[code].quantity = parseInt(newQuantity, 10);
    saveCart(cart);
}

function removeItem(code) {
    const cart = getCart();
    delete cart[code];
    saveCart(cart);
    loadCart();
}
