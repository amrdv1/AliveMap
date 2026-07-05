async function test() {
  const res = await fetch('https://appealing-emotion-production-62c6.up.railway.app/ukraine.geojson');
  console.log(res.status, res.headers.get('content-type'));
  if (res.ok) {
    const data = await res.json();
    console.log('Features count:', data.features ? data.features.length : 'none');
  }
}
test();
