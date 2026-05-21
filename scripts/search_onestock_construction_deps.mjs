const base = "https://www.onestockhome.com/osh-online/";
const deps = [
  "assets/show-D9v4OhgP.js",
  "assets/react-core-DWxzZbHN.js",
  "assets/index-DQMaiEiN.js",
  "assets/styled-components-0m6jzOaz.js",
  "assets/construction-calculator-YAwvH79j.js",
  "assets/i18n-locales-3hmYWW-5.js",
  "assets/index-DUrpi2cm.js",
  "assets/preload-helper-Bf6asrWH.js",
  "assets/apollo-BpPv-mK3.js",
  "assets/i18n-core-B0Jui2uq.js",
  "assets/i18n-en-D8ZY742B.js",
  "assets/i18n-th-Bqfl97jE.js",
  "assets/index-Tg6G0mCs.js",
  "assets/style-D2fNyXC-.js",
  "assets/index-Cj4Jo55r.js",
  "assets/ui-modal-BujKK80X.js",
  "assets/ui-select-CkMarmgF.js",
  "assets/ui-drawer-Bskw_1oN.js",
  "assets/index-C1-AlK7b.js",
  "assets/hooks-BGG2Roi4.js",
  "assets/index-Ck0Kh9bn.js",
  "assets/number-BY576yx-.js",
  "assets/index-D8yvsnve.js",
  "assets/index-DawG9Lwb.js",
  "assets/index-CBRs9GKS.js",
  "assets/utility-9Elf8gbE.js",
  "assets/logo-home-gray-C3p9FIpE.js",
  "assets/prop-types-DlXxxiRG.js",
  "assets/scrollToNode-hy_AZ_o3.js",
  "assets/index-ukX9ZMLP.js",
];

const needles = ["A302", "A3020", "โปรลายน์", "proline", "ฉาบ"];

for (const dep of deps) {
  const url = `${base}${dep}`;
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  const text = await res.text();
  const hitNeedles = needles.filter((n) => text.toLowerCase().includes(n.toLowerCase()));
  const skuMatches = text.match(/A\\d{8}/g);
  if (hitNeedles.length || (skuMatches && skuMatches.length)) {
    console.log(JSON.stringify({ dep, status: res.status, len: text.length, hitNeedles, skuUnique: skuMatches ? new Set(skuMatches).size : 0 }, null, 2));
  }
}

const hookUrl = `${base}assets/hooks-BGG2Roi4.js`;
const hookRes = await fetch(hookUrl, { headers: { "user-agent": "Mozilla/5.0" } });
const hookText = await hookRes.text();
const idx = hookText.indexOf('key:"pro-c-line"');
console.log("pro-c-line ctx", idx === -1 ? null : hookText.slice(Math.max(0, idx - 120), idx + 260));
