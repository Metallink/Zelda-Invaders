// la classe Bouclier représente l'ensemble des boucliers
function Bouclier(ligneBouclier) {

    // emplacement du modele 3D JSON (fait sous BLender)
    this.chemin = 'src/medias/models/json/triforce.json';

    /* == DONNEES HITBOX == */
    this.largeur = 30;
    this.hauteur = 30;
    this.profondeur = 30;

    this.ligne = ligneBouclier;

    // on appelle le constructeur de la classe ChargementModele
    ChargementModele.call(this, this.chemin, this.largeur, this.hauteur, this.profondeur, this);

    // ajustement du bouclier (orientation/position etc..)
    this.scale.set(2.2, 2.2, 2.2);
    this.rotation.y += 4.7;
    this.rotation.x -= 0.8;
    this.position.z -= 100;
};

// =========================================== HERITAGE ===========================================
/* NOTE: https://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */

// On surcharge la classe Bouclier
Bouclier.prototype = Object.create(ChargementModele.prototype);
Bouclier.prototype.constructor = Bouclier;

// fonction qui permet de détuire un bouclier
Bouclier.prototype.detruire = function() {
    this.ligne.detruireUnBouclier(this);
};