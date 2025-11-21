// Yandex.Metrika - Centralized analytics tracking
// Load this script in all HTML files via: <script type="text/javascript" src="/js/yandex-metrika.js" defer></script>

const METRIKA_INFORMER = `
<!-- Yandex.Metrika informer -->
<a href="https://metrika.yandex.ru/stat/?id=41211754&amp;from=informer" target="_blank" rel="nofollow">
    <img src="https://informer.yandex.ru/informer/41211754/3_1_FFFFFFFF_EFEFEFFF_0_pageviews"
         style="width:88px; height:31px; border:0;"
         alt="Яндекс.Метрика"
         title="Яндекс.Метрика: данные за сегодня (просмотры, визиты и уникальные посетители)"
        class="ym-advanced-informer" data-cid="41211754" data-lang="ru"/>
</a>
<!-- /Yandex.Metrika informer -->
`;

// <!-- Yandex.Metrika counter -->
(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');

ym(41211754, 'init', {webvisor:true, clickmap:true, accurateTrackBounce:true, trackLinks:true});
// <!-- /Yandex.Metrika counter -->

// Inject Yandex.Metrika informer at the bottom of the page  
document.addEventListener('DOMContentLoaded', function () {
    var div = document.createElement('div');
    div.style.textAlign = 'center';
    div.innerHTML = METRIKA_INFORMER;
    document.body.appendChild(div);
});
