document.body.style.overflow = 'hidden';
const grid = document.querySelector('.grid')
const hero = document.querySelector('.hero')
const collectables = document.getElementsByClassName("collectable")
const scoreVisual = document.querySelector('.score')
const gameOverVisual = document.querySelector('.gameOver')
let heroLeftSpace = 0
let heroBottomSpace = 90
let numberOfCollectables = 5
let score = 0
let i = 0

let isGameOver = false
let collectableIntervalId, collectingIntervalId, collisionIntervalId

//random number generator for positioning within the grid
function createRandomNumberWithinGrid() {
    return Math.floor(Math.random() * 91)
}

//random number to choose picture for collectable
function createRandomNumberCollectable() {
    return Math.floor(Math.random() * 10) + 1
}

//creates collectables according to the number needed with random position
function createCollectables() {
    if (collectables.length < numberOfCollectables) {
        do {
            i += 1;
            const collectable = document.createElement('div')
            collectable.setAttribute("id", 'c' + i);
            let collectableLeftSpace = 0
            let collectableBottomSpace = 0
            grid.appendChild(collectable)
            collectable.classList.add('collectable')
            collectableLeftSpace += createRandomNumberWithinGrid()
            collectable.style.left = collectableLeftSpace + '%'
            collectableBottomSpace += createRandomNumberWithinGrid()
            collectable.style.bottom = collectableBottomSpace + '%'
            collectable.innerHTML = ('<img src="img/' + createRandomNumberCollectable() + '.png"/>')
        } while (i < numberOfCollectables);
    }
}

//functions for key controls
function moveLeft() {
    heroLeftSpace -= 5
    hero.style.left = heroLeftSpace + '%'
}
function moveRight() {
    heroLeftSpace += 5
    hero.style.left = heroLeftSpace + '%'
}
function moveUp() {
    heroBottomSpace += 5
    hero.style.bottom = heroBottomSpace + '%'
}
function moveDown() {
    heroBottomSpace -= 5
    hero.style.bottom = heroBottomSpace + '%'
}

//key controls
function control(e) {
    if (e.key === "ArrowLeft" && heroLeftSpace > 0) {
        moveLeft()
    } else if (e.key === "ArrowRight" && heroLeftSpace < 90) {
        moveRight()
    } else if (e.key === "ArrowUp" && heroBottomSpace < 90) {
        moveUp()
    } else if (e.key === "ArrowDown" && heroBottomSpace > 0) {
        moveDown()
    }
}

//keeping score and collecting the collectables
function collecting() {
    for (const collectable of collectables) {
        //converting percentages into numbers
        let collectLeft = Number(collectable.style.left.replace('%', ''))
        let heroLeft = Number(hero.style.left.replace('%', ''))
        let collectBottom = Number(collectable.style.bottom.replace('%', ''))
        let heroBottom = Number(hero.style.bottom.replace('%', ''))
        //checking if the hero at a collectable
        if (((collectLeft - 8) <= heroLeft) &&
            ((collectLeft + 8) >= heroLeft) &&
            ((collectBottom - 8) <= heroBottom) &&
            ((collectBottom + 8) >= heroBottom)
        ) {
            //removing the collectable and adding to the score
            let removedCollectable = document.getElementById(collectable.id)
            removedCollectable.remove()
            score += 1
            scoreVisual.innerHTML = 'Score: ' + score
        }
    }
}

//start creating the enemies with specific id tags and height
function startCreatingEnemies() {
    //creating the enemies
    function createEnemies(id, enemyBottom, pic) {
        const enemy = document.createElement('div')
        enemy.setAttribute("id", id);
        enemy.classList.add('enemy')
        enemy.style.left = '95%'
        enemy.style.bottom = enemyBottom
        grid.appendChild(enemy)
        enemy.innerHTML = ('<img src="img/' + pic + '.png"/>')
    }
    createEnemies('e1', '75%', 'wizard1')
    createEnemies('e2', '55%', 'wizard2')
    createEnemies('e3', '35%', 'wizard4')
    createEnemies('e4', '15%', 'wizard3')
}

//create projectiles for every enemy, at the same height as the enemy
function createProjectile() {
    const enemies = document.getElementsByClassName('enemy');
    let i = 0
    for (const enemy of enemies) {
        const projectile = document.createElement('div')
        i += 1
        grid.appendChild(projectile)
        projectile.classList.add('projectile')
        projectile.setAttribute("id", enemy.style.bottom);
        projectile.style.left = 91 + '%'
        projectile.style.bottom = enemy.style.bottom
        projectile.innerHTML = ('<img src="img/projectile.png"/>')
    }
}
//create random number for projectile 'bottom' trajectory
function randomBottom() {
    const value = 0.5;
    return Math.floor(Math.random() * (2 * value + 1) + value) * (Math.round(Math.random()) ? 1 : -1)
}
let projectileIntervals = [];

function projectilesFlying() {
    projectileIntervals.push(projectileFlying('15%', randomBottom()));
    projectileIntervals.push(projectileFlying('35%', randomBottom()));
    projectileIntervals.push(projectileFlying('55%', randomBottom()));
    projectileIntervals.push(projectileFlying('75%', randomBottom()));
}
function speedInc() {
    if (score >= 6 && projectileSpeed < 3) {
        projectileSpeed =  score * 0.075
    }
    if (score >= 40) {
        projectileSpeed = 3
    }
}
let projectileSpeed = 0.4
function projectileFlying(id, number) {
    let projectile = document.getElementById(id)
    return setInterval(function() {
        speedInc()
        let projectileLeft = Number(projectile.style.left.replace('%', ''))
        let projectileBottom = Number(projectile.style.bottom.replace('%', ''))
        projectileLeft -= projectileSpeed
        projectileBottom += number
        projectile.style.left = `${projectileLeft}%`
        projectile.style.bottom = `${projectileBottom}%`
        //if projectile gets close to the grids border it returns to it's starting position 
        if ((projectileBottom <= 0) || (projectileBottom >= 90) ||
            (projectileLeft >= 98) || (projectileLeft <= 0)) {
            projectile.style.left = 91 + '%'
            //getting projectiles starting height from its id
            projectile.style.bottom = projectile.id
            //changes projectile trajectory when starting again from the starting position, otherwise the trajectory would be the same for every flight
            number = randomBottom()
        }
    }, 40)
}

//try again button which will reload the page
function reloadButton() {
    const button = document.createElement('button')
    button.setAttribute("onClick", "window.location.reload()");
    grid.appendChild(button)
    button.innerHTML = "Try again?"
}

function gameOver() {
    isGameOver = true
    gameOverVisual.innerHTML = 'Game over!'
    // keycontrols won't work
    document.removeEventListener('keydown', control)
    //function intervals are cleared
    clearInterval(collectableIntervalId)
    clearInterval(collectingIntervalId)
    clearInterval(collisionIntervalId)
    reloadButton()
    projectileIntervals.forEach(intervalId => clearInterval(intervalId))
}

//game ends when projectile hits the hero
function collision() {
    let projectiles = document.getElementsByClassName('projectile')
    for (const projectile of projectiles) {
        //converting percentages into numbers
        let projectileLeft = Number(projectile.style.left.replace('%', ''))
        let heroLeft = Number(hero.style.left.replace('%', ''))
        let projectileBottom = Number(projectile.style.bottom.replace('%', ''))
        let heroBottom = Number(hero.style.bottom.replace('%', ''))
        //defining the areas which can't overlap or game ends
        if (((projectileLeft - 4) <= heroLeft) &&
            ((projectileLeft + 4) >= heroLeft) &&
            ((projectileBottom - 5) <= heroBottom) &&
            ((projectileBottom + 5) >= heroBottom)
        ) {
            gameOver()
        }
    }
}
//functions that start when start button is pressed and setting their intervals
function start() {
    document.addEventListener('keydown', control)
    collectableIntervalId = setInterval(createCollectables, 500);
    collectingIntervalId = setInterval(collecting, 50);
    startCreatingEnemies()
    createProjectile()
    collisionIntervalId = setInterval(collision, 20);
    projectilesFlying()
    //remove start button when the game starts
    let removedButton = document.getElementById("startButton")
    removedButton.remove()
}