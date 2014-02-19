window.onload = function() {

    /*
     * Definition du canvas et de son context.
     */

    var c=document.getElementById("can");
    var ctx = c.getContext("2d");
    c.oncontextmenu = function(){return false;};

    var lastSelected = new Tile();

    // Event permettant au canvas de faire toujours 100% de la page.

    window.addEventListener('resize', resizeCanvas, false);

    // Event souris

    c.addEventListener('mousemove', function(evt) {
        var mousepos = getMousePos(c,evt);
        if(typeof(map[mousepos.x]) !== 'undefined'){
            if(typeof(map[mousepos.x][mousepos.y]) !== 'undefined'){
                if(map[mousepos.x][mousepos.y].selected !== true){
                    lastSelected.selected = false;
                    map[mousepos.x][mousepos.y].selected = true;
                    lastSelected = map[mousepos.x][mousepos.y];
                    draw();
                }
            }
            else{
                if(lastSelected.selected){
                    lastSelected.selected = false;
                    draw();
                }
            }
        }
        else{
            if(lastSelected.selected){
                lastSelected.selected = false;
                draw();
            }
        }
    });

    b
    c.addEventListener('mousedown', function(evt) {
        switch(evt.button){
            case 0: LeftClick(evt);break;
            case 1: MiddleClick(evt);break;
            case 2: RighClick(evt);break;
        }
    });

    /*
     * Settings
     */

    var tileSet = new Image();
    var tileWidth = 100;
    var tileHeight = 70;
    var visualHeight = 50;
    tileSet.src = "tileset.png";
    var buildings = new Image();
    var buildingHeight = 150;
    buildings.src="building.png";

    var offsetX = 500;
    var offsetY = 100;

    /*
     *  Definition de l'objet Tile
     */

    function Tile() {
        this.x;
        this.y;
        this.z;
        this.type;
        this.selected;
        this.building;
        this.selected = false;
        this.building = 0;
        this.z = 0;
        if ( typeof(Tile.initialized) == "undefined" ) {
            // Definition des coordonnée sur l'écran par rapport aux coordonnées dans le tableau
            Tile.prototype.toScreen = function(){
                screen = {};
                screen.x = offsetX - (this.y * tileWidth/2) + (this.x * tileWidth/2) - (tileWidth/2);
                screen.y = offsetY + (this.y * visualHeight/2) + (this.x * visualHeight/2);
                return screen;
            }
            // Affichage de la tile
            Tile.prototype.print = function(context){
                if (this.selected)
                    var j = 1;
                else
                    var j=0;

                context.drawImage(tileSet, tileWidth*this.type, j*tileHeight, tileWidth, tileHeight, this.toScreen().x, ((this.toScreen().y)-this.z), tileWidth, tileHeight);
                if(this.building !== 0){
                    context.drawImage(buildings, tileWidth*this.building, j*buildingHeight, tileWidth, buildingHeight, this.toScreen().x, this.toScreen().y-(buildingHeight-visualHeight)-this.z, tileWidth, buildingHeight);
                }
            }
        }
    }

    /*
     * Creation de la map
     */

    var map = new Array();

    for(var a=0; a<=100; a++){
        if(map[a] === void 0){
            map[a] = new Array();
        }
        for(var b=0;b<=100;b++){
            tile = new Tile();
            tile.type = Math.floor((Math.random()*4)+1);;
            if(Math.random()>0.95 && tile.type > 1){
                tile.building = 2;
            }
            if(Math.random()>0.99 && tile.type > 1){
                tile.building = 1;
            }
            tile.x = a;
            tile.y = b;
            map[a][b] = tile;
        }
    }

    // Fontion dessinant l'intégralité de la carte. Réinitialise le canvas avant de commencer.

    function draw() {
        c.width = window.innerWidth;
        c.height = window.innerHeight;

        for(var i=0; i< map.length; i++){
            for(var j=0; j<map[i].length; j++){
                map[i][j].print(ctx);
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

    function getMousePos(canvas, e){
        var rect = canvas.getBoundingClientRect();
        x = e.clientX-rect.left-offsetX;
        y = e.clientY-rect.top-offsetY;
        i = Math.floor((y + x/2)/visualHeight);
        j = Math.floor((y - x/2)/visualHeight);

        return{
            x:i,
            y:j
        }
    }

    // Opération lors d'un click gauche sur le canvas

    function LeftClick(evt) {
        var mousepos = getMousePos(c,evt);
        if(typeof(map[mousepos.x]) !== 'undefined'){
            if(typeof(map[mousepos.x][mousepos.y]) !== 'undefined'){
                if(map[mousepos.x][mousepos.y].type > 1){
                    map[mousepos.x][mousepos.y].building = 1;
                    draw();
                }
            }
        }
        return false;
    }

    // Opération lors d'un clique droit sur le canvas

    function RighClick(evt) {
        var mousepos = getMousePos(c,evt);
        if(typeof(map[mousepos.x]) !== 'undefined'){
            if(typeof(map[mousepos.x][mousepos.y]) !== 'undefined'){
                if(map[mousepos.x][mousepos.y].building !== 0)
                    map[mousepos.x][mousepos.y].building = 0;
                draw();
            }
        }
        return false;
    }

    // Opération lors d'un clic molette sur le canvas.

    var startX;
    var startY;
    function MiddleClick(evt) {
        document.getElementsByTagName('body')[0].style.cursor = "url('deplace.png')"
        startX = evt.clientX;
        startY = evt.clientY;
        c.addEventListener("mousemove", dragMap, false);
        c.addEventListener("mouseup", function(){c.removeEventListener("mousemove", dragMap, false);document.getElementsByTagName('body')[0].style.cursor = "url('cursor.png')"});
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
}
