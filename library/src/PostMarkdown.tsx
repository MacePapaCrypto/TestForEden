import React from 'react';
import markdown from 'simple-markdown';
import { Box, useTheme } from '@mui/material';

// post markdown
const NFTPostMarkdown = (props = {}) => {
  // theme
  const theme = useTheme();
  
  // return object
  const mdRules = {
    // default
    u : markdown.defaultRules.u,
    text : markdown.defaultRules.text,
    escape : markdown.defaultRules.escape,
    newline : markdown.defaultRules.newline,
    
    // code block
    codeBlock : {
      ...markdown.defaultRules.codeBlock,

      match : markdown.inlineRegex(/^```(([a-z0-9-]+?)\n+)?\n*([^]+?)\n*```/i),
      parse : (capture, parse, state) => {
        return {
          lang : (capture[2] || '').trim(),
          content : capture[3] || '',
          inQuote : state.inQuote || false
        };
      },
      react : (node, output, state) => {
        return (
          <Box className="js" key={ state.key }>
            { node.content }
          </Box>
        );
      }
    },

    // autolink
    autolink : {
      ...markdown.defaultRules.autolink,

      parse : (capture) => {
        return {
          content : [{
            type : 'text',
            content : capture[1],
          }],
          target : capture[1],
        };
      },
      react : (node, output, state) => (
        <Box component="a" href={ markdown.sanitizeUrl(node.target) } key={ state.key } sx={ {
          color          : theme.palette.primary.main,
          textDecoration : 'none',
        } } target="_BLANK">
          { output(node.content, state) }
        </Box>
      )
    },

    // normal url
    url : {
      ...markdown.defaultRules.url,

      parse : capture => {
        return {
          content : [{
            type : 'text',
            content : capture[1],
          }],
          target : capture[1],
        };
      },
      react : (node, output, state) => (
        <Box component="a" href={ markdown.sanitizeUrl(node.target) } key={ state.key } sx={ {
          color          : theme.palette.primary.main,
          textDecoration : 'none',
        } } target="_BLANK">
          { output(node.content, state) }
        </Box>
      )
    },

    // inline code
    inlineCode : {
      ...markdown.defaultRules.inlineCode,

      match : (source) => markdown.defaultRules.inlineCode.match.regex.exec(source),
      react : (node, output, state) => {
        // return code
        return (
          <Box component="span" sx={ {
            color      : theme.palette.primary.main,
            padding    : theme.spacing(.25),
            fontFamily : 'monospace',
          } } key={ state.key }>
            { node.content }
          </Box>
        );
      }
    },

    // italics
    em : {
      ...markdown.defaultRules.em,

      parse : (capture, parse, state) => {
        const parsed = markdown.defaultRules.em.parse(capture, parse, Object.assign({ }, state, { inItalics : true }));
        return state.inItalics ? parsed.content : parsed;
      },
      react : (node, output, state) => (
        <Box component="span" sx={ {
          fontStyle : 'italic',
        } } key={ state.key }>
          { output(node.content, state) }
        </Box>
      )
    },

    // boldish
    strong : {
      ...markdown.defaultRules.strong,

      parse : (capture, parse, state) => {
        const parsed = markdown.defaultRules.strong.parse(capture, parse, Object.assign({ }, state, { inStrong : true }));
        return state.inStrong ? parsed.content : parsed;
      },
      react : (node, output, state) => (
        <Box component="span" sx={ {
          fontWeight : theme.typography.fontWeightMedium,
        } } key={ state.key }>
          { output(node.content, state) }
        </Box>
      )
    },

    // greentext
    bluetext : {
      order : -2,
      match : markdown.inlineRegex(/^([\\]?<)[^\n]+/i),
      parse : (capture, parse, state) => {
        // return jsx
        return {
          type    : 'bluetext',
          content : [{
            type    : 'text',
            content : capture[0][0] === '\\' ? capture[0].substring(1) : capture[0],
          }],
        };
      },
      react : (node, output, state) => (
        <Box component="span" sx={ {
          color : theme.palette.info.main,
        } } key={ state.key }>
          { output(node.content, state) }
        </Box>
      )
    },

    // greentext
    greentext : {
      order : -1,
      match : markdown.inlineRegex(/^([\\]?>)[^\n]+/i),
      parse : (capture, parse, state) => {
        // return jsx
        return {
          type    : 'greentext',
          content : [{
            type    : 'text',
            content : capture[0][0] === '\\' ? capture[0].substring(1) : capture[0],
          }],
        };
      },
      react : (node, output, state) => (
        <Box component="span" sx={ {
          color : theme.palette.success.main,
        } } key={ state.key }>
          { output(node.content, state) }
        </Box>
      )
    },
    
    // strike
    br : {
      ...markdown.defaultRules.br,

      match : markdown.anyScopeRegex(/^\n/),
    },
    strike : {
      ...markdown.defaultRules.del,

      match : markdown.inlineRegex(/^[\\]?~~([\s\S]+?)~~(?!_)/),
    },
  };

  // state
  const state = {
    inline : true,
    inQuote : false
  };

  // parser
  const parser = markdown.parserFor(mdRules);
  const reactOutput = markdown.reactFor(markdown.ruleOutput(mdRules, 'react'));

  // return
  return reactOutput(parser(props.content, state), state);
};

// export default
export default NFTPostMarkdown;