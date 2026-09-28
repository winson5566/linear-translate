const fields = ["apiKey", "model"];
browser.storage.local.get(fields).then((saved) => {
  for (const field of fields) document.getElementById(field).value = saved[field] ?? "";
});
document.getElementById("save").onclick = async () => {
  await browser.storage.local.set(Object.fromEntries(fields.map((f) => [f, document.getElementById(f).value.trim()])));
  document.getElementById("status").textContent = "已保存";
};
