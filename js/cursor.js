const targets = "textarea, input, button, span, a";

const style = document.createElement("style");
style.innerHTML = `
  .hide-native-cursor {
    cursor: none;
  }
`;
document.head.appendChild(style);

function customCursor(options) {
  const settings = Object.assign(
    {
      targetClass: "custom-cursor",
      wrapper: document.body,
      speed: 0.2,
      movingDelay: 300,
      idleTime: 2000,
      hideAfter: 5000,
      hasHover: true,
      hoverTarget: document.querySelectorAll(targets),
      touchDevices: false,
      onMove: function (data) {}
    },
    options
  );

  const data = {};
  
  function isTouchDevice() {
    return (('ontouchstart' in window) ||
       (navigator.maxTouchPoints > 0) ||
       (navigator.msMaxTouchPoints > 0));
  }

  if (isTouchDevice()) return;

  let timer = null,
    idleTimer = null,
    hideTimer = null,
    idleAnim = null,
    currentScale = 1.5;

  const cursor = document.createElement("div");
  cursor.className = settings.targetClass;
  settings.wrapper.appendChild(cursor);

  const setX = gsap.quickTo(".custom-cursor", "x", { duration: 0.2, ease: "power3"});
  const setY = gsap.quickTo(".custom-cursor", "y", { duration: 0.2, ease: "power3"});

  data.cursor = cursor;
  data.isHover = false;
  data.isClicked = false;

  setX(window.innerWidth / 2);

  gsap.to([cursor], { opacity: 0 });

  window.addEventListener("mousemove", init);

  function init() {
    window.removeEventListener("mousemove", init);

    window.addEventListener("mousemove", (e) => {
      idling = false;

      setX(e.clientX);
      setY(e.clientY);

      data.isMoving = true;
      settings.onMove(data);

      clearTimeout(timer);
      clearTimeout(idleTimer);
      clearTimeout(hideTimer);

      if (idleAnim) {
        idleAnim.kill();
        idleAnim = null;
        gsap.to([cursor], { scale: 2 });
      }

      document.documentElement.classList.remove("hide-native-cursor");

      idleTimer = setTimeout(() => {
        idleAnimation();
      }, settings.idleTime);

      hideTimer = setTimeout(() => {
        gsap.to([cursor], { opacity: 0 });
      }, settings.hideAfter);

      timer = setTimeout(() => {
        data.isMoving = false;
        settings.onMove(data);
      }, settings.movingDelay);
    });

    window.addEventListener("mousedown", () => {
      if (!idling) {
        data.isClicked = true;
        clearTimeout(timer);
        clearTimeout(idleTimer);
        clearTimeout(hideTimer);
        gsap.to(cursor, { scale: currentScale - 0.3 });
      }
    });

    window.addEventListener("mouseup", () => {
      if (!idling) {
        data.isClicked = false;
        clearTimeout(timer);
        clearTimeout(idleTimer);
        clearTimeout(hideTimer);
        gsap.to(cursor, { scale: currentScale });
      }
    });

    document.addEventListener("mouseleave", () => {
      data.isInViewport = false;
      settings.onMove(data);
    });

    document.addEventListener("mouseenter", (e) => {
      setX(e.clientX, e.clientX);
      setY(e.clientY, e.clientY);

      data.isInViewport = true;
      settings.onMove(data);
    });

    data.isInViewport = true;
  }

  function idleAnimation() {
    if (!data.isMoving && !data.isHover) {
      idling = true;
      idleAnim = gsap.to([cursor], {
        scale: 2,
        repeat: -1,
        yoyo: true,
        duration: 0.5
      });
      hideCursorTimeout = setTimeout(() => {
        document.documentElement.classList.add("hide-native-cursor");
      }, 3250);
    }
  }

  function addHoverTargets(targets) {
    hoverTargets = gsap.utils.toArray(targets);
    if (settings.hasHover && hoverTargets.length) {
      hoverTargets.forEach((target) => {
        target.addEventListener("mouseenter", () => {
          data.hoverTarget = target;
          data.isHover = true;
        });
        target.addEventListener("mouseleave", () => {
          data.hoverTarget = target;
          data.isHover = false;
        });
      });
    }
  }

  addHoverTargets(targets);

  document.addEventListener("FilePond:loaded", (e) => {
    console.log(
      "filepond loaded",
      document.querySelector(".filepond--label-action")
    );

    let targets = ".filepond--label-action, .filepond--download-icon, .filepond--file-action-button";

    gsap.delayedCall(0.5, () => addHoverTargets(targets));
  });
  
  document.addEventListener("FilePond:addfile", (e) => {
    console.log("added file");

    let targets = ".filepond--label-action, .filepond--download-icon, .filepond--file-action-button";

    gsap.delayedCall(0.5, () => addHoverTargets(targets));
  });
}

const ccOptions = {
  targetClass: "custom-cursor",
  hasHover: true,
  idleTime: 2000,
  onMove: function (data) {
    if (data.isInViewport) {
      if (data.isMoving) {
        if (data.isHover) {
          gsap.to(data.cursor, { opacity: 0.5, scale: 2 });
          currentScale = 2;
        } else {
          gsap.to(data.cursor, { opacity: 1, scale: data.isClicked ? 1.2 : 1.5 });
          currentScale = 1.5;
        }
      } else {
        gsap.to(data.cursor, { opacity: 0.5 });
      }
    } else {
      gsap.to(data.cursor, { opacity: 0, scale: 2 });
    }
  }
};

customCursor(ccOptions);