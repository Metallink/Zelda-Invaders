function Main() {

    THREE.Scene.call(this); // NOTE: on appelle le constructeur de THREE.Scene

    /* initilisation des proprietes */
    this.joueur;
    this.decor = new Decor(this);
    this.armee;

    this.camera;
    this.cameraEtat;

    this.interface = new Interface(this);
    this.audio = new Audio();

    this.gestionNiveau;
    this.difficulte;

    /* liste de tous les etats possibles du jeu
        C'est necessaire pour effectuer certaine action en fonction de l'etat d'avancement du jeu
    */
    this.jeuEtatsPossibles = {
        LANCEMENT: 1,
        PAUSE: 2,
        ENJEU: 3,
        GAMEOVER: 4,
        ACCUEIL: 5
    };
    this.etat = this.jeuEtatsPossibles.ACCUEIL;

    /* liste les different etat de la camera */
    this.listeVuesCamera = Array();
    this.cameraEtatsPossibles = {
        ACCUEIL: "accueil",
        DEFAUT: "defaut",
        JOUEUR: "joueur",
    };
};

// =========================================== HERITAGE ===========================================
/* NOTE: https://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */

// On surcharge la classe Main
Main.prototype = Object.create(THREE.Scene.prototype); // heritage
Main.prototype.constructor = Main;

// =========================================== INITIALISATION ===========================================

Main.prototype.init = function() {

    console.log("Bonjour et bienvenue, vous êtes curieux n'est-ce pas?! ;)");

    /* AUDIO */
    this.audio.init();
    this.audio.musique["zeldaAccueil"].loop(true); // musique en boucle
    this.audio.musique["zeldaAccueil"].play(); // et hop on balance le son

    /* JOUEUR */
    this.joueur = new Joueur(3, 7, this);
    this.add(this.joueur); // on ajoute le joueur à la scene

    /* NIVEAU */
    this.difficulte = 1;
    this.gestionNiveau = new Niveau(this.difficulte, this.joueur, this); // on prépare le niveau (ennemis)
    this.gestionNiveau.init();
    this.add(this.gestionNiveau); // on ajoute les ennemis à la scene

    /* DECOR */
    this.decor.init();
    this.add(this.decor); // on ajoute le decor à la scene

    /* INTERFACE */
    this.interface.init(); // on initialise le menu d'accueil

    /* CLAVIER */
    this.gestionCLavier(); // on commence à ecouter les appuis clavier

    /* CAMERA */
    this.creerCamera(); // on créer et place notre camera à la vue d'accueil
};

// =========================================== BOUCLE D'ANIMATION ===========================================

Main.prototype.animate = function() {

    this.decor.animate(); // on lance l'animation du décor (étoiles)

    // si nous sommes dans un état de transition (début, changement de niveau, fin de partie)
    if (this.etat === this.jeuEtatsPossibles.LANCEMENT) {

        console.log("Let's GO, allons sauver la princesse Zelda!");

        if (this.joueur.pointsDeVie != 3) {
            this.joueur.pointsDeVie = 3;
            this.interface.affichageVies(); // on actualise l'affichage des points de vie
        }

        this.audio.son["fanfare"].play();

        this.difficulte++; // on augmente la difficulte
        document.getElementById("level").innerHTML = this.difficulte; // et on actualise son affichage

        var messageNiveau = "Level " + this.difficulte;
        // on affiche un message en fonction de notre situation dans le jeu (début de partie ou changement de niveau)
        if (this.difficulte === 1) {
            this.interface.afficheMessage(messageNiveau, "Here we go !", 2800)
        } else {
            this.interface.afficheMessage("Stage Clear <br>" + messageNiveau, "Nice!", 3000);
        }

        // on masque le score final (suite à l'écran game over)
        document.getElementById("scorefinal").innerHTML = "";
        document.getElementById("scorefinal").style.visibility = 'hidden';

        // on supprime tous les modeles de la scene
        this.gestionNiveau.reset();
        // on génére de nouveau une horde d'ennemis
        this.gestionNiveau = new Niveau(this.difficulte, this.joueur, this);
        this.gestionNiveau.init();
        this.add(this.gestionNiveau);
        this.etat = this.jeuEtatsPossibles.PAUSE;
    }

    // phase de jeu
    if (this.etat === this.jeuEtatsPossibles.ENJEU) {
        this.audio.musique["zeldaAccueil"].fade(0.8, 0.0, 1000);
        this.audio.musique["zeldaAccueil"].pause();

        // on lance le déplacement des ennemis
        this.gestionNiveau.horde.animate();
        // le joueur gère lui même le deplacement du projectile
        this.joueur.deplacementProjectile();

        // on arrete la partie lorsque le joueur n'a plus de points de vie
        if (this.joueur.pointsDeVie === 0) {
            this.etat = this.jeuEtatsPossibles.GAMEOVER; // on passe à l'état game over
            this.audio.musique["zeldaTheme"].fade(0.8, 0.0, 700);
            this.audio.son["gameover"].play();
            this.audio.son["gameover"].loop(true);
            console.log("GAME OVER - Link is dead :((");
        }
    }

    // le joueur a perdu la partie, on affiche le score
    if (this.etat === this.jeuEtatsPossibles.GAMEOVER) {
        this.interface.afficheMessage("Link is dead", "Your score: " + this.joueur.points, -1);
        document.getElementById("scorefinal").innerHTML = "Press Enter to try again";
    }

    /* ============ UPDATE ============ */
    // update pour la library pour la gestion du clavier
    kd.tick();

    // update periodiquement les Tweens
    TWEEN.update();
};

// =========================================== CLAVIER ===========================================

Main.prototype.gestionCLavier = function() {

    /* LIBRARY UTILISEE */
    //NOTE: https://jeremyckahn.github.io/keydrown/
    /* HACK: la fonction press permet d'empecher le 'spam' de la touche */

    /* HACK: on définit une var pour acceder à 'this' dans une autre scope
       NOTE: https://javascriptplayground.com/javascript-variable-scope-this/ */
    var _this = this;

    /* ======================== COMMANDES ======================== */

    /*HACK: http://learningthreejs.com/blog/2011/11/17/lets-make-a-3d-game-make-it-fullscreen/
         active le fullscreen */
    kd.F.press(function() {

        THREEx.WindowResize.bind(renderer, _this.camera); //BUG: redimensionne correctement le fullscreen
        if (THREEx.FullScreen.activated()) {
            THREEx.FullScreen.cancel();
        } else {
            THREEx.FullScreen.request();
        }
    });

    /* prends une capture d'écran et l'affiche dans un nouvelle onglet
       NOTE: Il faut s'assurer que le navigateur autorise les pop up et de desactiver AdBlock */
    kd.S.press(function() {
        var dataUrl = renderer.domElement.toDataURL("image/jpeg");
        var iframe = "<iframe width='100%' height='100%' src='" + dataUrl + "'></iframe>";
        var nouvelOnglet = window.open();
        nouvelOnglet.document.write(iframe);
        nouvelOnglet.document.close();
    });

    // couper le son
    kd.M.press(function() {
        _this.audio.couperMusique();
    });

    // code triche: tue tous les ennemis et initialise le niveau suivant
    kd.K.press(function() {
        if (_this.etat === _this.jeuEtatsPossibles.ENJEU) {
            _this.gestionNiveau.reset();
            console.log("Oh le tricheur !");
        } else {
            //HACK
        }
    });

    // mettre en pause le jeu
    kd.P.press(function() {
        if (_this.etat === _this.jeuEtatsPossibles.ENJEU) {
            _this.audio.musique["zeldaTheme"].fade(0.8, 0.0, 800);
            _this.etat = _this.jeuEtatsPossibles.PAUSE;
            console.log("TA DUM TA DUM");
        } else if (_this.etat === _this.jeuEtatsPossibles.PAUSE) {
            _this.etat = _this.jeuEtatsPossibles.ENJEU;
            _this.audio.musique["zeldaTheme"].fade(0.0, 0.8, 800);
            console.log("La princesse Zelda n'attend pas !");
        } else if (_this.etat === _this.jeuEtatsPossibles.LANCEMENT) { //HACK
            // on est à l'écran d'accueil et on fait rien ! (sinon on a une erreur dans la console)
        }
    });

    // afficher/masquer les touches en bas de l'écran
    kd.H.press(function() {
        if (document.getElementById("info_middle").style.visibility === "visible") {
            document.getElementById("info_middle").style.visibility = "hidden";
        } else if (document.getElementById("info_middle").style.visibility === "hidden") {
            document.getElementById("info_middle").style.visibility = "visible";
        } else { // HACK
            // empeche erreur console
        }
    });

    /* ======================== TOUCHES CAMERA ======================== */

    // touche 0 du clavier => camera par defaut
    kd.ZERO.press(function() {
        if (_this.etat === _this.jeuEtatsPossibles.ENJEU) {
            _this.choixCamera(0);
        } else if (_this.etat === _this.jeuEtatsPossibles.PAUSE) {
            _this.choixCamera(0);
        } else if (_this.etat === _this.jeuEtatsPossibles.LANCEMENT) { //HACK
            // on est à l'écran d'accueil et on ne fait rien ! (sinon on a une erreur dans la console)
        }
    });

    // touche 1 du clavier => camera "joueur"
    kd.ONE.press(function() {
        if (_this.etat === _this.jeuEtatsPossibles.ENJEU) {
            _this.choixCamera(1);
        } else if (_this.etat === _this.jeuEtatsPossibles.PAUSE) {
            _this.choixCamera(1);
        } else if (_this.etat === _this.jeuEtatsPossibles.LANCEMENT) { //HACK
            // on est à l'écran d'accueil et on ne fait rien ! (sinon on a une erreur dans la console)
        }
    });

    /* ======================== TOUCHE ENTREE => DEBUT JEU/GAME OVER ======================== */

    kd.ENTER.press(function() {
        // si on est à l'ecran d'accueil et qu'on a appuyé sur la touche entrée
        if (_this.etat === _this.jeuEtatsPossibles.ACCUEIL) {

            console.log("Force et honneur !");

            // on masque l'écran d'accueil
            _this.interface.masquerEcranAccueil();

            // on affiche les differentes barres d'affichages
            _this.interface.affichageBarresInfo();

            // on switch de musique
            _this.audio.musique["zeldaAccueil"].fade(0.8, 0.0, 1000); // transition douce
            _this.audio.musique["zeldaTheme"].fade(0.0, 0.8, 1000); // transition douce
            _this.audio.musique["zeldaTheme"].loop(true); // boucle
            _this.audio.musique["zeldaTheme"].play(); // et hop on balance le son

            // on change de camera et choisi celle 'par defaut'
            _this.choixCamera(0);

            // on affiche le message de transition de niveau
            var messageNiveau = "Level " + _this.difficulte;
            _this.interface.afficheMessage(messageNiveau, "Here we go!", 2000);

        }
        // on est à l'écran de game over et on souhaite recommencer une partie
        else if (_this.etat === _this.jeuEtatsPossibles.GAMEOVER) {

            _this.audio.son["gameover"].fade(1.0, 0.0, 1200);
            _this.audio.son["gameover"].stop();
            _this.audio.musique["zeldaTheme"].fade(0.0, 0.8, 2500);

            _this.difficulte = -1;
            _this.joueur.points = 0;
            _this.joueur.pointsDeVie = 3;

            // on charge l'interface mais en veillant à bien masquer l'écran d'accueil (qui arrive par defaut avec l'init)
            _this.interface.init();
            // on masque l'écran d'accueil
            _this.interface.masquerEcranAccueil();
            // on affiche les differentes barres d'affichages
            _this.interface.affichageBarresInfo();

            // c'est reparti on relance une partie
            _this.etat = _this.jeuEtatsPossibles.LANCEMENT;
        }
    });

    // deplacement joueur à gauche (NOTE: on utilise down)
    kd.LEFT.down(function() {

        if (_this.etat === _this.jeuEtatsPossibles.ENJEU) {

            var direction = [-1, 0, 0]

            // on ne deplace le joueur que lorsqu'il se trouve dans les limite du "board"
            if (_this.joueur.position.x > -280) {
                _this.joueur.deplacer(direction);
                if (_this.cameraEtat === _this.cameraEtatsPossibles.JOUEUR) {
                    _this.camera.position.x += (direction[0] * _this.joueur.deplacement);
                    _this.camera.position.y += (direction[1] * _this.joueur.deplacement);
                    _this.camera.position.z += (direction[2] * _this.joueur.deplacement);
                }
            }
            // on actualise la vue joueur car la position du joueur a été modifié !
            _this.actualisationVueJoueur();
        }
    });

    // deplacement joueur à droite (NOTE: on utilise down)
    kd.RIGHT.down(function() {

        if (_this.etat === _this.jeuEtatsPossibles.ENJEU) {

            var direction = [1, 0, 0]

            if (_this.joueur.position.x < 280) {
                _this.joueur.deplacer(direction);
                if (_this.cameraEtat === _this.cameraEtatsPossibles.JOUEUR) {
                    _this.camera.position.x += (direction[0] * _this.joueur.deplacement);
                    _this.camera.position.y += (direction[1] * _this.joueur.deplacement);
                    _this.camera.position.z += (direction[2] * _this.joueur.deplacement);
                }
            }
            // on actualise la vue joueur car la position du joueur a été modifié !
            _this.actualisationVueJoueur();
        }
    });

    // joueur tire
    kd.SPACE.down(function() {
        // on tire seulement lorsque l'on est en cours de partie
        if (_this.etat === _this.jeuEtatsPossibles.ENJEU) {
            _this.joueur.tirer();
        }
    });
};

// =========================================== CAMERA ===========================================

// fonction qui initialise les differentes vues possibles
Main.prototype.creationVuesCamera = function() {
    var positionCamera;
    var directionCamera; //(lookAt)
    var uneVueTemp = new Array();

    /* ====================== CAMERA ACCUEIL ====================== */
    positionCamera = new THREE.Vector3(-8000, -80, 8000);
    directionCamera = new THREE.Vector3(0, 0, 0);
    uneVueTemp.push(positionCamera);
    uneVueTemp.push(directionCamera);
    // on ajoute notre vue accueil à la liste des vues possibles
    this.listeVuesCamera["accueil"] = uneVueTemp;

    /* ====================== CAMERA PAR DEFAUT ====================== */
    uneVueTemp = []; // on vide le tableau pour qu'il soit utilisé par la prochaine vue
    positionCamera = new THREE.Vector3(0, -800, 100);
    directionCamera = new THREE.Vector3(0, 1, 0);
    uneVueTemp.push(positionCamera);
    uneVueTemp.push(directionCamera);
    // on ajoute notre vue defaut à la liste des vues possibles
    this.listeVuesCamera["defaut"] = uneVueTemp;

    /* ====================== CAMERA JOUEUR ====================== */
    uneVueTemp = []; // on vide le tableau pour qu'il soit utilisé par la prochaine vue

    // on récupérer la position du joueur
    var positionJoueur = new THREE.Vector3(this.joueur.position.x, this.joueur.position.y, this.joueur.position.z);

    // on ajuste la position de la vue pour qu'elle soit au niveau de l'épée
    positionJoueur.x += 20;
    positionJoueur.z += this.joueur.hauteur;

    positionCamera = new THREE.Vector3(positionJoueur.x, positionJoueur.y, positionJoueur.z);
    directionCamera = new THREE.Vector3(0, 1, 0);
    uneVueTemp.push(positionCamera);
    uneVueTemp.push(directionCamera);
    // on ajoute notre vue joueur à la liste des vues possibles
    this.listeVuesCamera["joueur"] = uneVueTemp;
};

// fonction qui créer et ajoute la camera à la scene
Main.prototype.creerCamera = function() {
    // on creer et initialise les differentes vues de la camera
    this.creationVuesCamera();

    //set the camera to default view
    var vueActuelle = this.listeVuesCamera["accueil"];
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 10, 5000);
    // on positionne la camera
    this.camera.position.set(vueActuelle[0].x, vueActuelle[0].y, vueActuelle[0].z);
    this.camera.lookAt(vueActuelle[1]);

    this.add(this.camera); // on ajoute la camera à la scene
    this.cameraEtat = this.cameraEtatsPossibles.ACCUEIL;
};

// fonction qui actualise la position de la vue joueur (necessaire car la position du joeur varie)
Main.prototype.actualisationVueJoueur = function() {

    // on récupérer la position du joueur
    var positionJoueur = new THREE.Vector3(this.joueur.position.x, this.joueur.position.y, this.joueur.position.z);

    // on ajuste la position de la vue pour qu'elle soit au niveau de l'épée
    positionJoueur.x += 20;
    positionJoueur.z += this.joueur.hauteur;

    var positionTemp = new THREE.Vector3(positionJoueur.x, positionJoueur.y, positionJoueur.z);
    var directionTemp = new THREE.Vector3(0, 1, 0);
    var uneVue = new Array();
    uneVue.push(positionTemp);
    uneVue.push(directionTemp);
    // on actualise notre vue joueur dans la liste des vues possibles
    this.listeVuesCamera["joueur"] = uneVue;
};

// fonction qui effectue les transitions et place la camera à la vue demandée
Main.prototype.choixCamera = function(choix) {
    switch (choix) {
        case 0: // camera par defaut
            this.transitionCamera(this.listeVuesCamera["defaut"][0], this.listeVuesCamera["defaut"][1], false);
            this.cameraEtat = this.cameraEtatsPossibles.DEFAUT;
            break;
        case 1: // camera joueur
            this.transitionCamera(this.listeVuesCamera["joueur"][0], this.listeVuesCamera["joueur"][1], true);
            this.cameraEtat = this.cameraEtatsPossibles.JOUEUR;
            break;
        default:
            console.log('il y a une erreur de choix de camera!!');
            break;
    }
};

// fonction qui effectue les transitions (grâce à la library TWEEN.js)
Main.prototype.transitionCamera = function(positionCamera, directionCamera, cameraJoueur) {
    //NOTE: http://learningthreejs.com/blog/2011/08/17/tweenjs-for-smooth-animation/

    /* le parametre 'cameraJoueur' permet de faire une action supplémentare pour la camera demandé 'joueur' */

    var destination = {
        x: positionCamera.x,
        y: positionCamera.y,
        z: positionCamera.z
    };

    /* HACK: on définit une var pour acceder à 'this' dans une autre scope
       NOTE: https://javascriptplayground.com/javascript-variable-scope-this/ */
    var _this = this;

    var transition = new TWEEN.Tween(this.camera.position);
    // transition suivant une courbe "non linéaire"
    transition.easing(TWEEN.Easing.Circular.Out); //NOTE: http://tweenjs.github.io/tween.js/examples/03_graphs.html

    /* ==== on distingue 3 cas: depuis l'écran d'accueil, la demande de la camera joueur et les autres ==== */
    // on est à l'écran d'accueil et le joueur a pressé la touche entrée
    if (this.cameraEtat === this.cameraEtatsPossibles.ACCUEIL) {

        // init déplacement depuis la position de la camera actuelle vers la destination fourni en parametre en 2s
        transition.to(destination, 2000);
        // à chaque étape de deplacement, on fait une rotation pour toujours "regarder" notre destination finale
        transition.onUpdate(function() {
            _this.camera.lookAt(directionCamera);
        });
        // une fois "arrivé", on passe l'état possible de la caméra à par défaut
        transition.onComplete(function() {
            _this.cameraEtat = _this.cameraEtatsPossibles.DEFAUT;
        });
    }
    // on demande la camera joueur, il faut actualiser la position de la caméra une fois la transition complete
    else if (this.cameraEtat === this.cameraEtatsPossibles.DEFAUT) {
        // init déplacement depuis la position de la camera actuelle vers la destination fourni en parametre en 1.5s
        transition.to(destination, 300);
        // on le fait une fois la transition complete
        transition.onComplete(function() {
            _this.camera.position.x = _this.joueur.position.x; //COMBAK
        });
    } else {
        // init déplacement depuis la position de la camera actuelle vers la destination fourni en parametre en 3s
        transition.to(destination, 1500);
        // à chaque étape de deplacement, on fait une rotation pour toujours "regarder" notre destination finale
        transition.onUpdate(function() {
            _this.camera.lookAt(directionCamera);
        });
    }

    // hop on lance la transition
    transition.start();
};