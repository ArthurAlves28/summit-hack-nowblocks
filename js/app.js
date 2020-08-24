const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartBlocks = document.querySelector(".cart-blocks");
const scheduleDelivery = document.querySelector(".scheduleDelivery");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// carrinho
let cart = [];
// botoes
let buttonsDOM = [];

// recuperando produtos do JSON
class Products {
    async getProducts(){
        try {
            let result = await fetch('produtos.json');
            let data = await result.json();

            let products = data.items;
            products = products.map(item => {
                const {Produto, Preco, Blocos} = item.fields;
                const {id} = item.sys;
                const image = item.fields.Imagem.fields.file.url;
                return {Produto, Preco, Blocos, id, image}
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}
// exibindo produtos
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `
            <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img
                    src=${product.image}  
                    alt="product" 
                    class="product-img"
                    />
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        adicionar ao carrinho
                    </button>
                </div>
                <h3>${product.Produto}</h3>
                <h4>${product.Preco}</h4>
            </article>
            <!-- end of single product -->
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart) {
                button.innerText = "No carrinho";
                button.disabled == true;
            }
            button.addEventListener("click", (event) => {
                event.target.innerText = "No carrinho";
                event.target.disabled = true;
                let cartItem = { ...Storage.getProduct(id), amount: 1};
                cart = [...cart, cartItem];
                Storage.saveCart(cart);
                this.setCartValues(cart);
                this.addCartItem(cartItem);
                this.showCart();
            })
        });
    }
    setCartValues(cart) {
        const h3 = document.createElement("h3");
        h3.classList.add("schedule-delivery");
        let tempTotal = 0;
        let itemsTotal = 0;
        let itemBlock = 0;
        cart.map(item => {
            tempTotal += item.Preco * item.amount;
            itemsTotal += item.amount;
            itemBlock += Math.ceil(item.Blocos) * item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        cartBlocks.innerText = itemBlock;
        if(itemBlock >= 900) {
            cartBlocks.innerText = itemBlock + "\nAgende sua entrega" ;
        }
    }
    addCartItem(item) {
        const cartItem = document.createElement("div");
        const cartFooter = document.createElement("div");

        cartItem.classList.add("cart-item");
        cartFooter.classList.add("cart-footer");

        cartItem.innerHTML = `<img src=${item.image} alt="product"/>
        <div>
            <h4>${item.Produto}</h4>
            <h5>R$${item.Preco}</h5>
            <span class="remove-item" data-id=${item.id}>remover</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;

        cartFooter.innerHTML = `<button class="clear-cart banner-btn">finalizar compra</button>`;

        cartContent.appendChild(cartItem) ;
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic() {
        // limpar o carrinho
        clearCartBtn.addEventListener('click', () =>  { 
            this.clearCart();
        });
        // funcionalidades do carrinho
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item'))
            {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if(event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if(event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);

        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>adicionar ao carrinho`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
class Storage {
    static saveProducts(products) {
        localStorage.setItem("produtos", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('produtos'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI()
    const products = new Products();

    ui.setupAPP();
    
    products.getProducts().then(products => {
        ui.displayProducts(products);
    Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
});
