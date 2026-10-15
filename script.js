document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("cta").addEventListener("click", function () {
  document.getElementById("output").textContent = "Button clicked! Start building here.";
});
