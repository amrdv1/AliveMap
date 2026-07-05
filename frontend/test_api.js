async function check() {
  try {
    const res = await fetch('https://ubilling.net.ua/aerialalerts/');
    const data = await res.json();
    console.log("Ubilling API:", Object.keys(data.states).filter(k => data.states[k].alertnow));
  } catch (e) {
    console.error("Ubilling failed", e.message);
  }
}
check();
