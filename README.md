## TÄTÄ EI PÄIVITETÄ ENÄÄ. VASTALAUTAA EI SCRIPTEILLÄ KORJATA.



## Vastalauta Yhdistetty Userscript

Tämä repositorio sisältää yhdistetyn userscriptin, jonka tarkoituksena on parantaa käyttökokemusta Vastalauta-sivustolla. Skripti yhdistää useita hyödyllisiä toimintoja yhdeksi kattavaksi kokonaisuudeksi, mikä tekee Vastalauta-kokemuksesta sujuvamman ja monipuolisemman.

### Yhdistetyn Skriptin Ominaisuudet

- **Käyttäjän Postausten Seuranta:** Mahdollistaa yksittäisen käyttäjän postausten seuraamisen keskusteluketjuissa.
- **Viestien Numerointi:** Lisää uniikit numerot jokaiselle viestille.
- **Kuvien ja Videoiden Selaus:** Tukee sekä näppäimistöllä että kosketusnäytöllä tapahtuvaa kuvien ja videoiden selaamista.
- **Suomalainen Aikaleima:** Muuttaa aikaleimat suomalaiseen formaattiin, mikä tekee niiden lukemisesta helpompaa.
- **Tiedostojen Avaaminen Uuteen Välilehteen:** Sallii tiedostojen nopean avaamisen uuteen välilehteen hiiren keskinäppäintä napsauttamalla.

### Asennus ja Käyttö

Yhdistetyn userscriptin asentaminen ja käyttäminen Vastalauta-sivustolla:

1. **Asennus:**
   - Asenna userscript tästä linkistä: [Vastalauta Yhdistetty Userscript](https://github.com/Vastanonyymi/vastalauta-userscript/raw/main/Vastalauta%20Combined%20Userscript.user.js).
   - Varmista, että käytössäsi on userscript-tuki, esimerkiksi Tampermonkey tai vastaava laajennus selaimessasi.

2. **Toimintojen Hallinta:**
   - Skriptin eri toiminnot on määritelty muuttujien avulla skriptin alussa.
   - Voit ottaa toimintoja käyttöön tai pois käytöstä muokkaamalla seuraavia rivejä skriptin alusta:
     ```javascript
     const enableFileNavigation = true; // Tiedostojen selaus päälle/pois (true/false)
     const enableFinnishTimestamps = true; // Suomalaiset aikaleimat päälle/pois
     const enableMiddleClickNewTab = true; // Keskinäppäimellä avaus uuteen välilehteen
     const enablePostIDs = true; // Viestien numerointi
     const enableTrackUserPosts = true; // Käyttäjän postausten seuranta
     ```
   - `true` tarkoittaa, että toiminto on käytössä, ja `false` että se on pois päältä.
   - Muutosten jälkeen tallenna skripti ja päivitä Vastalauta-sivu, jotta muutokset tulevat voimaan.

3. **Käyttö:**
   - Skripti aktivoituu automaattisesti Vastalauta-sivustolla.
   - Voit nauttia parannellusta käyttökokemuksesta, jossa eri toiminnot helpottavat sivuston käyttöä.

### Huomioita

- Jotkin toiminnot, kuten käyttäjän postausten seuranta, saattavat vaatia erityistä huomiota mobiililaitteilla.
- Suosittelemme testaamaan eri toimintoja yksitellen, erityisesti jos kohtaat ongelmia tai jotain odottamatonta.

### Osallistuminen ja Palaute

Kaikki parannusehdotukset, bugiraportit ja kehitysideat ovat tervetulleita. Voit osallistua projektin kehitykseen lähettämällä pull requesteja tai avaamalla issueita GitHubissa.

### Lisenssi

Tämä userscript on jaettu avoimen lähdekoodin periaatteella, ja sen käyttö ja muokkaus on sallittua kaikille kiinnostuneille.
