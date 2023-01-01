var stop = false;

setTimeout(function () {
  stop = true;
}, 80000);

while (stop === false) {
  console.log(stop);
}
