
// import react
import Add from '@mui/icons-material/Add';
import More from '@mui/icons-material/MoreVert';
import Logo from './assets/logo.png';
import Link from './Link';
import useAuth from './useAuth';
import useBrowse from './useBrowse';
import useContexts from './useContexts';
import useSegments from './useSegments';
import LoadingButton from '@mui/lab/LoadingButton';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, MenuList, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Box, Stack, Avatar, Tooltip, Divider, useTheme, IconButton, CircularProgress, Typography, Button, TextField } from '@mui/material';

// sidebar item
import ScrollBar from './ScrollBar';
import SideBarContext from './SideBarContext';
import SideBarSegment from './SideBarSegment';

// global context
let timeout;
let dragging;
let grouping;

// nft sidebar
const NFTSideBar = (props = {}) => {
  // theme
  const auth = useAuth();
  const theme = useTheme();
  const browse = useBrowse();
  const segment = useSegments();
  const context = useContexts({
    context : browse.context?.id,
    segment : browse.segment?.id,
  });

  // state
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(new Date());
  const [creating, setCreating] = useState(null);
  const [contextName, setContextName] = useState('');
  const [segmentName, setSegmentName] = useState('');

  // set dragging
  const setDragging = (d) => {
    // check return
    if (d?.id === dragging?.id) return;
    
    // set
    dragging = d;
    setUpdated(new Date());
  };
  const setGrouping = (g) => {
    // check return
    if (g?.id === grouping?.id) return;
    
    // set
    grouping = g;
    setUpdated(new Date());
  };

  // open
  const toggleGroupOpen = (group) => {
    // update
    segment.update({
      ...group,

      open : group.open ? false : new Date(),
    });
  };

  // set drag place
  const setDragPlace = (id, parent, order) => {
    // check dragging
    if (!dragging) return;

    // get actual dragging
    const actualDragging = segment.segments.find((seg) => seg.id === dragging.id);

    // check dragging again
    if (!actualDragging) return;

    // is group
    const over    = segment.segments.find((seg) => seg.id === id);
    const aParent = segment.segments.find((g) => g.id === parent)?.type === 'group' ? segment.segments.find((g) => g.id === parent) : null;

    // check default variables
    if (actualDragging.id === id) return;
    if (actualDragging.id === parent) return;
    if (actualDragging.parent === parent && actualDragging.order === order) return;

    // clear timeout
    clearTimeout(timeout);
    
    // debounce
    timeout = setTimeout(() => {
      // check default variables
      if (actualDragging.id === id) return;
      if (actualDragging.id === parent) return;
      if (grouping && (grouping.id === parent)) return;
      if (actualDragging.parent === parent && actualDragging.order === order) return;

      // set order
      actualDragging.order = order;

      // check over
      if (!aParent && over?.type !== 'group' && parent) {
        // grouping over
        actualDragging.parent = over.id;
        setGrouping(over);
      } else {
        // not grouping
        setGrouping(null);

        // set parent
        if (aParent && over?.type !== 'group') {
          actualDragging.parent = aParent.id;
        } else if (over?.type === 'group' && parent) {
          actualDragging.parent = over.id;
        } else {
          actualDragging.parent = null;
        }
      }

      // update
      segment.update(actualDragging, false);

      // which to update
      setUpdated(new Date());
    }, parent && !aParent ? 500 : 1);
  };

  // save drag place
  const saveDragPlace = async () => {
    // clear timeout
    clearTimeout(timeout);

    // laoding
    setLoading(true);

    // create group if grouping
    if (grouping) {
      // create
      const tempGroup = await segment.create({
        type  : 'group',
        order : grouping.order,
      });

      // set parents
      grouping.parent = tempGroup.id;
      dragging.parent = tempGroup.id;
      dragging.order  = grouping.order + .5;
    }

    // @todo remove groups with 1 item

    // new groups
    segment.segments.sort((a, b) => {
      // sort
      if ((a.order || 0) > (b.order || 0)) return 1;
      if ((a.order || 0) < (b.order || 0)) return -1;
      return 0;
    }).forEach((item, order) => {
      item.order = order;
    });

    // promise all
    await segment.updates(segment.segments);

    // set updated
    setLoading(false);
    setDragging(null);
    setGrouping(null);
  };

  // on add
  const onCreate = (type = 'segment') => {
    // check add
    if (!auth.account) {
      // login
      return auth.login();
    }

    // launch modal
    setCreating(type);
  };

  // on submit create
  const onSubmitCreate = async (type = 'segment') => {
    // base
    const base = type === 'segment' ? segment : context;
    const name = type === 'segment' ? segmentName : contextName;
  
    // try/catch
    try {
      // create
      await base.create({
        name,
      });
    } catch (e) {}

    // set done
    setCreating(null);
  };

  // get sorted parts
  const getSortedSidebar = () => {
    // sort
    return segment.segments.sort((a, b) => {
      // order
      const aO = a.order || 0;
      const bO = b.order || 0;
  
      // return
      if (aO < bO) return -1;
      if (aO > bO) return 1;
      return 0;
    }).filter((s) => !s.parent);
  };

  // return jsx
  return (
    <>
      <Box sx={ {
        top           : 0,
        width         : browse.segment ? theme.spacing(40) : theme.spacing(10),
        height        : '100vh',
        display       : 'flex',
        position      : 'sticky',
        background    : `rgba(0,0,0,0.2)`,
        transition    : 'all 0.2s ease',
        flexDirection : 'row',

        ...(props.sx || {}),
      } }>
        <Box width={ theme.spacing(10) } display="flex" height="100vh">
          <ScrollBar isFlex>
            <Stack spacing={ 1 } sx={ {
              px        : theme.spacing(2),
              py        : theme.spacing(2),
              minHeight : `100%`,
            } }>
              <Box sx={ {
                cursor : 'pointer',
              } } onClick={ () => browse.setSegment(null) }>
                <Tooltip title="Home" placement="right">
                  <Link to="/">
                    <Avatar sx={ {
                      width  : theme.spacing(6),
                      height : theme.spacing(6),
                    } } src={ Logo } />
                  </Link>
                </Tooltip>
              </Box>

              <Divider />

              { !!browse.segment && !segment.segments.find((s) => s.id === browse.segment.id) && (
                <>
                  <SideBarSegment
                    item={ browse.segment }

                    active={ browse.segment }
                    loading={ segment.loading }

                    onActive={ browse.setSegment }
                    isActive

                  />

                  <Divider />
                </>
              ) }
              
              <DndProvider backend={ HTML5Backend }>
                { getSortedSidebar().map((child) => {
                  // return jsx
                  return (
                    <SideBarSegment
                      key={ child.id }
                      item={ child }

                      active={ browse.segment }
                      loading={ segment.loading }
                      segments={ segment.segments || [] }

                      onActive={ browse.setSegment }
                      setPlace={ setDragPlace }
                      dragging={ dragging }
                      grouping={ grouping }
                      isActive={ browse.segment?.id === child.id }
                      savePlace={ saveDragPlace }
                      isLoading={ segment.loading === child.id }
                      isGrouping={ grouping?.id === child.id }
                      isDragging={ !!dragging }
                      toggleOpen={ toggleGroupOpen }
                      setDragging={ setDragging }
                      isDraggable

                    />
                  );
                }) }
              </DndProvider>

              { !!segment.segments?.length && (
                <Divider />
              ) }

              <Box sx={ {
                cursor : 'pointer',
              } } onClick={ () => loading || auth.loading || segment.loading ? undefined : onCreate() }>
                <Tooltip title="Add Segment" placement="right">
                  <Avatar sx={ {
                    width      : theme.spacing(6),
                    height     : theme.spacing(6),
                    bgcolor    : `rgba(255,255,255,0.1)`,
                    transition : `all 0.2s ease`,

                    '&:hover' : {
                      bgcolor : theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600],
                    },
                    '& .MuiCircularProgress-svg' : {
                      color : `${theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600]}!important`,
                    }
                  } }>
                    { loading || auth.loading || segment.loading ? (
                      <CircularProgress size={ 20 } thickness={ 5 } />
                    ) : (
                      <Add />
                    ) }
                  </Avatar>
                </Tooltip>
              </Box>
            </Stack>
          </ScrollBar>
        </Box>
        <Box sx={ {
          width      : browse.segment ? theme.spacing(30) : '0px',
          opacity    : browse.segment ? 1 : 0,
          overflow   : 'hidden',
          transition : 'all 0.2s ease',
        } }>
          <Box sx={ {
            px     : theme.spacing(2),
            py     : theme.spacing(2),
            width  : theme.spacing(30),
            height : '100vh',
          } }>
            <Stack spacing={ 1 }>
              <Box height={ theme.spacing(6) } display="flex" alignItems="center" flexDirection="row">
                <Link to={ `/s/${browse.segment?.id}` } sx={ {
                  color  : theme.palette.text.primary,
                  cursor : 'pointer',
                } }>
                  <Typography variant="subtitle1" fontWeight="bold">
                    { browse.segment?.name }
                  </Typography>
                </Link>
                <IconButton
                  sx={ {
                    marginLeft : 'auto',
                  } }
                  color="inherit"
                >
                  <More />
                </IconButton>
              </Box>

              <Divider />

              { context.loading === true ? (
                <Box py={ 3 } display="flex" flexDirection="row" alignItems="center" justifyContent="center">
                  <CircularProgress />
                </Box>
              ) : (
                <MenuList>
                  { (context.contexts || []).map((child) => {
                    // return jsx
                    return (
                      <SideBarContext
                        key={ child.id }
                        item={ child }

                        active={ browse.context }
                        loading={ context.loading }
                        contexts={ context.contexts || [] }

                        onActive={ browse.setContext }
                        setPlace={ setDragPlace }
                        dragging={ dragging }
                        grouping={ grouping }
                        isActive={ browse.context?.id === child.id }
                        savePlace={ saveDragPlace }
                        isLoading={ context.loading === child.id }
                        isGrouping={ grouping?.id === child.id }
                        isDragging={ !!dragging }
                        toggleOpen={ toggleGroupOpen }
                        setDragging={ setDragging }
                        isDraggable
                        
                      />
                    );
                  }) }
                  
                  { !!context.contexts?.length && (
                    <Box my={ 1 } component={ Divider } />
                  ) }

                  <MenuItem onClick={ () => setCreating('context') }>
                    <ListItemIcon>
                      <Add />
                    </ListItemIcon>
                    <ListItemText>
                      Create Channel
                    </ListItemText>
                  </MenuItem>
                </MenuList>
              ) }

            </Stack>
          </Box>
        </Box>
      </Box>

      <Dialog open={ creating === 'context' } onClose={ () => setCreating(null) } fullWidth maxWidth="xs">
        <DialogTitle>
          Create Channel
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Channel Name"
            value={ contextName }
            onChange={ (e) => setContextName(e.target.value) }
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={ () => setCreating(null) }
            disabled={ !!context?.loading }
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={ () => onSubmitCreate('context') }
            loading={ context.loading }
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={ creating === 'segment' } onClose={ () => setCreating(null) } fullWidth maxWidth="xs">
        <DialogTitle>
          Create Stream
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Stream Name"
            value={ segmentName }
            onChange={ (e) => setSegmentName(e.target.value) }
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={ () => setCreating(null) }
            disabled={ !!segment?.loading }
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={ () => onSubmitCreate('segment') }
            loading={ segment.loading }
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

// export default
export default NFTSideBar;