\# SmartEE – Déploiement avec Docker



\## Description

SmartEE est une application web de comparaison énergétique et de marketplace pour électroménagers, développée avec :

\- \*\*Frontend\*\* : React + Vite

\- \*\*Backend\*\* : Node.js + Express

\- \*\*Base de données\*\* : MongoDB

\- \*\*Authentification\*\* : JWT (JSON Web Token)



Ce document explique comment lancer le projet avec \*\*Docker\*\* et \*\*Docker Compose\*\*.



---



\## Prérequis

Avant de commencer, assurez-vous que les outils suivants sont installés sur votre machine :

\- \[Docker](https://www.docker.com/)  

\- \[Docker Compose](https://docs.docker.com/compose/)  



Vérifiez avec :

```bash

docker -v

docker-compose -v



\# Structure du projet
eco-electro-v2/
├── client/           # Frontend (React)
│   └── dist/         # Build frontend prêt à servir
├── server/           # Backend (Express.js)
├── mongo-init/       # Scripts d'initialisation MongoDB
│   └── dump.archive  # Dump initial de la base de données
│   └── init.sh       # Script d'import du dump
├── docker-compose.yml
├── Dockerfile        # Dockerfile pour l'API + frontend
└── README.md



\# Lancer l’application
1. Ouvrir un terminal dans le dossier eco-electro-v2.
2. Construire les conteneurs et images :
	docker-compose build --no-cache
3. Lancer les conteneurs en arrière-plan :
	docker-compose up -d
4. Vérifier les logs pour s’assurer que tout fonctionne :
	docker-compose logs -f



\# Accéder à l’application

Frontend : http://localhost:4000

API : http://localhost:4000/api

MongoDB : accessible via le conteneur eco-electro-mongo (port 27017)


\# Commandes utiles

* Arrêter tous les conteneurs :
	docker-compose down

*Supprimer la base de données pour restaurer le dump :
	docker volume rm eco-electro-v2_mongo-data
	docker-compose up -d

* Se connecter à MongoDB depuis le conteneur :
	docker exec -it eco-electro-mongo mongosh


\###### NOTE: ######

Au démarrage, le profil utilisateur (/auth/me) peut mettre un moment à se charger. Pendant ce temps, certaines pages protégées peuvent rediriger vers l’accueil ou la page de login. Attendez quelques secondes après le lancement des conteneurs.