import Path from 'path';
import * as resources from './resources';

/* TODO:
  remove hardcoded username and languageId
  pass directly through components
*/
const username = 'unfoldingword';
const languageId = 'en'
const repositories = resources.resourceRepositories({languageId});

export const parseSenses = ({lexiconMarkdown}) => {
  let uniqueSenses = [];
  if (lexiconMarkdown) {
    let senses = [];
    const sensesSection = lexiconMarkdown.split(/##\s*Senses/)[1];
    const senseSections = sensesSection.split(/###\s*Sense/).splice(1);
    senseSections.forEach(senseSection => {
      const definitionRegexp = /####\s*Definitions?.*?[\n\s]+(.*?)\n/;
      const glossRegexp = /####\s*Glosse?s?.*?[\n\s]+(.*?)\n/;
      let definition = definitionRegexp.test(senseSection) ? definitionRegexp.exec(senseSection)[1] : null;
      definition = (!/#/.test(definition)) ? definition : null;
      let gloss = glossRegexp.test(senseSection) ? glossRegexp.exec(senseSection)[1] : null;
      gloss = (!/#/.test(gloss)) ? gloss : null;
      const sense = {
        definition: definition,
        gloss: gloss,
      };
      senses.push(sense);
    });
    uniqueSenses = unique({array: senses});
  }
  return uniqueSenses;
};

export async function senses({strong}) {
  let senses, repository, path;
  if (/H\d+/.test(strong)) {
    repository = repositories.uhal;
    const _strong = strong.match(/H\d+/)[0];
    path = Path.join('content', _strong + '.md');
  }
  if (/G\d+/.test(strong)) {
    repository = repositories.ugl;
    path = Path.join('content', strong, '01.md');
  }
  if (repository && path) {
    const lexiconMarkdown = await resources.getFile({username, repository, path});
    senses = parseSenses({lexiconMarkdown});
  }
  if (!senses) throw(Error(`Could not find sense info for: ${strong}`));
  return senses;
};

export const unique = ({array, response=[]}) => {
  let _array = array;
  array.forEach(object => {
    _array = _array.filter(_object =>
      !(object.gloss === _object.gloss && object.definition === _object.definition)
    );
    _array.push(object);
  });
  return _array;
}
