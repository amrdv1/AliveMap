async function test() {
  try {
    const res = await fetch('https://appealing-emotion-production-62c6.up.railway.app/api/alerts');
    const data = await res.json();
    console.log(data ? Object.keys(data.states || {}).length : "No data");
    console.log(data.states ? data.states["Дніпропетровська область"] : "No states");
  } catch (err) {
    console.error(err.message);
  }
}
test();
