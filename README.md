# Projektin asennus- ja käynnistysohjeet

## 1. Lataa ja pura projekti

Lataa projektikansio ja pura se haluamaasi paikkaan. Avaa projektin juurikansio tekstieditorilla, esimerkiksi Visual Studio Codella.

## 2. Avaa kaksi terminaalia

Avaa kaksi terminaali-ikkunaa:

- **Terminaali 1:** siirry backend-kansioon:

  ```bash
  cd backnd
  ```
- **Terminaali 2:** siirry frontend-kansioon:

  ```bash
  cd frontend
  ```

## 3. Asenna tarvittavat paketit

Aja molemmissa terminaaleissa:

```bash
npm install
```

Tämä asentaa projektin tarvitsemat paketit.

## 4. Tuo tietokanta

Projektin backend-kansiossa on tietokantatiedosto. Avaa phpMyAdmin ja tuo kyseinen `.sql`-tiedosto tietokantaan.

## 5. Määritä .env-tiedosto

Projektin backend-kansiossa on `.env`-tiedosto. Kirjoita siihen oman tietokantasi tiedot.

> Varmista, että tietokannan nimi, käyttäjätunnus ja salasana vastaavat omaa MySQL-tietokantaasi.

## 6. Käynnistä backend

Backend-kansiossa terminaalissa käynnistä palvelin:

```bash
nodemon server.js
```

## 7. Käynnistä frontend

Frontend-kansion terminaalissa käynnistä sovellus:

```bash
npm run dev
```

Frontendin käynnistämisen jälkeen terminaali näyttää osoitteen, josta sovelluksen voi avata selaimessa.

---

## Vaadittavat ohjelmat

Varmista ennen projektin käynnistämistä, että tietokoneelle on asennettu:

- Node.js ja npm
- MySQL
- phpMyAdmin
- Nodemon (jos sitä ei ole asennettu projektin riippuvuuksiin)

---

## Käyttäjätunnukset

| Rooli | Käyttäjänimi | Salasana |
|---|---|---|
| Opettaja | Maija | 123 |
| Oppilas | Matti | 123 |
| Oppilas | Mikko | 123 |
| Ohjaaja | Misa | 123 |

> **HUOM!** Tällä hetkellä ei ole tehty admin-paneelia, koska uuden opettajan tai ohjaajan voi lisätä suoraan tietokantaan. Jos haluat lisätä opettajan tai ohjaajan, muista hashata heidän salasanansa `hash.js`-tiedostolla:
>
> 1. Syötä salasana, jonka haluat hashata:
>    ```js
>    const password = 'TÄHÄN';
>    ```
> 2. Aja terminaalissa:
>    ```bash
>    node hash.js
>    ```
> 3. Terminaaliin tulostuu hashattu salasana.

---

## Käyttäjälähtöinen suunnittelu

### Opiskelija
- Kirjautua tunnuksilla
- Päiväkirja
- Nähdä omat TEO-jaksot (kalenteri) ja näytöt (eri sivu, jossa on päivämäärä niille)

### Opettaja
- Tallentaa opiskelijoiden tiedot TEO-paikasta (paikka, ohjaaja...)
- Luoda TEO-jaksoja (kalenteri, jossa merkitään TEO-jakso joillekin päiville)
- Suunnitella näyttöjä (pelkkä tekstilaatikko)
- Tallentaa arviointeja näyttöpaikoille

### Työpaikkaohjaaja
- Kirjautua tunnuksilla
- Näkee opiskelijan TEO-jakso-kalenterin

---

## Näkymät (reitit)

```
/admin
/users
    /post   /delete   /update   /get     – Lisätään käyttäjiä ja salasanoja

/login

/opiskelija
    /kalenteri
    /päiväkirja
    /näytöt

/opettaja
    /oppilaat
        /post   /delete   /update   /get – Lisätään kaikki tiedot ja näytöt kalenteriin
        -> Näkyy kalenterina ja tauluna kaikki tiedot esim. TEO-jakso ja näytöt

/työpaikkaohjaaja
    /kalenteri     – oppilaan kalenteri
    /päiväkirja    – opiskelijan eteneminen
```

---

## User stories

On olemassa kolme eri roolia ja admin. Admin lisää opettajat ja työpaikkaohjaajat, ja opettaja lisää oppilaat. Kaikki kirjautuvat samalta kirjautumissivulta, paitsi admin, jolla on oma kirjautumissivu ja hallintapaneeli. Kaikki salasanat tallennetaan hashattyina. Kaikilla on samankaltainen näkymä, mutta eri toiminnoilla: sivupalkki vasemmalla, jossa on eri sivuja eri toiminnoille, ja sivupalkin ulkopuolella oikealla toiminnot. Sivupalkin alhaalla on "Kirjaudu ulos" -nappi.

### Admin
Sivupalkissa on kaksi sivua: **Opettajat** ja **Työpaikkaohjaajat**. Sivuilla näkyvät kaikki opettajat ja työpaikkaohjaajat, ja admin voi lisätä tai poistaa heitä sekä muokata heidän tietojaan.

### Opettaja
Opettajalla on kolme sivua:

1. **Oppilaat** – näkee kaikki oppilaat (nimi, luokka, rooli), voi lisätä oppilaita (modal, johon syötetään nimi, luokka ja salasana), muokata oppilaiden tietoja (nimi, luokka ja/tai salasana) tai poistaa oppilaita.
2. **TEO-jaksot** – näkyvissä kaikki oppilaat, suodatettavissa luokittain. Valitulle oppilaalle voi lisätä TEO-jakson (alku- ja loppupäivä, työpaikka, opettaja, ohjaaja). Samasta paikasta löytyvät kaikki oppilaan TEO-jaksot, ja niiden tietoja voi muokata.
3. **Näytöt** – valitaan oppilas ja lisätään tietylle TEO-jaksolle tila (kesken, hylätty, valmis) ja arvosana (1–5). "Tallenna muutokset" -napin alla on "Näytä päiväkirjamerkinnät" -nappi, joka hakee valitun oppilaan ja TEO-jakson päiväkirjamerkinnät (päivämäärä ja päivitysteksti).

### Oppilas
Oppilaalla on kaksi sivua:

1. **TEO-jaksot** – näkee kaikki TEO-jaksot ja niiden tiedot (työpaikka, opettaja, ohjaaja, näytön tila ja arvosana).
2. **Päiväkirja** – valitaan TEO-jakso, päivä, jolle merkintä tehdään, ja kirjoitetaan päivitys. Päivitys näytetään sivun alaosassa, ja sitä voi muokata tai poistaa. Muokkaustilassa muokattava päivitys siirtyy samaan kohtaan, mistä uusi päivitys luotaisiin, mutta esitäytettynä olemassa olevilla tiedoilla.

### Työpaikkaohjaaja
Ohjaajalla on vain yksi sivu: **Oppilaat**, jossa näkyvät ohjattavien oppilaiden tiedot ja päiväkirjapäivitykset. Oppilaat ovat listassa, jonka voi avata nähdäkseen tarkemmat tiedot (TEO-jakson kesto, luokka, työpaikka, näytön tila, arvosana ja päiväkirjamerkinnät).

---

## Sprintit

| Sprintti | Tavoite | Lopputulos |
|---|---|---|
| **1 – Suunnittelu** | Suunnitella projektin rakenne ja toiminnallisuudet | Projektin rakenne, vaatimukset ja käyttöliittymän suunnitelma valmiina |
| **2 – Tietokannan suunnittelu** | Suunnitella sovelluksen tietokantarakenne | Tietokannan taulut, kentät ja suhteet suunniteltu |
| **3 – Tietokannan toteutus** | Toteuttaa suunniteltu tietokanta | Tietokanta ja sen taulut sekä relaatiot toiminnassa |
| **4 – Käyttäjät ja opettajan sivu** | Toteuttaa käyttäjien hallinta ja opettajan käyttöliittymä | Kirjautuminen, käyttäjien hallinta ja opettajan sivun keskeiset toiminnot toimivat |
| **5 – Oppilaan ja ohjaajan sivut** | Toteuttaa oppilaan ja ohjaajan käyttöliittymät | Oppilas ja ohjaaja voivat käyttää heille tarkoitettuja toimintoja |
| **6 – Testaus** | Testata sovelluksen toiminta ja korjata havaitut virheet | Sovelluksen keskeiset toiminnallisuudet testattu ja virheet korjattu |
| **7 – Dokumentointi** | Dokumentoida valmis projekti | Projektin dokumentaatio ja käyttöohjeet valmiit |