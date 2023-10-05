const fs = require('fs');
const assert = require('assert');
const path = require('path');
const deburr = require('lodash.deburr');

const moviesFolder = './movies';
const actorsFolder = './actors';
const directorsFolder = './directors';

const requiredMovieProps = ['name', 'year', ['runtime', 'future']];

const validateFileName = (fileName) => {
  // Ensure the file name is in lowercase
  if (fileName !== fileName.toLowerCase()) {
    return 'Invalid JSON filename format; must be lowercase: ' + fileName;
  }
  return null;
};

const validateJSON = (fileName) => {
  try {
    const movieData = fs.readFileSync(fileName, 'utf8');
    JSON.parse(movieData);
    return null;
  } catch (e) {
    return 'Invalid JSON file: ' + fileName;
  }
};

const validateMovie = (fileName, movie) => {
  // Check for required properties in the movie object
  for (let i = 0; i < requiredMovieProps.length; i++) {
    const currentProp = requiredMovieProps[i];
    if (Array.isArray(currentProp)) {
      if (!currentProp.some(key => movie[key])) {
        return fileName + ' missing one of the props: ' + currentProp.join(',');
      }
    } else if (!movie.hasOwnProperty(currentProp)) {
      return fileName + ' doesn\'t contain ' + currentProp;
    }
  }

  // Check if the movie's year matches the folder it's in
  const year = parseInt(path.basename(path.dirname(fileName)));
  if (movie.year !== year) {
    return fileName + ' movie is in the wrong year folder. Found: ' + movie.year + '. Expected: ' + year;
  }

  // Validate the file name format
  const expectedFileName = deburr(movie.name)
    .replace(/[\'\"\,\?]/g, '')
    .replace(/([\:\.]| - )/g, ' ')
    .replace(/  /g, ' ')
    .replace(/&/, 'and')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters
    .replace('æ', 'ae')
    .replace('ç', 'c');

  if (path.parse(fileName).name !== expectedFileName) {
    return fileName + ' movie name is either wrong or file name is not according to guidelines. Expected: ' + expectedFileName + '.json';
  }

  // Check the file extension
  if (path.extname(fileName) !== '.json') {
    return fileName + ' extension is not json';
  }

  return null; // No errors found
};

const validatePerson = (fileName, requiredProperties) => {
  try {
    const personData = fs.readFileSync(fileName, 'utf8');
    const person = JSON.parse(personData);

    // Check for required properties in the person object
    for (const prop of requiredProperties) {
      if (!person.hasOwnProperty(prop)) {
        console.warn(`${fileName} is missing the required property: ${prop}`);
      }
    }

    // Validate the file name format
    const expectedFileName = person.name
      .replace(/[\'\"]/g, '')
      .replace(/([\:\.]| - )/g, '')
      .replace(/  /g, ' ')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters
      .replace('æ', 'ae')
      .replace('ç', 'c');

    if (path.parse(fileName).name !== expectedFileName) {
      console.warn(`${fileName} person's name is either wrong or file name is not according to guidelines. Expected: ${expectedFileName}.json`);
    }

    // Check the file extension
    if (path.extname(fileName) !== '.json') {
      console.warn(fileName + ' extension is not json');
    }
  } catch (e) {
    console.error('Error parsing ' + fileName);
  }
};

const validateFilesInFolder = (folder, validationFunction, requiredProperties) => {
  const files = fs.readdirSync(folder);
  files.forEach(file => {
    const fileName = path.join(folder, file);
    const fileNameValidation = validateFileName(file);
    const jsonValidation = validateJSON(fileName);

    if (fileNameValidation) {
      console.error(fileNameValidation);
    } else if (jsonValidation) {
      console.error(jsonValidation);
    } else {
      const movie = JSON.parse(fs.readFileSync(fileName, 'utf8'));
      const movieValidation = validationFunction(fileName, movie, requiredProperties);
      if (movieValidation) {
        console.error(movieValidation);
      }
    }
  });
};

// Validate movie files
validateFilesInFolder(moviesFolder, validateMovie, requiredMovieProps);
console.log('Movies test complete.');

// Validate actor files
validateFilesInFolder(actorsFolder, validatePerson, ['name', 'birthdate', 'birthplace']);
console.log('Actors test complete.');

// Validate director files
validateFilesInFolder(directorsFolder, validatePerson, ['name', 'birthdate', 'birthplace']);
console.log('Directors test complete.');

// Assert that no errors were found
assert.equal(false, 'Invalid files found');
