// classe qui permet de gérer un bouclier (triforce)
function ligneBouclier(nombreBoucliers, niveau) {

    THREE.Group.call(this); // NOTE: on appelle le constructeur de THREE.Group

    this.niveau = niveau; // niveau actuel
    this.bouclierTab = new Array(); // on stocke tous les boucliers

    // on calcule la distance entre chaque bouclier en fonction du nombre de bouclier et de la "taille" du board
    var distanceEntreBoucliers = 700 / nombreBoucliers;

    for (var i = 0; i < nombreBoucliers; i++) {

        var unBouclier = new Bouclier(this);

        // on ajuste le positionnement du bouclier
        unBouclier.position.x = -250 + (i * distanceEntreBoucliers);
        unBouclier.position.y = this.niveau.joueur.position.y + 200;
        unBouclier.rotation.z = -90 * Math.PI / 180;

        this.bouclierTab.push(unBouclier); // l'ajoute à notre liste de boucliers
        this.add(unBouclier); // on l'ajoute à notre Group
    }
};

// =========================================== HERITAGE ===========================================
/* NOTE: https://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */

// On surcharge la classe ligneBouclier
ligneBouclier.prototype = Object.create(THREE.Group.prototype); // heritage
ligneBouclier.prototype.constructor = ligneBouclier;

// fonction qui permet de détruire un bouclier particulier (appellé par la classe ligneBouclier)
ligneBouclier.prototype.detruireUnBouclier = function(unBouclier) {

    // on recupere l'index du bouclier dans le tabeau ou sont stocké les boucliers
    var i = this.bouclierTab.indexOf(unBouclier);

    // NOTE: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/indexOf
    //indexOf renvoie -1 si le projectile ne figure pas dans le tableau
    if (i > -1) {
        // on supprime le bouclier de la scene
        this.remove(this.bouclierTab[i]);
        // et ensuite on le retire du tableau
        this.bouclierTab.splice(i, 1);
    }
};

// fonction qui permet de détruire tous les boucliers (appellé par la classe ligneBouclier)
ligneBouclier.prototype.detruireTousLesBoucliers = function() {
    while (this.bouclierTab.length > 0) { // tant qu'on a un bouclier dans notre liste
        this.detruireUnBouclier(this.bouclierTab[this.bouclierTab.length - 1]);
    }
};