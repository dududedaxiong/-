// ==UserScript==
// @name         广告辅助增强版
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  智能隐藏各种广告、敏感词tab、浮窗、VPN链接等（支持动态加载）
// @author       You
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    //1. 按结构化规则隐藏 tab（推荐方式，可无限扩展） ====================
  const keywordsDisplay = [
        {
            selector: 'a > span.van-tab__text',
            keywords: ["催情春药", "同城约炮", "一键脱衣"]
        },
           {
            selector: 'div > span.more.text-muted.pull-right',
            keywords: ["无需安装任何插件，即可快速播放"]
        },
         {
            selector: 'li > a',
            keywords: ["会员"]
        }
  
   
        
    ];

    //2. 其他所有div类需要直接隐藏的类名 ====================
    const classesToHide = [
        "ad",
        "mda",
        "notice"
    ];

    //3. 其他需要直接隐藏的选择器 ====================
    const selectorsToHide = [
        'span[style*="color: gold"]',
        "#rm-float3",
        "uni-view.tabbar-list",
        'div[style="z-index: 2001;"]',
        "div.uni-swiper-slides",








    ];

    // ==================== 核心隐藏函数 ====================
    function hideElements() {
        // 1. 按规则隐藏关键词 tab
        keywordsDisplay.forEach(rule => {
            const { selector, keywords } = rule;
            document.querySelectorAll(selector).forEach(el => {
                const text = el.textContent.trim();
                if (keywords.includes(text)) {
                    // 向上找到最近的可隐藏父节点（a、div、uni-view 等）
                    const hideTarget = el.closest('a') || el.closest('div') || el.parentElement;
                    if (hideTarget) {
                        hideTarget.style.display = "none";
                        console.log(`[广告辅助] 隐藏关键词 tab: ${text} (${selector})`);
                    }
                }
            });
        });

       

        // 3. 按类名隐藏 div
        classesToHide.forEach(cls => {
            document.querySelectorAll(`div.${cls}`).forEach(div => {
                div.style.display = "none";
            });
        });

        // 4. 按选择器直接隐藏
        selectorsToHide.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.display = "none";
            });
        });
    }

    // ==================== MutationObserver 动态监听 ====================
    const observer = new MutationObserver(mutations => {
        // 有新节点加入时才执行，减少性能消耗
        for (const m of mutations) {
            if (m.addedNodes.length) {
                hideElements();
                break; // 一次变动里只要执行一次就够了
            }
        }
    });

    // 页面加载完成或 DOM  ready 后开始观察
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
        hideElements(); // 首次立即执行
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            observer.observe(document.body, { childList: true, subtree: true });
            hideElements();
        });
    }

    // 可选：每隔 1~2 秒再强制扫一次（对付极慢加载或 JS 动态插入的广告）
    setInterval(hideElements, 1500);
})();