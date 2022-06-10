import 'reflect-metadata';

// Import aliases
import _ from 'lodash';
import Events from 'events';

/**
 * Exports decorator function to set type of model
 */
export function Action(path: string, priority: number = 100, type: string = 'poll', timer: number = 5000) {
  // return function
  return (target: any, propertyKey: string) => {
    // Add namespace and subspace
    Reflect.defineMetadata('route:path', path, target, propertyKey);
    Reflect.defineMetadata('route:type', type, target, propertyKey);
    Reflect.defineMetadata('route:timer', timer, target, propertyKey);
    Reflect.defineMetadata('route:priority', priority, target, propertyKey);
  };
}

/**
 * Create Controller class
 */
export default class MoonDaemon extends Events {
  // variables
  public routes: Array<any>;
  public building: Promise<any>;
  
  /**
   * construct controller class
   */
  constructor(base) {
    // run super
    super();

    // super
    this.base = base;

    // building
    this.building = this.build();
  }

  /**
   * Builds the current controller
   */
  public async build(): Promise<void> {
    // build routes
    this.routes = Reflect.ownKeys(Object.getPrototypeOf(this))
      .filter((property) => typeof this[property] === 'function')
      .filter((property) => Reflect.hasMetadata('route:path', this, property))
      .map((property) => ({
        ctrl : this,
        property,

        path     : Reflect.getMetadata('route:path', this, property),
        type     : Reflect.getMetadata('route:type', this, property),
        timer    : Reflect.getMetadata('route:timer', this, property),
        priority : Reflect.getMetadata('route:priority', this, property)
      }));
    
    // bind routes
    this.routes.forEach(({ property }) => {
      // bind property
      this[property] = this[property].bind(this);
    });
  }
}