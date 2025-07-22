// ==UserScript==
// @name         2_Amazon Analyzer Data Extractor
// @namespace    http://tampermonkey.net/
// @version      1.3  // 版本更新
// @description  提取商品数据（增强容错/多站点支持）
// @require      tampermonkey:///?id=b8ff6911-2c84-47b3-aa6f-b715388ef489
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
         * 增强版商品等待逻辑
         * @param {number} [timeout=10000] 超时时间(ms)
         */
        async waitForProducts(timeout = 10000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const check = () => {
                    // 多站点兼容选择器
                    const validItems = [
                        '[data-component-type="s-search-result"]',
                        '.s-result-item',
                        '[cel_widget_id*="MAIN-SEARCH_RESULTS"]',
                        '[data-asin][data-index]'  // 通用ASIN选择器
                    ].some(selector => 
                        document.querySelectorAll(selector).length > 3
                    );

                    if (validItems) {
                        resolve();
                    } else if (Date.now() - startTime > timeout) {
                        reject(new Error(`等待商品超时 (${timeout}ms)`));
                    } else {
                        setTimeout(check, 500);
                    }
                };
                check();
            });
        },

        /**
         * 安全提取商品数据
         * @returns {Array} 始终返回数组（可能为空）
         */
        extractProductData() {
            try {
                // 防御性选择器查询
                const items = [
                    ...document.querySelectorAll(`
                        [data-component-type="s-search-result"],
                        .s-result-item,
                        [cel_widget_id*="MAIN-SEARCH_RESULTS"],
                        [data-asin]:not(iframe [data-asin])  // 排除iframe内元素
                    `)
                ].filter(Boolean);  // 过滤null

                if (!items.length) {
                    console.warn('未找到任何商品容器元素');
                    return [];
                }

                return items.map(item => {
                    // 统一使用dataset.asin作为商品唯一标识
                    const asin = item.dataset?.asin || 
                                item.closest('[data-asin]')?.dataset?.asin || 
                                'N/A';

                    // 价格提取增强（支持多种货币格式）
                    const priceText = item.querySelector(`
                        .a-price-whole,
                        .a-price .a-offscreen,
                        .priceBlock .price
                    `)?.textContent?.replace(/[^0-9.]/g, '') || '0';

                    return {
                        asin,  // 确保始终有ASIN
                        name: item.querySelector(`
                            h2 a span,
                            .a-text-normal > span,
                            .a-size-medium
                        `)?.textContent?.trim() || `未知商品_${asin}`,
                        price: parseFloat(priceText) || 0,
                        rating: parseFloat(
                            item.querySelector(`
                                .a-icon-star-small,
                                .a-star-small,
                                [aria-label*="stars"]
                            `)?.getAttribute('aria-label')?.match(/[\d.]+/)?.[0] || '0'
                        ),
                        reviewCount: parseInt(
                            item.querySelector(`
                                .a-size-base,
                                .reviewCountText,
                                [href*="product-reviews"]
                            `)?.textContent?.replace(/\D/g, '') || '0'
                        ),
                        url: item.querySelector(`
                            h2 a,
                            .a-link-normal[href*="/dp/"]
                        `)?.href || `https://www.amazon.com/dp/${asin}`
                    };
                });
            } catch (e) {
                console.error('数据提取异常:', e);
                return [];  // 确保始终返回数组
            }
        }
    };
})();
