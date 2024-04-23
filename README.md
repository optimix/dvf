# DVF

Ce dépôt contient le traitement permettant de produire la [version géolocalisée des fichiers DVF](https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres-geolocalisees/).

## Pré-requis

- [Node.js](https://nodejs.org) version 12 ou supérieure
- yarn (ou à défaut npm)

## Installation

Cloner le présent dépôt de code, puis installer les dépendances :

```bash
yarn # (ou npm install)
```

## Mise en place des données sources

Les [données sources produites par la DGFiP](https://www.data.gouv.fr/datasets/5c4ae55a634f4117716d5656) doivent être placées dans le dossier `/data`.
Ces fichiers doivent avoir la forme `valeursfoncieres-YYYY.txt.gz` avec YYYY correspondant à l'année des données. Si le fichier récupéré n'est pas compressé, utilisez la commande `gzip`.

## Configuration du script

Pour configurer le script vous devez créer un fichier `.env` à la racine du dossier.

```
CADASTRE_MILLESIME=2024-01-01
COG_MILLESIME=2023-01-01
ANNEES=2023
```

`CADASTRE_MILLESIME` correspond au millésime du plan cadastral à utiliser
`COG_MILLESIME` correspond au millésime du code officiel géographique à utiliser
`ANNEES` est la liste des années à lire dans le dossier `/data`

## Lancement du traitement

```
yarn improve-csv
```

Le traitement dure plusieurs dizaines de minutes et écrit les résultats dans le dossier `/dist`.

## Notes après la mise à jour d'avril 2024

Pour les données de 2023, il reste 1.4% des données sans géolocalisation à cause des parcelles différente
des parcelles du cadastre.

Par exemple pour la commune de Gond Pontouvre, il semble que des ventes récentes référencent
l'ancienne numérotation des parcelles, malgré le [remaniement du
cadastre](https://www.gond-pontouvre.fr/2021/03/09/remaniement-du-cadastre/).

Pour avoir plus de correspondances possibles, il faudrait regarder le cadastre de chaque année
(depuis 2017 par exemple) depuis:
https://files.data.gouv.fr/cadastre/etalab-cadastre/
https://cadastre.data.gouv.fr/data/etalab-cadastre/

Peut être même [l'historique des parcelles cadastrales](https://www.data.gouv.fr/fr/datasets/historique-des-parcelles-cadastrales-filiation/#/discussions) (mentionné [içi](https://github.com/datagouv/dvf/issues/20#issue-1222746867)).

## Licence

MIT
