import React, { useCallback } from "react";
import PropTypes from 'prop-types';
import deepFreeze from 'deep-freeze';
import useEffect  from 'use-deep-compare-effect';

import * as helpers from './helpers';

function useSelections({
  selections,
  onSelections,
  occurrence,
  quote,
  onQuote,
  verseObjects,
}) {

  useEffect(() => {
    console.log("useEffect/1")
    const _selections = helpers.selectionsFromQuote({
      quote,
      verseObjects,
      occurrence,
    });

    update(_selections);
  }, [quote, occurrence, verseObjects]);

  useEffect(() => {
    console.log("useEffect/2")
    if (verseObjects && onQuote) {
      const _quote = helpers.quoteFromVerse({selections, verseObjects});
      onQuote(_quote);
    }
  }, [selections, onQuote, verseObjects]);

  const update = useCallback((_selections) => {
    // the "parsify" function is expecting an array of stringified objects
    // it will return an array of the parsed objects
    // const parsify = (array) => array.map(string => JSON.parse(string));
    // However, at present, some of the array elements are objecs, 
    // not strings. This causes the parse to fail. At present, it is
    // unknown where the mixed bag of an array is created.
    // So let's deal with it here.
    let _selectionsParsified = [];
    for (let i=0; i < _selections.length; i++) {
      try {
        let x = JSON.parse(_selections[i]);
        _selectionsParsified.push(x);
      } catch (error) {
        _selectionsParsified.push(_selections[i]);
      }

    }
    //const __selections = _selections && deepFreeze(parsify(_selections));
    const __selections = _selections && deepFreeze(_selectionsParsified);
    onSelections(__selections);
  }, [onSelections]);

  const isSelected = (word) => helpers.isSelected({word, selections});

  const areSelected = (words) => helpers.areSelected({words, selections});

  const addSelection = (word) => {
    let _selections = helpers.addSelection({word, selections});
    update(_selections);
  };

  const addSelections = (words) => {
    let _selections = helpers.addSelections({words, selections});
    update(_selections);
  };

  const removeSelection = (word) => {
    const _selections = helpers.removeSelection({word, selections});
    update(_selections);
  };

  const removeSelections = (words) => {
    let _selections = helpers.removeSelections({words, selections});
    update(_selections);
  };

  return {
    state: selections,
    actions: {
      update,
      isSelected,
      areSelected,
      addSelection,
      addSelections,
      removeSelection,
      removeSelections,
    },
  };
};

useSelections.propTypes = {
  /** words in a selection */
  selections: PropTypes.array,
  /** action taken after a selection is made */
  onSelections: PropTypes.func.isRequired,
  /** the quote to be selected */
  quote: PropTypes.string.isRequired,
  /** the verses where quote may be found */
  verseObjects: PropTypes.array,
  /** if quote occurs mulitple times, this is the occurence of the one selected */
  occurrence: PropTypes.number,
  /** action taken when quote is provided */
  onQuote: PropTypes.func,
};

export default useSelections;
