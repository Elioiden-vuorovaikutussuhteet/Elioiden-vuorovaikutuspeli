# Eliöiden vuorovaikutuspeli

[![codecov](https://codecov.io/github/Elioiden-vuorovaikutussuhteet/Elioiden-vuorovaikutuspeli/graph/badge.svg?token=Q1J3R7U0PT)](https://codecov.io/github/Elioiden-vuorovaikutussuhteet/Elioiden-vuorovaikutuspeli)

React + TypeScript perusteinen opetuspeli.

## Käyttö

### Production

<https://eliopeli-prod.ext.ocp-prod-0.k8s.it.helsinki.fi/>

### Staging

<https://eliopeli-staging.ext.ocp-test-0.k8s.it.helsinki.fi/>

### Docker image

<https://github.com/Elioiden-vuorovaikutussuhteet/Elioiden-vuorovaikutuspeli/pkgs/container/elioiden-vuorovaikutuspeli>

## Docker-käyttö kehitykseen

1. Asenna [docker ja docker compose](https://docs.docker.com/engine/install/). Halutessasi lisää itsesi docker-käyttäjäryhmään [ohjeiden mukaisesti](https://docs.docker.com/engine/install/linux-postinstall/). Tällöin et tarvitse sudoa.
2. Kloonaa repositorio.
3. Muuta halutessasi compose.yml-tiedostossa admin-salasanaa. Oletus on admin.
4. Avaa komentorivi repositorion kansiossa. Aja komento

```bash
docker compose up
```

5. Kontti rakentuu ja Eliopeli aukeaa osoitteeseen <http://localhost:5173>. Sen saa suljettua komentorivillä yhdistelmällä ctrl + c.
6. Kontti päivittyy automaattisesti, kun koodia muutetaan, joten sitä ei tarvitse uudelleenkäynnistää useimpien muutosten välissä. Kaikki muutokset eivät kuitenkaan päivity. Tällöin kontin uudelleenrakennuksen käynnistyksen yhteydessä voi pakottaa komennolla

```bash
docker compose up --build -V
```

## Local

Vaatimukset:

- Node.js
- npm

Kloonaa repositorio:

- git clone <https://github.com/Elioiden-vuorovaikutussuhteet/Elioiden-vuorovaikutuspeli.git>

Siirry repositorioon:

- cd Elioiden-vuorovaikutuspeli

Asenna vaatimukset:

- npm install

Aloita kehitysserveri:

- npm run dev

Sivun URL pitäisi tulostua esim. <http://localhost:5173/>

Admin sivua varten:

Aloita backend serveri toisessa komentoikkunassa:

- npm run server

Siirry esim. <http://localhost:5173/admin>
