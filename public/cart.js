let cart = JSON.parse(localStorage.getItem("goldenWearsCart")) || [];

let cartItems = document.getElementById("cartItems");
let cartSubtotal = document.getElementById("cartSubtotal");

const displayCart = () => {
    
    let total = 0;
    
    cartItems.innerHTML = "";
    if (cart.length === 0) {
      cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="bi bi-bag"></i>
                <h3>Your cart is empty</h3>
                <p>You haven't added any items yet.</p>
                <a href="index.html">Explore Collection</a>
            </div>
        `;
    } else {
      for (let i = 0; i < cart.length; i++) {
        cartItems.innerHTML += `
        <div class="cart-item">
            <img src="${cart[i].image}" alt="${cart[i].name}">
    
            <div class="cart-item-info">
                <p>${cart[i].category}</p>
                <h3>${cart[i].name}</h3>
                <h4>₦${cart[i].price.toLocaleString()}</h4>
    
                <div class="quantity-controls">
                    <button onclick="changeQuantity(${i}, -1)">−</button>
                    <span>${cart[i].quantity}</span>
                    <button onclick="changeQuantity(${i}, 1)">+</button>
                </div>
    
                <button class="remove-item" onclick="removeItem(${i})">
                    Remove
                </button>
            </div>
        </div>
    `;
    
        total += cart[i].price * cart[i].quantity;
      }
    }

    cartSubtotal.textContent = total.toLocaleString();

};

displayCart()


function changeQuantity(index, amount) {
    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem("goldenWearsCart", JSON.stringify(cart));

    displayCart();
    updateCheckoutButton();
}

function removeItem(index) {
    cart.splice(index, 1);

    localStorage.setItem("goldenWearsCart", JSON.stringify(cart));

    displayCart();
    updateCheckoutButton();
}

const checkoutButton = document.getElementById("checkoutButton");

function updateCheckoutButton() {
    if (cart.length === 0) {
        checkoutButton.style.pointerEvents = "none";
        checkoutButton.style.opacity = "0.5";
        checkoutButton.setAttribute("aria-disabled", "true");
    } else {
        checkoutButton.style.pointerEvents = "auto";
        checkoutButton.style.opacity = "1";
        checkoutButton.removeAttribute("aria-disabled");
    }
}

updateCheckoutButton();