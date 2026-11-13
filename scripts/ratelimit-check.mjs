// Hız sınırının sahte X-Forwarded-For ile aşılamadığını ölçer (nginx kenarı üzerinden).
// Kullanım: node scripts/ratelimit-check.mjs [url]   (varsayılan http://localhost:3100)
// DİKKAT: çalıştıran IP'nin girişini 10 dk kilitler; sonra: docker compose -p sinopcepte restart backend
// Beklenen: 11. deneme 429, farklı sahte IP ile 12. deneme de 429. Çıkış kodu 0 = geçti.
const B=process.argv[2]||'http://localhost:3100';
async function attempt(xff){
  const h={}; if(xff) h['x-forwarded-for']=xff;
  let r=await fetch(B+'/api/auth/csrf',{headers:h}); const c=r.headers.getSetCookie().map(s=>s.split(';')[0]); const tok=decodeURIComponent((c.find(s=>s.startsWith('XSRF-TOKEN='))||'=').split('=')[1]);
  r=await fetch(B+'/api/auth/login',{method:'POST',headers:{...h,'content-type':'application/json','x-xsrf-token':tok,cookie:c.join('; ')},body:JSON.stringify({username:'yok_boyle_biri',password:'yanlis-sifre'})});
  return r.status;
}
const a=[]; for(let i=0;i<11;i++) a.push(await attempt('203.0.113.7'));
console.log('aynı sahte IP, 11 deneme:', a.join(','));
console.log('farklı sahte IP ile 12. deneme:', await attempt('198.51.100.9'));
const spoof=await attempt('192.0.2.55');
console.log('farklı sahte IP ile 13. deneme:', spoof);
process.exit(a[10]===429 && spoof===429 ? 0 : 1);
