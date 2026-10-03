import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync('src/data.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { TARIFFS } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const expected = [[240,9000],[375,13500],[450,18000],[675,18000]];
TARIFFS.forEach((t,i) => {
  const rate = t.rate ?? t.rateOptions[0].rate;
  assert.deepEqual([rate,t.minPrice],expected[i]);
  for (const area of [25,60,250]) assert.equal(Math.max(rate*area,t.minPrice), Math.max(expected[i][0]*area,expected[i][1]));
});
assert.equal(TARIFFS[3].rateOptions[1].rate,825);
const html = fs.readFileSync('dist/index.html','utf8');
assert(!/Сочи|vershina-23|110419132/.test(html));
assert(html.includes('https://vershina50.ru/'));
assert(html.includes('Балашихе'));
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema.name,'Вершина — клининг в Балашихе');
for (const match of html.matchAll(/(?:src|href)="(\/(?:images|assets)\/[^"?#]+)"/g)) assert(fs.existsSync('dist'+match[1]),'Missing '+match[1]);
for (const f of ['favicon.ico','favicon-120x120.png','favicon-16x16.png','favicon-32x32.png','favicon-48x48.png','apple-touch-icon.png','site.webmanifest','robots.txt','sitemap.xml','privacy.html']) assert(fs.existsSync('dist/'+f),'Missing '+f);
assert.equal(fs.readFileSync('public/CNAME','utf8').trim(),'vershina50.ru');
console.log('Release checks passed: tariffs, minima, structured SEO, image assets, favicons, domain.');
