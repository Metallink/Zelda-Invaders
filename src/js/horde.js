// classe qui permet de gérer une horde d'ennemi (ensemble des ennemis => toutes les lignes d'ennemis)
function Horde(main, niveau, deplacement, force, points, nombreDeLignes, nombreEnnemies, typeEnnemi) {

    THREE.Group.call(this); // NOTE: on appelle le constructeur de THREE.Group

    this.main = main;
    this.ligne = new Array(); // représente une ligne d'ennemis
    this.force = force; // force d'une ligne
    this.niveau = niveau; // niveau actuel du jeu

    // distance entre les ennemies d'une meme ligne
    var distanceEntreDeuxLignes = (200 / (nombreDeLignes)) / 2;
    /* On initialise la horde (plusieurs lignes ennemies) */
    for (var i = 0; i < nombreDeLignes; i++) {
        var uneLigne = new LigneEnnemie(typeEnnemi[i], deplacement[i], points[i], nombreEnnemies[i], 1400 - (i * distanceEntreDeuxLignes), this.force, this, this.main);

        this.ligne.push(uneLigne); //on l'ajoute à notre liste de lignes
        this.add(uneLigne); // on ajoute notre ligne à notre Group
    }
};

// =========================================== HERITAGE ===========================================
/* NOTE: https://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */

// On surcharge la classe Horde
Horde.prototype = Object.create(THREE.Group.prototype); // heritage
Horde.prototype.constructor = Horde;

// fonction qui permet de gérer le deplacement des lignes
Horde.prototype.deplacer = function() {
    for (var i = 0; i < this.ligne.length; i++) {
        this.ligne[i].deplacer();
    }
    // si la premiere ligne ennemie arrive au niveau des boucliers, le joueur perd la partie!
    if (this.ligne.length > 0 && this.ligne[this.ligne.length - 1].collisionBouclier()) {
        this.main.etat = this.main.jeuEtatsPossibles.GAMEOVER;
        console.log("Sorcellerie! Tu as laissé les vils rubis atteindre Link!");
        this.main.audio.musique["zeldaTheme"].stop();
        this.main.audio.son["gameover"].loop(true);
        this.main.audio.son["gameover"].play();
    }
};

// fonction qui permet de supprimer un ennemi de la ligne
Horde.prototype.detruireUnEnnemi = function(ennemi) {
    ennemi.ligneEnemmie.detruireUnEnnemi(ennemi);
};

// fonction qui permet de supprimer une ligne d'ennemis
Horde.prototype.detruireUneLigne = function(uneLigne) {

    // on recupere l'index de la ligne dans le tabeau ou sont stocké les lignes
    var i = this.ligne.indexOf(uneLigne);

    // NOTE: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/indexOf
    //indexOf renvoie -1 si le projectile ne figure pas dans le tableau
    if (i > -1) {
        // on supprime la ligne de la horde
        this.remove(this.ligne[i]);
        // puis on supprime (en passant par le this de niveau) la ligne de la scene
        this.niveau.main.remove(this.ligne[i]);
        // et ensuite on le retire du tableau
        this.ligne.splice(i, 1); // NOTE: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/splice
    }

    // s'il n y a plus de lignes, le joueur a gagné et on prepare le niveau suivant
    if (this.ligne.length === 0) {
        // on voit l'utilité d'avoir recu en parametre la classe niveau => on peut à travers lui acceder à la classe main et donc à this.scene
        this.niveau.main.etat = this.niveau.main.jeuEtatsPossibles.LANCEMENT;
    }
};

// fonction qui permet à une ligne de tirer (seules les deux premieres lignes tirent)
Horde.prototype.tirer = function() {
    for (var i = 0; i < 2; i++) {
        if (this.ligne[i] !== undefined) // on anticipe le fait qu'il ne peut rester qu'une ligne
            this.ligne[i].tirer();
    }
};

// fonction qui permet le deplacement d'un projectile
Horde.prototype.deplacementProjectile = function() {
    for (var i = 0; i < this.ligne.length; i++) {
        this.ligne[i].deplacementProjectile(); // on fait appel à la fonction deplacementProjectile de la classe Ennemi
    }
};

// fonction qui permet l'animation d'une ligne (deplacement et tir)
Horde.prototype.animate = function() {
    // animation de la horde: on tire, on gere le mouvement du projectile et on se deplace
    this.deplacer();
    this.tirer();
    this.deplacementProjectile();
};

// fonction qui permet de tout détuire => code de triche (touche k)
Horde.prototype.detruireHorde = function() {
    while (this.ligne.length > 0) { // tant qu'il reste des lignes
        if (this.ligne[this.ligne.length - 1] !== undefined) { // on vérifie que le dernier élément de la liste de la ligne existe
            if (this.ligne[this.ligne.length - 1].ennemieTab.length !== undefined) { // on vérie qu'il existe des ennemis dans la ligne
                while (this.ligne[this.ligne.length - 1].ennemieTab.length > 0) { //BUG: bug console...mais ca a l'air de fonctionner COMBAK
                    this.ligne[this.ligne.length - 1].detruireUnEnnemi(this.ligne[this.ligne.length - 1].ennemieTab[this.ligne[this.ligne.length - 1].ennemieTab.length - 1]);
                }
            }
        }
    }
};