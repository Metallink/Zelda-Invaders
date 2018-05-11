// fonction qui gère un ennemi
function Ennemi(deplacement, points, force, ligne, main, chemin) {

    // emplacement du modele 3D JSON (fait sous BLender)
    this.chemin = chemin;

    /* == DONNEES HITBOX == */
    this.largeur = 70;
    this.hauteur = 130;
    this.profondeur = 20;

    ChargementModele.call(this, this.chemin, this.largeur, this.hauteur, this.profondeur, this); // NOTE: on appelle le constructeur de la classe ChargementModele

    this.deplacement = deplacement;
    this.force = force; // cadence de tir
    this.points = points; // valeur de l'ennemi en nombre de points

    this.projectileTab = new Array(); // on stocke ses projectiles
    this.ligneEnemmie = ligne; // un ennemi fait partie d'une ligne d'ennemis
    this.direction = new THREE.Vector3(0, -1, 0); // direction vers le joueur
    this.main = main;

    this.attente = false; // permet un court espacement entre les tirs


    //  Positionnement des enemmis
    this.rotation.z += -90 * Math.PI / 180;
    this.rotation.x += 90 * Math.PI / 180;
    this.scale.set(0.5, 0.5, 0.5);
};

// =========================================== HERITAGE ===========================================
/* NOTE: https://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */

// On surcharge la classe Ennemi
Ennemi.prototype = Object.create(ChargementModele.prototype); // heritage
Ennemi.prototype.constructor = Ennemi;

// fonction qui permet de déplacer un ennemi
Ennemi.prototype.deplacer = function(direction) { // direction = [0,1,0]
    this.position.x += (direction[0] * this.deplacement);
    this.position.y += (direction[1] * this.deplacement);
    this.position.z += (direction[2] * this.deplacement);
};

/* =========================== GESTION DU PROJECTILE D'UN ENNEMI =========================== */

// fonction qui permet le déplacement d'un projectile stocké dans la table des projectiles
Ennemi.prototype.deplacementProjectile = function() {
    // on parcourt la table et on déplace tous les projectiles stockés
    for (var i = 0; i < this.projectileTab.length; i++) {
        this.projectileTab[i].deplacer(this.direction);
    }
};

// fonction qui permet de détruire un projectile en particulier
Ennemi.prototype.detruireProjectile = function(projectile) {

    // on recupere l'index du projectile dans le tabeau ou sont stocké les projectiles lancés
    var i = this.projectileTab.indexOf(projectile);

    // NOTE: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/indexOf
    //indexOf renvoie -1 si le projectile ne figure pas dans le tableau
    if (i > -1) {
        // on supprime le projectile de la scene
        this.main.remove(this.projectileTab[i]);
        // et ensuite on le retire du tableau
        this.projectileTab.splice(i, 1); // NOTE: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/splice
    }
};

// fonction qui permet à un ennemi de tirer un projectile
Ennemi.prototype.tirer = function() {
    /* HACK: on définit une var pour acceder à 'this' dans une autre scope
       NOTE: https://javascriptplayground.com/javascript-variable-scope-this/ */
    var _this = this;

    if (!this.attente) {
        // on a tiré, on attend
        this.attente = true;

        var cheminEpee = 'src/medias/models/json/epee.json';

        // instanciation du projectile (projectile avec comme tireur l'ennemie et surtout une cadence de tir qui augmentera à chaque niveau)
        var uneEpee = new Projectile(4 + this.force, this, cheminEpee, this.main);
        uneEpee.position.set(this.position.x + this.hauteur, this.position.y - this.largeur, 0);
        uneEpee.rotation.z += -90 * Math.PI / 180;
        uneEpee.position.z -= 50;

        // on stoppe d'abord dans le cas ou un son est deja en cours
        this.main.audio.son["tirEnnemi"].stop();
        this.main.audio.son["tirEnnemi"].play();

        // on ajoute l'épee dans la scene (tihs.main = this.scene)
        this.main.add(uneEpee);

        //on ajoute le projectile dans la liste des projectile lancée
        this.projectileTab.push(uneEpee);

        /* on génére une cadence de tir aléatoire pour les ennemies en fonction de
           sa force qui varie en fonction des niveaux */
        setTimeout(function() {
            _this.attente = false;
        }, (Math.floor((Math.random() * 20000) - _this.force * _this.force))); // durée calculé aléatoirement en fonction de la force
    }
};