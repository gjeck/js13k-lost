/**
  Returns a number whose value is limited to the given range.

  @param {Number} value The input to clamp
  @param {Number} min The lower boundary of the output range
  @param {Number} max The upper boundary of the output range
  @returns A number in the range [min, max]
  @type Number
*/
const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

/**
  Shuffles an array.

  @param {Array} array the input to shuffle
  @returns the array with its contents shuffled
  @type Array
*/
const shuffle = (array) => {
  let counter = array.length
  while (counter > 0) {
    let index = Math.floor(Math.random() * counter)
    counter -= 1
    let temp = array[counter]
    array[counter] = array[index]
    array[index] = temp
  }
  return array
}

/**
  Get a random integer between two values

  @param {Number} min inclusive minimum
  @param {Number} max exclusive maximum
  @returns An integer between min and max
  @type Number
*/
const randomIntInRange = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

export {
  clamp,
  shuffle,
  randomIntInRange
}
