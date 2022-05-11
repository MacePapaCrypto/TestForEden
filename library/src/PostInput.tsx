
// import dependencies
import useId from './useId';
import stringify from 'remark-stringify';
import { unified } from 'unified';
import PasteLinkify from 'slate-paste-linkify';
import { slateToRemark } from 'remark-slate-transformer';
import { Box, useTheme } from '@mui/material';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { Text, Editor, Transforms, Range, createEditor } from 'slate';

// create withmentions hook
const withMentions = (editor) => {
  // is inline
  const { isInline, isVoid } = editor;

  // add is inline
  editor.isInline = element => {
    return ['mention', 'emoji'].includes(element.type) ? true : isInline(element);
  };

  // add is void
  editor.isVoid = element => {
    return ['mention', 'emoji'].includes(element.type) ? true : isVoid(element);
  };

  // return editor
  return editor;
};

// leaf
const SlateLeaf = ({ attributes, children, leaf }) => {

  // return leaf child
  return (
    <Box
      { ...attributes }

      sx={ {
        fontStyle      : leaf.italic ? 'italic' : null,
        fontWeight     : leaf.bold ? 'bold' : null,
        textDecoration : leaf.underlined ? 'underline' : '',
      } }
      component="span"
      className={ leaf.code ? 'pre' : null }>
      { children }
    </Box>
  );
};

// create element
const SlateElement = (props = {}) => {

  // return element
  return (
    <p { ...props.attributes }>{ props.children }</p>
  );
};

/**
 * nft post input
 *
 * @param props 
 */
const NFTPostInput = (props = {}) => {
  // theme
  const uuid = useId();
  const theme = useTheme();

  // editor
  const editor = useMemo(() => withMentions(withReact(createEditor())), []);

  // empty state
  const emptyState = [{
    type     : 'paragraph',
    children : [{ text : '' }]
  }];

  // state
  const [value, setValue] = useState(emptyState);
  const [markdown, setMarkdown] = useState('');

  // plugins
  const plugins = [
    PasteLinkify(),
  ];

  // use effect
  useEffect(() => {
    // check props
    if (props.onChange) props.onChange(markdown);
  }, [markdown]);

  // use effect
  useEffect(() => {
    // reset
    setValue([{
      type     : 'paragraph',
      children : [{ text : '' }]
    }]);
    setMarkdown('');

    // set embeds
    Transforms.select(editor, Editor.start(editor, []));
    
    // delete
    Transforms.delete(editor, {
      at : {
        focus  : Editor.end(editor, []),
        anchor : Editor.start(editor, []),
      },
    });
  }, [props.reset]);

  // render methods
  const renderLeaf = useCallback(props => <SlateLeaf { ...props } />, []);
  const renderElement = useCallback(props => <SlateElement { ...props } />, []);

  // handle update
  const handleUpdate = (val) => {
    // set value
    setValue(val);

    // to markdown
    const processor = unified().use(slateToRemark).use(stringify);

    // run processor
    const ast = processor.runSync({
      type     : 'root',
      children : val,
    });

    // stringify
    const text = processor.stringify(ast);

    // check props
    setMarkdown(text);
  };

  // on key down
  const onKeyDown = (e) => {
    // on key up
    if (props.onKeyDown) props.onKeyDown(e);

    // check key code
    if (e.keyCode !== 13) return true;

    // check shift key
    if (e.shiftKey && props.onShiftEnter) props.onShiftEnter(e);
    if (!e.shiftKey && props.onEnter) props.onEnter(e);
  };

  // return jsx
  return (
    <Slate
      autoFocus
      
      value={ value }
      editor={ editor }
      onChange={ handleUpdate }
    >
      <Editable
        autoFocus
        onBlur={ () => props.onBlur() }
        plugins={ plugins }
        onFocus={ () => props.onFocus() }
        onKeyDown={ (e) => onKeyDown(e) }
        renderLeaf={ renderLeaf }
        renderElement={ renderElement }
      />
    </Slate>
  );
};

// export input
export default NFTPostInput;