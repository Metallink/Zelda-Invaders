// classe qui permet de gérer les niveaux (Génération des ennemis)
function Niveau(niveau, joueur, main) {

    THREE.Group.call(this); // on appelle le constructeur de THREE.Group

    this.main = main; // (this.main = this.scene)
    this.niveau = niveau;
    this.joueur = joueur;
    this.horde;
    this.bouclier;

    /* NOTE: Il y a 3 types d'ennemies:
            - le vert compte pour 10 points
            - le bleu compte pour 20 points
            - le rouge compte pour 40 points
     */
    this.typeEnnemi = ["vert", "bleu", "rouge"];
    this.scoreEnnemi = [10, 20, 40];
};

// =========================================== HERITAGE ===========================================
/* NOTE: https://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */

// On surcharge la classe gestionNiveau
Niveau.prototype = Object.create(THREE.Group.prototype);
Niveau.prototype.constructor = Niveau;

// fonction qui permet de générer dynamique les ennemis
Niveau.prototype.init = function() {

    /* =============== GENERATION DES PARAMETRES DE LA HORDE =============== */

    var typeEnnemiTab = new Array();
    var pointsTab = new Array();
    var deplacementTab = new Array();
    var nombreEnnemiesTab = new Array();

    // on double le nombre de lignes à chaque niveau
    var nombreDeLignes = this.niveau * 2;
    // sera utilisé pour calculé la cadence de tir des ennemis
    var force = this.niveau;

    /* Cette boucle va nous permettre de générer aleatoirement et dynamiquement le nombre de lignes,
        le nombre d'ennemies, le type d'ennemies etc... */
    for (var i = 0; i < nombreDeLignes; i++) {
        // variable random qui permet de choisir entre les 3 types d'ennemies au hasard (1 2 ou 3)
        var rand = Math.floor(Math.random() * 3);
        typeEnnemiTab.push(this.typeEnnemi[rand]);
        // on double,trile, quadruple... les points à chaque niveau
        pointsTab.push(this.scoreEnnemi[rand] * force);
        // ici on génére la vitesse de deplacement qui augmentera avec les niveaux
        deplacementTab.push(Math.floor((Math.random() * 1 * this.niveau)) + 1.5);
        // on génére ici le nombre d'ennemis par ligne et elle augmentera avec les niveaux
        nombreEnnemiesTab.push(Math.floor((Math.random() * this.niveau) + 3));
    }

    // on instancie une nouvelle horde et on transmet les parametres générées aléatoirement
    this.horde = new Horde(this.main, this, deplacementTab, force, pointsTab, nombreDeLignes, nombreEnnemiesTab, typeEnnemiTab);
    // on ajoute notre horde à notre Group
    this.add(this.horde);


    /* =============== GENERATION DES BOUCLIERS =============== */

    // on aura 2 boucliers lors des 2 premiers niveau puis 5 par la suite
    var nombreBoucliers = (this.niveau <= 2) ? 3 : 5;

    this.bouclier = new ligneBouclier(nombreBoucliers, this);
    // on ajoute notre bouclier à notre Group
    this.add(this.bouclier);

    // tout est configuré pour le niveau actuel, on incremente pour préparer le suivant
    this.niveau++;
};

// fonction qui permet de supprimer tous les ennemis, boucliers et projectiles
Niveau.prototype.reset = function() {
    if (this.joueur) {
        this.joueur.detruireTousLesProjectiles();
    }
    if (this.horde) {
        this.horde.detruireHorde();
    }
    if (this.bouclier) {
        this.bouclier.detruireTousLesBoucliers();
    }
};