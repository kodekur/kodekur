const MENU_TEMPLATE = `
<ul id="nav" style="width: 250px">
    <li><a href="/index.html">Главная</a></li>
    <li><a href="/market.html">Ассортимент на 2026 год</a></li>
    <li><a href="/opt.html">Для оптовиков</a></li>
    <li><a href="#">Каталог:</a></li>
    <span id="menuCatalog">
        <li><a href="/arbustum.html">Декоративные кустарники</a></li>
        <li><a href="/herbs.html">Декоративные травы</a></li>
        <li><a href="/mnogoletnije.html">Многолетние культуры</a></li>
        <li><a href="/conifer.html">Хвойные</a></li>
    </span>
    <li><a href="/contacts.html">Контакты</a></li>
</ul>

<br/>

<div style="width: 250px">
    <script async src="https://cse.google.com/cse.js?cx=012816619450786521312:3jqswgt6k4s"></script>
    <gcse:searchbox-only resultsUrl="/search.html"></gcse:searchbox-only>
</div>

<br/>
`;

function executeScripts(container) {
    var scripts = container.querySelectorAll('script');
    Array.prototype.forEach.call(scripts, function (oldScript) {
        var newScript = document.createElement('script');
        for (var i = 0; i < oldScript.attributes.length; i += 1) {
            var attr = oldScript.attributes[i];
            newScript.setAttribute(attr.name, attr.value);
        }
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var target = document.getElementById('menu-include');
    if (!target) {
        console.error('Элемент с id="menu-include" не найден на странице!');
        return;
    }

    target.innerHTML = MENU_TEMPLATE;
    executeScripts(target);
});
