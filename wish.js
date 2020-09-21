const odds = {
  5: {
    chance: 0.006,
    totalEntries: 15, // this is the number of entries in the corresponding # of stars
    pity: 90,
  },
  4: {
    chance: 0.051,
    totalEntries: 32,
    pity: 10,
  },
  3: {
    chance: 1,
    totalEntries: 1,
  },
}

const characters = {
  5: ['keqing', 'mona', 'qiqi', 'diluc', 'jean'],
  4: [
    'sucrose',
    'chongyun',
    'noelle',
    'bennett',
    'fischl',
    'ningguang',
    'xingqiu',
    'beidou',
    'xiangling',
    'amber',
    'razor',
    'kaeya',
    'barbara',
    'lisa',
  ],
  3: [],
}

/**
 * type Outcome = {
 *   type: 'character' | 'weapon',
 *   rarity: 5 | 4 | 3,
 *   name: string | undefined,
 *   pity: boolean,
 * }
 */

const pity = {
  5: 0,
  4: 0,
}
const evalOrder = [5, 4, 3]

function rollWish() {
  const val = Math.random()
  pity[5]++;
  pity[4]++
  for (const star of evalOrder) {
    const params = odds[star]
    let hit = val < params.chance
    let isPity = false
    if (!hit && params.pity) {
      if (pity[star] >= params.pity) {
        hit = true
        isPity = true
      }
    }
    if (hit) {
      pity[star] = 0
      const charactersToPickFrom = characters[star]
      const isChar =
        Math.random() < charactersToPickFrom.length / params.totalEntries
      if (!isChar) {
        return {
          type: 'weapon',
          rarity: star,
          pity: isPity,
        }
      } else {
        return {
          type: 'character',
          rarity: star,
          name:
            charactersToPickFrom[
              Math.floor(Math.random() * charactersToPickFrom.length)
            ],
          pity: isPity,
        }
      }
    }
  }

  throw new Error('should never get here')
}

function resultSort(a, b) {
  if (a.type !== b.type) {
    return a.type.localeCompare(b.type)
  }
  return b.rarity - a.rarity
}

function rollX(x) {
  const count = Number(x)
  const output = []
  for (let i = 0; i < count; i++) {
    const wish = rollWish()
    updateStatWithResult(wish)
    output.push(wish)
  }

  output.sort(resultSort)
  animateResults(output)

  return output
}

function animateResults(results) {
  const container = document.getElementById('display-container')
  container.className = ''
  if (results.length > 10) {
    results = results.slice(results.length - 10)
  }

  const resultDivs = results.map(
    (x) =>
      `<div class="result rare-${x.rarity}">
      <div class="image-holder image-${
        x.type === 'weapon' ? 'weapon' : x.name
      }"></div>
      </div>`,
  )
  container.innerHTML = resultDivs.join('')

  let offset = 0
  let current = container.firstChild
  while (current) {
    const target = current
    setTimeout(() => {
      target.className += ' slide-in'
    }, ++offset * 50)
    current = current.nextSibling
  }
}

const stats = {
  rolls: 0,
  results: {},
  pities: {
    5: 0,
    4: 0,
  },
}

function updateStatWithResult(result) {
  stats.rolls++
  const clone = Object.assign({}, result)
  const pity = result.pity
  delete clone.pity
  const key = JSON.stringify(clone)
  if (stats.results.hasOwnProperty(key)) {
    stats.results[key]++
  } else {
    stats.results[key] = 1
  }
  if (pity) {
    stats.pities[result.rarity]++
  }
}

function updateStats() {
  const elem = document.getElementById('stats')
  const results = Object.entries(stats.results).map((x) => ({
    key: JSON.parse(x[0]),
    count: x[1],
  }))
  results.sort((a, b) => resultSort(a.key, b.key))

  const resultLines = results.map(
    (x) =>
      `${x.count} x ${x.key.rarity}* ${
        x.key.type === 'character' ? x.key.name : 'weapon'
      }`,
  )
  const lines = [
    'Obtained: ',
    ...resultLines,
    `over ${stats.rolls} rolls`,
    `with ${stats.pities[5]} x 5* pities and ${stats.pities[4]} x 4* pities`,
  ]

  elem.innerHTML = lines.join('<br />')
}

function reset() {
  pity[5] = 0
  pity[4] = 0
  stats.rolls = 0
  stats.results = {}
  stats.pities[5] = 0
  stats.pities[4] = 0
  document.getElementById('stats').innerHTML = ''
  document.getElementById('display-container').innerHTML = ''
}
