window.onload = function () {

    /*
     *  Definition de l'objet Tile
     */

    function Tile() {
        this.x=0;
        this.y=0;
        this.z=0;
        this.type='';
        this.selected = false;
        this.isConstructible = true;
        this.building = 0;
        if (typeof(Tile.initialized) == 'undefined') {
            // Definition des coordonnée sur l'écran par rapport aux coordonnées dans le tableau
            Tile.prototype.toScreen = function () {
                var screen = [];
                screen.x = offsetX - (this.y * tileWidth / 2) + (this.x * tileWidth / 2) - (tileWidth / 2);
                screen.y = offsetY + (this.y * visualHeight / 2) + (this.x * visualHeight / 2);
                return screen;
            };
            // Affichage de la tile
            Tile.prototype.print = function (context) {
                context.drawImage(tileSet, tileWidth * (this.type+tilesetOffset), 0 * tileHeight, tileWidth, tileHeight, this.toScreen().x, ((this.toScreen().y) - this.z), tileWidth, tileHeight);
                var j;
                if (this.selected) {
                    if (!this.isConstructible){
                        context.drawImage(tileSet, tileWidth * 1, 0 * tileHeight, tileWidth, tileHeight, this.toScreen().x, ((this.toScreen().y) - this.z), tileWidth, tileHeight);
                    } else {
                        context.drawImage(tileSet, tileWidth * 0, 0 * tileHeight, tileWidth, tileHeight, this.toScreen().x, ((this.toScreen().y) - this.z), tileWidth, tileHeight);
                    }
                    j = 1;
                }
                else {
                    j = 0;
                }

                if (this.building !== 0) {
                    context.drawImage(buildings, tileWidth * this.building, j * buildingHeight, tileWidth, buildingHeight, this.toScreen().x, this.toScreen().y - (buildingHeight - visualHeight) - this.z, tileWidth, buildingHeight);
                }
            };
        }
    }

    /*
     * Definition du canvas et de son context.
     */

    var c = document.getElementById('can');
    var ctx = c.getContext('2d');
    c.oncontextmenu = function () {return false; };

    var lastSelected = new Tile();

    // Event permettant au canvas de faire toujours 100% de la page.

    window.addEventListener('resize', resizeCanvas, false);

    // Event souris

    c.addEventListener('mousemove', function (evt) {
        var mousepos = getMousePos(c, evt);
        if (typeof(map[mousepos.x]) !== 'undefined') {
            if (typeof(map[mousepos.x][mousepos.y]) !== 'undefined') {
                if (map[mousepos.x][mousepos.y].selected !== true) {
                    lastSelected.selected = false;
                    map[mousepos.x][mousepos.y].selected = true;
                    lastSelected = map[mousepos.x][mousepos.y];
                    draw();
                }
            }
            else {
                if (lastSelected.selected) {
                    lastSelected.selected = false;
                    draw();
                }
            }
        }
        else {
            if (lastSelected.selected) {
                lastSelected.selected = false;
                draw();
            }
        }
    });

    c.addEventListener('mousedown', function (evt) {
        switch (evt.button) {
        case 0:
            leftClick(evt);
            break;
        case 1:
            middleClick(evt);
            break;
        case 2:
            rightClick(evt);
            break;
        }
    });

    /*
     * Settings
     */

    var tileSet = new Image();
    var tileWidth = 100;
    var tileHeight = 70;
    var visualHeight = 50;
    var tilesetOffset = 1;
    tileSet.src = 'img/tileset.png';
    var buildings = new Image();
    var buildingHeight = 150;
    buildings.src = 'img/building.png';

    var offsetX = window.innerWidth/2;
    var offsetY = window.innerHeight/2;

    /*
     * Creation de la map
     */

    var map = [];

    for (var a = 0; a <= 100; a++) {
        if (map[a] === void 0){
            map[a] = [];
        }
        for (var b=0;b<=100;b++){
            var tile = new Tile();
            tile.type = 3;
            //tile.type = Math.floor((Math.random()*4)+1);
            if(tile.type === 1){
                tile.isConstructible = false;
            }
            if(Math.random()>0.999 && tile.isConstructible){
                tile.building = 2;
                tile.isConstructible = false;
            }
            if(Math.random()>0.9999 && tile.isConstructible){
                tile.building = 1;
                tile.isConstructible = false;
            }
            tile.x = a;
            tile.y = b;
            map[a][b] = tile;
        }
    }

    /*
     * Ajout de rivière
     */
    var nbRiver = Math.floor(Math.random()*(map.length/2));

    for(var i=nbRiver; i--; i>0){
        var x = Math.floor(Math.random()*map.length);
        var y = Math.floor(Math.random()*map[x].length);
        var l  = Math.floor(Math.random()*map[x].length/2)+1;
        map[x][y].type = 1;
        for(var z=l; z--; z>0){
            var dir = Math.floor(Math.random()*4);
            switch(dir){
            case 0:
                x = (x+1 > map.length) ? map.length : x+1;
                break;
            case 1:
                y = (y+1 > map.length) ? map.length : y+1;
                break;
            case 3:
                x = (x-1 < 0 ) ? 0 : x-1;
                break;
            case 4:
                x = (y-1 < 0) ? 0 : y-1;
                break;

            }
            if(typeof(map[x]) != 'undefined'){
                if(typeof(map[x][y]) != 'undefined'){
                    map[x][y].type = 1;
                    map[x][y].isConstructible = false;
                    map[x][y].building = 0;
                }
            }
        }
    }

    // Fontion dessinant l'intégralité de la carte. Réinitialise le canvas avant de commencer.

    function draw() {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        var rect = c.getBoundingClientRect();

        //Récupération des limites de la zone à dessiner
        var topLeft = (((toMapCoord(c, 0-rect.left-offsetX, 0-rect.top-offsetY).x) >= 0) ? toMapCoord(c, 0-rect.left-offsetX, 0-rect.top-offsetY).x: 0);
        var bottomRight = (((toMapCoord(c, c.width-rect.left-offsetX, c.height-rect.top-offsetY).x) >= 0) ? toMapCoord(c, c.width-rect.left-offsetX, c.height-rect.top-offsetY).x: 0);

        var topRight = (((toMapCoord(c, c.width-rect.left-offsetX, -rect.top-offsetY).y) >= 0) ? toMapCoord(c, c.width-rect.left-offsetX, -rect.top-offsetY).y: 0);
        var bottomLeft = (((toMapCoord(c, -rect.left-offsetX, c.height-rect.top-offsetY).y) >= 0) ? toMapCoord(c, -rect.left-offsetX, c.height-rect.top-offsetY).y: 0);

        for(var i=topLeft; i< bottomRight; i++){
            if(typeof(map[i]) != 'undefined'){
                for(var j=topRight; j<bottomLeft; j++){
                    if(typeof(map[i][j]) != 'undefined'){
                        map[i][j].print(ctx);
                    }
                }
            }
        }
    }

    /*
     * Fonctions Utiles
     */
    function resizeCanvas() {
        draw();
    }

    // Renvoi le coordonnée de la souris, par rapport au tableau formé par les tiles

    function toMapCoord(canvas, x, y){
        var i = Math.floor((y + x/2)/visualHeight);
        var j = Math.floor((y - x/2)/visualHeight);

        return{
            x:i,
            y:j
        };
    }

    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left-offsetX;
        var y = e.clientY-rect.top-offsetY;

        return toMapCoord(canvas, x, y);
    }

    // Opération lors d'un click gauche sur le canvas

    function leftClick(evt) {
        var mousepos = getMousePos(c,evt);
        if(typeof(map[mousepos.x]) !== 'undefined'){
            if(typeof(map[mousepos.x][mousepos.y]) !== 'undefined'){
                if(map[mousepos.x][mousepos.y].isConstructible){
                    map[mousepos.x][mousepos.y].isConstructible = false;
                    map[mousepos.x][mousepos.y].building = 1;
                    draw();
                }
            }
        }
        return false;
    }

    // Opération lors d'un clique droit sur le canvas

    function rightClick(evt) {
        var mousepos = getMousePos(c,evt);
        if(typeof(map[mousepos.x]) !== 'undefined'){
            if(typeof(map[mousepos.x][mousepos.y]) !== 'undefined'){
                if(map[mousepos.x][mousepos.y].building !== 0) {
                    map[mousepos.x][mousepos.y].isConstructible = true;
                    map[mousepos.x][mousepos.y].building = 0;
                }
                draw();
            }
        }
        return false;
    }

    // Opération lors d'un clic molette sur le canvas.

    var startX;
    var startY;
    function middleClick(evt) {
        document.getElementsByTagName('body')[0].style.cursor = 'url("img/deplace.png")';
        startX = evt.clientX;
        startY = evt.clientY;
        c.addEventListener('mousemove', dragMap, false);
        c.addEventListener('mouseup', function(){c.removeEventListener('mousemove', dragMap, false);document.getElementsByTagName('body')[0].style.cursor = 'url("img/cursor.png")';});
    }

    function dragMap(evt){
        if(evt.offsetX){
            offsetX += evt.clientX-startX;
            offsetY += evt.clientY-startY;
            startX = evt.clientX;
            startY = evt.clientY;
        }
        draw();
    }


    tileSet.onload = resizeCanvas();
};
