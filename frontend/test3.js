async function test() {
  const res = await fetch('https://ubilling.net.ua/aerialalerts/');
  const data = await res.json();
  const k = Object.keys(data.states)[0];
  console.log('Value:', data.states[k].alertnow, 'Type:', typeof data.states[k].alertnow);
}
test();
