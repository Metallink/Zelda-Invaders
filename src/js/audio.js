function Audio() {

    // liste des musiques
    this.musique = new Array();
    // liste des effets sonores
    this.son = new Array();

    // utile pour savoir l'état de la musique (fonction mute)
    this.uneMusiqueON = true;
};

// fonction qui précharge nos musiques et sons
Audio.prototype.init = function() {

    /* =================== MUSIQUE =================== */

    this.musique["zeldaAccueil"] = new Howl({
        src: ['src/medias/sounds/musics/1.mp3'],
        volume: 0.7,
        preload: true
    });

    this.musique["zeldaTheme"] = new Howl({
        src: ['src/medias/sounds/musics/2.mp3'],
        volume: 0.2,
        preload: true
    });

    /* =================== EFFETS SONORES =================== */

    this.son["epee"] = new Howl({
        src: ['src/medias/sounds/sound_effects/LOZ_Sword_Slash.wav'],
        volume: 1.0,
        preload: true
    });

    this.son["tirEnnemi"] = new Howl({
        src: ['src/medias/sounds/sound_effects/LOZ_Enemy_Hit.wav'],
        volume: 1.0,
        preload: true
    });

    this.son["fanfare"] = new Howl({
        src: ['src/medias/sounds/sound_effects/LOZ_Fanfare.wav'],
        volume: 1.0,
        preload: true
    });

    this.son["gameover"] = new Howl({
        src: ['src/medias/sounds/sound_effects/Game_Over.mp3'],
        volume: 0.8,
        preload: true
    });

    this.son["stairs"] = new Howl({
        src: ['src/medias/sounds/sound_effects/LOZ_Stairs.wav'],
        volume: 1.0,
        preload: true
    });

    this.son["bouclier"] = new Howl({
        src: ['src/medias/sounds/sound_effects/LOZ_Text.wav'],
        volume: 1.0,
        preload: true
    });

    this.son["linkhurt"] = new Howl({
        src: ['src/medias/sounds/sound_effects/LOZFDS_Link_Hurt.wav'],
        volume: 1.0,
        preload: true
    });
};

// fonction qui permet de mute la musique (touche M)
Audio.prototype.couperMusique = function() {

    if (this.uneMusiqueON === true) {
        this.uneMusiqueON = false;
    } else {
        this.uneMusiqueON = true;
    }

    if (this.uneMusiqueON) {
        for (var m in this.musique) {
            this.musique[m].mute(false);
            console.log("Ah c'est quand même mieux avec la musique!");
        }
    } else {
        for (var m in this.musique) {
            this.musique[m].mute(true);
            console.log("Vous n'aimez pas la musique de Zelda?!");
        }
    }
};