(function () {
    function logError(message, detail) {
        if (window.console && console.error) {
            console.error(message, detail || '');
        }
    }

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

    function includePartial(target) {
        var src = target.getAttribute('data-include');
        if (!src) {
            return;
        }

        fetch(src)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status + ' ' + response.statusText);
                }
                return response.text();
            })
            .then(function (html) {
                target.innerHTML = html;
                executeScripts(target);
            })
            .catch(function (err) {
                logError('Не удалось загрузить include: ' + src, err);
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var targets = document.querySelectorAll('[data-include]');
        Array.prototype.forEach.call(targets, includePartial);
    });

    window.toggleBlock = function (elementId) {
        var el = document.getElementById(elementId);
        if (!el) {
            return;
        }
        var style = window.getComputedStyle ? window.getComputedStyle(el) : el.style;
        var isHidden = style.display === 'none';
        el.style.display = isHidden ? 'block' : 'none';
    };
})();
