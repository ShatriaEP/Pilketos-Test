let votingTerkunci = localStorage.getItem("votingTerkunci") === "true";
let sudahVote = localStorage.getItem("sudahVote") === "true";
let hasilTerlihat = false;
let chartInstance = null;

function updateStatus() {
  document.getElementById("toggleVotingBtn").textContent = votingTerkunci ? "Buka Voting" : "Kunci Voting";
  document.getElementById("toggleHasilBtn").textContent = hasilTerlihat ? "Tutup Hasil Voting" : "Lihat Hasil Voting";
}

function vote(kandidat) {
  if (votingTerkunci) {
    alert("Voting sudah dikunci.");
    return;
  }

  if (sudahVote) {
    alert("Kamu sudah memilih. Gunakan reset dengan kode untuk memilih ulang.");
    return;
  }

  if (!confirm("Apakah kamu yakin memilih kandidat ini?")) return;

  let hasil = JSON.parse(localStorage.getItem("hasil")) || {
    kandidat1: 0,
    kandidat2: 0,
    kandidat3: 0
  };

  hasil[kandidat]++;
  localStorage.setItem("hasil", JSON.stringify(hasil));
  localStorage.setItem("sudahVote", "true");
  sudahVote = true;
  document.getElementById("resetKode").value = "";
  alert("Pilihan berhasil disimpan!");
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
  if (pass === "pilketos") {
    const yakin = confirm(votingTerkunci ? "Yakin ingin membuka voting?" : "Yakin ingin mengunci voting?");
    if (yakin) {
      votingTerkunci = !votingTerkunci;
      localStorage.setItem("votingTerkunci", votingTerkunci);

      if (!votingTerkunci) {
        hasilTerlihat = false;
        document.getElementById("hasil").style.display = "none";
      }

      updateStatus();
      alert(votingTerkunci ? "Voting dikunci." : "Voting dibuka.");
    }
  } else {
    alert("Password salah!");
  }
}

function verifikasiToggleHasil() {
  const pass = prompt("Masukkan password:");
  if (pass !== "pilketos") {
    alert("Password salah!");
    return;
  }

  if (!votingTerkunci) {
    alert("Voting masih dibuka. Hasil voting hanya bisa dilihat jika voting telah dikunci.");
    return;
  }

  hasilTerlihat = !hasilTerlihat;
  document.getElementById("hasil").style.display = hasilTerlihat ? "block" : "none";
  if (hasilTerlihat) tampilkanHasil();
  updateStatus();
}

function tampilkanHasil() {
  const ctx = document.getElementById("grafikHasil").getContext("2d");
  const data = JSON.parse(localStorage.getItem("hasil")) || {
    kandidat1: 0,
    kandidat2: 0,
    kandidat3: 0
  };

  if (chartInstance) {
    chartInstance.destroy();
  }

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

updateStatus();
