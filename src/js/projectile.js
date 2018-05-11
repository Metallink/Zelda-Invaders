// classe qui permet de gérer les projectiles et surtout la collision
function Projectile(deplacement, tireur, chemin, main) {

    this.chemin = chemin; // emplacement du modele 3D JSON (fait sous BLender)
    this.main = main;

    /* == DONNEES HITBOX == */
    this.largeur = 15;
    this.hauteur = 22;
    this.profondeur = 7;

    // on charge le modele en envoyant le fichier json au générateur de modele
    ChargementModele.call(this, this.chemin, this.largeur, this.hauteur, this.profondeur, this); // NOTE: on appelle le constructeur de la classe ChargementModele

    // on positionne correctement le projectile
    this.scale.set(1.5, 1.5, 1.5);
    this.position.x = 0;
    this.position.y = -280;
    this.position.z = -80;
    this.rotation.x = 0.40;
    this.rotation.z = -1.4;
    this.updateMatrix();

    this.deplacement = deplacement;
    this.tireur = tireur; // origine du tir (ennemi ou joueur)
    this.direction = new THREE.Vector3();
    this.collision; // raycaster
};

// =========================================== HERITAGE ===========================================
/* NOTE: https://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */

// On surcharge la classe Projectile
Projectile.prototype = Object.create(ChargementModele.prototype);
Projectile.prototype.constructor = Projectile;

// fonction qui permet de deplacer les projectiles
Projectile.prototype.deplacer = function(direction) {

    this.direction = direction; //(direction differentes selon ennemi (négative sur Y) ou joueur (positive sur Y))
    if (this.position.y >= 2000 || this.position.y <= -750) { // on supprime quand le projectile est au dela du board
        this.tireur.detruireProjectile(this);
    }

    // on déplace sur chaque axe de x deplacement dans la direction (y) [0,1,0]
    this.position.x += this.direction.x * this.deplacement;
    this.position.y += this.direction.y * this.deplacement;
    this.position.z += this.direction.z * this.deplacement;

    // gestion de la collision
    this.gestionCollision();
};


/* =================================== GESTION DES COLLISIONS =================================== */
Projectile.prototype.gestionCollision = function() {

    // Just for the raycaster who only accpet vectors
    var direction = new THREE.Vector3(this.direction.x, this.direction.y, this.direction.z);
    // on positionne le Raycaster au milieu du projectile sur l'axe X
    var origine = new THREE.Vector3(this.position.x + (this.largeur / 2), this.position.y, this.position.z);

    // on initialise notre Raycaster en ayant une tolérance de 30
    this.collision = new THREE.Raycaster(origine, direction, 0, 30);

    // liste des cibles potentielles interceptés
    if (this.tireur instanceof Joueur) // par le joueur
        var cibleTab = this.collision.intersectObjects(this.main.gestionNiveau.horde.children.concat(this.main.gestionNiveau.bouclier), true); // cibles: ennemis + boucliers
    if (this.tireur instanceof Ennemi) // par les ennemis
        var cibleTab = this.collision.intersectObjects(this.main.joueur.children.concat(this.main.gestionNiveau.bouclier), true); // cibles: joueur + boucliers

    if (cibleTab.length > 0) { // quand on a intercepté quelque chose
        var laCible = cibleTab[0].object.parent;

        // le joueur a été touché :c
        if (laCible instanceof Joueur && cibleTab[0].distance <= 30 && this.tireur instanceof Ennemi) {
            this.main.audio.son["linkhurt"].play();
            laCible.pointsDeVie--; // il perd des points de vie
            this.main.interface.affichageVies(); // on réactualise l'affichage des points de vie
            this.tireur.detruireProjectile(this); // hop on se debarasse de l'épée du crime
            console.log("le joueur est touché! " + laCible.pointsDeVie + " point(s) de vie restant...");
        }
        // on a touché un ennemi !
        if (laCible instanceof Ennemi && cibleTab[0].distance <= 30 && this.tireur instanceof Joueur) {
            this.main.gestionNiveau.horde.detruireUnEnnemi(laCible); // on supprime l'ennemi de la scene
            this.tireur.points += laCible.points; // le joueur gagne le nombre de points de l'ennemi
            this.main.interface.affichageScore(); // on actualise le score
            this.tireur.detruireProjectile(this); // hop on se debarasse de l'épée du crime
            console.log("Un ennemi a été touché!");
        }
        // on a touché un pauvre bouclier
        if (laCible instanceof Bouclier && cibleTab[0].distance <= 20) {
            this.main.audio.son["bouclier"].play();
            laCible.detruire(cibleTab[0].object); // on supprime le bouclier de la scene
            this.tireur.detruireProjectile(this); // hop on se debarasse de l'épée du crime
            console.log("Un bouclier a été touché!");
        }
        // collision de 2 projectiles
        if (laCible instanceof Projectile && cibleTab[0].distance <= 30) { //FIXME ne fonctionne pas pk??
            laCible.tireur.detruireProjectile(laCible); // le projectile victime est supprimé de la scene
            this.tireur.detruireProjectile(this); // le tireur (ennemi ou joueur) supprime son projectile
            console.log("Deux projectiles sont entrés en collision!");
        }
    }
};