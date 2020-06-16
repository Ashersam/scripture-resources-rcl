import React, { useState, useCallback } from 'react';
import useEffect from 'use-deep-compare-effect';
import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import { ResourcesContext } from '../resources/Resources.context';

import { ScriptureTable } from '../../';
import { License } from '../license';
import { localString } from '../../core/localStrings';

function ParallelScripture({
  reference,
  quote,
  onQuote,
  occurrence,
  height,
  buttons,
}) {
  const [title, setTitle] = useState('');
  const [titles, setTitles] = useState([]);
  const [books, setBooks] = useState([]);
  const openLink = useCallback((link) => window.open(link, '_blank'), []);

  const { state: resources } = React.useContext(ResourcesContext);

  useEffect(() => {
    if (resources && resources[0] && resources[0].project) {
      const { title: _title } = resources[0].project;
      let ref = '';
      if (reference) {
        if (reference.chapter && reference.verse)
          ref = reference.chapter + ':' + reference.verse;
        else if (reference.chapter) ref = reference.chapter;
      }
      const __title = _title + ' ' + ref;
      setTitle(__title);
      const _titles = resources.map((resource) => {
        let _title = `Error: ${resource.resourceLink}`;
        if (resource.manifest) {
          const {
            manifest: {
              dublin_core: { title, version, rights },
            },
          } = resource;
          let branchOrTag = 'tag';
          if (resource.tag === 'master') {
            branchOrTag = 'branch';
          }
          const licenseLink =
            resource.config.server +
            '/' +
            resource.username +
            '/' +
            resource.repository +
            '/' +
            'src/' +
            branchOrTag +
            '/' +
            resource.tag +
            '/' +
            'LICENSE.md';
          let viewLicense = localString('ViewLicense') + ' ' + rights;
          let rightsIcon = (
            <License
              rights={viewLicense}
              licenseLink={licenseLink}
              style={{ fontSize: '1em', marginLeft: '0.1em' }}
            />
          );

          _title = (
            <Typography variant='caption'>
              {title} v{version}
              {rightsIcon}
            </Typography>
          );
        }
        return _title;
      });
      setTitles(_titles);
      const promises = resources.map((resource, index) =>
        resource.project.json()
      );
      Promise.all(promises).then(setBooks);
    }
  }, [resources, reference]);

  return (
    <>
      <ScriptureTable
        titles={titles}
        books={books}
        title={title}
        reference={reference}
        height={height}
        quote={quote}
        // onQuote={onQuote} // disable until round trip is working
        occurrence={occurrence}
        buttons={buttons}
      />
    </>
  );
}

ParallelScripture.propTypes = {
  /** the reference to scroll into view */
  reference: PropTypes.shape({
    bookId: PropTypes.string,
    chapter: PropTypes.number,
    verse: PropTypes.number,
  }),
  /** pass the quote in */
  quote: PropTypes.string.isRequired,
  /** callback to return the quote when selections made */
  onQuote: PropTypes.func,
  /** set the height to ensure rendering work properly   */
  height: PropTypes.string.isRequired,
};

export default ParallelScripture;
