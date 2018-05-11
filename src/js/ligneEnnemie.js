// classe qui permet de gérer une ligne d'ennemi
function LigneEnnemie(typeEnnemi, deplacement, points, nombreEnnemies, hauteurLigne, force, horde, main) {

    THREE.Group.call(this); // NOTE: on appelle le constructeur de THREE.Group

    this.ennemieTab = new Array(); // on stocke les ennemis de la ligne dans un tableau
    this.deplacement = deplacement; // vitesse de déplacement
    this.direction = [-1, 0, 0]; // deplacement à gauche
    this.force = force; // force permet de calculer la cadence de tir (voir la classe Ennemi)
    this.horde = horde;
    this.main = main;

    this.chemin = typeEnnemi;
    this.points = points;

    // on récupére les modeles des ennemis (voir la classe gestionNiveau)
    switch (this.chemin) {
        case "vert":
            // emplacement du modele 3D JSON (fait sous BLender)
            this.chemin = 'src/medias/models/json/rubisVert.json';
            break;
        case "bleu":
            // emplacement du modele 3D JSON (fait sous BLender)
            this.chemin = 'src/medias/models/json/rubisBleu.json';
            break;
        case "rouge":
            // emplacement du modele 3D JSON (fait sous BLender)
            this.chemin = 'src/medias/models/json/rubisRouge.json';
            break;
        default:
            console.log("Erreur chemin fichier ennemi: " + typeEnnemi);
            break;
    }

    /* On instancie les ennemies d'une ligne */
    for (var i = -nombreEnnemies / 2; i < nombreEnnemies / 2; i++) {
        var unEnnemi = new Ennemi(this.deplacement, this.points, this.force, this, this.main, this.chemin);

        // on positionne correcte l'ennemi
        unEnnemi.position.x = i * (500 / nombreEnnemies);
        unEnnemi.position.y = hauteurLigne;
        unEnnemi.position.z -= 40;

        this.ennemieTab.push(unEnnemi); // on l'ajoute à notre liste d'ennemis
        this.add(unEnnemi); // on l'ajoute à notre Group
    }
};

// =========================================== HERITAGE ===========================================
/* NOTE: https://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */

// On surcharge la classe LigneEnnemie
LigneEnnemie.prototype = Object.create(THREE.Group.prototype); // heritage
LigneEnnemie.prototype.constructor = LigneEnnemie;

// fonction qui permet de vérifier quand l'ennemi le plus à droite atteindra la limite  du "board"
LigneEnnemie.prototype.sortieDroite = function() {
    if (this.ennemieTab[this.ennemieTab.length - 1].position.x >= 300) {
        return true;
    } else {
        return false;
    }
};

// fonction qui permet de vérifier quand l'ennemi le plus à gauche atteindra la limite du "board"
LigneEnnemie.prototype.sortieGauche = function() {
    if (this.ennemieTab[0].position.x < -300) {
        return true;
    } else {
        return false;
    }
};

// fonction qui permet de déplacer une ligne d'ennemi
LigneEnnemie.prototype.deplacer = function() {

    // calcul du déplacement vertical d'une ligne quand il touchera la limite du "board"
    var d = [0, -this.ennemieTab[0].hauteur / this.deplacement, 0];

    // on déplace tous les ennemis de notre tableau (on fait appel à la fonction déplacer de la classe Ennemi)
    for (var i = 0; i < this.ennemieTab.length; i++) {
        this.ennemieTab[i].deplacer(this.direction);
    }

    // quand la ligne atteint la limite du board à gauche et à droite
    if ((this.sortieDroite() || this.sortieGauche())) {
        if (!this.collisionEntreDeuxLignes()) { // permet de vérifier qu'il n y a pas de collision entre deux lignes (car parametre deplacement differents entre les lignes)
            for (var i = 0; i < this.ennemieTab.length; i++) {
                this.ennemieTab[i].deplacer(d);
            }
        }

        // on inverse la direction (gauche->droite ou droite->gauche)
        this.direction[0] = -this.direction[0];
        this.direction[1] = -this.direction[1];
        this.direction[2] = -this.direction[2];
    }
};

// fonction qui permet de vérifier que la ligne actuelle n'entrera pas en collision avec la suivante
LigneEnnemie.prototype.collisionEntreDeuxLignes = function() {
    var i = this.horde.ligne.indexOf(this);
    if ((i >= 0) && (i < this.horde.ligne.length - 1)) {
        if (this.horde.ligne[i + 1] && (this.ennemieTab[0].position.y - this.horde.ligne[i + 1].ennemieTab[0].position.y <= this.ennemieTab[0].hauteur)) {
            return true;
        }
    }
    return false;
};

// fonction qui permet d'indiquer quand la ligne la plus proche du joueur entrera en collision avec un bouclier
LigneEnnemie.prototype.collisionBouclier = function() {
    var contact = this.main.joueur.position.y; // s'il n' y a pas de boucliers, on perd quand la ligne atteint le joueur
    if (this.main.gestionNiveau.bouclier.bouclierTab.length > 0) { // s'il y'a des boucliers
        contact = this.main.gestionNiveau.bouclier.bouclierTab[0].position.y; // on perd quand la ligne atteint le joueur
    }
    if (this.ennemieTab[0] !== undefined && this.ennemieTab[0].position.y <= contact) { // game over !
        return true;
    }
    return false;
};

// fonction qui permet de supprimer un ennemi particulier de la ligne
LigneEnnemie.prototype.detruireUnEnnemi = function(unEnnemi) {

    // on recupere l'index de l'ennemie dans le tabeau ou sont stocké tous les ennemies de la ligne
    var i = this.ennemieTab.indexOf(unEnnemi);

    // NOTE: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/indexOf
    //indexOf renvoie -1 si le projectile ne figure pas dans le tableau
    if (i > -1) {

        // on supprime également tous les projectiles des ennemis
        while (this.ennemieTab[i].projectileTab.length > 0) {
            this.ennemieTab[i].detruireProjectile(this.ennemieTab[i].projectileTab[this.ennemieTab[i].projectileTab.length - 1]);
        }

        // on supprime l'ennemie de la scene
        this.remove(this.ennemieTab[i]);
        // et ensuite on le retire du tableau
        this.ennemieTab.splice(i, 1); // NOTE: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/splice
    }
    // bien sur s'il n y a plus d'ennemie, on supprime la ligne
    if (this.ennemieTab.length === 0) {
        this.horde.detruireUneLigne(this);
    }
};

// fonction utile qui calcule la distance entre deux points => theoreme de pythagore CQFD
LigneEnnemie.prototype.distanceDeuxPoints = function(point1, point2) {

    //HACK: https://stackoverflow.com/questions/20916953/get-distance-between-two-points-in-canvas
    // on applique Pythagore

    var x = point1.x - point2.x;
    var y = point1.y - point2.y;
    var z = point1.z - point2.z;

    var distance = Math.sqrt(x * x + y * y + z * z);
    return distance;
};

// fonction qui permet de selectionner le candidat au tir le plus proche de la position du joueur (IA)
LigneEnnemie.prototype.ennemiLePlusProche = function() {
    //HACK: https://stackoverflow.com/questions/24791010/how-to-find-the-coordinate-that-is-closest-to-the-point-of-origin

    // le candidat idéal parce que it's over 9000
    var candidat = 9000; // HACK: https://www.youtube.com/watch?v=SiMHTK15Pik
    var unEnnemi;
    // on parcourt le tableau d'ennemis
    for (var i = 0; i < this.ennemieTab.length; i++) {
        // et si la distance d'un ennemi est inferieur à celle du canditat, alors cet ennemi devient le candidat potentiel
        if (candidat > this.distanceDeuxPoints(this.ennemieTab[i].position, this.main.joueur.position)) {
            candidat = this.distanceDeuxPoints(this.ennemieTab[i].position, this.main.joueur.position);
            unEnnemi = this.ennemieTab[i];
        }
    }
    return unEnnemi;
};

// fonction qui permet à l'ennemi le plus proche de tirer
LigneEnnemie.prototype.tirer = function() {
    this.ennemiLePlusProche().tirer();
};

// fonction qui permet de déplacer tous les projectiles des ennemis de la ligne
LigneEnnemie.prototype.deplacementProjectile = function() {
    for (var i = 0; i < this.ennemieTab.length; i++) {
        this.ennemieTab[i].deplacementProjectile();
    }
};