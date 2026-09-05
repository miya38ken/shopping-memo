// ==================================================
// 買い物メモ
// ==================================================
//
// データ構造
//
// products
//   商品そのもの
//
// shoppingItems
//   今回買うもの
//
// purchaseHistory
//   実際に購入した記録
//
// ==================================================


// データ保護をブラウザにリクエスト（ページ読み込み時に一度実行）
if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(granted => {
        console.log("永続化ストレージ許可:", granted);
    });
}

// ==================================================
// データ読み込み
// ==================================================

let products =
    JSON.parse(
        localStorage.getItem("shopping_products") || "[]"
    );

let shoppingItems =
    JSON.parse(
        localStorage.getItem("shopping_items") || "[]"
    );

let purchaseHistory =
    JSON.parse(
        localStorage.getItem("shopping_history") || "[]"
    );


// ==================================================
// データ保存
// ==================================================

function saveData() {

    localStorage.setItem(
        "shopping_products",
        JSON.stringify(products)
    );

    localStorage.setItem(
        "shopping_items",
        JSON.stringify(shoppingItems)
    );

    localStorage.setItem(
        "shopping_history",
        JSON.stringify(purchaseHistory)
    );
}


// ==================================================
// DOM
// ==================================================

const shoppingList =
    document.getElementById("shoppingList");

const shoppingCount =
    document.getElementById("shoppingCount");

const productList =
    document.getElementById("productList");

const historyList =
    document.getElementById("historyList");

const searchInput =
    document.getElementById("searchInput");

const productModal =
    document.getElementById("productModal");

const detailModal =
    document.getElementById("detailModal");

const productNameInput =
    document.getElementById("productNameInput");

const categoryInput =
    document.getElementById("categoryInput");

const modalTitle =
    document.getElementById("modalTitle");

const saveProductButton =
    document.getElementById("saveProductButton");


// 現在編集している商品
let editingProductId = null;


// ==================================================
// カテゴリ
// ==================================================

const categories = [
    "日用品",
    "食品",
    "飲料",
    "衛生・美容",
    "その他"
];


// ==================================================
// 日付
// ==================================================

function getToday() {

    const date = new Date();

    return (
        date.getFullYear() +
        "/" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "/" +
        String(date.getDate()).padStart(2, "0")
    );
}


// ==================================================
// 日付文字列 → Date
// ==================================================

function parseDate(dateString) {

    const parts =
        dateString.split("/");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
}


// ==================================================
// ページ切り替え
// ==================================================

document
    .querySelectorAll(".nav-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const page =
                button.dataset.page;

            document
                .querySelectorAll(".nav-button")
                .forEach(b =>
                    b.classList.remove("active")
                );

            button.classList.add("active");


            document
                .querySelectorAll(".page")
                .forEach(p =>
                    p.classList.remove("active")
                );


            document
                .getElementById(
                    page + "Page"
                )
                .classList.add("active");


            if (page === "shopping") {
                displayShoppingList();
            }

            if (page === "products") {
                displayProducts();
            }

            if (page === "history") {
                displayHistory();
            }

        });

    });


// ==================================================
// 商品登録モーダル
// ==================================================

document
    .getElementById("addProductButton")
    .addEventListener("click", () => {

        editingProductId = null;

        modalTitle.textContent =
            "商品を登録";

        saveProductButton.textContent =
            "登録";

        productNameInput.value = "";

        categoryInput.value =
            "日用品";

        productModal.classList.add("show");

        setTimeout(() => {
            productNameInput.focus();
        }, 100);

    });


// ==================================================
// 商品保存
// ==================================================

saveProductButton
    .addEventListener("click", saveProduct);


function saveProduct() {

    const name =
        productNameInput.value.trim();

    const category =
        categoryInput.value;


    if (name === "") {

        alert("商品名を入力してください。");

        return;

    }


    // 編集
    if (editingProductId !== null) {

        const product =
            products.find(
                p => p.id === editingProductId
            );

        if (product) {

            product.name = name;

            product.category = category;

        }

    }

    // 新規登録
    else {

        products.push({

            id: Date.now(),

            name: name,

            category: category,

            purchaseCount: 0,

            lastPurchaseDate: null

        });

    }


    saveData();

    productModal.classList.remove("show");

    displayProducts();

}


// ==================================================
// 商品編集
// ==================================================

function editProduct(productId) {

    const product =
        products.find(
            p => p.id === productId
        );

    if (!product) {
        return;
    }


    editingProductId =
        productId;


    modalTitle.textContent =
        "商品を編集";

    saveProductButton.textContent =
        "保存";


    productNameInput.value =
        product.name;

    categoryInput.value =
        product.category;


    productModal.classList.add("show");

}


// ==================================================
// 商品削除
// ==================================================

function deleteProduct(productId) {

    const product =
        products.find(
            p => p.id === productId
        );

    if (!product) {
        return;
    }


    const result =
        confirm(
            `「${product.name}」を削除しますか？\n\n購入履歴は残ります。`
        );


    if (!result) {
        return;
    }


    products =
        products.filter(
            p => p.id !== productId
        );


    shoppingItems =
        shoppingItems.filter(
            item =>
                item.productId !== productId
        );


    saveData();

    displayProducts();

    displayShoppingList();

}


// ==================================================
// 商品リスト表示
// ==================================================

function displayProducts() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    productList.innerHTML = "";


    // 検索
    let filteredProducts =
        products.filter(product => {

            return product.name
                .toLowerCase()
                .includes(keyword);

        });


    // 購入回数の多い順
    filteredProducts.sort(
        (a, b) =>
            b.purchaseCount - a.purchaseCount
    );


    if (filteredProducts.length === 0) {

        productList.innerHTML = `
            <div class="empty">
                商品がありません
            </div>
        `;

        return;

    }


    categories.forEach(category => {

        const categoryProducts =
            filteredProducts.filter(
                product =>
                    product.category === category
            );


        if (categoryProducts.length === 0) {
            return;
        }


        const categoryDiv =
            document.createElement("div");

        categoryDiv.className =
            "category";


        const title =
            document.createElement("div");

        title.className =
            "category-title";

        title.textContent =
            category;


        categoryDiv.appendChild(title);


        categoryProducts.forEach(
            product => {

                const item =
                    document.createElement("div");

                item.className =
                    "product-item";


                const lastPurchase =
                    product.lastPurchaseDate
                    ? `最終購入 ${product.lastPurchaseDate}`
                    : "購入履歴なし";


                item.innerHTML = `

                    <div class="product-main">

                        <div class="product-name">
                            ${escapeHTML(product.name)}
                        </div>

                        <div class="product-info">
                            ${product.purchaseCount}回購入
                            ・
                            ${lastPurchase}
                        </div>

                    </div>

                    <div class="button-group">

                        <button
                            class="small-button buy-button">
                            ＋ 買う
                        </button>

                        <button
                            class="small-button detail-button">
                            詳細
                        </button>

                        <button
                            class="small-button edit-button">
                            編集
                        </button>

                    </div>

                `;

                item
                    .querySelector(".buy-button")
                    .addEventListener(
                        "click",
                        () =>
                            addToShoppingList(product.id)
                );


                item
                    .querySelector(".detail-button")
                    .addEventListener(
                        "click",
                        () =>
                            showProductDetail(product.id)
                    );


                item
                    .querySelector(".edit-button")
                    .addEventListener(
                        "click",
                        () =>
                            editProduct(product.id)
                    );


                categoryDiv.appendChild(item);

            }
        );


        productList.appendChild(categoryDiv);

    });

}


// ==================================================
// 買い物リストへ追加
// ==================================================

function addToShoppingList(productId) {

    const exists =
        shoppingItems.some(
            item =>
                item.productId === productId
        );


    if (exists) {

        alert("すでに買い物リストに入っています。");

        return;

    }


    shoppingItems.push({

        productId: productId

    });


    saveData();

    displayShoppingList();

}


// ==================================================
// 買い物リスト表示
// ==================================================

function displayShoppingList() {

    shoppingList.innerHTML = "";


    shoppingCount.textContent =
        shoppingItems.length + "個";


    if (shoppingItems.length === 0) {

        shoppingList.innerHTML = `
            <div class="empty">
                買うものはありません
                <br>
                <br>
                「商品」から追加できます
            </div>
        `;

        return;

    }


    categories.forEach(category => {

        const items =
            shoppingItems.filter(item => {

                const product =
                    products.find(
                        p =>
                            p.id === item.productId
                    );

                return product &&
                    product.category === category;

            });


        if (items.length === 0) {
            return;
        }


        const categoryDiv =
            document.createElement("div");

        categoryDiv.className =
            "category";


        const title =
            document.createElement("div");

        title.className =
            "category-title";

        title.textContent =
            category;


        categoryDiv.appendChild(title);


        items.forEach(item => {

            const product =
                products.find(
                    p =>
                        p.id === item.productId
                );


            if (!product) {
                return;
            }


            const div =
                document.createElement("div");

            div.className =
                "shopping-item";


            div.innerHTML = `

                <label>
                    ${escapeHTML(product.name)}
                </label>

                <button
                    class="small-button delete-shopping">
                    削除
                </button>

            `;


            div
                .querySelector(".delete-shopping")
                .addEventListener(
                    "click",
                    () =>
                        removeShoppingItem(product.id)
                );


            categoryDiv.appendChild(div);

        });


        shoppingList.appendChild(categoryDiv);

    });

}


// ==================================================
// 買い物リストから削除
// ==================================================

function removeShoppingItem(productId) {

    shoppingItems =
        shoppingItems.filter(
            item =>
                item.productId !== productId
        );


    saveData();

    displayShoppingList();

}


// ==================================================
// 買い物モード
// ==================================================

document
    .getElementById("shoppingModeButton")
    .addEventListener(
        "click",
        startShopping
    );


function startShopping() {

    if (shoppingItems.length === 0) {

        alert("買うものがありません。");

        return;

    }


    shoppingList.innerHTML = `

        <p style="
            margin-bottom:20px;
            color:#777;
            font-size:14px;
        ">
            基本的には全部購入したものとして、
            <br>
            買わなかったものだけチェックを外してください。
        </p>

    `;


    shoppingItems.forEach(item => {

        const product =
            products.find(
                p =>
                    p.id === item.productId
            );


        if (!product) {
            return;
        }


        const div =
            document.createElement("div");

        div.className =
            "shopping-item";


        div.innerHTML = `

            <input
                type="checkbox"
                checked
                data-product-id="${product.id}"
            >

            <label>
                ${escapeHTML(product.name)}
            </label>

        `;


        shoppingList.appendChild(div);

    });


    const completeButton =
        document.createElement("button");

    completeButton.className =
        "main-button";

    completeButton.textContent =
        "購入完了";


    completeButton.addEventListener(
        "click",
        completeShopping
    );


    shoppingList.appendChild(
        completeButton
    );

}


// ==================================================
// 購入完了
// ==================================================

function completeShopping() {

    const checkboxes =
        shoppingList.querySelectorAll(
            'input[type="checkbox"]'
        );


    const purchasedIds = [];


    const today =
        getToday();


    checkboxes.forEach(checkbox => {

        const productId =
            Number(
                checkbox.dataset.productId
            );


        if (!checkbox.checked) {
            return;
        }


        const product =
            products.find(
                p =>
                    p.id === productId
            );


        if (!product) {
            return;
        }


        // 購入回数
        product.purchaseCount++;


        // 最終購入日
        product.lastPurchaseDate =
            today;


        // 購入履歴
        purchaseHistory.push({

            productId:
                product.id,

            name:
                product.name,

            date:
                today

        });


        purchasedIds.push(
            productId
        );

    });


    // 購入したものだけリストから削除
    shoppingItems =
        shoppingItems.filter(
            item =>
                !purchasedIds.includes(
                    item.productId
                )
        );


    saveData();

    displayShoppingList();

    alert("購入履歴を記録しました。");

}


// ==================================================
// 商品詳細
// ==================================================

function showProductDetail(productId) {

    const product =
        products.find(
            p =>
                p.id === productId
        );


    if (!product) {
        return;
    }


    const dates =
        purchaseHistory
            .filter(
                item =>
                    item.productId === productId
            )
            .map(
                item =>
                    item.date
            );


    const averageSpan =
        calculateAveragePurchaseSpan(
            dates
        );


    document.getElementById(
        "detailTitle"
    ).textContent =
        product.name;


    document.getElementById(
        "detailContent"
    ).innerHTML = `

        <div class="detail-stat">

            <div class="detail-label">
                カテゴリ
            </div>

            <div class="detail-value">
                ${product.category}
            </div>

        </div>


        <div class="detail-stat">

            <div class="detail-label">
                購入回数
            </div>

            <div class="detail-value">
                ${product.purchaseCount}回
            </div>

        </div>


        <div class="detail-stat">

            <div class="detail-label">
                最終購入日
            </div>

            <div class="detail-value">

                ${
                    product.lastPurchaseDate
                    || "まだ購入していません"
                }

            </div>

        </div>


        <div class="detail-stat">

            <div class="detail-label">
                平均購入スパン
            </div>

            <div class="detail-value">

                ${
                    averageSpan !== null
                    ? `約${averageSpan}日`
                    : "データ不足"
                }

            </div>

        </div>


        <div class="purchase-dates">

            <h3>
                過去の購入日
            </h3>

            ${
                dates.length === 0
                ? "<div>まだありません</div>"
                : dates
                    .slice()
                    .reverse()
                    .map(
                        date =>
                            `<div class="purchase-date">
                                ${date}
                            </div>`
                    )
                    .join("")
            }

        </div>


        <button
            id="detailDeleteButton"
            class="main-button"
            style="
                background:#eee;
                color:#333;
            "
        >
            🗑️ この商品を削除
        </button>

    `;


    document
        .getElementById(
            "detailDeleteButton"
        )
        .addEventListener(
            "click",
            () => {

                detailModal.classList.remove(
                    "show"
                );

                deleteProduct(productId);

            }
        );


    detailModal.classList.add(
        "show"
    );

}


// ==================================================
// 平均購入スパン
// ==================================================

function calculateAveragePurchaseSpan(
    dates
) {

    if (dates.length < 2) {
        return null;
    }


    const sortedDates =
        dates
            .map(
                date =>
                    parseDate(date)
            )
            .sort(
                (a, b) =>
                    a - b
            );


    let totalDays = 0;


    for (
        let i = 1;
        i < sortedDates.length;
        i++
    ) {

        const difference =
            sortedDates[i] -
            sortedDates[i - 1];


        const days =
            difference /
            (1000 * 60 * 60 * 24);


        totalDays += days;

    }


    return Math.round(
        totalDays /
        (sortedDates.length - 1)
    );

}


// ==================================================
// 購入履歴
// ==================================================

function displayHistory() {

    historyList.innerHTML = "";


    if (products.length === 0) {

        historyList.innerHTML = `
            <div class="empty">
                まだ商品がありません
            </div>
        `;

        return;

    }


    const sortedProducts =
        products
            .filter(
                product =>
                    product.purchaseCount > 0
            )
            .sort(
                (a, b) =>
                    b.purchaseCount -
                    a.purchaseCount
            );


    if (sortedProducts.length === 0) {

        historyList.innerHTML = `
            <div class="empty">
                まだ購入履歴がありません
            </div>
        `;

        return;

    }


    // 商品ごとの統計
    sortedProducts.forEach(
        product => {

            const dates =
                purchaseHistory
                    .filter(
                        item =>
                            item.productId ===
                            product.id
                    )
                    .map(
                        item =>
                            item.date
                    );


            const average =
                calculateAveragePurchaseSpan(
                    dates
                );


            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "history-product";


            div.innerHTML = `

                <div class="history-product-name">

                    ${escapeHTML(product.name)}

                </div>


                <div class="history-summary">

                    ${product.purchaseCount}回購入
                    ・
                    最終購入 ${product.lastPurchaseDate}

                    ${
                        average !== null
                        ? `・ 平均 約${average}日`
                        : ""
                    }

                </div>

            `;


            div.addEventListener(
                "click",
                () =>
                    showProductDetail(
                        product.id
                    )
            );


            historyList.appendChild(
                div
            );

        }
    );

}


// ==================================================
// 検索
// ==================================================

searchInput.addEventListener(
    "input",
    displayProducts
);


// ==================================================
// 詳細モーダルを閉じる
// ==================================================

document
    .getElementById(
        "closeDetailButton"
    )
    .addEventListener(
        "click",
        () => {

            detailModal.classList.remove(
                "show"
            );

        }
    );


// ==================================================
// 商品モーダルを閉じる
// ==================================================

document
    .getElementById(
        "cancelProductButton"
    )
    .addEventListener(
        "click",
        () => {

            productModal.classList.remove(
                "show"
            );

        }
    );


// モーダル外をクリックして閉じる
productModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            productModal
        ) {

            productModal.classList.remove(
                "show"
            );

        }

    }
);


detailModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            detailModal
        ) {

            detailModal.classList.remove(
                "show"
            );

        }

    }
);


// ==================================================
// HTMLエスケープ
// ==================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// ==================================================
// 初期表示
// ==================================================

displayShoppingList();

displayProducts();

displayHistory();

// ==================================================
// PWA Service Worker
// ==================================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./sw.js")
                .then(() => {

                    console.log(
                        "Service Worker registered."
                    );

                })
                .catch(error => {

                    console.error(
                        "Service Worker registration failed:",
                        error
                    );

                });

        }
    );

}