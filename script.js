// 스크롤 페이드인 효과
const faders = document.querySelectorAll(".fade-in");
const appearOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const appearOnScroll = new IntersectionObserver(function (entries, observer) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("appear");
    observer.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach((fader) => {
  appearOnScroll.observe(fader);
});

// Guestbook 메시지를 화면에만 표시 (저장은 안 됨)
document.addEventListener("DOMContentLoaded", () => {
  const guestForm = document.getElementById("guestForm");
  const postitBoard = document.getElementById("postit-board");

  if (!guestForm || !postitBoard) return;

  guestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const relation = document.getElementById("relation").value;
    const comment = document.getElementById("comment").value;

    const postit = document.createElement("div");
    const colors = ["#fff89c", "#ffdcdc", "#c9f7f5", "#e0bbff", "#d6ffb7"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    postit.className = "postit";
    postit.style.backgroundColor = randomColor;
    postit.innerHTML = `
      <button class="delete-btn">🗑</button>
      <p><strong>${relation}</strong></p>
      <p>${comment}</p>
    `;

    // 삭제 기능 추가
    postit.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm("Do you want to delete this message?")) {
        postit.remove();
      }
    });

    postitBoard.prepend(postit); // 작성된 메모 맨 위에 추가
  });
});
