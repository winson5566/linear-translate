# Linear Chinese Translator

A Firefox extension that adds a "译" button next to the title on [Linear](https://linear.app) issue pages. Clicking it translates the title, description, and comments into Simplified Chinese with DeepSeek and shows the result in a closable dialog, keeping the original formatting.

## Install

- Temporary: open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on…", and select `manifest.json`. Firefox removes it on restart.
- Permanent: submit the package at [addons.mozilla.org/developers](https://addons.mozilla.org/developers/) as "On your own" (unlisted), then install the signed `.xpi`.

Build the package:

```bash
zip -r linear-translate.xpi manifest.json background.js content.js panel.css options.html options.js icon.svg
```

## Settings

Open the extension's options in `about:addons` and enter your DeepSeek API key. The model defaults to `deepseek-chat`. The key is stored only in your local browser profile.
