const targets = "textarea, input, button, span";

function customCursor(options) {
  const settings = Object.assign(
    {
      targetClass: "custom-cursor",
      dotClass: "custom-cursor-dot",
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

  let timer = null,
    idleTimer = null,
    hideTimer = null,
    idleAnim = null;

  if (isTouchDevice()) return;

  const cursor = document.createElement("div");
  cursor.className = settings.targetClass;
  const dot = document.createElement("div");
  dot.className = settings.dotClass;
  settings.wrapper.appendChild(cursor);
  settings.wrapper.appendChild(dot);

  let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let dotPosition = { x: position.x, y: position.y };
  const setX = gsap.quickSetter(cursor, "x", "px");
  const setY = gsap.quickSetter(cursor, "y", "px");
  const setDotX = gsap.quickSetter(dot, "x", "px");
  const setDotY = gsap.quickSetter(dot, "y", "px");

  data.cursor = cursor;
  data.isHover = false;

  gsap.to([cursor, dot], { opacity: 0 });

  window.addEventListener("mousemove", init);

  function init() {
    window.removeEventListener("mousemove", init);

    window.addEventListener("mousemove", (e) => {
      dotPosition.x = e.clientX;
      dotPosition.y = e.clientY;

      data.isMoving = true;
      settings.onMove(data);

      clearTimeout(timer);
      clearTimeout(idleTimer);
      clearTimeout(hideTimer);

      if (idleAnim) {
        idleAnim.kill();
        idleAnim = null;
        gsap.to([cursor, dot], { scale: 1 });
      }

      idleTimer = setTimeout(() => {
        idleAnimation();
      }, settings.idleTime);

      hideTimer = setTimeout(() => {
        gsap.to([cursor, dot], { opacity: 0 });
      }, settings.hideAfter);

      timer = setTimeout(() => {
        data.isMoving = false;
        settings.onMove(data);
      }, settings.movingDelay);
    });

    document.addEventListener("mouseleave", () => {
      data.isInViewport = false;
      settings.onMove(data);
    });

    document.addEventListener("mouseenter", (e) => {
      dotPosition.x = position.x = e.clientX;
      dotPosition.y = position.y = e.clientY;

      data.isInViewport = true;
      settings.onMove(data);
    });

    gsap.ticker.add((time, deltaTime) => {
      const fpms = 60 / 1000;
      const delta = deltaTime * fpms;
      const dt = 1 - Math.pow(1 - settings.speed, delta);
      position.x += (dotPosition.x - position.x) * dt;
      position.y += (dotPosition.y - position.y) * dt;
      setDotX(dotPosition.x);
      setDotY(dotPosition.y);
      setX(position.x);
      setY(position.y);
    });

    data.isInViewport = true;
  }

  function idleAnimation() {
    if (!data.isMoving && !data.isHover) {
      idleAnim = gsap.to([cursor, dot], {
        scale: 1.2,
        repeat: -1,
        yoyo: true,
        duration: 0.5
      });
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
  dotClass: "custom-cursor-dot",
  hasHover: true,
  idleTime: 2000,
  onMove: function (data) {
    if (data.isInViewport) {
      if (data.isMoving) {
        if (data.isHover) {
          if (data.hoverTarget.tagName === "TEXTAREA" || data.hoverTarget.tagName === "INPUT") {
            gsap.to(data.cursor, { opacity: 0.5, scale: 1.5 });
            gsap.to(document.querySelector(".custom-cursor-dot"), {
              opacity: 0.5,
              scale: 1.5,
              height: 18,
              width: 2.5,
              borderRadius: 15
            });
          }
          else {
            gsap.to(data.cursor, { opacity: 0.5, scale: 1.5 });
            gsap.to(document.querySelector(".custom-cursor-dot"), {
              opacity: 0.5,
              scale: 1.5,
              height: 8,
              width: 8,
              borderRadius: 50
            });
          }
        } else {
              gsap.to(data.cursor, { opacity: 1, scale: 1 });
              gsap.to(document.querySelector(".custom-cursor-dot"), {
                opacity: 1,
                scale: 1,
                height: 8,
                width: 8,
                borderRadius: 50
              });
            
        }
      } else {
        gsap.to(data.cursor, { opacity: 0.5 });
        gsap.to(document.querySelector(".custom-cursor-dot"), { opacity: 0.5 });
      }
    } else {
      gsap.to(data.cursor, { opacity: 0 });
      gsap.to(document.querySelector(".custom-cursor-dot"), { opacity: 0 });
    }
  }
};

customCursor(ccOptions);
