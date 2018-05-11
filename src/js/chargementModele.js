// classe importante qui permet de charger les modèles 3D dont les informations necessaires sont récuprérées en paramètre
function ChargementModele(cheminFichierJSON, largeur, hauteur, profondeur, demandeur) {

    /* le chemin du fichier est recu en parametre de la fonction
    ainsi ce générateur de modele est générique (joueur, aliens et boucliers) */
    this.chemin = cheminFichierJSON;

    /* == DONNEES HITBOX == */
    // VOIR plus bas pour explications
    this.largeur = largeur;
    this.hauteur = hauteur;
    this.profondeur = profondeur;

    this.demandeur = demandeur;

    THREE.Group.call(this); // NOTE: on appelle le constructeur de THREE.Group

    /* HACK: on définit une var pour acceder à 'this' dans une autre scope
       NOTE: https://javascriptplayground.com/javascript-variable-scope-this/ */
    var _this = this;

    // on charge le modele grâce à JSONLoader()
    var loader = new THREE.JSONLoader();
    loader.load(this.chemin, function(geometry, materials) {

        var modele = new THREE.Mesh(geometry, materials);
        _this.add(modele); // on ajoute notre modele à notre Group
    });

    /* ========================= HITBOX ========================= */
    /* NOTE: J'ai eu beaucoup de difficultés ici pour configurer la hitbox.
            En effet, je n'ai pas trouvé de fonction "toute prete" pour récuperer la largeur/hauteur/profondeur d'un objet 3D chargé.
            J'ai du creer un cube, positionner le modele en son centre et enfin en ajustant à la louche en jouant sur le scale du cube
            pour trouver la largeur/hauteur du modele. J'ai ensuite noté ces valeurs que j'ai mis dans des attributs "en brut"
            des fichiers/objets appellant (joueur, ennemie etc..). Ces données bruts sont recu en paraetre ici de cette classe pour générer les
            differentes hitboxs des objets.
            Vous pouvez voir la hitbox en passant le parametre 'visible' du material à true */

    /* HACK: https://stackoverflow.com/questions/23859512/how-to-get-the-width-height-length-of-a-mesh-in-three-js
            Solution "magique" sensée me donner la hauteur/largeur mais ne fonctionne pas. */

    var hitbox = new THREE.Mesh(new THREE.BoxGeometry(this.largeur, this.hauteur, this.profondeur), new THREE.MeshBasicMaterial({
        visible: false
    }));

    // BUG: la hitbox n'est pas centrée pour les differents modeles => petits ajustements en fonction de l'appellant
    if (this.demandeur instanceof Joueur) {
        hitbox.scale.set(1, 1, 2);
    };

    if (this.demandeur instanceof Projectile) {
        hitbox.translateX((this.largeur / 2) + 10);
        hitbox.translateY((this.hauteur / 2) + 20);
        hitbox.translateZ(5);
    };

    if (this.demandeur instanceof Ennemi) {
        hitbox.translateX((this.largeur / 2) + 30);
        hitbox.translateY((this.hauteur / 2));
        hitbox.translateZ(5);
    };

    if (this.demandeur instanceof Bouclier) {
        hitbox.translateX((this.largeur / 2));
        hitbox.translateY((this.hauteur / 2));
        hitbox.translateZ(5);
    };
    // on l'ajoute enfin à notre Group
    this.add(hitbox);
};

// =========================================== HERITAGE ===========================================
/* NOTE: https://blog.xebia.fr/2013/06/10/javascript-retour-aux-bases-constructeur-prototype-et-heritage/
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create */

// On surcharge la classe ChargementModele
ChargementModele.prototype = Object.create(THREE.Group.prototype); // heritage
ChargementModele.prototype.constructor = ChargementModele;