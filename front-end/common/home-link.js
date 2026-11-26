//so called iife, which is a expression but not a declaration,outermost () called the function inside immediately

(function () {
    const home = new URL('../index.html', document.currentScript.src).href;
    const btnlink = document.createElement('a');
    btnlink.href = home;
    btnlink.textContent = 'return to home';
    btnlink.id = 'home-link';
    btnlink.style.cssText = "position:fixed; top:8px; left:8px; z-index:1000; padding:6px 12px; background:#fff; color:#000; border:1px solid #000; border-radius:6px; font:14px; text-decoration:none "

    const top = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
    document.body.style.paddingTop = (top + 48) + 'px';
    document.body.append(btnlink)
})()