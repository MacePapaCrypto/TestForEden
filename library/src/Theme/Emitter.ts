
// emitter
import mainTheme from './index';
import { EventEmitter } from 'events';

// debouncer
const timeouts = {};
const promises = {};

/**
 * theme emitter class
 */
export default class ThemeEmitter extends EventEmitter {
  // public variables
  public themes    = [];
  public shortcuts = [];

  // cache timeout
  private socket  = null;
  private timeout = 60 * 1000;
  private current = {};

  // getter/setter
  private __theme   = null;
  private __loading = null;
  private __updated = null;

  /**
   * constructor
   *
   * @param props 
   */
  constructor(props = {}) {
    // run super
    super();

    // bind
    this.props = this.props.bind(this);
    this.getTheme = this.getTheme.bind(this);
    this.emitTheme = this.emitTheme.bind(this);
    this.listThemes = this.listThemes.bind(this);
    this.chooseTheme = this.chooseTheme.bind(this);
    this.updateTheme = this.updateTheme.bind(this);
    this.createTheme = this.createTheme.bind(this);
    this.deleteTheme = this.deleteTheme.bind(this);
    this.emitThemeRemove = this.emitThemeRemove.bind(this);

    // set props
    this.props(props);
  }

  /**
   * set props
   *
   * @param props 
   */
  props(props = {}) {
    // set cache timeout
    this.auth    = props.auth || this.auth;
    this.socket  = props.socket || this.socket;
    this.timeout = props.timeout || props.cache || this.timeout;

    // useEffect stuff
    if (typeof props.auth !== 'undefined' && props.auth?.account !== this.current.auth?.account) {
      // set current
      this.current = props;

      // load from socket
      this.listThemes();
  
      // on connect
      this.socket.on('theme', this.emitTheme);
      this.socket.on('connect', this.listThemes);
      this.socket.on('theme+remove', this.emitThemeRemove);
  
      // done
      return () => {
        // off connect
        this.socket.off('theme', this.emitTheme);
        this.socket.off('connect', this.listThemes);
        this.socket.off('theme+remove', this.emitThemeRemove);
      };
    }

    // set current
    this.current = props;
  }

  /**
   * get state
   */
  public get state() {
    // return state
    return {
      get    : this.getTheme,
      list   : this.listThemes,
      choose : this.chooseTheme,
      update : this.updateTheme,
      create : this.createTheme,
      delete : this.deleteTheme,

      theme   : this.theme,
      themes  : this.themes,
      default : mainTheme,
    };
  }

  /**
   * get theme
   */
  get theme() {
    // return got
    return this.__theme;
  }

  /**
   * set theme
   */
  set theme(theme) {
    // check date
    const shouldUpdate = theme?.id !== this.__theme?.id;

    // set theme
    this.__theme = theme;

    // check id
    if (shouldUpdate) {
      // emit
      this.emit('theme', theme);
    }
  }

  /**
   * get theme
   */
  get updated() {
    // return got
    return this.__updated;
  }

  /**
   * set updated
   */
  set updated(updated) {
    // check date
    const shouldUpdate = updated !== this.__updated;

    // set updated
    this.__updated = updated;

    // check id
    if (shouldUpdate) {
      // emit
      this.emit('updated', this.__updated);
    }
  }

  /**
   * get theme
   */
  get loading() {
    // return got
    return this.__loading;
  }

  /**
   * set updated
   */
  set loading(loading) {
    // check date
    const shouldUpdate = loading !== this.__loading;

    // set updated
    this.__loading = loading;

    // check id
    if (shouldUpdate) {
      // emit
      this.emit('loading', this.__loading);
    }
  }

  
  ////////////////////////////////////////////////////////////////////////
  //
  // MISC FUNCTIONALITY
  //
  ////////////////////////////////////////////////////////////////////////

  /**
   * debounce function
   *
   * @param key 
   * @param fn 
   * @param to 
   */
  debounce (key, fn, to = 500) {
    // clear
    clearTimeout(timeouts[key]);
  
    // get resolver
    let [promise, resolver] = promises[key] || [];
  
    // if no promise
    if (!promise || !resolver) {
      // create new promise
      promise = new Promise((resolve) => {
        resolver = resolve;
      });
  
      // set
      promises[key] = [promise, resolver];
    }
  
    // set timeout
    timeouts[key] = setTimeout(async () => {
      // execute debounce function
      const result = await fn();
  
      // resolve
      resolver(result);
  
      // delete
      delete promises[key];
    }, to);
  
    // return promise
    return promise;
  }


  ////////////////////////////////////////////////////////////////////////
  //
  // DESKTOP FUNCTIONALITY
  //
  ////////////////////////////////////////////////////////////////////////

  /**
   * get theme
   *
   * @param id 
   * @returns 
   */
  async getTheme(id) {
    // check found
    if (!id) return;

    // check found
    const found = this.themes.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendTheme = await this.socket.get(`/theme/${id}`);

    // return backend theme
    return backendTheme;
  }

  /**
   * list themes
   *
   * @returns 
   */
  async listThemes() {
    // check socket
    if (!this.socket || !this.auth?.account) return;

    // loading
    this.loading = 'themes';

    // loaded
    let loadedThemes = [];

    // try/catch
    try {
      // loaded
      loadedThemes = await this.socket.get('/theme/installed');

      // themes
      for (let i = (this.themes.length - 1); i >= 0; i--) {
        // check if theme
        if (!loadedThemes.find((s) => s.id === this.themes[i].id)) {
          // removed
          this.themes.splice(i, 1);
        }
      }

      // replace all info
      loadedThemes.forEach((theme) => {
        // local
        const localTheme = this.themes.find((s) => s.id === theme.id);

        // check local theme
        if (!localTheme) return this.themes.push(theme);

        // update info
        Object.keys(theme).forEach((key) => {
          // theme key
          localTheme[key] = theme[key];
        });
      });

      // set themes
      this.updated = new Date();
    } catch (e) {
      // loading
      this.loading = null;
      throw e;
    }

    // set loading
    this.loading = null;

    // check themes
    if (!this.theme) {
      // sort and set default
      const defaultTheme = loadedThemes.sort((a, b) => {
        // aC
        const aC = new Date(a.chosenAt || 0);
        const bC = new Date(b.chosenAt || 0);

        // return
        if (aC > bC) return -1;
        if (aC < bC) return 1;
        return 0;
      })[0];

      // set default
      this.theme = defaultTheme;
    }

    // return themes
    return loadedThemes;
  }

  /**
   * create theme
   *
   * @param param0 
   * @returns 
   */
  async createTheme({ theme, chosen, name, published, description }) {
    // set loading
    this.loading = 'create';

    // loaded
    let createdTheme = {};

    // try/catch
    try {
      // load
      createdTheme = await this.socket.post('/theme', {
        name,
        theme,
        chosen,
        published,
        description,
      }, this.timeout);

      // set themes
      this.updateTheme(createdTheme, false);
    } catch (e) {
      // loading
      this.loading = null;
      throw e;
    }

    // done loading
    this.loading = null;

    // return themes
    return createdTheme;
  }

  /**
   * update theme
   *
   * @param param0 
   * @param save 
   * @returns 
   */
  chooseTheme({ id }) {
    // update theme
    let localTheme = this.themes.find((s) => s.id === id);

    // update theme
    this.theme = localTheme;

    // update theme
    return this.updateTheme({
      id,
      chosen : true,
    });
  }

  /**
   * update theme
   *
   * @param param0 
   * @param save 
   * @returns 
   */
  async updateTheme({ id, theme, name, description, published, chosen }, save = true) {
    // set loading
    if (save) {
      // loading
      this.loading = id;
    }

    // update theme
    let localTheme = this.themes.find((s) => s.id === id);

    // check local theme
    if (!localTheme) {
      // set theme
      localTheme = {
        name,
        theme,
        chosen,
        chosenAt : chosen ? new Date() : null,
        publishedAt : published ? new Date() : null,
        description,
      };

      // push
      this.themes.push(localTheme);
    }

    // keys
    if (typeof name !== 'undefined') localTheme.name = name;
    if (typeof theme !== 'undefined') localTheme.theme = theme;
    if (typeof chosen !== 'undefined') localTheme.chosenAt = chosen ? new Date() : null;
    if (typeof published !== 'undefined') localTheme.publishedAt = published ? new Date() : null;
    if (typeof description !== 'undefined') localTheme.description = description;

    // check theme
    if (localTheme && new Date(localTheme.chosenAt || 0) > new Date(this.theme?.chosenAt || 0)) {
      // set theme
      this.theme = localTheme;
    }

    // update
    if (!save) {
      // update
      return this.updated = new Date();
    } else {
      // update in place
      this.updated = new Date();
    }

    // debounce save
    return this.debounce(`${id}.update`, async () => {
      // loaded
      let loadedTheme = localTheme;
  
      // try/catch
      try {
        // load
        loadedTheme = await this.socket.patch(`/theme/${id}`, {
          chosen,
          published,
          name        : localTheme.name,
          theme       : localTheme.theme,
          description : localTheme.description,
        });
  
        // loop
        Object.keys(loadedTheme).forEach((key) => {
          // add to loaded
          localTheme[key] = loadedTheme[key];
        });
  
        // set themes
        this.updated = new Date();
      } catch (e) {
        // loading
        throw e;
      }
  
      // done loading
      this.loading = null;
  
      // return themes
      return loadedTheme;
    }, 1000);
  }

  /**
   * delete theme
   *
   * @param param0 
   * @returns 
   */
  async deleteTheme({ id }) {
    // set loading
    this.loading = id;

    // try/catch
    try {
      // load
      await this.socket.delete(`/theme/${id}`);

      // themes
      for (let i = (this.themes.length - 1); i >= 0; i--) {
        // check if theme
        if (id === this.themes[i].id) {
          // removed
          this.themes.splice(i, 1);
        }
      }

      // set themes
      this.updated = new Date();
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    this.loading = null;

    // return themes
    return true;
  }

  /**
   * emit theme update
   *
   * @param theme 
   * @param isRemove 
   */
  emitTheme(theme, isRemove = false) {
    // remove
    if (isRemove) {
      // themes
      for (let i = (this.themes.length - 1); i >= 0; i--) {
        // check if theme
        if (theme.id === this.themes[i].id) {
          // removed
          this.themes.splice(i, 1);
        }
      }

      // update
      this.updated = new Date();
    } else {
      // update
      this.updateTheme(theme, false);
    }
  }

  /**
   * emit theme
   *
   * @param theme 
   * @returns 
   */
  emitThemeRemove(theme) {
    // emit theme
    return this.emitTheme(theme);
  }
}