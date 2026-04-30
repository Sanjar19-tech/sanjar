document.addEventListener('DOMContentLoaded', function() {
    console.log("ArzonApteka tizimi aktivlashtirildi.");

    // ==========================================================
    // 1. ELEMENTLARNI TANLASH
    // ==========================
    const body = document.body;
    const mainHeader = document.querySelector('.main-header');
    const searchInput = document.querySelector('.search-input-wrapper input');
    const searchResultsList = document.querySelector('.search-results-list');
    const popularProductsSection = document.querySelector('.popular-products-section');
    const featuresSection = document.querySelector('.features-section');
    const sliderTracks = document.querySelectorAll('.slider-track');
    const cartBadge = document.getElementById('cart-count');

    // ==========================================================
    // 2. SAVAT MANTIQI (Savatga qo'shish va Badge)
    // ==========================
    
    // Savatdagi umumiy dori sonini hisoblash
    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        if (cartBadge) {
            cartBadge.innerText = totalItems;
        }
    }

    // Savatga qo'shish funksiyasi (Universal Event Delegation)
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.add-to-cart'); // Tugma yoki ichidagi ikonka bosilsa ham ishlaydi
        
        if (btn) {
            const product = {
                name: btn.getAttribute('data-name'),
                price: parseFloat(btn.getAttribute('data-price')),
                image: btn.getAttribute('data-image'),
                quantity: 1
            };

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProduct = cart.find(item => item.name === product.name);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push(product);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            
            // Vizual effekt
            const originalText = btn.innerText;
            btn.innerText = "Qo'shildi ✓";
            btn.style.backgroundColor = "#28a745";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "";
            }, 1000);
        }
    });

    // ==========================================================
    // 3. DORI QIDIRISH VA FILTRLASH
    // ==========================
    let productsData = [];
    const allCards = document.querySelectorAll('.product-card');

    // Mavjud kartochkalardan ma'lumot yig'ish
    allCards.forEach(card => {
        const name = card.querySelector('.name')?.textContent.trim();
        if (name && !productsData.some(p => p.name === name)) {
            const btn = card.querySelector('.add-to-cart');
            productsData.push({
                name: name,
                price: btn?.getAttribute('data-price') || card.querySelector('.price')?.textContent,
                image: btn?.getAttribute('data-image') || card.querySelector('img')?.src,
                manufacturer: card.querySelector('.manufacturer')?.textContent.trim() || ''
            });
        }
    });

    if (searchInput && searchResultsList) {
        searchInput.addEventListener('input', function() {
            const term = this.value.toLowerCase().trim();
            
            if (term === '') {
                searchResultsList.style.display = 'none';
                if (popularProductsSection) popularProductsSection.style.display = 'block';
                if (featuresSection) featuresSection.style.display = 'block';
                return;
            }

            // Qidiruv aktivlashsa
            searchResultsList.style.display = 'block';
            if (popularProductsSection) popularProductsSection.style.display = 'none';
            if (featuresSection) featuresSection.style.display = 'none';

            const filtered = productsData.filter(p => p.name.toLowerCase().includes(term));
            
            searchResultsList.innerHTML = filtered.length > 0 ? filtered.map(p => `
                <div class="list-item-card" style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${p.image}" width="50" height="50" style="border-radius: 5px; object-fit: cover;">
                        <div>
                            <h4 style="margin:0;">${p.name}</h4>
                            <p style="margin:0; font-size: 12px; color: #777;">${p.manufacturer}</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; color: #28a745;">${Number(p.price).toLocaleString()} so'm</div>
                        <button class="add-to-cart" 
                                data-name="${p.name}" 
                                data-price="${p.price}" 
                                data-image="${p.image}"
                                style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;">
                            Qo'shish
                        </button>
                    </div>
                </div>
            `).join('') : '<p style="padding: 20px; text-align: center;">Hech narsa topilmadi...</p>';
        });
    }

    // ==========================================================
    // 4. REKLAMA SLAYDERI
    // ==========================
    const sliderItems = document.querySelectorAll('.slider-item');
    const dotsContainer = document.querySelector('.dots-container');
    let currentSlide = 0;

    if (sliderItems.length > 0 && dotsContainer) {
        sliderItems.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.dot');

        function goToSlide(index) {
            sliderItems.forEach(item => item.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            currentSlide = (index + sliderItems.length) % sliderItems.length;
            sliderItems[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        setInterval(() => goToSlide(currentSlide + 1), 5000);
    }

    // ==========================================================
    // 5. SAHIFA YUKLANGANDA ISHGA TUSHIRISH
    // ==========================
    updateCartBadge(); // Badge raqamini yangilash
});
function displayCart() {
    const container = document.getElementById('cart-items-container');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 50px; grid-column: 1/-1;">
                <h2>Savatingiz bo'sh</h2>
                <a href="index.html">Asosiy sahifaga qaytish</a>
            </div>`;
        updateCartBadge();
        return;
    }

    // Har bir mahsulotni alohida blok qilib chiqarish
    container.innerHTML = cart.map((item, index) => `
        <div class="product-card" style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 10px;">
            <button class="close-btn" onclick="removeItem(${index})" style="float:right; cursor:pointer;">&times;</button>
            
            <div style="display: flex; align-items: center; gap: 20px;">
                <img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                
                <div class="product-details">
                    <h2 style="margin: 0 0 10px 0; font-size: 18px;">${item.name}</h2>
                    
                    <p style="margin: 5px 0; color: #666;">
                        <strong>Narxi:</strong> ${Number(item.price).toLocaleString()} so'm
                    </p>
                    
                    <p style="margin: 5px 0; font-weight: bold;">
                        <strong>Soni:</strong> 1 dona
                    </p>
                </div>
            </div>
            
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; text-align: right;">
                <span style="color: #28a745; font-weight: bold;">
                    Jami: ${Number(item.price).toLocaleString()} so'm
                </span>
            </div>
        </div>
    `).join('');

    updateCartBadge();
}

// O'chirish funksiyasi (faqat tanlangan qatorni o'chiradi)
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1); // Index bo'yicha aynan o'sha dorini o'chirish
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

// Badge raqamini yangilash
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = cart.length; // Ro'yxatdagi qatorlar soni
    }
}

document.addEventListener('DOMContentLoaded', displayCart);