// classe qui permet de gérer un joueur
function Joueur(vie, deplacement, main) {

    // emplacement du modele 3D JSON (fait sous BLender)
    this.chemin = 'src/medias/models/json/link_face.json';

    /* == DONNEES HITBOX == */
    this.largeur = 50;
    this.hauteur = 45;
    this.profondeur = 20;

    // on charge le modele en envoyant le fichier json au générateur de modele ainsi que les données pour la hitbox
    ChargementModele.call(this, this.chemin, this.largeur, this.hauteur, this.profondeur, this); // NOTE: on appelle le constructeur de la classe ChargementModele

    this.pointsDeVie = vie;
    this.points = 0;
    this.main = main;
    this.deplacement = deplacement;

    this.epeeTab = new Array(); // on stocke tous les projectiles dans un tableau
    this.direction = new THREE.Vector3(0, 1, 0);
    this.attente = false; // permet un court espacement entre les tirs

    // on positionne le modele correctement (rotation/scale/position)
    this.scale.set(2, 2, 2);
    this.position.x = 0;
    this.position.y = -280;
    this.position.z = -90;
    this.rotation.x = 0.5;
};

// =========================================== HERITAGE ===========================================
/* NOTE: https://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */

// On surcharge la classe Joueur
Joueur.prototype = Object.create(ChargementModele.prototype); // heritage
Joueur.prototype.constructor = Joueur;

// fonction qui permet de déplacer le joueur
Joueur.prototype.deplacer = function(direction) {
    this.position.x += (direction[0] * this.deplacement);
    this.position.y += (direction[1] * this.deplacement);
    this.position.z += (direction[2] * this.deplacement);
};

// fonction qui permet au joueur de tirer un projectile
Joueur.prototype.tirer = function() {

    /* HACK: on définit une var pour acceder à 'this' dans une autre scope
       NOTE: https://javascriptplayground.com/javascript-variable-scope-this/ */
    var _this = this;

    if (!this.attente) {

        // on a tiré, on attend un peu
        this.attente = true;

        var cheminEpee = 'src/medias/models/json/epee.json';

        // instanciation de l'épée (projectile avec comme tireur le joueur et une vitesse de deplacement de 10)
        var uneEpee = new Projectile(15, this, cheminEpee, this.main);
        uneEpee.position.set(this.position.x - (this.largeur / 2), this.position.y, this.position.z);
        uneEpee.rotation.z += 90 * Math.PI / 180;

        // on stoppe d'abord dans le cas ou un son est deja en cours
        this.main.audio.son["epee"].stop();
        this.main.audio.son["epee"].play();

        //on ajoute le projectile dans la liste des projectile lancée
        this.epeeTab.push(uneEpee);
        // on ajoute l'épee dans la scene (tihs.main = this.scene)
        this.main.add(uneEpee);

        // on attend 0.5s avant de pouvoir tirer de nouveau
        setTimeout(function() {
            _this.attente = false;
        }, (500 + (50 * _this.main.difficulte))); // cadence de tir qui augmente avec les niveaux
    }
};

// fonction qui permet de déplacer tous les projectives du joueur
Joueur.prototype.deplacementProjectile = function() {
    for (var i = 0; i < this.epeeTab.length; i++) {
        this.epeeTab[i].deplacer(this.direction);
    }
};

// fonction qui permet de détruire un projectile passé en paramètre dans le tableau de projectile du joueur
Joueur.prototype.detruireProjectile = function(epee) {

    // on recupere l'index du projectile dans le tabeau ou sont stocké les projectiles lancés
    var i = this.epeeTab.indexOf(epee);

    // NOTE: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/indexOf
    //indexOf renvoie -1 si le projectile ne figure pas dans le tableau
    if (i > -1) {
        // on supprime le projectile de la scene
        this.main.remove(this.epeeTab[i]);
        // et ensuite on le retire du tableau
        this.epeeTab.splice(i, 1); // NOTE: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/splice
    }
};

// fonction qui permet de clear tous les projectiles du joueur de la scene (utilie pour la classe Niveau)
Joueur.prototype.detruireTousLesProjectiles = function() {
    // tant qu'on "a un tableau" (à cause de slice), on continue à vider le tableau
    while (this.epeeTab.length > 0) {
        this.detruireProjectile(this.epeeTab[this.epeeTab.length - 1]);
    }
};