const SYSTEM_PROMPT =
  "你是专业的技术翻译。用户给你一段 Linear ticket 的 HTML。把其中的文字翻译成简体中文，HTML 标签和属性原样保留，代码块、链接地址、人名和 ticket 编号不译。只输出翻译后的 HTML，不要用 ``` 包裹。";

browser.runtime.onMessage.addListener(async (message) => {
  if (message.type !== "translate") return;
  const { apiKey, model } = await browser.storage.local.get(["apiKey", "model"]);
  if (!apiKey) throw new Error("未设置 DeepSeek API key，请在插件选项里填写");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message.text },
      ],
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw new Error(`DeepSeek ${response.status}: ${await response.text()}`);
  const body = await response.json();
  return body.choices[0].message.content;
});
