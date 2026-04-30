# Crunchyroll Speed Controller (Manifest V3)

Това е изцяло **text-only** Chrome extension проект (без binary файлове), който променя скоростта на видео възпроизвеждане в Crunchyroll.

## Файлова структура

- `manifest.json`
- `popup.html`
- `popup.js`
- `popup.css`
- `content.js`
- `README.md`

## Версия

Текуща версия: **1.0.2**

## Инсталация

- Отвори Chrome.
- Напиши `chrome://extensions` в address bar.
- Включи **Developer mode**.
- Натисни **Load unpacked**.
- Избери папката на проекта.
- Extension-ът ще се появи горе вдясно в Chrome.

## Използване

- Отвори `crunchyroll.com`.
- Пусни видео.
- Натисни иконата на extension-а.
- Избери желаната скорост, например `1.5x` или `2x`.
- Скоростта трябва да се приложи веднага.
- При следващо видео последната избрана скорост трябва да се приложи автоматично.

## Troubleshooting

- Ако пише **No video found**, първо пусни видеото и отвори extension-а пак.
- Ако Crunchyroll е зареден преди инсталацията, направи refresh на страницата.
- Ако не работи, провери дали URL е `crunchyroll.com`.
- Ако Chrome покаже warning за липсваща икона, това е нормално, защото умишлено няма binary icon файлове.

## Проверка, че няма binary файлове

Можеш да провериш локално с:

```bash
find . -type f
```

Не трябва да има файлове с разширения като:
- `.png`
- `.jpg`
- `.jpeg`
- `.ico`
- `.webp`
- `.gif`
- `.zip`
- `.crx`
