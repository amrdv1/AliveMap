async function test() {
  const res = await fetch('https://alerts.com.ua/api/states');
  const data = await res.json();
  console.log(data.states[0]);
}
test();
