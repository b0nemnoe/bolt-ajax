🛒  Webshop Alkalmazás
Ez a projekt egy modern, teljes körű (full-stack) e-kereskedelmi webalkalmazás, amely egy robusztus Node.js/Express backendből és egy reszponzív Vue 3 (Vite) frontendből áll. Az alkalmazás célja egy teljes értékű online vásárlási élmény biztosítása, beépített felhasználókezeléssel, termékkatalógussal, rendeléskezeléssel és számos egyéb kényelmi funkcióval.

✨ Főbb funkciók
A rendszer a következő főbb modulokat és funkciókat tartalmazza:

Felhasználókezelés és Hitelesítés: * Hagyományos regisztráció és bejelentkezés jelszótitkosítással (Bcrypt) és JWT (JSON Web Token) alapú azonosítással.

Beépített Google Login integráció (OAuth).

Rate-limiting védelem a túlzott próbálkozások és támadások (pl. brute-force) ellen.

Termékkatalógus: Termékek listázása, kategóriák kezelése, árak, készletinformációk és leírások megjelenítése. A termékképek kezelése és felhőalapú tárolása a Cloudinary segítségével történik.

Kosár és Rendeléskezelés: Termékek kosárba helyezése, majd a rendelések teljes körű adminisztrációja és rögzítése az adatbázisban.

Kívánságlista (Wishlist): A felhasználók elmenthetik a számukra szimpatikus termékeket későbbi vásárlás céljából.

Értékelési rendszer (Reviews): Vásárlói vélemények és értékelések leadása az egyes termékekhez.

Kuponok és Kedvezmények: Kuponkódok érvényesítési és beváltási lehetősége.

Többnyelvűség (i18n): Az alkalmazás felülete el van látva többnyelvű megjelenítéssel, jelenleg angol és magyar nyelven, a vue-i18n csomag segítségével.

Értesítések: Felhasználóbarát visszajelzések és értesítések (Toastification), valamint email küldési funkció a háttérben (Nodemailer).

🛠️ Alkalmazott Technológiák
A projekt a legmodernebb webes technológiákra és könyvtárakra épül:

Frontend (Kliens oldal):

Keretrendszer: Vue.js 3 (Composition API) Vite környezetben

Állapotkezelés: Pinia

Útválasztás (Routing): Vue Router

Dizájn és UI: Bootstrap 5, Oh-Vue-Icons

HTTP Kliens: Axios

Egyéb: Vue I18n (többnyelvűség), Vue Toastification (értesítések), Vue3 Google Login

Backend (Szerver oldal): 
  - Környezet és Keretrendszer: Node.js, Express.js (v5)
  - Adatbázis: MongoDB a Mongoose objektum-relációs leképző (ORM) csomaggal
  - Adatvalidáció: express-validator a bejövő kérések és adatok szigorú ellenőrzésére
  - Konfiguráció és Egyéb: dotenv a szenzitív környezeti változók kezelésére, illetve axios a szerveroldali külső API hívásokhoz
  - Biztonság és Autentikáció: JWT (jsonwebtoken), Bcrypt.js, Express Rate Limit, Google Auth Library, CORS
  - Fájlkezelés: Multer & Cloudinary (képek felhőalapú tárolása)
  - Email küldés: Nodemailer
