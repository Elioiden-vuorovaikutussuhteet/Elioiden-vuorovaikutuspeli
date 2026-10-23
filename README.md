# Eliöiden vuorovaikutuspeli

[![codecov](https://codecov.io/github/Elioiden-vuorovaikutussuhteet/Elioiden-vuorovaikutuspeli/graph/badge.svg?token=Q1J3R7U0PT)](https://codecov.io/github/Elioiden-vuorovaikutussuhteet/Elioiden-vuorovaikutuspeli)

React + TypeScript perusteinen opetuspeli.

# Käyttö

## Production 

https://eliopeli-prod.ext.ocp-prod-0.k8s.it.helsinki.fi/

## Staging 

https://eliopeli-staging.ext.ocp-test-0.k8s.it.helsinki.fi/

## Docker image

https://github.com/Elioiden-vuorovaikutussuhteet/Elioiden-vuorovaikutuspeli/pkgs/container/elioiden-vuorovaikutuspeli

# Docker-käyttö kehitykseen

1. Asenna [docker ja docker compose](https://docs.docker.com/engine/install/). Halutettasi lisää itsesi docker-käyttäjäryhmään [ohjeiden mukaisesti](https://docs.docker.com/engine/install/linux-postinstall/). Tällöin et tarvitse sudoa.
2. Lataa repositorio
3. Avaa komentorivi latauskansiossa
```
cd Elioiden-vuorovaikutuspeli
docker compose up
```
4. Kontti rakentuu ja Eliopeli aukeaa osoitteeseen http://localhost:5173. Sen saa suljettua komentorivillä yhdistelmällä ctrl + c. 
5. Kontti päivittyy automaattisesti, kun koodia muutetaan, joten sitä ei tarvitse uudelleenkäynnistää muutosten välissä. Joskus docker tallentaa kuitenkin vanhentuneen version välimuistiin. Tällöin kontin uudelleenrakennuksen voi pakottaa komennolla
```
docker compose up --build -V
```

## Local

Vaatimukset:

- Node.js
- npm

Kloonaa repositorio:

- git clone https://github.com/Elioiden-vuorovaikutussuhteet/Elioiden-vuorovaikutuspeli.git

Siirry repositorioon:

- cd Elioiden-vuorovaikutuspeli

Asenna vaatimukset:

- npm install

Aloita kehitysserveri:

- npm run dev

Sivun URL pitäisi tulostua esim. http://localhost:5173/
