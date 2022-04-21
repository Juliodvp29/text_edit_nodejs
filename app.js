const readLine = require("readline");
const Messages = require("./messages");
const Document = require("./document");
const Directory = require("./directory");
const { createInflate } = require("zlib");
const messages = require("./messages");

const dir = new Directory();

let interface = readLine.createInterface(process.stdin, process.stdout);

const tools = `Comandos :q Salir, :sa = guardar como, :s = guardar
-----------------------------------------------------`;

const pantalla = `
=================================
Editor de texto.\n
=================================
Elige una opcion:\n
1 Crear un nuevo documento\n
2 Abrir un documento
3 Cerrar editor\n
`;

mainScreen();

function mainScreen() {
  process.stdout.write("\033c");

  interface.question(pantalla, (res) => {
    switch (res.trim()) {
      case "1":
        createFile();
        break;
      case "2":
        openFileInterface();
        break;
      case "3":
        interface.close();
        break;

      default:
        mainScreen();
    }
  });
}

function createFile() {
  let file = new Document(dir.getPath());

  renderInterface(file);
  readCommand(file);
}

function openFileInterface() {
  let file = new Document(dir.getPath());
  dir.getFilesInDir();

  interface.question(messages.requestFileName, (name) => {
    if (file.exits(name)) {
      openFile(file, name);
    } else {
      console.log(messages.fileNotFound);
      setTimeout(() => {
        interface.removeAllListeners("line");
        mainScreen();
      }, 2000);
    }
  });
}

function openFile(file, name) {
  file.open(name);
  renderInterface(file);
  readCommand(file);
}

function renderInterface(file, mensaje) {
  process.stdout.write("\033c");
  file.getName() == ""
    ? console.log(` | Untitled | `)
    : console.log(` | ${file.getName()} | `);

  console.log(tools);

  if (mensaje != null) {
    console.log(mensaje);
  } else {
    console.log(file.getContent());
  }
}
function readCommand(file) {
  interface.on("line", (input) => {
    switch (input.trim()) {
      case "sa":
        saveas(file);
        break;

      case "q":
        interface.removeAllListeners("line");
        mainScreen();
        break;

      case "s":
        save(file);
        break;

      default:
        file.append(input.trim());
    }
  });
}

function saveas(file) {
  interface.question(messages.requestFileName, (name) => {
    if (file.exits(name)) {
      console.log(messages.fileExists);
      interface.question(messages.replaceFile, (confirm) => {
        if ((confirm = "y")) {
          file.saveas(name);
          renderInterface(file, messages.fileSaved + "\n");
        } else {
          renderInterface(file, messages.fileNotSaved + "\n");
        }
      });
    } else {
      //el archivo no existe y se tiene que creae
      file.saveas(name);
      renderInterface(file, messages.fileSaved + "\n");
    }
  });
}

function save(file) {
  if (file.hasName()) {
    file.save();
    renderInterface(file, messages.fileSaved + "\n");
  } else {
    saveas(file);
  }
}
