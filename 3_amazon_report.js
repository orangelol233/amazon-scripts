// ==UserScript==
// @name         3_Amazon Analyzer Report Generator
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  生成亚马逊商品分析报告（低分商品评价数+最低价TOP3）
// @author       Lily
// @require      https://raw.githubusercontent.com/orangelol233/amazon-scripts/main/1_amazon_utils.js
// @require      https://raw.githubusercontent.com/orangelol233/amazon-scripts/main/2_amazon_data.js
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
        generateAnalysisReport: function(items) {
            // 类型安全检查
            if (!Array.isArray(items)) {
                console.error('Expected array, got:', typeof items, items);
                return "分析失败：数据格式异常（非数组）";
            }

            // 过滤有效商品
            const validItems = items.filter(item => 
                item?.price > 0 && item?.name !== '未知商品'
            );

            if (validItems.length === 0) {
                return "未找到有效商品数据";
            }

            // 1. 处理低分商品（评分<4）
            const lowRatedItems = validItems
                .filter(item => item.rating > 0 && item.rating < 4)
                .sort((a, b) => b.reviewCount - a.reviewCount);

            // 2. 获取价格最低的3个有效商品
            const cheapestItems = validItems
                .filter(item => item.price > 0)
                .sort((a, b) => a.price - b.price)
                .slice(0, 3);

            // 3. 构建报告
            let report = `📊 亚马逊商品分析（共 ${validItems.length} 个有效商品）\n\n`;

            // 3.1 低分商品报告
            report += `⭐ <b>评分低于4的商品</b>（共 ${lowRatedItems.length} 个）:\n`;
            if (lowRatedItems.length === 0) {
                report += "▸ 未找到低分商品\n\n";
            } else {
                lowRatedItems.forEach((item, index) => {
                    report += `${index + 1}. ${window.AmazonAnalyzerUtils.truncate(item.name)}\n`;
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
                report += `   - 直达链接: ${item.url || '无'}\n\n`;
            });

            return report;
        }
    };
})();
