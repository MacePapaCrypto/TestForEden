
// import dependencies
import Prism from 'prismjs';
import SoftBreak from 'slate-soft-break';
import stringify from 'remark-stringify';
import { unified } from 'unified';
import PasteLinkify from 'slate-paste-linkify';
import { withHistory } from 'slate-history';
import { slateToRemark } from 'remark-slate-transformer';
import { Box, useTheme } from '@mui/material';
import { Slate, Editable, withReact } from 'slate-react';
import { Text, Editor, Transforms, createEditor } from 'slate';
import React, { useMemo, useState, useCallback, useEffect } from 'react';

// eslint-disable-next-line
;Prism.languages.markdown=Prism.languages.extend("markup",{}),Prism.languages.insertBefore("markdown","prolog",{blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},code:[{pattern:/^(?: {4}|\t).+/m,alias:"keyword"},{pattern:/``.+?``|`[^`\n]+`/,alias:"keyword"}],title:[{pattern:/\w+.*(?:\r?\n|\r)(?:==+|--+)/,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#+.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^\*\*|^__|\*\*$|__$/}},italic:{pattern:/(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*_]|[*_]$/}},url:{pattern:/!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,inside:{variable:{pattern:/(!?\[)[^\]]+(?=\]$)/,lookbehind:!0},string:{pattern:/"(?:\\.|[^"\\])*"(?=\)$)/}}}}),Prism.languages.markdown.bold.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.italic.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.bold.inside.italic=Prism.util.clone(Prism.languages.markdown.italic),Prism.languages.markdown.italic.inside.bold=Prism.util.clone(Prism.languages.markdown.bold); // prettier-ignore

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
  // theme
  const theme = useTheme();

  // return leaf child
  return (
    <Box
      { ...attributes }

      sx={ {
        fontStyle      : leaf.italic ? 'italic' : null,
        fontWeight     : leaf.bold ? theme.typography.fontWeightMedium : null,
        textDecoration : leaf.underlined ? 'underline' : '',

        ...(leaf.code ? {
          color      : theme.palette.primary.main,
          padding    : theme.spacing(.25),
          fontFamily : 'monospace',
        } : {})
      } }
      component="span"
    >
      { children }
    </Box>
  );
};

// create element
const SlateElement = (props = {}) => {

  // return element
  return (
    <Box { ...props.attributes }>{ props.children }</Box>
  );
};

/**
 * nft post input
 *
 * @param props 
 */
const NFTPostInput = (props = {}) => {
  // editor
  const editor = useMemo(() => withMentions(withHistory(withReact(createEditor()))), []);

  // empty state
  const emptyState = [{
    type     : 'root',
    children : [{ text : '' }]
  }];

  // state
  const [value, setValue] = useState(emptyState);
  const [markdown, setMarkdown] = useState('');

  // plugins
  const plugins = [
    SoftBreak({
      shift : true,
    }),
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
      type     : 'root',
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
    const lines = val.map((item) => {
      // return
      return processor.stringify(processor.runSync(item));
    });

    // stringify
    const text = lines.join('');

    // check props
    setMarkdown(text);
  };

  // decorate
  const decorate = useCallback(([node, path]) => {
    // ragnes
    const ranges = [];

    // check is text
    if (!Text.isText(node)) {
      return ranges;
    }

    // get length
    const getLength = token => {
      if (typeof token === 'string') {
        return token.length;
      } else if (typeof token.content === 'string') {
        return token.content.length;
      } else {
        return token.content.reduce((l, t) => l + getLength(t), 0);
      }
    }

    // expound tokens
    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;

    // loop tokens
    for (const token of tokens) {
      // get length
      const length = getLength(token);
      const end = start + length;

      // add range
      if (typeof token !== 'string') {
        // push range
        ranges.push({
          focus  : {
            path,
            offset : end,
          },
          anchor : {
            path,
            offset : start,
          },
          [token.type] : true,
        });
      }

      // set start
      start = end;
    }

    // return ranges
    return ranges;
  }, []);

  // on key down
  const onKeyDown = (e) => {
    // on key up
    if (props.onKeyDown) props.onKeyDown(e);

    // check key code
    if (e.keyCode !== 13) return true;

    // check shift key
    if (e.shiftKey && props.onShiftEnter) {
      return props.onShiftEnter(e);
    }
    if (!e.shiftKey && props.onEnter) {
      return props.onEnter(e);
    }
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
        decorate={ decorate }
        onKeyDown={ (e) => onKeyDown(e) }
        renderLeaf={ renderLeaf }
        renderElement={ renderElement }
      />
    </Slate>
  );
};

// export input
export default NFTPostInput;