let mode = undefined;
let blocks = {};
let paused=false;

function START_BLOCK(block) {
    if(!paused) blocks[block] = [performance.now()];
}

function END_BLOCK(block) {
    if(!paused) blocks[block].push(performance.now() - blocks[block][0]);
}

function drawTable() {
        fill(0);
        text(Math.round(frameRate()), 30, 30);
        var keys = Object.keys(blocks);
        var tableWidth = 500,
            tableHeight = Object.keys(blocks).length * 50;
        
        push();
        stroke(0);
        rectMode(CORNER);
        fill(68, 70, 118, 200);
        rect(width - tableWidth, 0, width, tableHeight);
        for(var i = 0; i < 3; i++) {
            line(width - i * (tableWidth / 3), 0, width - i * (tableWidth / 3), tableHeight);
        } 
        
        fill(255);
        textAlign(CENTER);
        text('Block Name', width - ((tableWidth / 3) * 2.5), (tableHeight / keys.length) - 20);
        text('Block Percent', width - ((tableWidth / 3) * 1.5), (tableHeight / keys.length) - 20);
        text('Block Time', width - ((tableWidth / 3) / 2), (tableHeight / keys.length) - 20);

        for(var i = 1; i < keys.length; i++) {
            line(width, i * (tableHeight / keys.length), width - tableWidth, i * (tableHeight / keys.length));
            text(keys[i], width - (tableWidth / 3) * 2.5, (i + 1) * (tableHeight / keys.length) - 20);
            text(`${Math.trunc((blocks[keys[i]][1] / blocks['gameLoop'][1]) * 100)}%`, width - (tableWidth / 3) * 1.5, (i + 1) * (tableHeight / keys.length) - 20);
            text(`${(blocks[keys[i]][1]).toFixed(4)}ms`, width - (tableWidth / 3) / 2, (i + 1) * (tableHeight / keys.length) - 20);
        }
        
        pop();
}

function debugSetup() {
    document.getElementById('defaultCanvas0').addEventListener('contextmenu', function(e) {
        if (e.button === 2) {
            e.preventDefault();
            return false;
        }
    }, false);
}

function debugUpdate() {
    if(mouseIsPressed && mouseButton === LEFT) {
        if(mode === 'add') {
            addWall();
        } else if(mode === 'remove') {
            removeWall();
        }
    }
}

function takeSnapshot() {
    ((paused) ? paused = false : paused = true);
}