// ==UserScript==
// @name         2_Amazon Analyzer Data Extractor
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  提取商品数据（价格/评分/评价数）
// @require      tampermonkey:///?id=b8ff6911-2c84-47b3-aa6f-b715388ef489  // Utils
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (!window.AmazonAnalyzerUtils) {
        console.error('Utils工具库未加载！');
        return;
    }

    window.AmazonAnalyzerData = {
        /**
         * 等待商品加载完成
         */
        async waitForProducts() {
            return new Promise(resolve => {
                const observer = new MutationObserver(() => {
                    if (document.querySelector('[data-component-type="s-search-result"]')) {
                        observer.disconnect();
                        resolve();
                    }
                });
                observer.observe(document.body, { 
                    childList: true, 
                    subtree: true 
                });
            });
        },

        /**
         * 提取商品数据
         * @returns {Array} 商品对象数组
         */
        extractProductData() {
            const items = [
                ...document.querySelectorAll(
                    '[data-component-type="s-search-result"], ' +
                    '.s-result-item, ' +
                    '[cel_widget_id*="MAIN-SEARCH_RESULTS"]'
                )
            ];

            return items.map(item => {
                try {
                    return {
                        name: item.querySelector('h2 a span')?.textContent?.trim() || '未知商品',
                        price: parseFloat(
                            item.querySelector('.a-price-whole')?.textContent?.replace(/[^0-9.]/g, '') || 0
                        ),
                        rating: parseFloat(
                            item.querySelector('.a-icon-star-small')?.getAttribute('aria-label')?.match(/[\d.]+/)?.[0] || 0
                        ),
                        reviewCount: parseInt(
                            item.querySelector('.a-size-base')?.textContent?.replace(/\D/g, '') || 0
                        ),
                        url: item.querySelector('h2 a')?.href || ''
                    };
                } catch (e) {
                    console.error('商品解析失败:', e, item);
                    return null;
                }
            }).filter(Boolean);  // 过滤无效项
        }
    };
})();
