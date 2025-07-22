// ==UserScript==
// @name         2_Amazon Analyzer Data Extractor
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  亚马逊商品数据提取器
// @author       Lily
// @match        https://www.amazon.com/*
// @match        https://www.amazon.co.jp/*
// @grant        none
// @require      https://fastly.jsdelivr.net/gh/orangelol233/amazon-scripts@main/1_amazon_utils.js
// ==/UserScript==

(function() {
    'use strict';
    
    const VERSION = '1.3';
    
    // 主工具对象
    const DataExtractor = {
        version: VERSION,
        
        // 提取商品基础数据
        extractProductData: function(products) {
            return Array.from(products).map(item => {
                const asin = item.getAttribute('data-asin') || '';
                const priceElement = item.querySelector('.a-price[data-a-size="xl"] .a-offscreen');
                const priceText = priceElement ? priceElement.textContent : '$0.00';
                
                return {
                    asin: asin,
                    title: item.querySelector('h2 a')?.textContent.trim() || '无标题',
                    price: window.AmazonAnalyzerUtils.extractPrice(priceText),
                    rating: parseFloat(item.querySelector('.a-icon-star-small .a-icon-alt')?.textContent.split(' ')[0] || 0),
                    reviewCount: parseInt(
                        item.querySelector('.a-size-small .a-size-base')?.textContent.replace(/,/g, '') || 0
                    ),
                    url: item.querySelector('h2 a')?.href || `https://www.amazon.com/dp/${asin}`,
                    imageUrl: item.querySelector('img.s-image')?.src || ''
                };
            });
        },
        
        // 提取搜索关键词
        extractSearchKeyword: function() {
            const input = document.getElementById('twotabsearchtextbox');
            return input ? input.value.trim() : '';
        },
        
        // 提取分页信息
        extractPaginationInfo: function() {
            const pagination = document.querySelector('.s-pagination-strip');
            if (!pagination) return null;
            
            return {
                currentPage: parseInt(pagination.querySelector('.s-pagination-selected')?.textContent || '1'),
                totalPages: Array.from(pagination.querySelectorAll('.s-pagination-item:not(.s-pagination-separator)'))
                    .map(el => parseInt(el.textContent))
                    .filter(num => !isNaN(num))
                    .pop() || 1
            };
        },
        
        // 提取排序方式
        extractSortMethod: function() {
            const selected = document.querySelector('#s-result-sort-select option[selected]');
            return selected ? selected.textContent.trim() : '默认排序';
        },
        
        // 增强数据校验
        validateProductData: function(data) {
            return data.filter(item => {
                return (
                    item.asin && 
                    item.asin.length >= 10 &&
                    !isNaN(item.price) &&
                    item.price > 0
                );
            });
        }
    };
    
    // 全局导出（关键修改点！）
    if (typeof window.AmazonAnalyzerData === 'undefined') {
        window.AmazonAnalyzerData = DataExtractor;
        console.log(`[AA] Data Extractor v${VERSION} 已加载`);
        
        // 依赖检查
        if (!window.AmazonAnalyzerUtils) {
            console.error('[AA] 错误: 未找到AmazonAnalyzerUtils');
        }
    } else {
        console.warn('[AA] 警告: Data Extractor重复加载');
    }
})();
