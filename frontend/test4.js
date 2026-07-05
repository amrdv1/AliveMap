async function test() {
  try {
    const res = await fetch('https://appealing-emotion-production-62c6.up.railway.app/api/alerts');
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    console.log(data.states ? Object.keys(data.states).filter(k => data.states[k].alertnow) : "No states");
  } catch(e) {
    console.error(e.message);
  }
}
test();
