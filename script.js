let emulator;

function carregarROM() {
  const file = document.getElementById('romInput').files[0];

  if (!file) {
    alert("Escolhe a ROM primeiro!");
    return;
  }

  emulator = new EmulatorJS({
    canvas: document.getElementById("gameCanvas"),
    system: "neogeo",
    romFile: file,
    biosFile: "neogeo.zip"
  });

  emulator.loadROM();
}

function sendKey(key){
  if(emulator){
    emulator.sendKey(key);
  }
}