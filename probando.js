import Localbase from "./localbase/localbase";

const db = new Localbase("db");

const main = async () => {
  await db.conected();

  setInterval(async () => {
    await db.collection("users").add({ nombre: "Juan", edad: 25, sexo: "M" });
    await db.collection("users").get().then(users => console.log(users));
  }, 1000);

}

main();