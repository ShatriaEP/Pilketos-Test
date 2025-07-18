import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAT0CmCyoACw3X5haMTz5IMQNfa8v8sZ9Y",
  authDomain: "pilketos-test.firebaseapp.com",
  projectId: "pilketos-test",
  storageBucket: "pilketos-test.appspot.com",
  messagingSenderId: "189300135890",
  appId: "1:189300135890:web:e8adbe7abc02d1a96a1a0b",
  measurementId: "G-NSX7YQ0GML",
  databaseURL: "https://pilketos-test-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let sudahVote = localStorage.getItem("sudahVote") === "true";
let hasilTerlihat = false;
let votingTerkunci = false;
let chartInstance = null;

const hasilRef = ref(db, "hasil");
const statusRef = ref(db, "votingTerkunci");

// Dengar status voting realtime
onValue(statusRef, (snapshot) => {
  votingTerkunci = snapshot.val() || false;
  updateStatus();
});

// Dengar hasil realtime
onValue(hasilRef, (snapshot) => {
  if (hasilTerlihat && snapshot.exists()) tampilkanHasil(snapshot.val());
});

function vote(kandidat) {
  if (votingTerkunci) return alert("Voting sudah dikunci.");
  if (sudahVote) return alert("Kamu sudah memilih.");

  if (!confirm("Yakin memilih kandidat ini?")) return;

  get(hasilRef).then(snapshot => {
    let hasil = snapshot.val() || {
      kandidat1: 0,
      kandidat2: 0,
      kandidat3: 0
    };
    hasil[kandidat]++;
    set(hasilRef, hasil);
    localStorage.setItem("sudahVote", "true");
    sudahVote = true;
    alert("Pilihan berhasil disimpan!");
    document.getElementById("resetKode").value = "";
  });
}

document.getElementById("resetKode").addEventListener("input", function () {
  if (this.value.toLowerCase() === "snessa") {
    localStorage.removeItem("sudahVote");
    sudahVote = false;
    alert("Pilihan berhasil di-reset. Silakan pilih kembali.");
    this.value = "";
  }
});

function verifikasiToggleVoting() {
  const pass = prompt("Masukkan password:");
  if (pass !== "pilketos") return alert("Password salah!");

  const konfirmasi = confirm(votingTerkunci ? "Buka voting?" : "Kunci voting?");
  if (konfirmasi) {
    votingTerkunci = !votingTerkunci;
    set(statusRef, votingTerkunci);
    if (!votingTerkunci) {
      hasilTerlihat = false;
      document.getElementById("hasil").style.display = "none";
    }
    updateStatus();
    alert(votingTerkunci ? "Voting dikunci." : "Voting dibuka.");
  }
}

function verifikasiToggleHasil() {
  const pass = prompt("Masukkan password:");
  if (pass !== "pilketos") return alert("Password salah!");
  if (!votingTerkunci) return alert("Voting belum dikunci.");

  hasilTerlihat = !hasilTerlihat;
  document.getElementById("hasil").style.display = hasilTerlihat ? "block" : "none";
  updateStatus();

  if (hasilTerlihat) {
    get(hasilRef).then(snapshot => {
      if (snapshot.exists()) tampilkanHasil(snapshot.val());
    });
  }
}

function tampilkanHasil(data) {
  const ctx = document.getElementById("grafikHasil").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Shatria", "Andan", "Raka"],
      datasets: [{
        label: "Jumlah Suara",
        data: [data.kandidat1, data.kandidat2, data.kandidat3],
        backgroundColor: ["#3498db", "#2ecc71", "#f39c12"]
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          precision: 0
        }
      }
    }
  });
}

function updateStatus() {
  document.getElementById("toggleVotingBtn").textContent = votingTerkunci ? "Buka Voting" : "Kunci Voting";
  document.getElementById("toggleHasilBtn").textContent = hasilTerlihat ? "Tutup Hasil Voting" : "Lihat Hasil Voting";
}

updateStatus();
