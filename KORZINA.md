Чтобы работало локально, нужно запускать любой веб-сервер. Например:

```
python3 -m http.server 8000
```

http://localhost:8000/market.html

Так же, чтобы email отправлялся локально - нужно выключать security -- см. "emailjs security.png".


To import data:
1. Upload.gs
2. Manually copy =IMAGE column, paste in-place values only
3. FixFormatting.gs
4. Results in market2.html

TODO:
1. Image loading stats
2. Image loading retries
3. market2.html - fix all formatting, fonts, etc
4. Same for korzina.html
5. Выделить "НОВИНКА!"

