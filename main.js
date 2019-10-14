/**
 * Returns a random Boolean value, true or false
 * @returns {boolean}
 */
const randomBool = _ => Math.random() >= 0.5

// dimension of (square) grid
const GRID_SIZE = 100

/**
 * Create a Game of Life universe of dimension rows x columns with a random configuration
 * Live cell - true, dead cell - false
 * 
 * @param {number} rows Number of rows
 * @param {number} cols Number of columns
 * 
 * @returns {number[][]}
 */
const createUniverse = (rows, cols) => {
  const grid = []

  for (i = 0; i < rows; i++) {
    const row = []
    for (j = 0; j < cols; j++) {
      row.push(randomBool())
    }
    grid.push(row)
  }   

  return grid
}

let universe = createUniverse(GRID_SIZE, GRID_SIZE)

/* DOM */

// not the most performant implementation, but is beyond the scope of the program

const gridDom = document.getElementsByClassName('grid')[0]
const divDom = document.createElement('div')

const render = universe => {
  gridDom.innerHTML = ''
  const cellsFrag = document.createDocumentFragment()

  universe.forEach(row => {
    row.forEach(cell => {
      const cellDom = divDom.cloneNode()
      cellDom.classList.add('cell')
      if (cell) cellDom.classList.add('alive')
      cellsFrag.appendChild(cellDom)
    })
  })

  gridDom.appendChild(cellsFrag)
}

/* DOM */

render(universe)

/**
 * Generate a list of neighbors of a cell
 * @param {number[]} cell Cell with coords m, n ([m, n])
 * @returns {number[][]} List of 8 neighbors of the cell (including 'invalid' ones)
 */
var getNeighbors = ([m, n]) => {
  const ops = [-1, 0, 1]
  // [[m-1, n-1], [m-1, n], [m-1, n+1], [m, n-1], [m, n+1], [m+1, n-1], [m+1, n], [m+1, n+1]]
  return ops.map(x => ops.map(y => [m + x, n + y])).flat().filter((v, i) => i === 4 ? false : true)
}

/**
 * Bind universe access indices to size of universe. Wrap larger/smaller values. 
 * @param {number} i Access index
 * 
 * @example
 * wrapIndex(-1) // 99
 * 
 * @example
 * wrapIndex(100) // 0
 * 
 */
const wrapIndex = i => {
  i %= GRID_SIZE
  if (i < 0) i += GRID_SIZE
  return i
}

/**
 * Given a cell, if it's not within the bounds of the universe, assume the top and bottom edges are stitched, and the left and right edges are stitched.
 * @param {number[]} cell Cell values 
 * @returns {number[]} 'Wrapped' cell
 */
const wrapCell = ([m, n]) => [wrapIndex(m), wrapIndex(n)]

// const isValid = ([m, n]) => m >= 0 && n >= 0 && m < GRID_SIZE && n < GRID_SIZE

/**
 * Given the state of a cell (dead or alive), and the number of live neighbors, determine it's next state
 * @param {boolean} alive Is cell alive? true or false
 * @param {number} liveNeighbors Number of live neighbors
 * @returns {boolean} Next state (alive?)
 */
const nextCellState = (alive, liveNeighbors) => {
  if (alive) {
    /**
     * If a live cell has fewer than two live neighbors, it dies of isolation
     * If a live cell has more than three live neighbors, it dies due to overpopulation
     * 
     */
    if (liveNeighbors < 2 || liveNeighbors > 3) return false
  } else {
    /**
     * If a dead cell has any but 3 live neighbors, it remains dead
     */
    if (!(liveNeighbors === 3)) return false
  }

  /**
    * If a dead cell has exactly 3 live neighbors, it becomes alive, as if by reproduction
    * If a live cell has 2 or 3 live neighbors), it lives on
   */
  return true
}

/**
 * Given a list of cells returns the number of live cells
 * @param {number[][]} cells List of cells
 * @returns {number} Number of live cells
 */
// const countAlive = cells => {
//   let alive = 0

//   cells.forEach(([m, n]) => {
//     if (universe[m][n]) alive += 1
//   })

//   return alive
// }

const countAlive = cells => cells.reduce((acc, [m ,n]) => universe[m][n] ? acc + 1 : acc, 0)

/**
 * Step? through a single generation of a universe
 * @param {number[][]} universe Game of life universe
 * @returns {number[][]} New universe
 */
const step = universe => universe.map((row, m) => row.map((cell, n) => {
  // get list of neighbors, and 'normalize' them
  const neighbors = getNeighbors([m, n]).map(wrapCell)
  // count live neighbors
  const alive = countAlive(neighbors)
  // get next state of cell, from cell state, and number of live neighbors
  return nextCellState(cell, alive)
}))

/**
 * Step through a generation of the universe, then re-render after PERIOD milliseconds
 * 
 */
const ticker = (_ => {
  const PERIOD = 250
  const tick = _ => {
    universe = step(universe)
    render(universe)
    setTimeout(tick, PERIOD)
  }
  setTimeout(tick, PERIOD)
})()

/**
 * TODO:
 * Consider: "If a toroidal array is used, a third buffer is needed so that the original state of the first line in the array can be saved until the last line is computed." ?
 */
