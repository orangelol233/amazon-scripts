// ==UserScript==
// @name         2_Amazon Analyzer Data Extractor
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  提取商品数据
// @require      tampermonkey:///?id=b8ff6911-2c84-47b3-aa6f-b715388ef489
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.AmazonAnalyzerData = {
        extractProductData: () => {
            items = [...document.querySelectorAll('[data-component-type="s-search-result"]')];
            console.log("提取到的商品DOM节点:", items); // 调试1
            const products = items.map(item => { /* 解析逻辑 */ });
            console.log("处理后商品数据:", products); // 调试2
            return products;
        }
        async waitForProducts() {
            // ...原有等待商品加载逻辑...
        },
        extractProductData() {
            // ...原有数据提取逻辑...
            // 返回数据结构示例：
            return {
                name: "商品名称",
                price: 19.99,   // 数值类型
                rating: 3.5,    // 数值类型
                reviewCount: 128, // 数值类型
                url: "https://..."
            };
        }
    };
})();
