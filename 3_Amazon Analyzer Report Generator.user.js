// ==UserScript==
// @name         3_Amazon Analyzer Report Generator
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  生成亚马逊商品分析报告（低分商品评价数+最低价TOP3）
// @author       Lily
// @require      tampermonkey:///?id=b8ff6911-2c84-47b3-aa6f-b715388ef489
// @require      tampermonkey:///?id=6287980e-20a5-4b54-9406-64601bde908b
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (!window.AmazonAnalyzerUtils) {
        console.error('未加载 AmazonAnalyzerUtils 工具脚本！');
        return;
    }

    window.AmazonAnalyzerReport = {
        /**
         * 生成分析报告
         * @param {Array} items - 商品数据数组
         * @returns {string} 格式化报告文本
         */
        generateAnalysisReport(items) {
            // 1. 处理低分商品（评分<4）
            const lowRatedItems = items
                .filter(item => item.rating > 0 && item.rating < 4)
                .sort((a, b) => b.reviewCount - a.reviewCount); // 按评价数降序

            // 2. 获取价格最低的3个有效商品
            const cheapestItems = items
                .filter(item => item.price > 0) // 过滤无效价格
                .sort((a, b) => a.price - b.price)
                .slice(0, 3);

            // 3. 构建报告
            let report = `📊 亚马逊商品分析（共 ${items.length} 个商品）\n\n`;

            // 3.1 低分商品报告
            report += `⭐ <b>评分低于4的商品</b>（共 ${lowRatedItems.length} 个）:\n`;
            if (lowRatedItems.length === 0) {
                report += "▸ 未找到符合条件的商品\n\n";
            } else {
                lowRatedItems.forEach((item, index) => {
                    report += `${index + 1}. ${window.truncate(item.name)}\n`;
                    report += `   - 评分: ${item.rating}星\n`;
                    report += `   - 评价数: ${window.AmazonAnalyzerUtils.formatNumber(item.reviewCount)}条\n`;
                    report += `   - 价格: ${window.AmazonAnalyzerUtils.formatCurrency(item.price)}\n\n`;
                });
            }

            // 3.2 最低价商品报告
            report += `💰 <b>价格最低的3个商品</b>:\n`;
            cheapestItems.forEach((item, index) => {
                report += `${index + 1}. ${window.AmazonAnalyzerUtils.truncate(item.name)}\n`;
                report += `   - 价格: <b>${window.AmazonAnalyzerUtils.formatCurrency(item.price)}</b>\n`;
                report += `   - 评分: ${item.rating}星 (${window.AmazonAnalyzerUtils.formatNumber(item.reviewCount)}条评价)\n`;
                report += `   - 直达链接: ${item.url}\n\n`;
            });

            return report;
        }
    };
})();