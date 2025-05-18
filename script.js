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

// README 토글 (필요 시)
function toggleReadme() {
  const readme = document.getElementById("readme-content");
  readme.classList.toggle("readme-show");
}

// Firebase SDK 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAkLnLRczQgEo46eykdyAT8YksyTLSj6VQ",
  authDomain: "guestbook-ed614.firebaseapp.com",
  projectId: "guestbook-ed614",
  storageBucket: "guestbook-ed614.firebasestorage.app",
  messagingSenderId: "901106425561",
  appId: "1:901106425561:web:f8e1c56392b0fd707668c8",
  measurementId: "G-56NJESRZF7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const guestForm = document.getElementById("guestForm");
  const postitBoard = document.getElementById("postit-board");

  if (!guestForm || !postitBoard) return;

  guestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const relation = document.getElementById("relation").value;
    const comment = document.getElementById("comment").value;

    try {
      await addDoc(collection(db, "guestbook"), {
        relation,
        comment,
        createdAt: serverTimestamp(),
      });
      guestForm.reset();
    } catch (error) {
      alert("Failed to save message: " + error.message);
    }
  });

  const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));

  const colors = ["#fff89c", "#ffdcdc", "#c9f7f5", "#e0bbff", "#d6ffb7"];

  onSnapshot(q, (snapshot) => {
    postitBoard.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      const date = data.createdAt?.toDate().toLocaleDateString("ko-KR") || "";
      const postit = document.createElement("div");
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      postit.className = "postit";
      postit.style.backgroundColor = randomColor;
      postit.innerHTML = `
        <button class="delete-btn" data-id="${id}">🗑</button>
        <p><strong>${data.relation}</strong> 🗓 ${date}</p>
        <p>${data.comment}</p>
      `;

      postitBoard.appendChild(postit);
    });

    // 삭제 이벤트 바인딩
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Do you want to delete the post?")) {
          await deleteDoc(doc(db, "guestbook", id));
        }
      });
    });
  });
});
