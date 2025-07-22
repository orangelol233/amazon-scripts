// ==UserScript==
// @name         1_Amazon Analyzer Utils
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  亚马逊分析工具实用函数库
// @author       Lily
// @match        https://www.amazon.com/*
// @match        https://www.amazon.co.jp/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // 版本控制
    const VERSION = '1.1';
    
    // 核心工具函数
    const Utils = {
        version: VERSION,
        
        // DOM操作
        findElements: function(selector, parent = document) {
            return Array.from(parent.querySelectorAll(selector));
        },
        
        // 价格提取
        extractPrice: function(text) {
            const match = text.match(/(\d+\.\d+)/);
            return match ? parseFloat(match[1]) : 0;
        },
        
        // 安全JSON解析
        safeJsonParse: function(str) {
            try {
                return JSON.parse(str);
            } catch (e) {
                console.warn('JSON解析失败:', str);
                return null;
            }
        },
        
        // 防抖函数
        debounce: function(func, delay = 300) {
            let timer;
            return function() {
                clearTimeout(timer);
                timer = setTimeout(() => func.apply(this, arguments), delay);
            };
        },
        
        // 通知封装
        showNotice: function(message, type = 'info') {
            const colors = {
                info: '#FF9900',
                error: '#FF3E00',
                success: '#00C853'
            };
            
            const notice = document.createElement('div');
            notice.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px;
                background: white;
                border-left: 4px solid ${colors[type] || colors.info};
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 9999;
                max-width: 300px;
            `;
            notice.textContent = message;
            document.body.appendChild(notice);
            
            setTimeout(() => notice.remove(), 5000);
        },
        
        // 异步加载资源
        loadResource: function(url) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    };
    
    // 全局导出（关键修改点！）
    if (typeof window.AmazonAnalyzerUtils === 'undefined') {
        window.AmazonAnalyzerUtils = Utils;
        console.log(`[AA] Utils v${VERSION} 已加载`);
    } else {
        console.warn('[AA] 警告: Utils重复加载');
    }
    
    // 旧版本兼容（可选）
    if (typeof window.AAUtil === 'undefined') {
        window.AAUtil = Utils;
    }
})();
