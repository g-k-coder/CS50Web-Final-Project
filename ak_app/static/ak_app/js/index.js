/* JavaScript file only for the index.html */

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    document.querySelector("#lfred").style.animation =
      "emphasize-initials 2s ease-in-out";
    document.querySelector("#rupa").style.animation =
      "emphasize-initials 2s ease-in-out";
    document.querySelector("#first").style.animation =
      "disappear-initials 2s ease-in-out";
    document.querySelector("#last").style.animation =
      "disappear-initials 2s ease-in-out";
  }, 1000);
  setTimeout(() => {
    document.querySelector("#index").style.display = "grid";
    document.querySelector(".name").style.animation =
      "increase-opacity 200ms ease-in";
  }, 2000);
  setTimeout(() => {
    document.querySelector("#lfred").style.display = "none";
    document.querySelector("#rupa").style.display = "none";
    document.querySelector("#first").style.display = "none";
    document.querySelector("#last").style.display = "none";
  }, 2950);

  let btn = document.querySelector(".name");

  btn.onclick = () => {
    document.querySelectorAll("#index > *:not(.name)").forEach((link) => {
      link.style.animation = "increase-opacity 200ms ease-in";
      setTimeout(() => {
        link.style.opacity = 1;
        link.style.display = "flex";
      }, 200);
    });
    btn.style.boxShadow =
      "0 12px 25px -4px rgba(0, 0, 0, 0.4), inset 0 -8px 30px 1px rgba(255, 255, 255, 0.9), 0 -10px 15px -1px rgba(255, 255, 255, 0.6), inset 0 8px 25px 0 rgba(0, 0, 0, 0.4), inset 0 0 10px 1px rgba(255, 255, 255, 0.6)";
    btn.children[0].style.color = "black";
    btn.style.filter = "brightness(1)";
  };
});
