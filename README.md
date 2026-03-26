# QuickBite Frontend

Ez a projekt a **QuickBite vizsgaremek** frontend része. A cél egy modern, reszponzív és felhasználóbarát webes felület biztosítása, ahol a felhasználók éttermeket böngészhetnek, rendeléseket adhatnak le, kezelhetik profiljukat és kedvenceiket.

## Mappaszerkezet

```text
QuickBite-Frontend/
├── public/                      # Statikus, build során közvetlenül kezelt fájlok
│   ├── img/                     # Publikus képek
│   ├── logo.jpg                 # Logó asset
│   └── logo2.png                # Alternatív logó asset
└── src/                         # Alkalmazás forráskódja
    ├── App.jsx                  # Fő alkalmazáskomponens
    ├── index.css                # Globális stílusok
    ├── components/              # Újrahasznosítható UI komponensek
    │   └── ...                  # Több UI komponens (navbar, footer, profile, stb.)
    ├── pages/                   # Oldalszintű nézetek
    │   ├── HomePage.jsx         # Főoldal komponens
    │   ├── ...                  # További oldalak (login, cart, profile, stb.)
    │   └── footerpages/         # Footerből elérhető információs aloldalak
    │       └── ...
    ├── services/                # Külső szolgáltatások
    │   └── ...
    ├── styles/                  # Oldal- és komponensszintű CSS fájlok
    │   └── ...                  # Több CSS fájl oldalakhoz és komponensekhez
    └── utils/                   # Segédfüggvények
        └── ...                  # API helper, auth, validáció, storage, toast, stb.
```

## Projekt elinditása

```bash
npm install
npm start
```

Alapértelmezetten a fejlesztői szerver a `http://localhost:3000` címen érhető el.
