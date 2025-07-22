// ==UserScript==
// @name         1_Amazon Analyzer Utils
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  提供格式化工具函数
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.AmazonAnalyzerUtils = {
        formatCurrency(amount) {
            return '$' + amount.toFixed(2);
        },
        formatNumber(num) {
            return num.toLocaleString();
        },
        truncate(str, max = 50) {
            return str?.length > max ? str.substring(0, max) + '...' : str;
        }
    };
})();
